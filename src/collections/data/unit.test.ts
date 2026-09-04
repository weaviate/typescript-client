/* eslint-disable no-await-in-loop */
import { describe, expect, it } from 'vitest';
import { Queue } from './batch';
import { normalizeBatchInput } from './index';

describe('Unit testing of the Queue class', () => {
  it('should push and pull items in FIFO order', async () => {
    const queue = new Queue<number>();
    queue.push(1);
    queue.push(2);
    queue.push(3);

    expect(await queue.pull()).toBe(1);
    expect(await queue.pull()).toBe(2);
    expect(await queue.pull()).toBe(3);
  });

  it('should return null when pulling from an empty queue with timeout', async () => {
    const queue = new Queue<number>();
    const result = await queue.pull(100); // 100ms timeout
    expect(result).toBeNull();
  });

  it('should handle concurrent pushes and pulls correctly', async () => {
    const queue = new Queue<number>();
    const results: number[] = [];

    // Push items in the background
    setTimeout(() => {
      for (let i = 1; i <= 5; i++) {
        queue.push(i);
      }
    }, 50);

    // Pull items concurrently
    while (results.length < 5) {
      const item = await queue.pull();
      if (item !== null) {
        results.push(item);
      }
    }

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle when pull happens before push', async () => {
    const queue = new Queue<number>();
    const pullPromise = queue.pull(500); // 500ms timeout

    setTimeout(() => {
      queue.push(42);
    }, 100); // Push after 100ms

    const result = await pullPromise;
    expect(result).toBe(42);
  });

  it('should return the correct length', async () => {
    const queue = new Queue<number>();
    expect(queue.length).toBe(0);
    queue.push(1);
    queue.push(2);
    expect(queue.length).toBe(2);
    await queue.pull();
    expect(queue.length).toBe(1);
  });

  it('should handle timeouts correctly', async () => {
    const queue = new Queue<number>();
    const start = Date.now();
    const result = await queue.pull(200); // 200ms timeout
    expect(result).toBeNull();
    expect(Date.now() - start).toBeGreaterThanOrEqual(199); // Allow some leeway for timing
  });

  it('should pull a pushed item while a pull is waiting', async () => {
    const queue = new Queue<number>();
    const pullPromise = queue.pull(100); // 100ms timeout
    queue.push(99);
    expect(await pullPromise).toBe(99);
  });

  it('should pull a pushed item after a pull has already timed-out', async () => {
    const queue = new Queue<number>();
    expect(await queue.pull(100)).toBeNull();
    queue.push(99);
    expect(await queue.pull(0)).toBe(99);
  });
});

describe('Unit testing of normalizeBatchInput (data.ingest metadata-loss regression)', () => {
  it('wraps an unwrapped NonReferenceInputs object into a properties field', () => {
    expect(normalizeBatchInput({ title: 'alpha' })).toEqual({
      properties: { title: 'alpha' },
    });
  });

  it('leaves an already-wrapped DataObject untouched', () => {
    const wrapped = { id: 'fixed-id', properties: { title: 'alpha' } };
    expect(normalizeBatchInput(wrapped)).toBe(wrapped);
  });

  it('treats an object carrying only references as already wrapped', () => {
    const wrapped = { references: { relatedTo: ['some-uuid'] } };
    expect(normalizeBatchInput(wrapped as any)).toBe(wrapped);
  });

  it('treats an object carrying only vectors as already wrapped', () => {
    const wrapped = { vectors: [0.1, 0.2, 0.3] };
    expect(normalizeBatchInput(wrapped as any)).toBe(wrapped);
  });

  it('produces the same properties shape for the ingest() and insertMany() input forms', () => {
    const unwrapped = normalizeBatchInput({ title: 'alpha' });
    const wrapped = normalizeBatchInput({ properties: { title: 'alpha' } });
    expect(unwrapped.properties).toEqual(wrapped.properties);
  });
});
