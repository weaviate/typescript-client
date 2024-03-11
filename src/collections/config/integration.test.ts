/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, { WeaviateNextClient } from '../..';
import { PropertyConfig, VectorIndexConfigHNSW } from './types';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collection.config namespace', () => {
  let client: WeaviateNextClient;

  beforeAll(async () => {
    client = await weaviate.client({
      rest: {
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
  });

  it('should be able get the config of a collection without generics', async () => {
    const collectionName = 'TestCollectionConfigGetWithGenerics';
    type TestCollectionConfigGet = {
      testProp: string;
    };
    await client.collections.create<TestCollectionConfigGet>({
      name: collectionName,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: weaviate.configure.vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexSearchable: true,
        indexFilterable: true,
        indexInverted: false,
        vectorizerConfig: undefined,
        nestedProperties: undefined,
        tokenization: 'word',
      },
    ]);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
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
      quantizer: undefined,
    });
    expect(config.vectorizer.default.indexType).toEqual('hnsw');
    expect(config.vectorizer.default.vectorizer.name).toEqual('none');
  });

  it('should be able get the config of a collection with generics', async () => {
    const collectionName = 'TestCollectionConfigGetWithoutGenerics';
    type TestCollectionConfigGet = {
      testProp: string;
    };
    await client.collections.create<TestCollectionConfigGet>({
      name: collectionName,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: weaviate.configure.vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexSearchable: true,
        indexFilterable: true,
        indexInverted: false,
        vectorizerConfig: undefined,
        nestedProperties: undefined,
        tokenization: 'word',
      },
    ]);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
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
      quantizer: undefined,
    });
    expect(config.vectorizer.default.indexType).toEqual('hnsw');
    expect(config.vectorizer.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get a collection with named vectors', async () => {
    const collectionName = 'TestCollectionConfigGetNamedVectors';
    await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: 'title',
          dataType: 'text',
        },
      ],
      vectorizer: [
        weaviate.configure.namedVectorizer.text2VecContextionary('title', 'hnsw', { properties: ['title'] }),
      ],
    });
    const collection = client.collections.get(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.title.indexConfig).toBeDefined();
    expect(config.vectorizer.title.indexType).toEqual('hnsw');
    expect(config.vectorizer.title.properties).toEqual(['title']);
    expect(config.vectorizer.title.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to get the config of a collection with HNSW+PQ', async () => {
    const collectionName = 'TestCollectionConfigGetHNSWPlusPQ';
    await client.collections.create({
      name: collectionName,
      vectorIndex: weaviate.configure.vectorIndex.hnsw({
        quantizer: weaviate.configure.vectorIndex.quantizer.pq(),
      }),
    });
    const collection = client.collections.get(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.default.indexConfig).toBeDefined();
    expect(config.vectorizer.default.indexConfig.quantizer).toBeDefined();
    expect(config.vectorizer.default.indexType).toEqual('hnsw');
    expect(config.vectorizer.default.properties).toBeUndefined();
    expect(config.vectorizer.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a collection with HNSW+BQ', async () => {
    const collectionName = 'TestCollectionConfigGetHNSWPlusBQ';
    await client.collections.create({
      name: collectionName,
      vectorIndex: weaviate.configure.vectorIndex.hnsw({
        quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
      }),
    });
    const collection = client.collections.get(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.default.indexConfig).toBeDefined();
    expect(config.vectorizer.default.indexConfig.quantizer).toBeDefined();
    expect(config.vectorizer.default.indexType).toEqual('hnsw');
    expect(config.vectorizer.default.properties).toBeUndefined();
    expect(config.vectorizer.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a collection with flat+BQ', async () => {
    const collectionName = 'TestCollectionConfigGetFlatPlusBQ';
    await client.collections.create({
      name: collectionName,
      vectorIndex: weaviate.configure.vectorIndex.flat({
        quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
      }),
    });
    const collection = client.collections.get(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizer.default.indexConfig).toBeDefined();
    expect(config.vectorizer.default.indexConfig.quantizer).toBeDefined();
    expect(config.vectorizer.default.indexType).toEqual('flat');
    expect(config.vectorizer.default.properties).toBeUndefined();
    expect(config.vectorizer.default.vectorizer.name).toEqual('none');
  });

  it('should be able to add a property to a collection', async () => {
    const collectionName = 'TestCollectionConfigAddProperty';
    const collection = await client.collections.create({
      name: collectionName,
      vectorizer: weaviate.configure.vectorizer.none(),
    });
    const config = await collection.config
      .addProperty({
        name: 'testProp',
        dataType: 'text',
      })
      .then(() => collection.config.get());
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexSearchable: true,
        indexFilterable: true,
        indexInverted: false,
        vectorizerConfig: undefined,
        nestedProperties: undefined,
        tokenization: 'word',
      },
    ]);
  });

  it('should be able to add a reference to a collection', async () => {
    const collectionName = 'TestCollectionConfigAddReference' as const;
    const collection = await client.collections.create({
      name: collectionName,
      vectorizer: weaviate.configure.vectorizer.none(),
    });
    const config = await collection.config
      .addReference({
        name: 'testProp',
        targetCollection: collection.name,
      })
      .then(() => collection.config.get());
    expect(config.references).toEqual([
      {
        name: 'testProp',
        targetCollections: [collectionName],
        description: undefined,
      },
    ]);
  });

  it('should get the shards of a sharded collection', async () => {
    const shards = await client.collections
      .create({
        name: 'TestCollectionConfigGetShards',
        sharding: {
          desiredCount: 2,
          actualCount: 2,
        },
      })
      .then((collection) => collection.config.getShards());

    expect(shards.length).toEqual(2);
    expect(shards[0].name).toBeDefined();
    expect(shards[0].status).toEqual('READY');
    expect(shards[0].vectorQueueSize).toEqual(0);
    expect(shards[1].name).toBeDefined();
    expect(shards[1].status).toEqual('READY');
    expect(shards[1].vectorQueueSize).toEqual(0);
  });

  it('should update all the shard statuses of a sharded collection', async () => {
    const shards = await client.collections
      .create({
        name: 'TestCollectionConfigUpdateAllShardStatuses',
        sharding: {
          desiredCount: 2,
          actualCount: 2,
        },
      })
      .then((collection) => collection.config.updateShards('READONLY'));

    expect(shards.length).toEqual(2);
    expect(shards[0].name).toBeDefined();
    expect(shards[0].status).toEqual('READONLY');
    expect(shards[0].vectorQueueSize).toEqual(0);
    expect(shards[1].name).toBeDefined();
    expect(shards[1].status).toEqual('READONLY');
    expect(shards[1].vectorQueueSize).toEqual(0);
  });

  it('should update all the shard statuses of a sharded collection', async () => {
    const { shards, shard } = await client.collections
      .create({
        name: 'TestCollectionConfigUpdateOneShardStatus',
        sharding: {
          desiredCount: 2,
          actualCount: 2,
        },
      })
      .then(async (collection) => {
        return { collection, shard: await collection.config.getShards().then((shards) => shards[0].name) };
      })
      .then(async ({ collection, shard }) => {
        return { shard, shards: await collection.config.updateShards('READONLY', shard) };
      });

    expect(shards.length).toEqual(2);
    const updated = shards.find((s) => s.name === shard);
    const notUpdated = shards.find((s) => s.name !== shard);
    expect(updated?.status).toEqual('READONLY');
    expect(notUpdated?.status).toEqual('READY');
  });
});
