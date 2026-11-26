import { createServer } from 'node:http';
import { performance } from 'node:perf_hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { httpClient } from '@weaviate/core/connection/http';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateRequestTimeoutError,
  WeaviateUnauthenticatedError,
  WeaviateUnexpectedStatusCodeError,
} from '@weaviate/core/errors';

const request = (kind: 'discovery' | 'token', url: string) => {
  const client = httpClient({ host: 'http://weaviate.test' });
  return kind === 'discovery'
    ? client.externalGet(url)
    : client.externalPost(
        url,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        'application/x-www-form-urlencoded'
      );
};

describe('OIDC response body deadlines', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each(['discovery', 'token'] as const)(
    'keeps the %s deadline active until its body is consumed',
    async (kind) => {
      vi.useFakeTimers();
      let signal: AbortSignal | null | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn((_input: unknown, init?: RequestInit) => {
          signal = init?.signal;
          return Promise.resolve(
            new Response(
              new ReadableStream({
                start(controller) {
                  signal?.addEventListener('abort', () => controller.error(signal?.reason), { once: true });
                },
              }),
              { headers: { 'content-type': 'application/json' } }
            )
          );
        })
      );
      const result = request(kind, 'https://issuer.test/body').catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(4_999);
      expect(signal?.aborted).toBe(false);
      expect(vi.getTimerCount()).toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(signal?.aborted).toBe(true);
      expect(await result).toBeInstanceOf(WeaviateRequestTimeoutError);
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it.each([
    [401, WeaviateUnauthenticatedError],
    [403, WeaviateInsufficientPermissionsError],
    [502, WeaviateUnexpectedStatusCodeError],
  ] as const)('preserves HTTP %s errors and clears their deadline', async (status, errorType) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.resolve(new Response('issuer refused', { status })))
    );
    await Promise.all(
      (['discovery', 'token'] as const).map((kind) =>
        expect(request(kind, 'https://issuer.test/error')).rejects.toBeInstanceOf(errorType)
      )
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('real OIDC response body cancellation', () => {
  it('aborts native discovery and token fetches after headers when JSON bodies stall', async () => {
    const seen = new Set<string>();
    const closed = new Set<string>();
    let notifyClosed: () => void;
    const allClosed = new Promise<void>((resolve) => {
      notifyClosed = resolve;
    });
    const server = createServer((incoming, response) => {
      const method = incoming.method!;
      seen.add(method);
      response.on('close', () => {
        closed.add(method);
        if (closed.size === 2) notifyClosed();
      });
      incoming.resume();
      response.writeHead(200, { 'content-type': 'application/json' });
      response.write('{"access_token":');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing loopback listener');
    const origin = `http://127.0.0.1:${address.port}`;
    let guard: ReturnType<typeof setTimeout> | undefined;
    let closeGuard: ReturnType<typeof setTimeout> | undefined;
    try {
      const started = performance.now();
      const results = await Promise.race([
        Promise.all(
          (['discovery', 'token'] as const).map((kind) =>
            request(kind, origin).catch((error: unknown) => error)
          )
        ),
        new Promise<never>((_resolve, reject) => {
          guard = setTimeout(
            () => reject(new Error('Auth response bodies remained pending past the bounded deadline')),
            8_000
          );
        }),
      ]);
      expect(seen).toEqual(new Set(['GET', 'POST']));
      for (const result of results) expect(result).toBeInstanceOf(WeaviateRequestTimeoutError);
      expect(performance.now() - started).toBeGreaterThanOrEqual(4_500);
      await Promise.race([
        allClosed,
        new Promise<never>((_resolve, reject) => {
          closeGuard = setTimeout(() => reject(new Error('Timed-out auth bodies left sockets open')), 500);
        }),
      ]);
      expect(closed).toEqual(new Set(['GET', 'POST']));
    } finally {
      clearTimeout(guard);
      clearTimeout(closeGuard);
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
