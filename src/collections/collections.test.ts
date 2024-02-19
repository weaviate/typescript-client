/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '../index.node';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collections.create method', () => {
  const cluster = weaviate.client({
    http: {
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
  const contextionary = weaviate.client({
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
  const openai = weaviate.client({
    http: {
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

  it('should be able to create a simple collection', async () => {
    const className = 'TestCollectionSimple';
    type TestCollectionSimple = {
      testProp: string;
    };
    const response = await contextionary.collections.create<TestCollectionSimple>({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('text');
    expect(response.vectorizer).toBeUndefined();

    await contextionary.collections.delete(className);
  });

  it('should be able to create a nested collection', async () => {
    const className = 'TestCollectionNested';
    type TestCollectionNested = {
      testProp: {
        nestedProp: string;
      };
    };
    const response = await contextionary.collections.create<TestCollectionNested>({
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
    });
    expect(response.name).toEqual(className);
    expect(response.properties.length).toEqual(1);
    expect(response.properties[0].name).toEqual('testProp');
    expect(response.properties[0].dataType).toEqual('object');
    expect(response.properties[0].nestedProperties?.length).toEqual(1);
    expect(response.properties[0].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.vectorizer).toBeUndefined();

    await contextionary.collections.delete(className);
  });

  it('should be able to create a complex collection', async () => {
    const className = 'TestCollectionSimple';
    const response = await cluster.collections.create({
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
          dataType: weaviate.Configure.DataType.TEXT,
        },
        {
          name: 'texts',
          dataType: weaviate.Configure.DataType.TEXT_ARRAY,
        },
        {
          name: 'number',
          dataType: weaviate.Configure.DataType.NUMBER,
        },
        {
          name: 'numbers',
          dataType: weaviate.Configure.DataType.NUMBER_ARRAY,
        },
        {
          name: 'int',
          dataType: weaviate.Configure.DataType.INT,
        },
        {
          name: 'ints',
          dataType: weaviate.Configure.DataType.INT_ARRAY,
        },
        {
          name: 'date',
          dataType: weaviate.Configure.DataType.DATE,
        },
        {
          name: 'dates',
          dataType: weaviate.Configure.DataType.DATE_ARRAY,
        },
        {
          name: 'boolean',
          dataType: weaviate.Configure.DataType.BOOLEAN,
        },
        {
          name: 'booleans',
          dataType: weaviate.Configure.DataType.BOOLEAN_ARRAY,
        },
        {
          name: 'object',
          dataType: weaviate.Configure.DataType.OBJECT,
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: weaviate.Configure.DataType.TEXT,
            },
          ],
        },
        {
          name: 'objects',
          dataType: weaviate.Configure.DataType.OBJECT_ARRAY,
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: weaviate.Configure.DataType.TEXT,
            },
          ],
        },
        {
          name: 'blob',
          dataType: weaviate.Configure.DataType.BLOB,
        },
        {
          name: 'geoCoordinates',
          dataType: weaviate.Configure.DataType.GEO_COORDINATES,
        },
        {
          name: 'phoneNumber',
          dataType: weaviate.Configure.DataType.PHONE_NUMBER,
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
        options: {
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
    });

    expect(response.name).toEqual(className);
    expect(response.description).toEqual('A test collection');
    expect(response.vectorizer).toEqual(undefined);

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

    expect(response.vectorizer).toBeUndefined();

    expect(response.multiTenancy.enabled).toEqual(true);

    expect(response.replication.factor).toEqual(2);

    expect(response.vectorIndex.cleanupIntervalSeconds).toEqual(10);
    expect(response.vectorIndex.distance).toEqual('dot');
    expect(response.vectorIndex.dynamicEfFactor).toEqual(6);
    expect(response.vectorIndex.dynamicEfMax).toEqual(100);
    expect(response.vectorIndex.dynamicEfMin).toEqual(10);
    expect(response.vectorIndex.ef).toEqual(-2);
    expect(response.vectorIndex.efConstruction).toEqual(100);
    expect(response.vectorIndex.flatSearchCutoff).toEqual(41000);
    expect(response.vectorIndex.maxConnections).toEqual(72);
    expect(response.vectorIndex.pq.bitCompression).toEqual(true);
    expect(response.vectorIndex.pq.centroids).toEqual(128);
    expect(response.vectorIndex.pq.enabled).toEqual(true);
    expect(response.vectorIndex.pq.encoder.distribution).toEqual('normal');
    // expect((response.vectorIndexConfig?.pq as any).encoder.type).toEqual('tile'); // potential weaviate bug, this returns as PQEncoderType.KMEANS
    expect(response.vectorIndex.pq.segments).toEqual(4);
    expect(response.vectorIndex.pq.trainingLimit).toEqual(100001);
    expect(response.vectorIndex.skip).toEqual(true);
    expect(response.vectorIndex.vectorCacheMaxObjects).toEqual(100000);

    expect(response.vectorIndexType).toEqual('hnsw');

    await cluster.collections.delete(className);
  });

  it('should be able to create a collection with the contextionary vectorizer', async () => {
    const className = 'TestCollectionContextionaryVectorizer';
    const response = await contextionary.collections.create({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: {
        name: 'text2vec-contextionary',
        options: {
          vectorizeClassName: false,
        },
      },
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer).toEqual({
      vectorizeClassName: false,
    });

    await contextionary.collections.delete(className);
  });

  it('should be able to create a collection with the contextionary vectorizer using Configure.Vectorizer', async () => {
    const className = 'ThisOneIsATest'; // must include words in contextionary's vocabulary to pass since vectorizeClassName will be true
    const response = await contextionary.collections.create({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: weaviate.Configure.Vectorizer.text2VecContextionary(),
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer).toEqual({
      vectorizeClassName: true,
    });

    await contextionary.collections.delete(className);
  });

  it('should be able to create a collection with the openai vectorizer', async () => {
    const className = 'TestCollectionOpenAIVectorizer';
    const response = await openai.collections.create({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: {
        name: 'text2vec-openai',
        options: {
          vectorizeClassName: true,
        },
      },
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.vectorizeClassName).toEqual(true);

    await openai.collections.delete(className);
  });

  it('should be able to create a collection with the openai vectorizer with Configure.Vectorizer', async () => {
    const className = 'TestCollectionOpenAIVectorizerWithConfigureVectorizer';
    const response = await openai.collections.create({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      vectorizer: weaviate.Configure.Vectorizer.text2VecOpenAI(),
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.vectorizer.vectorizeClassName).toEqual(true);

    await openai.collections.delete(className);
  });

  it('should be able to create a collection with the openai generative with Configure.Generative', async () => {
    const className = 'TestCollectionOpenAIGenerativeWithConfigureGenerative';
    const response = await openai.collections.create({
      name: className,
      properties: [
        {
          name: 'testProp',
          dataType: 'text',
        },
      ],
      generative: weaviate.Configure.Generative.openai(),
    });
    expect(response.name).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual('text');
    expect(response.generative).toEqual({});

    await openai.collections.delete(className);
  });
});
