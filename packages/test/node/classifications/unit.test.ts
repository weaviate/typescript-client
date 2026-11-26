import ClassificationsScheduler from '@weaviate/core/v2/classifications/scheduler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ClassificationsScheduler waiting for completion', () => {
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

  /** Runs `do()` against a client whose classification GET is answered by `poll`, and settles it. */
  const run = async (poll: () => Promise<any>, timeoutMs = 60_000, advanceMs = 5_000) => {
    const client: any = {
      postReturn: vi.fn(() => Promise.resolve({ id: 'c1', status: 'running' })),
      get: vi.fn(poll),
    };
    const scheduler: any = new ClassificationsScheduler(client)
      .withType('knn')
      .withClassName('Article')
      .withClassifyProperties(['hasCategory'])
      .withBasedOnProperties(['summary'])
      .withWaitForCompletion()
      .withWaitTimeout(timeoutMs);

    let outcome: { ok: true; value: any } | { ok: false; error: Error } | undefined;
    scheduler.do().then(
      (value: any) => (outcome = { ok: true, value }),
      (error: Error) => (outcome = { ok: false, error })
    );
    await vi.advanceTimersByTimeAsync(advanceMs);
    return { client, outcome: () => outcome };
  };

  it('resolves once the classification completes', async () => {
    let calls = 0;
    const { outcome } = await run(() => {
      calls += 1;
      return Promise.resolve({ id: 'c1', status: calls < 3 ? 'running' : 'completed' });
    });
    expect(outcome()).toEqual({ ok: true, value: { id: 'c1', status: 'completed' } });
  });

  it('rejects with the server error as soon as the classification fails', async () => {
    const { outcome, client } = await run(() =>
      Promise.resolve({ id: 'c1', status: 'failed', error: 'no training data' })
    );
    const result = outcome();
    expect(result?.ok).toBe(false);
    expect((result as any).error.message).toContain('no training data');
    // it stopped polling instead of waiting for the 60s timeout
    const calls = client.get.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5_000);
    expect(client.get.mock.calls.length).toBe(calls);
  });

  it('rejects with the request error and stops polling when a poll fails', async () => {
    const { outcome, client } = await run(() => Promise.reject(new Error('connection refused')));
    const result = outcome();
    expect(result?.ok).toBe(false);
    expect((result as any).error.message).toContain('connection refused');
    expect(unhandled).toEqual([]);
    const calls = client.get.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5_000);
    expect(client.get.mock.calls.length).toBe(calls);
  });

  it('still rejects with the timeout message if the classification never finishes', async () => {
    const { outcome } = await run(() => Promise.resolve({ id: 'c1', status: 'running' }), 3_000, 4_000);
    const result = outcome();
    expect(result?.ok).toBe(false);
    expect((result as any).error.message).toContain("didn't finish within configured timeout");
  });
});
