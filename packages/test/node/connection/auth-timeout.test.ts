import { afterEach, describe, expect, it, vi } from 'vitest';

import { WeaviateRequestTimeoutError } from '@weaviate/core/errors';
import { httpClient } from '@weaviate/core/connection/http';

describe('OIDC HTTP request deadlines', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const requests = {
    discovery: () => httpClient({ host: 'http://weaviate.test' }).externalGet('https://issuer.test/openid'),
    token: () =>
      httpClient({ host: 'http://weaviate.test' }).externalPost(
        'https://issuer.test/token',
        new URLSearchParams({ grant_type: 'client_credentials' }),
        'application/x-www-form-urlencoded'
      ),
  };

  it.each(Object.keys(requests) as (keyof typeof requests)[])(
    'aborts a stalled %s request after five seconds',
    async (kind) => {
      vi.useFakeTimers();
      let requestSignal: AbortSignal | null | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn((_input: unknown, init?: RequestInit) => {
          requestSignal = init?.signal;
          return new Promise<Response>((_resolve, reject) => {
            requestSignal?.addEventListener('abort', () => reject(requestSignal?.reason), { once: true });
          });
        })
      );

      const result = requests[kind]().catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(4_999);
      expect(requestSignal?.aborted).not.toBe(true);
      await vi.advanceTimersByTimeAsync(1);
      expect(requestSignal?.aborted).toBe(true);
      expect(await result).toBeInstanceOf(WeaviateRequestTimeoutError);
    }
  );

  it.each(Object.keys(requests) as (keyof typeof requests)[])(
    'clears the deadline after a successful %s request',
    async (kind) => {
      vi.useFakeTimers();
      const payload = { access_token: 'example-token' };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

      expect(await requests[kind]()).toEqual(payload);
      expect(vi.getTimerCount()).toBe(0);
    }
  );
});
