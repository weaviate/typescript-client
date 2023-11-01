/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('Testing of the collections methods', () => {
  const cluster = weaviate.client({
    scheme: 'http',
    host: 'localhost:8087',
  });
  const contextionary = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });
  const openai = weaviate.client({
    scheme: 'http',
    host: 'localhost:8086',
  });

  it('should be able to create a simple collection', async () => {
    const className = 'TestCollectionSimple';
    const response = await contextionary.collections.create({
      class: className,
      properties: [
        {
          name: 'testProp',
          dataType: ['text'],
        },
      ],
    });
    expect(response.class).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual(['text']);
    expect(response.moduleConfig).toBeUndefined();
  });

  it('should be able to create a nested collection', async () => {
    const className = 'TestCollectionNested';
    const response = await contextionary.collections.create({
      class: className,
      properties: [
        {
          name: 'testProp',
          dataType: ['object'],
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: ['text'],
            },
          ],
        },
      ],
    });
    expect(response.class).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual(['object']);
    expect(response.properties?.[0].nestedProperties?.length).toEqual(1);
    expect(response.properties?.[0].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.moduleConfig).toBeUndefined();
  });

  it('should be able to create a complex collection', async () => {
    const className = 'TestCollectionSimple';
    const response = await cluster.collections.create({
      class: className,
      description: 'A test collection',
      invertedIndexConfig: {
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
          dataType: ['text'],
        },
        {
          name: 'texts',
          dataType: ['text[]'],
        },
        {
          name: 'number',
          dataType: ['number'],
        },
        {
          name: 'numbers',
          dataType: ['number[]'],
        },
        {
          name: 'int',
          dataType: ['int'],
        },
        {
          name: 'ints',
          dataType: ['int[]'],
        },
        {
          name: 'date',
          dataType: ['date'],
        },
        {
          name: 'dates',
          dataType: ['date[]'],
        },
        {
          name: 'boolean',
          dataType: ['boolean'],
        },
        {
          name: 'booleans',
          dataType: ['boolean[]'],
        },
        {
          name: 'object',
          dataType: ['object'],
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: ['text'],
            },
          ],
        },
        {
          name: 'objects',
          dataType: ['object[]'],
          nestedProperties: [
            {
              name: 'nestedProp',
              dataType: ['text'],
            },
          ],
        },
        {
          name: 'geoCoordinates',
          dataType: ['geoCoordinates'],
        },
        {
          name: 'phoneNumber',
          dataType: ['phoneNumber'],
        },
      ],
      multiTenancyConfig: {
        enabled: true,
      },
      replicationConfig: {
        factor: 2,
      },
      vectorIndexConfig: {
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
    });

    expect(response.class).toEqual(className);
    expect(response.description).toEqual('A test collection');
    expect(response.vectorizer).toEqual('none');

    expect(response.properties?.length).toEqual(14);
    expect(response.properties?.[0].name).toEqual('text');
    expect(response.properties?.[0].dataType).toEqual(['text']);
    expect(response.properties?.[1].name).toEqual('texts');
    expect(response.properties?.[1].dataType).toEqual(['text[]']);
    expect(response.properties?.[2].name).toEqual('number');
    expect(response.properties?.[2].dataType).toEqual(['number']);
    expect(response.properties?.[3].name).toEqual('numbers');
    expect(response.properties?.[3].dataType).toEqual(['number[]']);
    expect(response.properties?.[4].name).toEqual('int');
    expect(response.properties?.[4].dataType).toEqual(['int']);
    expect(response.properties?.[5].name).toEqual('ints');
    expect(response.properties?.[5].dataType).toEqual(['int[]']);
    expect(response.properties?.[6].name).toEqual('date');
    expect(response.properties?.[6].dataType).toEqual(['date']);
    expect(response.properties?.[7].name).toEqual('dates');
    expect(response.properties?.[7].dataType).toEqual(['date[]']);
    expect(response.properties?.[8].name).toEqual('boolean');
    expect(response.properties?.[8].dataType).toEqual(['boolean']);
    expect(response.properties?.[9].name).toEqual('booleans');
    expect(response.properties?.[9].dataType).toEqual(['boolean[]']);
    expect(response.properties?.[10].name).toEqual('object');
    expect(response.properties?.[10].dataType).toEqual(['object']);
    expect(response.properties?.[10].nestedProperties?.length).toEqual(1);
    expect(response.properties?.[10].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.properties?.[10].nestedProperties?.[0].dataType).toEqual(['text']);
    expect(response.properties?.[11].name).toEqual('objects');
    expect(response.properties?.[11].dataType).toEqual(['object[]']);
    expect(response.properties?.[11].nestedProperties?.length).toEqual(1);
    expect(response.properties?.[11].nestedProperties?.[0].name).toEqual('nestedProp');
    expect(response.properties?.[11].nestedProperties?.[0].dataType).toEqual(['text']);
    expect(response.properties?.[12].name).toEqual('geoCoordinates');
    expect(response.properties?.[12].dataType).toEqual(['geoCoordinates']);
    expect(response.properties?.[13].name).toEqual('phoneNumber');
    expect(response.properties?.[13].dataType).toEqual(['phoneNumber']);

    expect(response.invertedIndexConfig?.bm25?.b).toEqual(0.8);
    expect(response.invertedIndexConfig?.bm25?.k1).toEqual(1.3);
    expect(response.invertedIndexConfig?.cleanupIntervalSeconds).toEqual(10);
    expect(response.invertedIndexConfig?.indexTimestamps).toEqual(true);
    expect(response.invertedIndexConfig?.indexPropertyLength).toEqual(true);
    expect(response.invertedIndexConfig?.indexNullState).toEqual(true);
    // expect(response.invertedIndexConfig?.stopwords?.additions).toEqual(['a']); // potential weaviate bug, this returns as None
    expect(response.invertedIndexConfig?.stopwords?.preset).toEqual('en');
    expect(response.invertedIndexConfig?.stopwords?.removals).toEqual(['the']);

    expect(response.moduleConfig).toBeUndefined();

    expect(response.multiTenancyConfig?.enabled).toEqual(true);

    expect(response.replicationConfig?.factor).toEqual(2);

    expect(response.vectorIndexConfig?.cleanupIntervalSeconds).toEqual(10);
    expect(response.vectorIndexConfig?.distance).toEqual('dot');
    expect(response.vectorIndexConfig?.dynamicEfFactor).toEqual(6);
    expect(response.vectorIndexConfig?.dynamicEfMax).toEqual(100);
    expect(response.vectorIndexConfig?.dynamicEfMin).toEqual(10);
    expect(response.vectorIndexConfig?.ef).toEqual(-2);
    expect(response.vectorIndexConfig?.efConstruction).toEqual(100);
    expect(response.vectorIndexConfig?.flatSearchCutoff).toEqual(41000);
    expect(response.vectorIndexConfig?.maxConnections).toEqual(72);
    expect((response.vectorIndexConfig?.pq as any).bitCompression).toEqual(true);
    expect((response.vectorIndexConfig?.pq as any).centroids).toEqual(128);
    expect((response.vectorIndexConfig?.pq as any).enabled).toEqual(true);
    expect((response.vectorIndexConfig?.pq as any).encoder.distribution).toEqual('normal');
    // expect((response.vectorIndexConfig?.pq as any).encoder.type).toEqual('tile'); // potential weaviate bug, this returns as PQEncoderType.KMEANS
    expect((response.vectorIndexConfig?.pq as any).segments).toEqual(4);
    expect((response.vectorIndexConfig?.pq as any).trainingLimit).toEqual(100001);
    expect(response.vectorIndexConfig?.skip).toEqual(true);
    expect(response.vectorIndexConfig?.vectorCacheMaxObjects).toEqual(100000);

    expect(response.vectorIndexType).toEqual('hnsw');
  });

  it('should be able to create a collection with the contextionary vectorizer', async () => {
    const className = 'TestCollectionContextionaryVectorizer';
    const response = await contextionary.collections.create({
      class: className,
      properties: [
        {
          name: 'testProp',
          dataType: ['text'],
        },
      ],
      vectorizerConfig: {
        'text2vec-contextionary': {
          vectorizeClassName: false,
        },
      },
    });
    expect(response.class).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual(['text']);
    expect(response.moduleConfig).toEqual({
      'text2vec-contextionary': {
        vectorizeClassName: false,
      },
    });
  });

  it('should be able to create a collection with the openai vectorizer', async () => {
    const className = 'TestCollectionOpenAIVectorizer';
    const response = await openai.collections.create({
      class: className,
      properties: [
        {
          name: 'testProp',
          dataType: ['text'],
        },
      ],
      vectorizerConfig: {
        'text2vec-openai': {
          vectorizeClassName: true,
        },
      },
    });
    const vectorizer: any = response.moduleConfig?.['text2vec-openai'];
    expect(response.class).toEqual(className);
    expect(response.properties?.length).toEqual(1);
    expect(response.properties?.[0].name).toEqual('testProp');
    expect(response.properties?.[0].dataType).toEqual(['text']);
    expect(vectorizer).toBeDefined();
    expect(vectorizer.vectorizeClassName).toEqual(true);
  });
});
