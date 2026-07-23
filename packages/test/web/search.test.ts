import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import weaviate, { WeaviateClient, Collection } from '@weaviate/web';
import { requireAtLeast } from '../version';

requireAtLeast(1, 39, 0).describe('search', () => {
  let client: WeaviateClient;
  let collection: Collection;

  beforeAll(async () => {
    client = await weaviate.connectToLocal({ skipInitChecks: true });
    collection = await client.collections.create({
      name: 'TestWebSearch',
      properties: [{ name: 'title', dataType: 'text' }],
    });
    await collection.data.insert({ title: 'Test' });
  });

  afterAll(async () => {
    await client.collections.delete(collection.name);
  });

  it('should perform a search query', async () => {
    const res = await collection.query.fetchObjects();
    expect(res.objects.length).toBe(1);
  });
});
