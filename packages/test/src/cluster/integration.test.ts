import weaviate, { WeaviateClient } from '@weaviate/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Testing of the client.cluster methods', () => {
  let client: WeaviateClient;

  const one = 'TestClusterCollectionOne';
  const two = 'TestClusterCollectionTwo';

  afterAll(async () => {
    await (await client).collections.delete(one);
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    return Promise.all([client.collections.create({ name: one }), client.collections.create({ name: two })]);
  });

  it('should return the default node statuses', async () => {
    const nodes = await client.cluster.nodes();
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats).toBeUndefined();
    expect(nodes[0].shards).toBeNull();
    expect(nodes[0].batchStats.queueLength).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toBeGreaterThanOrEqual(0);
  });

  it('should return the minimal node statuses', async () => {
    const nodes = await client.cluster.nodes({ output: 'minimal' });
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats).toBeUndefined();
    expect(nodes[0].shards).toBeNull();
    expect(nodes[0].batchStats.queueLength).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toBeGreaterThanOrEqual(0);
  });

  it('should return the verbose node statuses', async () => {
    const nodes = await client.cluster.nodes({ output: 'verbose' });
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats.shardCount).toBeDefined();
    expect(nodes[0].stats.objectCount).toBeDefined();
    expect(nodes[0].shards.length).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.queueLength).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toBeGreaterThanOrEqual(0);
  });

  it('should return the node statuses for a specific collection', async () => {
    const nodes = await client.cluster.nodes({ collection: one, output: 'verbose' });
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats.shardCount).toBeDefined();
    expect(nodes[0].stats.objectCount).toBeDefined();
    expect(nodes[0].shards.length).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.queueLength).toBeGreaterThanOrEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toBeGreaterThanOrEqual(0);
  });
});
