import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '@weaviate/core/proto/google/health/v1/health';
import { SearchReply, SearchRequest } from '@weaviate/core/proto/v1/search_get';
import { WeaviateDefinition, WeaviateServiceImplementation } from '@weaviate/core/proto/v1/weaviate';
import weaviate, { Collection, WeaviateClient } from '@weaviate/node';
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest';

class SearchMock {
  public requests: SearchRequest[] = [];

  private constructor(private grpc: GrpcServer, private http: HttpServer, requests: SearchRequest[]) {
    this.requests = requests;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const requests: SearchRequest[] = [];

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
      aggregate: vitest.fn(),
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
    return new SearchMock(grpc, http, requests);
  };

  public clear = () => {
    this.requests.length = 0;
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

describe('Mock testing of nearMedia', () => {
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
