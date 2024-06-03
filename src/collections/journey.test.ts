import weaviate, { CollectionConfig, WeaviateClient } from '../index.js';
import { GeoCoordinate } from '../proto/v1/properties.js';

describe('Journey testing of the client using a WCD cluster', () => {
  let client: WeaviateClient;
  const collectionName = 'MyTSTestingCollection';

  type MyType = {
    name: string;
    age: number;
    location?: GeoCoordinate;
    dateOfBirth: Date;
  };

  beforeAll(async () => {
    client = await weaviate.connectToWeaviateCloud(
      'https://piblpmmdsiknacjnm1ltla.c1.europe-west3.gcp.weaviate.cloud',
      {
        authCredentials: 'NOg5AliYnrN6z7dZDuGv7SLVKhTabAaSTKS7',
      }
    );
    return client.collections.delete(collectionName);
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
      vectorizers: weaviate.configure.vectorizer.text2VecCohere(),
    });
  });

  it('should get the config for the created collection', () => {
    return client.collections
      .get(collectionName)
      .config.get()
      .then((config) => {
        expect(config).toEqual<CollectionConfig>({
          name: 'MyTSTestingCollection',
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
            autoTenantCreation: false,
            enabled: false,
          },
          properties: [
            {
              name: 'name',
              dataType: 'text',
              indexFilterable: true,
              indexInverted: false,
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
              indexFilterable: true,
              indexInverted: false,
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
              indexFilterable: true,
              indexInverted: false,
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
              indexFilterable: true,
              indexInverted: false,
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
            factor: 1,
          },
          reranker: {
            name: 'reranker-cohere',
            config: {},
          },
          sharding: {
            virtualPerPhysical: 128,
            desiredCount: 1,
            actualCount: 1,
            desiredVirtualCount: 128,
            actualVirtualCount: 128,
            key: '_id',
            strategy: 'hash',
            function: 'murmur3',
          },
          vectorizers: {
            default: {
              vectorizer: {
                name: 'text2vec-cohere',
                config: {},
              },
              indexConfig: {
                cleanupIntervalSeconds: 300,
                distance: 'cosine',
                dynamicEfMin: 100,
                dynamicEfMax: 500,
                dynamicEfFactor: 8,
                ef: -1,
                efConstruction: 128,
                flatSearchCutoff: 40000,
                maxConnections: 64,
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
