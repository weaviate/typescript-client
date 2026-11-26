import { SearchReply, SearchRequest } from '@weaviate/core/proto/v1/search_get';
import weaviate, { WeaviateClient } from '@weaviate/node';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { makeGrpcApp, makeRestApp } from '../mocks';

describe('Query consistency metadata', () => {
  let client: WeaviateClient;
  let http: Server;
  let grpc: ReturnType<typeof makeGrpcApp>;
  let reply = SearchReply.create();
  const requests: SearchRequest[] = [];

  beforeAll(async () => {
    grpc = makeGrpcApp({
      search: (request: SearchRequest) => {
        requests.push(request);
        return Promise.resolve(reply);
      },
    });
    const grpcPort = await grpc.listen('127.0.0.1:0');
    http = await new Promise<Server>((resolve, reject) => {
      const server = makeRestApp('1.30.0').listen(0, '127.0.0.1', () => resolve(server));
      server.on('error', reject);
    });
    client = await weaviate.connectToLocal({
      host: '127.0.0.1',
      port: (http.address() as AddressInfo).port,
      grpcPort,
    });
  });

  beforeEach(() => {
    requests.length = 0;
  });

  afterAll(async () => {
    client?.close();
    await grpc?.shutdown();
    if (http) {
      await new Promise<void>((resolve, reject) => {
        http.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  describe.each(['fetchObjects', 'nearVector', 'generate', 'reference'] as const)('%s', (path) => {
    it.each([
      { label: 'false', value: false, present: true, expected: false },
      { label: 'true', value: true, present: true, expected: true },
      { label: 'not requested', value: undefined, present: false, expected: undefined },
    ])('preserves $label consistency metadata', async ({ value, present, expected }) => {
      const metadata = {
        id: '00000000-0000-0000-0000-000000000001',
        isConsistent: value,
        isConsistentPresent: present,
      };
      reply = SearchReply.fromPartial({
        results: [
          path === 'reference'
            ? {
                metadata: { id: '00000000-0000-0000-0000-000000000002' },
                properties: {
                  refProps: [
                    {
                      propName: 'related',
                      properties: [{ metadata, targetCollection: 'Target' }],
                    },
                  ],
                },
              }
            : { metadata },
        ],
      });

      const collection = client.collections.use('Test');
      const opts = { returnMetadata: present ? ['isConsistent' as const] : undefined };
      let actual: boolean | undefined;
      if (path === 'reference') {
        const result = await collection.query.fetchObjects({
          returnReferences: [{ linkOn: 'related', ...opts }],
        });
        actual = result.objects[0].references?.related.objects[0].metadata?.isConsistent;
      } else {
        const result =
          path === 'generate'
            ? await collection.generate.fetchObjects({ singlePrompt: 'Summarise this object' }, opts)
            : path === 'nearVector'
            ? await collection.query.nearVector([1, 0], opts)
            : await collection.query.fetchObjects(opts);
        actual = result.objects[0].metadata?.isConsistent;
      }

      expect(requests).toHaveLength(1);
      const requested =
        path === 'reference' ? requests[0].properties?.refProperties[0].metadata : requests[0].metadata;
      expect(requested?.isConsistent).toBe(present);
      expect(actual).toBe(expected);
    });
  });
});
