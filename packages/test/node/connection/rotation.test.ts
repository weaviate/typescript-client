import { AuthAccessTokenCredentials, OidcAuthenticator } from '@weaviate/core/connection/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// An identity provider that rotates refresh tokens: every refresh_token grant returns a new
// refresh token and invalidates the one that was just used.
const rotatingProvider = (firstToken: string) => {
  let valid = firstToken;
  let n = 1;
  const seen: string[] = [];
  const externalPost = vi.fn((_url: string, params: URLSearchParams) => {
    const sent = params.get('refresh_token')!;
    seen.push(sent);
    if (sent !== valid) return Promise.reject(new Error('invalid_grant: refresh token already used'));
    n += 1;
    valid = `rt${n}`;
    return Promise.resolve({ access_token: `at${n}`, expires_in: 30, refresh_token: valid });
  });
  const http: any = {
    externalGet: vi.fn(() => Promise.resolve({ token_endpoint: 'http://idp/token' })),
    externalPost,
  };
  return { http, seen };
};

const localConfig = { href: 'http://idp/.well-known/openid-configuration', clientId: 'c', scopes: [] };

describe('OidcAuthenticator with a rotating refresh token', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const make = (http: any) =>
    new OidcAuthenticator(
      http,
      new AuthAccessTokenCredentials({ accessToken: 'at1', expiresIn: 1, refreshToken: 'rt1' })
    );

  it('sends the latest refresh token on each silent refresh', async () => {
    const { http, seen } = rotatingProvider('rt1');
    const auth = make(http);
    await auth.refresh(localConfig);
    await vi.advanceTimersByTimeAsync(30_000);
    await vi.advanceTimersByTimeAsync(30_000);
    auth.stopTokenRefresh();
    expect(seen).toEqual(['rt1', 'rt2', 'rt3']);
    expect(auth.getAccessToken()).toBe('at4');
  });

  it('sends the latest refresh token when login re-authenticates after expiry', async () => {
    const { http, seen } = rotatingProvider('rt1');
    const auth = make(http);
    await auth.refresh(localConfig);
    auth.stopTokenRefresh();
    await auth.refresh(localConfig);
    auth.stopTokenRefresh();
    expect(seen).toEqual(['rt1', 'rt2']);
  });
});
