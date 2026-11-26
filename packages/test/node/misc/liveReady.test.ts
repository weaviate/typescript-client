import { DbVersionProvider } from '@weaviate/core/utils/dbVersion';
import LiveChecker from '@weaviate/core/v2/misc/liveChecker';
import ReadyChecker from '@weaviate/core/v2/misc/readyChecker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const checkers = [
  { name: 'LiveChecker', Checker: LiveChecker, path: '/.well-known/live' },
  { name: 'ReadyChecker', Checker: ReadyChecker, path: '/.well-known/ready' },
] as const;

describe.each(checkers)('$name', ({ Checker, path }) => {
  const unhandled: unknown[] = [];
  const onUnhandled = (e: unknown) => unhandled.push(e);

  beforeEach(() => {
    unhandled.length = 0;
    process.on('unhandledRejection', onUnhandled);
  });
  afterEach(() => {
    process.off('unhandledRejection', onUnhandled);
  });

  const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

  const make = (endpointUp: boolean, versionGetter: () => Promise<string>) => {
    const client: any = {
      get: vi.fn((p: string) =>
        endpointUp && p === path ? Promise.resolve(undefined) : Promise.reject(new Error('down'))
      ),
    };
    return new Checker(client, new DbVersionProvider(versionGetter));
  };

  it('reports true and refreshes the cached version when the endpoint is up', async () => {
    const getter = vi.fn(() => Promise.resolve('1.30.0'));
    expect(await make(true, getter).do()).toBe(true);
    await tick();
    expect(getter).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('reports true without an unhandled rejection when the background version refresh fails', async () => {
    // e.g. /meta answers 401/403 for a bad API key while the unauthenticated live/ready endpoints are up
    const getter = vi.fn(() => Promise.reject(new Error('401 unauthenticated')));
    expect(await make(true, getter).do()).toBe(true);
    await tick();
    expect(getter).toHaveBeenCalledTimes(1);
    expect(unhandled).toEqual([]);
  });

  it('reports false and does not refresh the version when the endpoint is down', async () => {
    const getter = vi.fn(() => Promise.resolve('1.30.0'));
    expect(await make(false, getter).do()).toBe(false);
    await tick();
    expect(getter).not.toHaveBeenCalled();
  });
});
