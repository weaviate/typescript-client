/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, { WeaviateNextClient } from '..';
import { CollectionConfigCreate, Text2VecContextionaryConfig, Text2VecOpenAIConfig } from './types';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collections.create method', () => {
  let cluster: WeaviateNextClient;
  let contextionary: WeaviateNextClient;
  let openai: WeaviateNextClient;

  beforeAll(async () => {
    cluster = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8087,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
    contextionary = await weaviate.client({
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
    openai = await weaviate.client({
      rest: {
        secure: false,
        host: 'localhost',
        port: 8086,
      },
      grpc: {
        secure: false,
        host: 'localhost',
        port: 50051,
      },
    });
  });

  it('should be able to create a simple collection with a generic', async () => {
    const className = 'TestCollectionSimpleGeneric';
    type TestCollectionSimple = {
      testProp: string;
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
      })
      .then(() => contextionary.collections.get<TestCollectionSimple>(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a simple collection without a generic', async () => {
    const className = 'TestCollectionSimpleNonGeneric';
    const response = await contextionary.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
      })
      .then(() => contextionary.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a simple collection without a generic using a schema var', async () => {
    const className = 'TestCollectionSimpleNonGenericVar';
    const schema = {
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text' as const,
        },
      ],
    };
    const response = await contextionary.collections
      .create(schema)
      .then(() => contextionary.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a simple collection with a generic using a schema var with const', async () => {
    const className = 'TestCollectionSimpleGenericVarConst';
    type TestCollectionSimple = {
      testProp: string;
    };
    const schema = {
      name: className,
      properties: [
        {
          name: 'testProp' as const,
          dataType: 'text' as const,
        },
      ],
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>(schema)
      .then(() => contextionary.collections.get<TestCollectionSimple>(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a simple collection with a generic using a schema var with type', async () => {
    const className = 'TestCollectionSimpleGenericVarType';
    type TestCollectionSimple = {
      testProp: string;
    };
    const schema: CollectionConfigCreate<TestCollectionSimple> = {
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
    };
    const response = await contextionary.collections
      .create<TestCollectionSimple>(schema)
      .then(() => contextionary.collections.get<TestCollectionSimple>(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a nested collection', async () => {
    const className = 'TestCollectionNested';
    type TestCollectionNested = {
      testProp: {
        nestedProp: string;
      };
    };
    const response = await contextionary.collections
      .create<TestCollectionNested>({
        name: className,
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
      .then(() => contextionary.collections.get<TestCollectionNested>(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('object');
    expect(response.properties[0].nestedProperties?.length).toEqual(1);
    expect(response.properties[0].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await contextionary.collections.delete(className);
  });

  it('should be able to create a complex collection', async () => {
    const className = 'TestCollectionSimple';
    const response = await cluster.collections
      .create({
        name: className,
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
        vectorIndex: {
          name: 'hnsw',
          config: {
            cleanupIntervalSeconds: 10,
            distance: 'dot',
            dynamicEfFactor: 6,
            dynamicEfMax: 100,
            dynamicEfMin: 10,
            ef: -2,
            efConstruction: 100,
            flatSearchCutoff: 41000,
            maxConnections: 72,
            pq: {
              bitCompression: true,
              centroids: 128,
              enabled: true,
              encoder: {
                distribution: 'normal',
                type: 'tile',
              },
              segments: 4,
              trainingLimit: 100001,
            },
            skip: true,
            vectorCacheMaxObjects: 100000,
          },
        },
      })
      .then(() => cluster.collections.get(className).config.get());

    expect(response.name).toEqual(className);
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

    expect(response.replication.factor).toEqual(2);

    expect(response.vectorizer.default.indexConfig.cleanupIntervalSeconds).toEqual(10);
    expect(response.vectorizer.default.indexConfig.distance).toEqual('dot');
    expect(response.vectorizer.default.indexConfig.dynamicEfFactor).toEqual(6);
    expect(response.vectorizer.default.indexConfig.dynamicEfMax).toEqual(100);
    expect(response.vectorizer.default.indexConfig.dynamicEfMin).toEqual(10);
    expect(response.vectorizer.default.indexConfig.ef).toEqual(-2);
    expect(response.vectorizer.default.indexConfig.efConstruction).toEqual(100);
    expect(response.vectorizer.default.indexConfig.flatSearchCutoff).toEqual(41000);
    expect(response.vectorizer.default.indexConfig.maxConnections).toEqual(72);
    expect(response.vectorizer.default.indexConfig.pq.bitCompression).toEqual(true);
    expect(response.vectorizer.default.indexConfig.pq.centroids).toEqual(128);
    expect(response.vectorizer.default.indexConfig.pq.enabled).toEqual(true);
    expect(response.vectorizer.default.indexConfig.pq.encoder.distribution).toEqual('normal');
    // expect((response.vectorIndexConfig?.pq as any).encoder.type).toEqual('tile'); // potential weaviate bug, this returns as PQEncoderType.KMEANS
    expect(response.vectorizer.default.indexConfig.pq.segments).toEqual(4);
    expect(response.vectorizer.default.indexConfig.pq.trainingLimit).toEqual(100001);
    expect(response.vectorizer.default.indexConfig.skip).toEqual(true);
    expect(response.vectorizer.default.indexConfig.vectorCacheMaxObjects).toEqual(100000);

    expect(response.vectorizer.default.indexType).toEqual('hnsw');

    expect(response.vectorizer.default.vectorizer.name).toEqual('none');

    await cluster.collections.delete(className);
  });

  it('should be able to create a collection with the contextionary vectorizer', async () => {
    const className = 'TestCollectionContextionaryVectorizer';
    const response = await contextionary.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: {
          name: 'text2vec-contextionary',
          config: {
            vectorizeClassName: false,
          },
        },
      })
      .then(() => contextionary.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('text2vec-contextionary');
    expect(
      (response.vectorizer.default.vectorizer.config as Text2VecContextionaryConfig).vectorizeClassName
    ).toEqual(false);

    await contextionary.collections.delete(className);
  });

  it('should be able to create a collection with the contextionary vectorizer using configure.vectorizer', async () => {
    const className = 'ThisOneIsATest'; // must include words in contextionary's vocabulary to pass since vectorizeClassName will be true
    const response = await contextionary.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary(),
      })
      .then(() => contextionary.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('text2vec-contextionary');
    expect(
      (response.vectorizer.default.vectorizer.config as Text2VecContextionaryConfig).vectorizeClassName
    ).toEqual(true);

    await contextionary.collections.delete(className);
  });

  it('should be able to create a collection with the openai vectorizer', async () => {
    const className = 'TestCollectionOpenAIVectorizer';
    const response = await openai.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: {
          name: 'text2vec-openai',
          config: {
            vectorizeClassName: true,
          },
        },
      })
      .then(() => openai.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('text2vec-openai');
    expect(
      (response.vectorizer.default.vectorizer.config as Text2VecOpenAIConfig).vectorizeClassName
    ).toEqual(true);

    await openai.collections.delete(className);
  });

  it('should be able to create a collection with the openai vectorizer with configure.vectorizer', async () => {
    const className = 'TestCollectionOpenAIVectorizerWithConfigureVectorizer';
    const response = await openai.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecOpenAI(),
      })
      .then(() => openai.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.default.indexConfig).toBeDefined();
    expect(response.vectorizer.default.indexType).toEqual('hnsw');
    expect(response.vectorizer.default.vectorizer.name).toEqual('text2vec-openai');
    expect(
      (response.vectorizer.default.vectorizer.config as Text2VecOpenAIConfig).vectorizeClassName
    ).toEqual(true);

    await openai.collections.delete(className);
  });

  it('should be able to create a collection with the openai generative with configure.Generative', async () => {
    const className = 'TestCollectionOpenAIGenerativeWithConfigureGenerative';
    const response = await openai.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        generative: weaviate.configure.generative.openAI(),
      })
      .then(() => openai.collections.get(className).config.get());
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.generative).toEqual({});

    await openai.collections.delete(className);
  });
});
