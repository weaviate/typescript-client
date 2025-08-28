/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { requireAtLeast } from '../../test/version';
import weaviate, { WeaviateClient } from '../index';
import {
  CollectionConfigCreate,
  GeoCoordinate,
  PQConfig,
  PhoneNumber,
  PropertyConfig,
  ReplicationDeletionStrategy,
  Text2VecContextionaryConfig,
  Text2VecOpenAIConfig,
  VectorIndexConfigHNSW,
} from './types/index';

describe('Testing of the collections.create method', () => {
  let cluster: WeaviateClient;
  let contextionary: WeaviateClient;
  let openai: WeaviateClient;

  beforeAll(async () => {
    cluster = await weaviate.connectToLocal({
      port: 8087,
      grpcPort: 50051,
    });
    contextionary = await weaviate.connectToLocal({
      port: 8080,
      grpcPort: 50051,
    });
    openai = await weaviate.connectToLocal({
      port: 8086,
      grpcPort: 50051,
    });
  });

  afterAll(() =>
    Promise.all([
      cluster.collections.deleteAll(),
      contextionary.collections.deleteAll(),
      openai.collections.deleteAll(),
    ])
  );

  it('should be able to create a simple collection with a generic', async () => {
    const collectionName = 'TestCollectionSimpleGeneric';
    type TestCollectionSimple = {
      testProp: string;
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
      })
      .then(() => contextionary.collections.get<TestCollectionSimple>(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a simple collection without a generic', async () => {
    const collectionName = 'TestCollectionSimpleNonGeneric';
    const response = await contextionary.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
      })
      .then(() => contextionary.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a collection with one fully customised text property', () => {
    return contextionary.collections
      .create({
        name: 'TestCollectionTextProperty',
        properties: [
          {
            name: 'text',
            dataType: 'text',
            indexFilterable: true,
            indexSearchable: true,
            skipVectorization: true,
            tokenization: 'field',
            vectorizePropertyName: true,
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary(),
      })
      .then((collection) => collection.config.get())
      .then((config) =>
        expect(config.properties[0]).toEqual<PropertyConfig>({
          name: 'text',
          dataType: 'text',
          indexFilterable: true,
          indexInverted: false,
          indexRangeFilters: false,
          indexSearchable: true,
          tokenization: 'field',
          vectorizerConfig: {
            'text2vec-contextionary': {
              skip: true,
              vectorizePropertyName: true,
            },
          },
        })
      );
  });

  it('should be able to create a collection with one fully customised int property', () => {
    return contextionary.collections
      .create({
        name: 'TestCollectionIntProperty',
        properties: [
          {
            name: 'int',
            dataType: 'int',
            indexFilterable: true,
            indexRangeFilters: true,
            skipVectorization: true,
            vectorizePropertyName: true,
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary(),
      })
      .then((collection) => collection.config.get())
      .then(async (config) =>
        expect(config.properties[0]).toEqual<PropertyConfig>({
          name: 'int',
          dataType: 'int',
          indexFilterable: true,
          indexInverted: false,
          indexRangeFilters: await contextionary.getWeaviateVersion().then((ver) => ver.isAtLeast(1, 26, 0)),
          indexSearchable: false,
          tokenization: 'none',
          vectorizerConfig: {
            'text2vec-contextionary': {
              skip: true,
              vectorizePropertyName: true,
            },
          },
        })
      );
  });

  it('should be able to create a simple collection without a generic and no properties', async () => {
    const collectionName = 'TestCollectionSimpleNonGenericNoProperties';
    const response = await contextionary.collections
      .create({
        name: collectionName,
      })
      .then(() => contextionary.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(0);
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a collection with 1 custom named vector', async () => {
    const collectionName = 'TestCollectionSingleCustomNamedVector';
    const response = await contextionary.collections
      .create({
        name: collectionName,
        vectorizers: weaviate.configure.vectors.none({ name: 'custom' }),
      })
      .then(() => contextionary.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(0);
    expect(response.vectorizers.custom.indexConfig).toBeDefined();
    expect(response.vectorizers.custom.indexType).toEqual('hnsw');
  });

  it('should be able to create a simple collection without a generic using a schema var', async () => {
    const collectionName = 'TestCollectionSimpleNonGenericVar';
    const schema = {
      name: collectionName,
      properties: [
        {
          name: 'testProp',
          dataType: 'text' as const,
        },
      ],
    };
    const response = await contextionary.collections
      .create(schema)
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => contextionary.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a simple collection with a generic using a schema var with const', async () => {
    const collectionName = 'TestCollectionSimpleGenericVarConst';
    type TestCollectionSimple = {
      testProp: string;
    };
    const schema = {
      name: collectionName,
      properties: [
        {
          name: 'testProp' as const,
          dataType: 'text' as const,
        },
      ],
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>(schema)
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => contextionary.collections.get<TestCollectionSimple>(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a simple collection with a generic using a schema var with type', async () => {
    const collectionName = 'TestCollectionSimpleGenericVarType';
    type TestCollectionSimple = {
      testProp: string;
    };
    const schema: CollectionConfigCreate<TestCollectionSimple> = {
      name: collectionName,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>(schema)
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => contextionary.collections.get<TestCollectionSimple>(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a nested collection', async () => {
    const collectionName = 'TestCollectionNested';
    type TestCollectionNested = {
      testProp: {
        nestedProp: string;
      };
    };
    const response = await contextionary.collections
      .create<TestCollectionNested>({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'object',
            nestedProperties: [
              {
                name: 'nestedProp',
                dataType: 'text',
              },
            ],
          },
        ],
      })
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => contextionary.collections.get<TestCollectionNested>(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('object');
    expect(response.properties[0].nestedProperties?.length).toEqual(1);
    expect(response.properties[0].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a collection with generic properties', () => {
    const collectionName = 'TestCollectionGenericProperties';

    type TestCollectionGenericProperties = {
      text: string;
      texts: string[];
      number: number;
      numbers: number[];
      int: number;
      ints: number[];
      date: Date;
      dates: Date[];
      boolean: boolean;
      booleans: boolean[];
      object: {
        nestedProp: string;
      };
      objects: {
        nestedProp: string;
      }[];
      blob: string;
      geoCoordinates: GeoCoordinate;
      phoneNumber: PhoneNumber;
    };

    return cluster.collections.create<TestCollectionGenericProperties, 'TestCollectionGenericProperties'>({
      name: collectionName,
      properties: [
        {
          name: 'text',
          dataType: 'text',
        },
        {
          name: 'texts',
          dataType: 'text[]',
        },
        {
          name: 'number',
          dataType: 'number',
        },
        {
          name: 'numbers',
          dataType: 'number[]',
        },
        {
          name: 'int',
          dataType: 'int',
        },
        {
          name: 'ints',
          dataType: 'int[]',
        },
        {
          name: 'date',
          dataType: 'date',
        },
        {
          name: 'dates',
          dataType: 'date[]',
        },
        {
          name: 'boolean',
          dataType: 'boolean',
        },
        {
          name: 'booleans',
          dataType: 'boolean[]',
        },
        {
          name: 'object',
          dataType: 'object',
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: 'text',
            },
          ],
        },
        {
          name: 'objects',
          dataType: 'object[]',
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: 'text',
            },
          ],
        },
        {
          name: 'blob',
          dataType: 'blob',
        },
        {
          name: 'geoCoordinates',
          dataType: 'geoCoordinates',
        },
        {
          name: 'phoneNumber',
          dataType: 'phoneNumber',
        },
      ],
    });
  });

  it('should be able to create a complex collection', async () => {
    const collectionName = 'TestCollectionSimple';
    const response = await cluster.collections
      .create({
        name: collectionName,
        description: 'A test collection',
        invertedIndex: {
          bm25: {
            b: 0.8,
            k1: 1.3,
          },
          cleanupIntervalSeconds: 10,
          indexTimestamps: true,
          indexPropertyLength: true,
          indexNullState: true,
          stopwords: {
            preset: 'en',
            additions: ['a'],
            removals: ['the'],
          },
        },
        properties: [
          {
            name: 'text',
            dataType: weaviate.configure.dataType.TEXT,
          },
          {
            name: 'texts',
            dataType: weaviate.configure.dataType.TEXT_ARRAY,
          },
          {
            name: 'number',
            dataType: weaviate.configure.dataType.NUMBER,
          },
          {
            name: 'numbers',
            dataType: weaviate.configure.dataType.NUMBER_ARRAY,
          },
          {
            name: 'int',
            dataType: weaviate.configure.dataType.INT,
          },
          {
            name: 'ints',
            dataType: weaviate.configure.dataType.INT_ARRAY,
          },
          {
            name: 'date',
            dataType: weaviate.configure.dataType.DATE,
          },
          {
            name: 'dates',
            dataType: weaviate.configure.dataType.DATE_ARRAY,
          },
          {
            name: 'boolean',
            dataType: weaviate.configure.dataType.BOOLEAN,
          },
          {
            name: 'booleans',
            dataType: weaviate.configure.dataType.BOOLEAN_ARRAY,
          },
          {
            name: 'object',
            dataType: weaviate.configure.dataType.OBJECT,
            nestedProperties: [
              {
                name: 'nestedProp',
                dataType: weaviate.configure.dataType.TEXT,
              },
            ],
          },
          {
            name: 'objects',
            dataType: weaviate.configure.dataType.OBJECT_ARRAY,
            nestedProperties: [
              {
                name: 'nestedProp',
                dataType: weaviate.configure.dataType.TEXT,
              },
            ],
          },
          {
            name: 'blob',
            dataType: weaviate.configure.dataType.BLOB,
          },
          {
            name: 'geoCoordinates',
            dataType: weaviate.configure.dataType.GEO_COORDINATES,
          },
          {
            name: 'phoneNumber',
            dataType: weaviate.configure.dataType.PHONE_NUMBER,
          },
        ],
        multiTenancy: {
          enabled: true,
        },
        replication: {
          factor: 2,
        },
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
          vectorIndexConfig: {
            name: 'hnsw' as const,
            config: {
              cleanupIntervalSeconds: 10,
              distance: 'dot',
              dynamicEfFactor: 6,
              dynamicEfMax: 100,
              dynamicEfMin: 10,
              ef: -2,
              efConstruction: 100,
              filterStrategy: 'acorn',
              flatSearchCutoff: 41000,
              maxConnections: 72,
              quantizer: {
                bitCompression: true,
                centroids: 128,
                encoder: {
                  distribution: 'normal',
                  type: 'tile',
                },
                segments: 4,
                trainingLimit: 100001,
                type: 'pq',
              },
              skip: true,
              vectorCacheMaxObjects: 100000,
            },
          },
        }),
      })
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => cluster.collections.use(collectionName).config.get());

    expect(response.name).toEqual(collectionName);
    expect(response.description).toEqual('A test collection');

    expect(response.properties?.length).toEqual(15);
    expect(response.properties?.[0].name).toEqual('text');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.properties?.[1].name).toEqual('texts');
    expect(response.properties?.[1].dataType).toEqual('text[]');
    expect(response.properties?.[2].name).toEqual('number');
    expect(response.properties?.[2].dataType).toEqual('number');
    expect(response.properties?.[3].name).toEqual('numbers');
    expect(response.properties?.[3].dataType).toEqual('number[]');
    expect(response.properties?.[4].name).toEqual('int');
    expect(response.properties?.[4].dataType).toEqual('int');
    expect(response.properties?.[5].name).toEqual('ints');
    expect(response.properties?.[5].dataType).toEqual('int[]');
    expect(response.properties?.[6].name).toEqual('date');
    expect(response.properties?.[6].dataType).toEqual('date');
    expect(response.properties?.[7].name).toEqual('dates');
    expect(response.properties?.[7].dataType).toEqual('date[]');
    expect(response.properties?.[8].name).toEqual('boolean');
    expect(response.properties?.[8].dataType).toEqual('boolean');
    expect(response.properties?.[9].name).toEqual('booleans');
    expect(response.properties?.[9].dataType).toEqual('boolean[]');
    expect(response.properties?.[10].name).toEqual('object');
    expect(response.properties?.[10].dataType).toEqual('object');
    expect(response.properties?.[10].nestedProperties?.length).toEqual(1);
    expect(response.properties?.[10].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.properties?.[10].nestedProperties?.[0].dataType).toEqual('text');
    expect(response.properties?.[11].name).toEqual('objects');
    expect(response.properties?.[11].dataType).toEqual('object[]');
    expect(response.properties?.[11].nestedProperties?.length).toEqual(1);
    expect(response.properties?.[11].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.properties?.[11].nestedProperties?.[0].dataType).toEqual('text');
    expect(response.properties?.[12].name).toEqual('blob');
    expect(response.properties?.[12].dataType).toEqual('blob');
    expect(response.properties?.[13].name).toEqual('geoCoordinates');
    expect(response.properties?.[13].dataType).toEqual('geoCoordinates');
    expect(response.properties?.[14].name).toEqual('phoneNumber');
    expect(response.properties?.[14].dataType).toEqual('phoneNumber');

    expect(response.invertedIndex.bm25.b).toEqual(0.8);
    expect(response.invertedIndex.bm25.k1).toEqual(1.3);
    expect(response.invertedIndex.cleanupIntervalSeconds).toEqual(10);
    expect(response.invertedIndex.indexTimestamps).toEqual(true);
    expect(response.invertedIndex.indexPropertyLength).toEqual(true);
    expect(response.invertedIndex.indexNullState).toEqual(true);
    // expect(response.invertedIndexConfig?.stopwords?.additions).toEqual(['a']); // potential weaviate bug, this returns as None
    expect(response.invertedIndex.stopwords?.preset).toEqual('en');
    expect(response.invertedIndex.stopwords?.removals).toEqual(['the']);

    expect(response.multiTenancy.enabled).toEqual(true);

    expect(response.replication.asyncEnabled).toEqual(false);
    expect(response.replication.deletionStrategy).toEqual<ReplicationDeletionStrategy>(
      'NoAutomatedResolution'
    );
    expect(response.replication.factor).toEqual(2);

    const indexConfig = response.vectorizers.default.indexConfig as VectorIndexConfigHNSW;
    const quantizer = indexConfig.quantizer as PQConfig;
    expect(indexConfig.cleanupIntervalSeconds).toEqual(10);
    expect(indexConfig.distance).toEqual('dot');
    expect(indexConfig.dynamicEfFactor).toEqual(6);
    expect(indexConfig.dynamicEfMax).toEqual(100);
    expect(indexConfig.dynamicEfMin).toEqual(10);
    expect(indexConfig.ef).toEqual(-2);
    expect(indexConfig.efConstruction).toEqual(100);
    expect(indexConfig.filterStrategy).toEqual(
      (await cluster.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) ? 'sweeping' : 'acorn'
    );
    expect(indexConfig.flatSearchCutoff).toEqual(41000);
    expect(indexConfig.maxConnections).toEqual(72);
    expect(quantizer.bitCompression).toEqual(true);
    expect(quantizer.centroids).toEqual(128);
    expect(quantizer.encoder.distribution).toEqual('normal');
    // expect(quantizer.encoder.type).toEqual('tile'); // potential weaviate bug, this returns as PQEncoderType.KMEANS
    expect(quantizer.segments).toEqual(4);
    expect(quantizer.trainingLimit).toEqual(100001);
    expect(indexConfig.skip).toEqual(true);
    expect(indexConfig.vectorCacheMaxObjects).toEqual(100000);

    expect(response.vectorizers.default.indexType).toEqual('hnsw');

    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
  });

  it('should be able to create a collection with the contextionary vectorizer using configure.vectors', async () => {
    const collectionName = 'ThisOneIsATest'; // must include words in contextionary's vocabulary to pass since vectorizeCollectionName will be true
    const response = await contextionary.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary(),
      })
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => contextionary.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect((response.vectorizers.default.indexConfig as VectorIndexConfigHNSW).quantizer).toBeUndefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-contextionary');
    expect(
      (response.vectorizers.default.vectorizer.config as Text2VecContextionaryConfig).vectorizeCollectionName
    ).toEqual(true);
  });

  requireAtLeast(1, 32, 0).describe('uncompressed vectors', () => {
    it('should be able to create a collection with uncompressed default vector', async () => {
      const collectionName = 'TestCollectionUncompressedVector';

      await contextionary.collections.create({
        name: collectionName,
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
          vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
            quantizer: weaviate.configure.vectorIndex.quantizer.none(),
          }),
        }),
      });

      const collection = await contextionary.collections.export(collectionName);

      expect((collection.vectorizers.default.indexConfig as VectorIndexConfigHNSW).quantizer).toBeUndefined();
    });

    it('should be able to create a collection with uncompressed named vector', async () => {
      const collectionName = 'TestCollectionUncompressedVectorNamed';

      await contextionary.collections.create({
        name: collectionName,
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
          name: 'custom_vec',
          vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({
            quantizer: weaviate.configure.vectorIndex.quantizer.none(),
          }),
        }),
      });

      const collection = await contextionary.collections.export(collectionName);

      expect(
        (collection.vectorizers.custom_vec.indexConfig as VectorIndexConfigHNSW).quantizer
      ).toBeUndefined();
    });
  });

  it('should be able to create a collection with an openai vectorizer with configure.vectors', async () => {
    const collectionName = 'TestCollectionOpenAIVectorizerWithConfigureVectorizer';
    const response = await openai.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecOpenAI(),
      })
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => openai.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizers.default.indexConfig).toBeDefined();
    expect((response.vectorizers.default.indexConfig as VectorIndexConfigHNSW).quantizer).toBeUndefined();
    expect(response.vectorizers.default.indexType).toEqual('hnsw');
    expect(response.vectorizers.default.vectorizer.name).toEqual('text2vec-openai');
    expect(
      (response.vectorizers.default.vectorizer.config as Text2VecOpenAIConfig).vectorizeCollectionName
    ).toEqual(true);
  });

  it('should be able to create a collection with the openai generative with configure.Generative', async () => {
    const collectionName = 'TestCollectionOpenAIGenerativeWithConfigureGenerative';
    const response = await openai.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        generative: weaviate.configure.generative.openAI(),
      })
      .then(async (collection) => expect(await collection.exists()).toEqual(true))
      .then(() => openai.collections.use(collectionName).config.get());
    expect(response.name).toEqual(collectionName);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.generative).toEqual({
      name: 'generative-openai',
      config: {},
    });
  });
});
