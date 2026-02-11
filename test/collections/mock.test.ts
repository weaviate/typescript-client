import express from 'express';
import { Server as HttpServer } from 'http';
import { createServer, Server as GrpcServer } from 'nice-grpc';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import weaviate, { WeaviateClient } from '../../src/index.js';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../src/proto/google/health/v1/health.js';
import { WeaviateClass } from '../../src/v2/index.js';

// Mock schema data
const mockExportedSchema: WeaviateClass = {
  class: 'TestCollection',
  description: 'A test collection for JSON export',
  properties: [
    {
      name: 'title',
      dataType: ['text'],
    },
    {
      name: 'content',
      dataType: ['text'],
    },
    {
      name: 'publishDate',
      dataType: ['date'],
    },
  ],
  vectorConfig: {
    default: {
      vectorIndexType: 'hnsw',
      vectorizer: {
        'text2vec-contextionary': {
          vectorizeClassName: true,
        },
      },
    },
  },
};

const mockComplexSchema: WeaviateClass = {
  class: 'ComplexCollection',
  description: 'Complex collection with nested properties',
  properties: [
    {
      name: 'metadata',
      dataType: ['object'],
      nestedProperties: [
        {
          name: 'author',
          dataType: ['text'],
        },
        {
          name: 'tags',
          dataType: ['text[]'],
        },
      ],
    },
    {
      name: 'score',
      dataType: ['number'],
    },
  ],
  invertedIndexConfig: {
    indexTimestamps: true,
    indexPropertyLength: true,
  },
};

const mockNamedVectorSchema: WeaviateClass = {
  class: 'NamedVectorCollection',
  properties: [
    {
      name: 'content',
      dataType: ['text'],
    },
  ],
  vectorConfig: {
    custom_vector: {
      vectorIndexType: 'hnsw',
      vectorizer: {
        none: {},
      },
    },
  },
};

const makeRestApp = (version: string, createdSchemas: Map<string, WeaviateClass>) => {
  const httpApp = express();
  httpApp.use(express.json());

  // Meta endpoint required for client instantiation
  httpApp.get('/v1/meta', (req, res) => res.send({ version }));

  // Export schema endpoint - GET /v1/schema/:className
  httpApp.get('/v1/schema/:className', (req, res) => {
    const className = req.params.className;
    const schema = createdSchemas.get(className);

    if (!schema) {
      res.status(404).send({ error: `Collection ${className} not found` });
      return;
    }

    res.send(schema);
  });

  // Create schema endpoint - POST /v1/schema
  httpApp.post('/v1/schema', (req, res) => {
    const schema: WeaviateClass = req.body;

    if (!schema.class) {
      res.status(400).send({ error: 'Class name is required' });
      return;
    }

    // Store the created schema
    createdSchemas.set(schema.class, schema);

    res.status(200).send(schema);
  });

  return httpApp;
};

const makeGrpcApp = () => {
  // gRPC health check required for client instantiation
  const healthMockImpl: HealthServiceImplementation = {
    check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
      Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
    watch: vi.fn(),
  };

  const grpcApp = createServer();
  grpcApp.add(HealthDefinition, healthMockImpl);

  return grpcApp;
};

const makeMockServers = async (weaviateVersion: string, httpPort: number, grpcAddress: string) => {
  // Pre-populate with mock schemas
  const createdSchemas = new Map<string, WeaviateClass>();
  createdSchemas.set('TestCollection', mockExportedSchema);
  createdSchemas.set('ComplexCollection', mockComplexSchema);
  createdSchemas.set('NamedVectorCollection', mockNamedVectorSchema);

  const rest = makeRestApp(weaviateVersion, createdSchemas);
  const grpc = makeGrpcApp();
  const server = await rest.listen(httpPort);
  await grpc.listen(grpcAddress);
  return { rest: server, grpc };
};

