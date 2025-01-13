/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import weaviate, { WeaviateClient, weaviateV2 } from '../../index.js';
import {
  GenerativeCohereConfig,
  ModuleConfig,
  MultiTenancyConfig,
  PropertyConfig,
  RerankerCohereConfig,
  VectorIndexConfigDynamic,
  VectorIndexConfigHNSW,
} from './types/index.js';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collection.config namespace', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
  });

  afterAll(() => client.collections.deleteAll());

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
      vectorizers: weaviate.configure.vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexRangeFilters: false,
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
    expect(config.vectorizers.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) ? 64 : 32,
      efConstruction: 128,
      ef: -1,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      filterStrategy: 'sweeping',
      flatSearchCutoff: 40000,
      distance: 'cosine',
      quantizer: undefined,
      type: 'hnsw',
    });
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
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
      vectorizers: weaviate.configure.vectorizer.none(),
    });
    const collection = client.collections.get<TestCollectionConfigGet>(collectionName);
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexRangeFilters: false,
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
    expect(config.vectorizers.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) ? 64 : 32,
      efConstruction: 128,
      ef: -1,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      filterStrategy: 'sweeping',
      flatSearchCutoff: 40000,
      distance: 'cosine',
      quantizer: undefined,
      type: 'hnsw',
    });
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get a collection with named vectors', async () => {
    const collectionName = 'TestCollectionConfigGetVectors';
    const query = () =>
      client.collections.create({
        name: collectionName,
        properties: [
          {
            name: 'title',
            dataType: 'text',
            skipVectorization: true,
            vectorizePropertyName: false,
          },
          {
            name: 'age',
            dataType: 'int',
          },
        ],
        vectorizers: [
          weaviate.configure.vectorizer.text2VecContextionary({
            name: 'title',
            sourceProperties: ['title'],
          }),
          weaviate.configure.vectorizer.text2VecContextionary({
            name: 'age',
            sourceProperties: ['age'],
          }),
        ],
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const config = await query().then((col) => col.config.get());

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.properties[0].vectorizerConfig?.['text2vec-contextionary'].vectorizePropertyName).toEqual(
      false
    );
    expect(config.properties[0].vectorizerConfig?.['text2vec-contextionary'].skip).toEqual(true);
    expect(config.properties[1].vectorizerConfig?.['text2vec-contextionary'].vectorizePropertyName).toEqual(
      true
    );
    expect(config.properties[1].vectorizerConfig?.['text2vec-contextionary'].skip).toEqual(false);
    expect(config.vectorizers.title.indexConfig).toBeDefined();
    expect(config.vectorizers.title.indexType).toEqual('hnsw');
    expect(config.vectorizers.title.properties).toEqual(['title']);
    expect(config.vectorizers.title.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to get the config of a collection with HNSW+PQ', async () => {
    const collectionName = 'TestCollectionConfigGetHNSWPlusPQ';
    const collection = await client.collections.create({
      name: collectionName,
      vectorizers: weaviate.configure.vectorizer.none({
        vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
          quantizer: weaviate.configure.vectorIndex.quantizer.pq(),
        }),
      }),
    });
    const config = await collection.config.get();

    const vectorIndexConfig = config.vectorizers.default.indexConfig as VectorIndexConfigHNSW;
    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(vectorIndexConfig).toBeDefined();
    expect(vectorIndexConfig.quantizer).toBeDefined();
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.properties).toBeUndefined();
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a collection with HNSW+BQ', async () => {
    const collectionName = 'TestCollectionConfigGetHNSWPlusBQ';
    const query = () =>
      client.collections.create({
        name: collectionName,
        vectorizers: weaviate.configure.vectorizer.none({
          vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
            quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
          }),
        }),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const config = await query().then((col) => col.config.get());

    const vectorIndexConfig = config.vectorizers.default.indexConfig as VectorIndexConfigHNSW;
    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(vectorIndexConfig).toBeDefined();
    expect(vectorIndexConfig.quantizer).toBeDefined();
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.properties).toBeUndefined();
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a collection with flat+BQ', async () => {
    const collectionName = 'TestCollectionConfigGetFlatPlusBQ';
    const collection = await client.collections.create({
      name: collectionName,
      vectorizers: weaviate.configure.vectorizer.none({
        vectorIndexConfig: weaviate.configure.vectorIndex.flat({
          quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
        }),
      }),
    });
    const config = await collection.config.get();

    const vectorIndexConfig = config.vectorizers.default.indexConfig as VectorIndexConfigHNSW;
    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(vectorIndexConfig).toBeDefined();
    expect(vectorIndexConfig.quantizer).toBeDefined();
    expect(config.vectorizers.default.indexType).toEqual('flat');
    expect(config.vectorizers.default.properties).toBeUndefined();
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a single-vector collection with dynamic+BQ', async () => {
    const asyncIndexing = await weaviate.connectToLocal({ port: 8078, grpcPort: 50049 }); // need async indexing for dynamic vectorizer
    const collectionName = 'TestSVCollectionConfigGetDynamicPlusBQ';
    await asyncIndexing.collections.delete(collectionName);
    const query = () =>
      asyncIndexing.collections.create({
        name: collectionName,
        vectorizers: weaviate.configure.vectorizer.none({
          vectorIndexConfig: weaviate.configure.vectorIndex.dynamic({
            hnsw: weaviate.configure.vectorIndex.hnsw({
              quantizer: weaviate.configure.vectorIndex.quantizer.pq(),
            }),
            flat: weaviate.configure.vectorIndex.flat({
              quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
            }),
          }),
        }),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const config = await query().then((collection) => collection.config.get());

    const vectorIndexConfig = config.vectorizers.default.indexConfig as VectorIndexConfigDynamic;
    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(vectorIndexConfig).toBeDefined();
    expect((vectorIndexConfig as any).quantizer).toBeUndefined();
    expect(vectorIndexConfig.hnsw).toBeDefined();
    expect(vectorIndexConfig.hnsw.quantizer).toBeDefined();
    expect(vectorIndexConfig.flat).toBeDefined();
    expect(vectorIndexConfig.flat.quantizer).toBeDefined();
    expect(config.vectorizers.default.indexType).toEqual('dynamic');
    expect(config.vectorizers.default.properties).toBeUndefined();
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to get the config of a multi-vector collection with dynamic+BQ', async () => {
    const asyncIndexing = await weaviate.connectToLocal({ port: 8078, grpcPort: 50049 }); // need async indexing for dynamic vectorizer
    const collectionName = 'TestMVCollectionConfigGetDynamicPlusBQ';
    await asyncIndexing.collections.delete(collectionName);
    const query = () =>
      asyncIndexing.collections.create({
        name: collectionName,
        vectorizers: weaviate.configure.vectorizer.none({
          vectorIndexConfig: weaviate.configure.vectorIndex.dynamic({
            hnsw: weaviate.configure.vectorIndex.hnsw({
              quantizer: weaviate.configure.vectorIndex.quantizer.pq(),
            }),
            flat: weaviate.configure.vectorIndex.flat({
              quantizer: weaviate.configure.vectorIndex.quantizer.bq(),
            }),
          }),
        }),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const config = await query().then((collection) => collection.config.get());

    const vectorIndexConfig = config.vectorizers.default.indexConfig as VectorIndexConfigDynamic;
    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(vectorIndexConfig).toBeDefined();
    expect((vectorIndexConfig as any).quantizer).toBeUndefined();
    expect(vectorIndexConfig.hnsw).toBeDefined();
    expect(vectorIndexConfig.hnsw.quantizer).toBeDefined();
    expect(vectorIndexConfig.flat).toBeDefined();
    expect(vectorIndexConfig.flat.quantizer).toBeDefined();
    expect(config.vectorizers.default.indexType).toEqual('dynamic');
    expect(config.vectorizers.default.properties).toBeUndefined();
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to add a property to a collection', async () => {
    const collectionName = 'TestCollectionConfigAddProperty';
    const collection = await client.collections.create({
      name: collectionName,
      vectorizers: weaviate.configure.vectorizer.none(),
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
        indexRangeFilters: false,
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
      vectorizers: weaviate.configure.vectorizer.none(),
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

  it('should be able update the config of a collection', async () => {
    const collectionName = 'TestCollectionConfigUpdate';
    const collection = await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizers: weaviate.configure.vectorizer.none(),
    });
    const config = await collection.config
      .update({
        vectorizers: weaviate.reconfigure.vectorizer.update({
          vectorIndexConfig: weaviate.reconfigure.vectorIndex.hnsw({
            quantizer: weaviate.reconfigure.vectorIndex.quantizer.pq(),
            ef: 4,
          }),
        }),
      })
      .then(() => collection.config.get());

    expect(config.name).toEqual(collectionName);
    expect(config.properties).toEqual<PropertyConfig[]>([
      {
        name: 'testProp',
        dataType: 'text',
        description: undefined,
        indexRangeFilters: false,
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
    expect(config.vectorizers.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) ? 64 : 32,
      efConstruction: 128,
      ef: 4,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      filterStrategy: 'sweeping',
      flatSearchCutoff: 40000,
      distance: 'cosine',
      quantizer: {
        bitCompression: false,
        segments: 0,
        centroids: 256,
        trainingLimit: 100000,
        encoder: {
          type: 'kmeans',
          distribution: 'log-normal',
        },
        type: 'pq',
      },
      type: 'hnsw',
    });
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to create and get a collection with multi-tenancy enabled', async () => {
    const collectionName = 'TestCollectionConfigCreateGetMultiTenancy';
    const collection = await client.collections.create({
      name: collectionName,
      multiTenancy: weaviate.configure.multiTenancy({
        autoTenantActivation: true,
        autoTenantCreation: true,
      }),
    });
    const config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.multiTenancy.autoTenantActivation).toEqual(
      await client.getWeaviateVersion().then((ver) => !ver.isLowerThan(1, 25, 2))
    );
    expect(config.multiTenancy.autoTenantCreation).toEqual(
      await client.getWeaviateVersion().then((ver) => !ver.isLowerThan(1, 25, 0))
    );
    expect(config.multiTenancy.enabled).toEqual(true);
  });

  it('should be able to create and update a collection with multi-tenancy enabled', async () => {
    const collectionName = 'TestCollectionConfigCreateUpdateMultiTenancy';
    const collection = await client.collections.create({
      name: collectionName,
      multiTenancy: weaviate.configure.multiTenancy(),
    });
    let config = await collection.config.get();
    expect(config.multiTenancy).toEqual<MultiTenancyConfig>({
      enabled: true,
      autoTenantActivation: false,
      autoTenantCreation: false,
    });

    await collection.config.update({
      multiTenancy: weaviate.reconfigure.multiTenancy({
        autoTenantActivation: true,
        autoTenantCreation: true,
      }),
    });
    config = await collection.config.get();

    expect(config.name).toEqual(collectionName);
    expect(config.multiTenancy.autoTenantActivation).toEqual(
      await client.getWeaviateVersion().then((ver) => !ver.isLowerThan(1, 25, 2))
    );
    expect(config.multiTenancy.autoTenantCreation).toEqual(
      await client.getWeaviateVersion().then((ver) => !ver.isLowerThan(1, 25, 0))
    );
    expect(config.multiTenancy.enabled).toEqual(true);
  });

  it('should be able update the config of a collection with legacy vectors', async () => {
    const clientV2 = weaviateV2.client({
      host: 'http://localhost:8080',
    });
    const collectionName = 'TestCollectionConfigUpdateLegacyVectors';
    await clientV2.schema
      .classCreator()
      .withClass({
        class: collectionName,
        vectorizer: 'none',
      })
      .do();
    const collection = client.collections.get(collectionName);
    const config = await collection.config
      .update({
        vectorizers: weaviate.reconfigure.vectorizer.update({
          vectorIndexConfig: weaviate.reconfigure.vectorIndex.hnsw({
            quantizer: weaviate.reconfigure.vectorIndex.quantizer.pq(),
            ef: 4,
          }),
        }),
      })
      .then(() => collection.config.get());

    expect(config.name).toEqual(collectionName);
    expect(config.generative).toBeUndefined();
    expect(config.reranker).toBeUndefined();
    expect(config.vectorizers.default.indexConfig).toEqual<VectorIndexConfigHNSW>({
      skip: false,
      cleanupIntervalSeconds: 300,
      maxConnections: (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) ? 64 : 32,
      efConstruction: 128,
      ef: 4,
      dynamicEfMin: 100,
      dynamicEfMax: 500,
      dynamicEfFactor: 8,
      vectorCacheMaxObjects: 1000000000000,
      filterStrategy: 'sweeping',
      flatSearchCutoff: 40000,
      distance: 'cosine',
      type: 'hnsw',
      quantizer: {
        bitCompression: false,
        segments: 0,
        centroids: 256,
        trainingLimit: 100000,
        encoder: {
          type: 'kmeans',
          distribution: 'log-normal',
        },
        type: 'pq',
      },
    });
    expect(config.vectorizers.default.indexType).toEqual('hnsw');
    expect(config.vectorizers.default.vectorizer.name).toEqual('none');
  });

  it('should be able to update the generative & reranker configs of a collection', async () => {
    if ((await client.getWeaviateVersion()).isLowerThan(1, 25, 0)) {
      console.warn('Skipping test because Weaviate version is lower than 1.25.0');
      return;
    }
    const collectionName = 'TestCollectionConfigUpdateGenerative';
    const collection = client.collections.get(collectionName);
    await client.collections.create({
      name: collectionName,
      vectorizers: weaviate.configure.vectorizer.none(),
    });
    let config = await collection.config.get();
    expect(config.generative).toBeUndefined();

    await collection.config.update({
      generative: weaviate.reconfigure.generative.cohere({
        model: 'model',
      }),
    });

    config = await collection.config.get();
    expect(config.generative).toEqual<ModuleConfig<'generative-cohere', GenerativeCohereConfig>>({
      name: 'generative-cohere',
      config: {
        model: 'model',
      },
    });

    await collection.config.update({
      reranker: weaviate.reconfigure.reranker.cohere({
        model: 'model',
      }),
    });

    config = await collection.config.get();
    expect(config.generative).toEqual<ModuleConfig<'generative-cohere', GenerativeCohereConfig>>({
      name: 'generative-cohere',
      config: {
        model: 'model',
      },
    });
    expect(config.reranker).toEqual<ModuleConfig<'reranker-cohere', RerankerCohereConfig>>({
      name: 'reranker-cohere',
      config: {
        model: 'model',
      },
    });
  });
});
