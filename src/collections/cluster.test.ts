import weaviate from '..';

describe('Testing of the client.cluster methods', () => {
  const client = weaviate.next({
    http: {
      secure: false,
      host: 'localhost',
      port: 8080,
    },
    grpc: {
      secure: false,
      host: 'localhost',
      port: 50051,
    },
  });

  const one = 'TestClusterCollectionOne';
  const two = 'TestClusterCollectionTwo';

  afterAll(async () => {
    await client.collections.delete(one);
  });

  beforeAll(() => {
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
    expect(nodes[0].batchStats.queueLength).toEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toEqual(0);
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
    expect(nodes[0].batchStats.queueLength).toEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toEqual(0);
  });

  it('should return the verbose node statuses', async () => {
    const nodes = await client.cluster.nodes({ output: 'verbose' });
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats.shardCount).toEqual(2);
    expect(nodes[0].stats.objectCount).toEqual(0);
    expect(nodes[0].shards.length).toEqual(2);
    expect(nodes[0].batchStats.queueLength).toEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toEqual(0);
  });

  it('should return the node statuses for a specific collection', async () => {
    const nodes = await client.cluster.nodes({ collection: one, output: 'verbose' });
    expect(nodes).toBeDefined();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].gitHash).toBeDefined();
    expect(nodes[0].version).toBeDefined();
    expect(nodes[0].status).toEqual('HEALTHY');
    expect(nodes[0].stats.shardCount).toEqual(1);
    expect(nodes[0].stats.objectCount).toEqual(0);
    expect(nodes[0].shards.length).toEqual(1);
    expect(nodes[0].batchStats.queueLength).toEqual(0);
    expect(nodes[0].batchStats.ratePerSecond).toEqual(0);
  });
});
