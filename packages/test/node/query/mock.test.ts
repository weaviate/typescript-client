import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '@weaviate/core/proto/google/health/v1/health';
import { AggregateReply, AggregateRequest } from '@weaviate/core/proto/v1/aggregate';
import { SearchReply, SearchRequest } from '@weaviate/core/proto/v1/search_get';
import { WeaviateDefinition, WeaviateServiceImplementation } from '@weaviate/core/proto/v1/weaviate';
import weaviate, { Collection, WeaviateClient } from '@weaviate/node';
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest';

class SearchMock {
  public requests: SearchRequest[] = [];
  public aggregateRequests: AggregateRequest[] = [];

  private constructor(
    private grpc: GrpcServer,
    private http: HttpServer,
    requests: SearchRequest[],
    aggregateRequests: AggregateRequest[]
  ) {
    this.requests = requests;
    this.aggregateRequests = aggregateRequests;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const requests: SearchRequest[] = [];
    const aggregateRequests: AggregateRequest[] = [];

    const httpApp = express();
    // Meta endpoint required for client instantiation
    httpApp.get('/v1/meta', (req, res) => res.send({ version }));

    // gRPC health check required for client instantiation
    const healthMockImpl: HealthServiceImplementation = {
      check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
        Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
      watch: vitest.fn(),
    };

    const grpc = createServer();
    grpc.add(HealthDefinition, healthMockImpl);

    // Search endpoint recording every request and returning an empty reply
    const weaviateMockImpl: WeaviateServiceImplementation = {
      aggregate: (req: AggregateRequest): Promise<AggregateReply> => {
        aggregateRequests.push(req);
        return Promise.resolve(AggregateReply.fromPartial({ singleResult: { objectsCount: 0 } }));
      },
      tenantsGet: vitest.fn(),
      search: (req: SearchRequest): Promise<SearchReply> => {
        requests.push(req);
        return Promise.resolve(SearchReply.fromPartial({ results: [] }));
      },
      batchDelete: vitest.fn(),
      batchObjects: vitest.fn(),
      batchReferences: vitest.fn(),
      batchStream: vitest.fn(),
    };
    grpc.add(WeaviateDefinition, weaviateMockImpl);

    await grpc.listen(`localhost:${grpcPort}`);
    const http = await httpApp.listen(httpPort);
    return new SearchMock(grpc, http, requests, aggregateRequests);
  };

  public clear = () => {
    this.requests.length = 0;
    this.aggregateRequests.length = 0;
  };

  public close = () => Promise.all([this.http.close(), this.grpc.shutdown()]);
}

const mediaTypes = [
  ['audio', 'nearAudio'],
  ['depth', 'nearDepth'],
  ['image', 'nearImage'],
  ['imu', 'nearImu'],
  ['thermal', 'nearThermal'],
  ['video', 'nearVideo'],
] as const;

describe('Mock testing of query serialization', () => {
  let client: WeaviateClient;
  let collection: Collection;
  let mock: SearchMock;

  // raw bytes are base64-encoded by toBase64FromMedia before being sent
  const media = Buffer.from('media');
  const encoded = media.toString('base64');

  beforeAll(async () => {
    mock = await SearchMock.use('1.30.0', 8960, 8961);
    client = await weaviate.connectToLocal({ port: 8960, grpcPort: 8961 });
    collection = client.collections.use('Whatever');
  });

  beforeEach(() => mock.clear());

  afterAll(() => mock.close());

  it.each(['query', 'generate', 'aggregate'] as const)(
    '%s.hybrid should forward nearText movement object IDs',
    async (api) => {
      const objects = ['00000000-0000-0000-0000-000000000001'];
      const opts = {
        vector: {
          query: 'semantic query',
          certainty: 0.8,
          moveTo: { objects, concepts: ['towards'], force: 0.5 },
          moveAway: { objects, concepts: ['away'], force: 0 },
        },
      };
      let nearText;
      if (api === 'aggregate') {
        await collection.aggregate.hybrid('keyword', opts);
        expect(mock.aggregateRequests).toHaveLength(1);
        nearText = mock.aggregateRequests[0].hybrid?.nearText;
      } else {
        if (api === 'generate') {
          await collection.generate.hybrid('keyword', { groupedTask: 'Summarise' }, opts);
        } else {
          await collection.query.hybrid('keyword', opts);
        }
        expect(mock.requests).toHaveLength(1);
        nearText = mock.requests[0].hybridSearch?.nearText;
      }
      expect(nearText).toMatchObject({
        query: ['semantic query'],
        certainty: 0.8,
        moveTo: { uuids: objects, concepts: ['towards'], force: 0.5 },
        moveAway: { uuids: objects, concepts: ['away'], force: 0 },
      });
    }
  );

  it.each([undefined, { concepts: ['towards'], force: 0.5 }])(
    'query.hybrid should preserve optional nearText movements: %j',
    async (moveTo) => {
      await collection.query.hybrid('keyword', { vector: { query: ['semantic', 'query'], moveTo } });
      const nearText = mock.requests[0].hybridSearch?.nearText;
      expect(nearText?.query).toEqual(['semantic', 'query']);
      expect(nearText?.moveTo).toEqual(moveTo ? { ...moveTo, uuids: [] } : undefined);
      expect(nearText?.moveAway).toBeUndefined();
    }
  );

  describe.each(mediaTypes)('%s', (type, field) => {
    it('query.nearMedia should forward the near options to the request', async () => {
      await collection.query.nearMedia(media, type, { certainty: 0.8, limit: 3 });
      expect(mock.requests).toHaveLength(1);
      const req = mock.requests[0];
      expect(req.limit).toEqual(3);
      expect(req[field]?.certainty).toEqual(0.8);
      expect((req[field] as unknown as Record<string, string>)[type]).toEqual(encoded);
    });

    it('generate.nearMedia should forward the near options to the request', async () => {
      await collection.generate.nearMedia(
        media,
        type,
        { groupedTask: 'Summarise the results' },
        { distance: 0.4, limit: 5 }
      );
      expect(mock.requests).toHaveLength(1);
      const req = mock.requests[0];
      expect(req.limit).toEqual(5);
      expect(req[field]?.distance).toEqual(0.4);
      expect((req[field] as unknown as Record<string, string>)[type]).toEqual(encoded);
      expect(req.generative?.grouped?.task).toEqual('Summarise the results');
    });
  });
});
