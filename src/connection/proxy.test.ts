import weaviate from '..';

describe('Testing of the client connecting to a proxied Weaviate instance', () => {
  it('should connect to a local instance using simultaneous http and grpc proxies', async () => {
    const client = await weaviate.connectToLocal({
      httpHost: 'localhost',
      httpPath: '/http',
      httpPort: 10000,
      httpSecure: false,
      grpcHost: 'weaviate-proxy',
      grpcPort: 8021,
      proxies: {
        grpc: 'http://localhost:10001',
      },
    });
    expect(client).toBeDefined();
    return client.collections
      .delete('Test')
      .then(() =>
        client.collections.create({
          name: 'Test',
        })
      )
      .then(async (collection) => {
        await collection.data.insert();
        return collection;
      })
      .then(async (collection) => {
        const res = await collection.query.fetchObjects();
        expect(res.objects).toHaveLength(1);
      });
  });
});
