/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '../..';
import Configure from '../configure';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collection.config namespace', () => {
  const client = weaviate.next({
    http: {
      secure: false,
      host: 'localhost',
      port: 8080,
    },
    grpc: {
      secure: false,
      host: 'localhost',
      port: 50051,
    },
  });

  it('should be able get the config of a collection without generics', async () => {
    const className = 'TestCollectionConfigGetWithGenerics';
    type TestCollectionConfigGet = {
      testProp: string;
    };
    await client.collections.create<TestCollectionConfigGet>({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: Configure.Vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(className);
    const config = await collection.config.get();

    expect(config.name).toEqual(className);
    expect(config.properties).toEqual([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexSearchable: true,
        indexFilterable: true,
        indexInverted: false,
        moduleConfig: undefined,
        nestedProperties: undefined,
        tokenization: 'word',
      },
    ]);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorIndex).toEqual({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: 64,
      efConstruction: 128,
      ef: -1,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      flatSearchCutoff: 40000,
      distance: 'cosine',
      pq: {
        enabled: false,
        bitCompression: false,
        segments: 0,
        centroids: 256,
        trainingLimit: 100000,
        encoder: {
          type: 'kmeans',
          distribution: 'log-normal',
        },
      },
    });
    expect(config.vectorIndexType).toEqual('hnsw');
    expect(config.vectorizer).toBeUndefined();
  });

  it('should be able get the config of a collection with generics', async () => {
    const className = 'TestCollectionConfigGetWithoutGenerics';
    type TestCollectionConfigGet = {
      testProp: string;
    };
    await client.collections.create<TestCollectionConfigGet>({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: Configure.Vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(className);
    const config = await collection.config.get<'hnsw', 'none', 'none', 'text2vec-contextionary'>();

    expect(config.name).toEqual(className);
    expect(config.properties).toEqual([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexSearchable: true,
        indexFilterable: true,
        indexInverted: false,
        moduleConfig: undefined,
        nestedProperties: undefined,
        tokenization: 'word',
      },
    ]);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorIndex).toEqual({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: 64,
      efConstruction: 128,
      ef: -1,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      flatSearchCutoff: 40000,
      distance: 'cosine',
      pq: {
        enabled: false,
        bitCompression: false,
        segments: 0,
        centroids: 256,
        trainingLimit: 100000,
        encoder: {
          type: 'kmeans',
          distribution: 'log-normal',
        },
      },
    });
    expect(config.vectorIndexType).toEqual('hnsw');
    expect(config.vectorizer).toBeUndefined();
  });
});
