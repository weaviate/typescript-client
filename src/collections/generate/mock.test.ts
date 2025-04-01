import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import weaviate, { Collection, GenerativeConfigRuntime, WeaviateClient } from '../..';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../proto/google/health/v1/health';
import { GenerativeResult } from '../../proto/v1/generative';
import { SearchReply, SearchRequest, SearchResult } from '../../proto/v1/search_get';
import { WeaviateDefinition, WeaviateServiceImplementation } from '../../proto/v1/weaviate';
import { generativeParameters } from './config';

const mockedSingleGenerative = 'Mocked single response';
const mockedGroupedGenerative = 'Mocked group response';

class GenerateMock {
  private grpc: GrpcServer;
  private http: HttpServer;

  constructor(grpc: GrpcServer, http: HttpServer) {
    this.grpc = grpc;
    this.http = http;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const httpApp = express();
    // Meta endpoint required for client instantiation
    httpApp.get('/v1/meta', (req, res) => res.send({ version }));

    // gRPC health check required for client instantiation
    const healthMockImpl: HealthServiceImplementation = {
      check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
        Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
      watch: jest.fn(),
    };

    const grpc = createServer();
    grpc.add(HealthDefinition, healthMockImpl);

    // Search endpoint returning generative mock data
    const weaviateMockImpl: WeaviateServiceImplementation = {
      aggregate: jest.fn(),
      tenantsGet: jest.fn(),
      search: (req: SearchRequest): Promise<SearchReply> => {
        expect(req.generative?.grouped?.queries.length).toBeGreaterThan(0);
        expect(req.generative?.single?.queries.length).toBeGreaterThan(0);
        return Promise.resolve(
          SearchReply.fromPartial({
            results: [
              SearchResult.fromPartial({
                properties: {
                  nonRefProps: { fields: { name: { textValue: 'thing' } } },
                },
                generative: GenerativeResult.fromPartial({
                  values: [
                    {
                      result: mockedSingleGenerative,
                    },
                  ],
                }),
                metadata: {
                  id: 'b602a271-d5a9-4324-921d-5abe4748d6b5',
                },
              }),
            ],
            generativeGroupedResults: GenerativeResult.fromPartial({
              values: [
                {
                  result: mockedGroupedGenerative,
                },
              ],
            }),
          })
        );
      },
      batchDelete: jest.fn(),
      batchObjects: jest.fn(),
    };
    grpc.add(WeaviateDefinition, weaviateMockImpl);

    await grpc.listen(`localhost:${grpcPort}`);
    const http = await httpApp.listen(httpPort);
    return new GenerateMock(grpc, http);
  };

  public close = () => Promise.all([this.http.close(), this.grpc.shutdown()]);
}

describe('Mock testing of generate with runtime config', () => {
  let client: WeaviateClient;
  let collection: Collection;
  let mock: GenerateMock;

  beforeAll(async () => {
    mock = await GenerateMock.use('1.30.0-rc.1', 8958, 8959);
    client = await weaviate.connectToLocal({ port: 8958, grpcPort: 8959 });
    collection = client.collections.use('Whatever');
  });

  afterAll(() => mock.close());

  const stringTest = (config: GenerativeConfigRuntime) =>
    collection.generate
      .fetchObjects({
        singlePrompt: 'What is the meaning of life?',
        groupedTask: 'What is the meaning of life?',
        config: config,
      })
      .then((res) => {
        expect(res.generative?.text).toEqual(mockedGroupedGenerative);
        expect(res.objects[0].generative?.text).toEqual(mockedSingleGenerative);
      });

  const objectTest = (config: GenerativeConfigRuntime) =>
    collection.generate
      .fetchObjects({
        singlePrompt: {
          prompt: 'What is the meaning of life?',
        },
        groupedTask: {
          prompt: 'What is the meaning of life?',
        },
        config: config,
      })
      .then((res) => {
        expect(res.generative?.text).toEqual(mockedGroupedGenerative);
        expect(res.objects[0].generative?.text).toEqual(mockedSingleGenerative);
      });

  const model = { model: 'llama-2' };

  const tests: GenerativeConfigRuntime[] = [
    generativeParameters.anthropic(),
    generativeParameters.anthropic(model),
    generativeParameters.anyscale(),
    generativeParameters.anyscale(model),
    generativeParameters.aws(),
    generativeParameters.aws(model),
    generativeParameters.azureOpenAI(),
    generativeParameters.azureOpenAI(model),
    generativeParameters.cohere(),
    generativeParameters.cohere(model),
    generativeParameters.databricks(),
    generativeParameters.databricks(model),
    generativeParameters.friendliai(),
    generativeParameters.friendliai(model),
    generativeParameters.google(),
    generativeParameters.google(model),
    generativeParameters.mistral(),
    generativeParameters.mistral(model),
    generativeParameters.nvidia(),
    generativeParameters.nvidia(model),
    generativeParameters.ollama(),
    generativeParameters.ollama(model),
    generativeParameters.openAI(),
    generativeParameters.openAI(model),
  ];

  tests.forEach((conf) => {
    it(`should get the mocked response for ${conf.name} with config: ${conf.config}`, async () => {
      await stringTest(conf);
      await objectTest(conf);
    });
  });
});
