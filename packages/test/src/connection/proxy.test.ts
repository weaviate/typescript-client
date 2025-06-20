import weaviate from '@weaviate/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Testing of the client connecting to a proxied Weaviate instance', () => {
  // Skip because Envoy Proxy in CI is too flaky with strange error:
  //  ClientError: /grpc.health.v1.Health/Check INTERNAL: Received RST_STREAM with code 2 triggered by internal client error: Protocol error
  it.skip('should connect to a local instance using simultaneous http and grpc proxies', async () => {
    const client = await weaviate.connectToCustom({
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
      .then((collection) => collection.query.fetchObjects())
      .then((res) => expect(res.objects).toHaveLength(1));
  });
});
