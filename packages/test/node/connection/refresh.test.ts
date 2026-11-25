import { OidcAuthenticator, AuthClientCredentials } from '@weaviate/core/connection/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('OidcAuthenticator background token refresh', () => {
  const unhandled: unknown[] = [];
  const onUnhandled = (e: unknown) => unhandled.push(e);

  beforeEach(() => {
    vi.useFakeTimers();
    unhandled.length = 0;
    process.on('unhandledRejection', onUnhandled);
  });
  afterEach(() => {
    process.off('unhandledRejection', onUnhandled);
    vi.useRealTimers();
  });

  const make = () => {
    const auth = new OidcAuthenticator({} as any, new AuthClientCredentials({ clientSecret: 's' }));
    (auth as any).refreshToken = 'rt';
    (auth as any).accessToken = 'old';
    (auth as any).expiresAt = Date.now() + 1_000;
    return auth;
  };

  it('does not leak an unhandled rejection when a silent refresh fails', async () => {
    const auth = make();
    const refresh = vi.fn().mockRejectedValue(new Error('idp down'));
    auth.startTokenRefresh({ refresh });
    await vi.advanceTimersByTimeAsync(30_000);
    await vi.advanceTimersByTimeAsync(0);
    auth.stopTokenRefresh();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('keeps retrying and recovers once the provider is back', async () => {
    const auth = make();
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('idp down'))
      .mockResolvedValue({ accessToken: 'new', expiresAt: Date.now() + 3_600_000, refreshToken: 'rt2' });
    auth.startTokenRefresh({ refresh });
    await vi.advanceTimersByTimeAsync(60_000);
    auth.stopTokenRefresh();
    expect(unhandled).toEqual([]);
    expect(auth.getAccessToken()).toBe('new');
  });
});