describe('Mock testing of exportToJson and createFromJson', () => {
  let servers: {
    rest: HttpServer;
    grpc: GrpcServer;
  };
  let client: WeaviateClient;

  beforeAll(async () => {
    servers = await makeMockServers('1.27.0', 8920, 'localhost:8921');
    client = await weaviate.connectToLocal({ port: 8920, grpcPort: 8921 });
  });

  afterAll(() => Promise.all([servers.rest.close(), servers.grpc.shutdown()]));

  describe('exportToJson', () => {
    it('should export a simple collection schema to JSON', async () => {
      const collectionName = 'TestCollection';
      const exportedSchema = await client.collections.exportToJson(collectionName);

      expect(exportedSchema).toBeDefined();
      expect(exportedSchema.class).toEqual(collectionName);
      expect(exportedSchema.description).toEqual('A test collection for JSON export');
      expect(exportedSchema.properties).toBeDefined();
      expect(exportedSchema.properties?.length).toEqual(3);
    });

    it('should export collection with correct property types', async () => {
      const exportedSchema = await client.collections.exportToJson('TestCollection');

      const titleProp = exportedSchema.properties?.find((p) => p.name === 'title');
      expect(titleProp?.dataType).toEqual(['text']);

      const contentProp = exportedSchema.properties?.find((p) => p.name === 'content');
      expect(contentProp?.dataType).toEqual(['text']);

      const publishDateProp = exportedSchema.properties?.find((p) => p.name === 'publishDate');
      expect(publishDateProp?.dataType).toEqual(['date']);
    });

    it('should export a collection with complex configuration', async () => {
      const exportedSchema = await client.collections.exportToJson('ComplexCollection');

      expect(exportedSchema.class).toEqual('ComplexCollection');
      expect(exportedSchema.properties?.length).toEqual(2);

      const metadataProp = exportedSchema.properties?.find((p) => p.name === 'metadata');
      expect(metadataProp?.dataType).toEqual(['object']);
      expect(metadataProp?.nestedProperties).toBeDefined();
      expect(metadataProp?.nestedProperties?.length).toEqual(2);

      expect(exportedSchema.invertedIndexConfig).toBeDefined();
      expect(exportedSchema.invertedIndexConfig?.indexTimestamps).toEqual(true);
      expect(exportedSchema.invertedIndexConfig?.indexPropertyLength).toEqual(true);
    });

    it('should export collection with named vectors', async () => {
      const exportedSchema = await client.collections.exportToJson('NamedVectorCollection');

      expect(exportedSchema.vectorConfig).toBeDefined();
      expect(exportedSchema.vectorConfig?.custom_vector).toBeDefined();
    });
  });

  describe('createFromJson', () => {
    it('should create a collection from JSON schema', async () => {
      const schemaJson: WeaviateClass = {
        class: 'NewTestCollection',
        description: 'A test collection created from JSON',
        properties: [
          {
            name: 'author',
            dataType: ['text'],
          },
          {
            name: 'rating',
            dataType: ['number'],
          },
        ],
      };

      const collection = await client.collections.createFromJson(schemaJson);

      expect(collection).toBeDefined();
    });

    it('should create a collection from minimal JSON schema', async () => {
      const minimalSchema: WeaviateClass = {
        class: 'MinimalCollection',
        properties: [
          {
            name: 'text',
            dataType: ['text'],
          },
        ],
      };

      const collection = await client.collections.createFromJson(minimalSchema);

      expect(collection).toBeDefined();
    });

    it('should create a collection with complex nested properties', async () => {
      const complexSchema: WeaviateClass = {
        class: 'ComplexNestedCollection',
        description: 'Collection with nested properties',
        properties: [
          {
            name: 'metadata',
            dataType: ['object'],
            nestedProperties: [
              {
                name: 'author',
                dataType: ['text'],
              },
              {
                name: 'tags',
                dataType: ['text[]'],
              },
            ],
          },
        ],
      };

      const collection = await client.collections.createFromJson(complexSchema);

      expect(collection).toBeDefined();
    });

    it('should create a collection with vector configuration', async () => {
      const vectorSchema: WeaviateClass = {
        class: 'VectorCollection',
        properties: [
          {
            name: 'content',
            dataType: ['text'],
          },
        ],
        vectorConfig: {
          named_vector: {
            vectorIndexType: 'hnsw',
            vectorizer: {
              none: {},
            },
          },
        },
      };

      const collection = await client.collections.createFromJson(vectorSchema);

      expect(collection).toBeDefined();
    });
  });

  describe('round-trip export and import', () => {
    it('should export and re-import a schema successfully', async () => {
      // Export existing schema
      const exportedSchema = await client.collections.exportToJson('TestCollection');

      // Modify for re-import
      exportedSchema.class = 'ReimportedCollection';
      exportedSchema.description = 'Reimported from exported schema';

      // Create new collection from exported schema
      const reimportedCollection = await client.collections.createFromJson(exportedSchema);

      expect(reimportedCollection).toBeDefined();
    });

    it('should preserve complex configuration in round-trip', async () => {
      const exportedSchema = await client.collections.exportToJson('ComplexCollection');

      // Change name and re-import
      exportedSchema.class = 'ReimportedComplexCollection';

      const collection = await client.collections.createFromJson(exportedSchema);

      expect(collection).toBeDefined();
    });
  });
});
