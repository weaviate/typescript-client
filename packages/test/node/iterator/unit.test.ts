import { describe, expect, it, vi } from 'vitest';
import { WeaviateObject } from '@weaviate/core/types/index.js';
import { Iterator } from '@weaviate/core/iterator/index.js';

type Obj = WeaviateObject<{ n: number }, undefined>;

const makeObjects = (count: number): Obj[] =>
  Array.from({ length: count }, (_, i) => ({ uuid: `uuid-${i}`, properties: { n: i } } as unknown as Obj));

const mockQuery = (objects: Obj[]) =>
  vi.fn((limit: number, after?: string) => {
    const start = after === undefined ? 0 : objects.findIndex((o) => o.uuid === after) + 1;
    return Promise.resolve(objects.slice(start, start + limit));
  });

describe('Unit testing of the Iterator class', () => {
  it.each([0, 1, 99, 100, 101, 250])(
    'should yield all %i objects in ceil(N / 100) + 1 queries',
    async (n) => {
      const objects = makeObjects(n);
      const query = mockQuery(objects);

      const yielded: Obj[] = [];
      for await (const obj of new Iterator(query)) yielded.push(obj);

      expect(yielded).toEqual(objects);
      expect(query).toHaveBeenCalledTimes(Math.ceil(n / 100) + 1);
    }
  );

  it('should page using the uuid of the last object in the previous batch', async () => {
    const query = mockQuery(makeObjects(250));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of new Iterator(query));

    expect(query.mock.calls).toEqual([
      [100, undefined],
      [100, 'uuid-99'],
      [100, 'uuid-199'],
      [100, 'uuid-249'],
    ]);
  });
});
