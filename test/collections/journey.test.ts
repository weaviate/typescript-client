import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import weaviate, { CollectionConfig, WeaviateClient } from '../../src/index.js';
import { GeoCoordinate } from '../../src/proto/v1/properties.js';

describe('Journey testing of the client using a WCD cluster', () => {
  let client: WeaviateClient;
  const collectionName = `MyTSTestingCollection_${Date.now()}`;

  type MyType = {
    name: string;
    age: number;
    location?: GeoCoordinate;
    dateOfBirth: Date;
  };

  afterAll(() => client.collections.delete(collectionName));

  beforeAll(async () => {
    client = await weaviate.connectToWeaviateCloud(
      'https://piblpmmdsiknacjnm1ltla.c1.europe-west3.gcp.weaviate.cloud',
      {
        authCredentials: 'NOg5AliYnrN6z7dZDuGv7SLVKhTabAaSTKS7',
      }
    );
  });

  it('should create the correct config for a collection with vectorizer, generative, and reranker modules', () => {
    return client.collections.create<MyType>({
      name: collectionName,
      properties: [
        {
          name: 'name',
          dataType: 'text',
        },
        {
          name: 'age',
          dataType: 'int',
        },
        {
          name: 'location',
          dataType: 'geoCoordinates',
        },
        {
          name: 'dateOfBirth',
          dataType: 'date',
        },
      ],
      generative: weaviate.configure.generative.cohere(),
      reranker: weaviate.configure.reranker.cohere(),
      vectorizers: weaviate.configure.vectors.text2VecCohere(),
    });
  });

  it('should get the config for the created collection', () => {
    return client.collections
      .get(collectionName)
      .config.get()
      .then(async (config) => {
        expect(config).toEqual<CollectionConfig>({
          name: collectionName,
          description: undefined,
          generative: {
            name: 'generative-cohere',
            config: {},
          },
          invertedIndex: {
            bm25: {
              b: 0.75,
              k1: 1.2,
            },
            cleanupIntervalSeconds: 60,
            stopwords: {
              additions: [],
              preset: 'en',
              removals: [],
            },
            indexNullState: false,
            indexPropertyLength: false,
            indexTimestamps: false,
          },
          multiTenancy: {
            autoTenantActivation: false,
            autoTenantCreation: false,
            enabled: false,
          },
          objectTTL: { enabled: false },
          properties: [
            {
              name: 'name',
              dataType: 'text',
              description: undefined,
              nestedProperties: undefined,
              indexFilterable: true,
              indexInverted: false,
              indexRangeFilters: false,
              indexSearchable: true,
              vectorizerConfig: {
                'text2vec-cohere': {
                  skip: false,
                  vectorizePropertyName: true,
                },
              },
              tokenization: 'word',
            },
            {
              name: 'age',
              dataType: 'int',
              description: undefined,
              nestedProperties: undefined,
              indexFilterable: true,
              indexInverted: false,
              indexRangeFilters: false,
              indexSearchable: false,
              vectorizerConfig: {
                'text2vec-cohere': {
                  skip: false,
                  vectorizePropertyName: true,
                },
              },
              tokenization: 'none',
            },
            {
              name: 'location',
              dataType: 'geoCoordinates',
              description: undefined,
              nestedProperties: undefined,
              indexFilterable: true,
              indexInverted: false,
              indexRangeFilters: false,
              indexSearchable: false,
              vectorizerConfig: {
                'text2vec-cohere': {
                  skip: false,
                  vectorizePropertyName: true,
                },
              },
              tokenization: 'none',
            },
            {
              name: 'dateOfBirth',
              dataType: 'date',
              description: undefined,
              nestedProperties: undefined,
              indexFilterable: true,
              indexInverted: false,
              indexRangeFilters: false,
              indexSearchable: false,
              vectorizerConfig: {
                'text2vec-cohere': {
                  skip: false,
                  vectorizePropertyName: true,
                },
              },
              tokenization: 'none',
            },
          ],
          references: [],
          replication: {
            asyncEnabled: false,
            deletionStrategy: 'NoAutomatedResolution',
            factor: 3,
          },
          reranker: {
            name: 'reranker-cohere',
            config: {},
          },
          sharding: {
            virtualPerPhysical: 384,
            desiredCount: 3,
            actualCount: 3,
            desiredVirtualCount: 384,
            actualVirtualCount: 384,
            key: '_id',
            strategy: 'hash',
            function: 'murmur3',
          },
          vectorizers: {
            default: {
              properties: undefined,
              vectorizer: {
                name: 'text2vec-cohere',
                config: {
                  baseUrl: 'https://api.cohere.ai',
                  model: 'embed-multilingual-v3.0',
                  truncate: 'END',
                  vectorizeCollectionName: true,
                },
              },
              indexConfig: {
                cleanupIntervalSeconds: 300,
                distance: 'cosine',
                dynamicEfMin: 100,
                dynamicEfMax: 500,
                dynamicEfFactor: 8,
                ef: -1,
                efConstruction: 128,
                filterStrategy: 'acorn',
                flatSearchCutoff: 40000,
                maxConnections: (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0)))
                  ? 64
                  : 32,
                multiVector: undefined,
                skip: false,
                vectorCacheMaxObjects: 1000000000000,
                quantizer: undefined,
                type: 'hnsw',
              },
              indexType: 'hnsw',
            },
          },
        });
      });
  });
});
