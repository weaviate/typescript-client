import weaviate from '..';

describe('Testing of the client connecting to a proxied Weaviate instance', () => {
  it('should connect to a local instance using a grpc proxy', async () => {
    const client = await weaviate.connectToLocal({
      httpHost: 'localhost',
      httpPort: 8080,
      grpcHost: 'localhost',
      grpcPort: 50051,
      proxies: {
        grpc: 'http://localhost:10000',
      },
    });
    expect(client).toBeDefined();
    const meta = await client.getMeta();
    expect(meta).toBeDefined();
  });
});
