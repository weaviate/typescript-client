/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { requireAtLeast } from '../../../test/version.js';
import { WeaviateQueryError, WeaviateUnsupportedFeatureError } from '../../errors.js';
import weaviate, { AggregateText, Bm25Operator, WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';
import { CrossReference } from '../references/index.js';
import { DataObject } from '../types/index.js';

describe('Testing of the collection.aggregate methods', () => {
  type TestCollectionAggregate = {
    text: string;
    texts: string[];
    int: number;
    ints: number[];
    number: number;
    numbers: number[];
    date: string;
    dates: string[];
    boolean: boolean;
    booleans: boolean[];
    ref?: CrossReference<TestCollectionAggregate>;
  };

  let client: WeaviateClient;
  let collection: Collection<TestCollectionAggregate, 'TestCollectionAggregate'>;
  const collectionName = 'TestCollectionAggregate';

  const date0 = '2023-01-01T00:00:00Z';
  const date1 = '2023-01-01T00:00:00Z';
  const date2 = '2023-01-02T00:00:00Z';
  const dateMid = '2023-01-01T12:00:00Z';

  afterAll(async () => {
    return (await client).collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    return client.collections
      .create({
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
            name: 'int',
            dataType: 'int',
          },
          {
            name: 'ints',
            dataType: 'int[]',
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
          // {
          //   name: 'ref',
          //   dataType: [collectionName],
          // },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
          vectorIndexConfig: weaviate.configure.vectorIndex.hnsw({ maxConnections: 64 }),
        }),
      })
      .then(async () => {
        const data: DataObject<TestCollectionAggregate>[] = [];
        for (let i = 0; i < 100; i++) {
          data.push({
            properties: {
              text: 'test',
              texts: ['tests', 'tests'],
              int: 1,
              ints: [1, 2],
              number: 1.0,
              numbers: [1.0, 2.0],
              date: date0,
              dates: [date1, date2],
              boolean: true,
              booleans: [true, false],
            },
          });
        }
        const res = (await collection).data.insertMany(data);
        return res;
      });
    // .then(async (res) => {
    //   const uuid1 = res.uuids[0];
    //   await collection.data.referenceAddMany({
    //     refs: Object.values(res.uuids).map((uuid) => {
    //       return {
    //         fromProperty: 'ref',
    //         fromUuid: uuid1,
    //         reference: Reference.to({ uuids: [uuid] })
    //       }
    //     })
    //   })
    // })
  });

  it('should aggregate data without a search and no property metrics', async () => {
    const result = await collection.aggregate.overAll();
    expect(result.totalCount).toEqual(100);
  });

  it('should aggregate grouped by data without a search and no property metrics', async () => {
    const result = await collection.aggregate.groupBy.overAll({ groupBy: 'text' });
    expect(result.length).toEqual(1);
    expect(result[0].totalCount).toEqual(100);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
    expect(result[0].properties).toEqual({});
  });

  it('should aggregate grouped by data with a near text search and no property metrics', async () => {
    const result = await collection.aggregate.groupBy.nearText('test', {
      groupBy: 'text',
      certainty: 0.01,
    });
    expect(result.length).toEqual(1);
    expect(result[0].totalCount).toEqual(100);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
    expect(result[0].properties).toEqual({});
  });

  it('should aggregate data without a search and one generic property metric', async () => {
    const result = await collection.aggregate.overAll({
      returnMetrics: collection.metrics
        .aggregate('text')
        .text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
    });
    expect(result.totalCount).toEqual(100);
    expect(result.properties.text.count).toEqual(100);
    expect(result.properties.text.topOccurrences![0].occurs).toEqual(100);
    expect(result.properties.text.topOccurrences![0].value).toEqual('test');
  });

  it('should aggregate data without a search and one non-generic property metric', async () => {
    const result = await (await client).collections.use(collectionName).aggregate.overAll({
      returnMetrics: collection.metrics
        .aggregate('text')
        .text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
    });
    expect(result.totalCount).toEqual(100);
    expect(result.properties.text.count).toEqual(100);
    expect((result.properties.text as AggregateText).topOccurrences![0].occurs).toEqual(100);
    expect((result.properties.text as AggregateText).topOccurrences![0].value).toEqual('test');
  });

  it('should aggregate data without a search and all property metrics', async () => {
    const result = await collection.aggregate.overAll({
      returnMetrics: [
        collection.metrics.aggregate('text').text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
        collection.metrics.aggregate('texts').text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
        collection.metrics
          .aggregate('int')
          .integer(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        collection.metrics
          .aggregate('ints')
          .integer(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        collection.metrics
          .aggregate('number')
          .number(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        collection.metrics
          .aggregate('numbers')
          .number(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        collection.metrics.aggregate('date').date(['count', 'maximum', 'median', 'minimum', 'mode']),
        collection.metrics.aggregate('dates').date(['count', 'maximum', 'median', 'minimum']), // 'mode' flakes between date1 and date2
        collection.metrics
          .aggregate('boolean')
          .boolean(['count', 'percentageFalse', 'percentageTrue', 'totalFalse', 'totalTrue']),
        collection.metrics
          .aggregate('booleans')
          .boolean(['count', 'percentageFalse', 'percentageTrue', 'totalFalse', 'totalTrue']),
        // Metrics.aggregate('ref').reference(['pointingTo'])
      ],
    });
    expect(result).toEqual({
      totalCount: 100,
      properties: {
        text: {
          count: 100,
          topOccurrences: [{ occurs: 100, value: 'test' }],
        },
        texts: {
          count: 200,
          topOccurrences: [{ occurs: 200, value: 'tests' }],
        },
        int: {
          count: 100,
          maximum: 1,
          mean: 1,
          median: 1,
          minimum: 1,
          mode: 1,
          sum: 100,
        },
        ints: {
          count: 200,
          maximum: 2,
          mean: 1.5,
          median: 1.5,
          minimum: 1,
          mode: 1,
          sum: 300,
        },
        number: {
          count: 100,
          maximum: 1,
          mean: 1,
          median: 1,
          minimum: 1,
          mode: 1,
          sum: 100,
        },
        numbers: {
          count: 200,
          maximum: 2,
          mean: 1.5,
          median: 1.5,
          minimum: 1,
          mode: 1,
          sum: 300,
        },
        date: {
          count: 100,
          maximum: date0,
          median: date0,
          minimum: date0,
          mode: date0,
        },
        dates: {
          count: 200,
          maximum: date2,
          median: dateMid,
          minimum: date1,
          // mode: date1, // randomly switches between date1 and date2
        },
        boolean: {
          count: 100,
          percentageFalse: 0,
          percentageTrue: 1,
          totalFalse: 0,
          totalTrue: 100,
        },
        booleans: {
          count: 200,
          percentageFalse: 0.5,
          percentageTrue: 0.5,
          totalFalse: 100,
          totalTrue: 100,
        },
        // ref: {
        //   pointingTo: collectionName
        // }
      },
    });
  });
});

describe('Testing of the collection.aggregate methods with named vectors', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionAggregateVectors, 'TestCollectionAggregateVectors'>;
  const collectionName = 'TestCollectionAggregateVectors';
  type TestCollectionAggregateVectors = {
    text: string;
  };

  afterAll(async () => {
    return (await client).collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    const query = () =>
      client.collections.create<TestCollectionAggregateVectors>({
        name: collectionName,
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
        ],
        vectorizers: [
          weaviate.configure.vectors.text2VecContextionary({
            name: 'text',
            sourceProperties: ['text'],
            vectorIndexConfig: weaviate.configure.vectorIndex.hnsw(),
          }),
        ],
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    return query();
  });

  it('should aggregate data with a near text search over a named vector', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    const result = await collection.aggregate.nearText('test', { certainty: 0.9, targetVector: 'text' });
    expect(result.totalCount).toEqual(0);
  });
});

describe('Testing of collection.aggregate.overAll with a multi-tenancy collection', () => {
  let client: WeaviateClient;
  let collection: Collection;
  const collectionName = 'TestCollectionAggregate';

  afterAll(async () => {
    return (await client).collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    return client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
        ],
        multiTenancy: { enabled: true },
      })
      .then(async (created) => {
        const tenants = await created.tenants.create({ name: 'test' });
        collection = created.withTenant(tenants[0].name);
        const data: Array<any> = [];
        for (let i = 0; i < 100; i++) {
          data.push({
            properties: {
              text: 'test',
            },
          });
        }
        await collection.data.insertMany(data);
      });
  });

  it('should aggregate data without a search and no property metrics over the tenant', () =>
    collection.aggregate.overAll().then((result) => expect(result.totalCount).toEqual(100)));

  it('should throw an error for a non-existant tenant', () =>
    expect(collection.withTenant('non-existing-tenant').aggregate.overAll()).rejects.toThrow(
      WeaviateQueryError
    ));
});

describe('Testing of collection.aggregate search methods', () => {
  let client: WeaviateClient;
  let collection: Collection;
  const collectionName = 'TestCollectionAggregateSearches';

  let uuid: string;

  afterAll(async () => {
    return (await client).collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    return client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary(),
      })
      .then(() => {
        const data: Array<any> = [];
        for (let i = 0; i < 100; i++) {
          data.push({
            properties: {
              text: 'test',
            },
          });
        }
        return collection.data.insertMany(data);
      })
      .then((res) => {
        uuid = res.uuids[0];
      });
  });

  it('should return an aggregation on a hybrid search', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      console.warn('Skipping test max vector distance not supported in 1.25.x');
      return;
    }
    const result = await collection.aggregate.hybrid('test', {
      alpha: 0.5,
      maxVectorDistance: 1,
      queryProperties: ['text'],
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.totalCount).toBeGreaterThan(0);
  });

  requireAtLeast(1, 31, 0).it('bm25 search operator with hybrid', async () => {
    const result = await collection.aggregate.hybrid('test', {
      bm25Operator: Bm25Operator.and(),
      maxVectorDistance: 1,
      queryProperties: ['text'],
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it('should return a grouped aggregation on a hybrid search', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      console.warn('Skipping test as there is a bug with this in 1.24.26 that will not be fixed');
      return;
    }
    const result = await collection.aggregate.groupBy.hybrid('test', {
      objectLimit: 1000,
      groupBy: 'text',
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.length).toEqual(1);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
  });

  it('should return an aggregation on a nearText search', async () => {
    const result = await collection.aggregate.nearText('test', {
      objectLimit: 1000,
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it('should return a grouped aggregation on a nearText search', async () => {
    const result = await collection.aggregate.groupBy.nearText('test', {
      objectLimit: 1000,
      groupBy: 'text',
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.length).toEqual(1);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
  });

  it('should return an aggregation on a nearVector search', async () => {
    const obj = await collection.query.fetchObjectById(uuid, { includeVector: true });
    const result = await collection.aggregate.nearVector(obj?.vectors.default as number[], {
      objectLimit: 1000,
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it('should return a grouped aggregation on a nearVector search', async () => {
    const obj = await collection.query.fetchObjectById(uuid, { includeVector: true });
    const result = await collection.aggregate.groupBy.nearVector(obj?.vectors.default as number[], {
      objectLimit: 1000,
      groupBy: 'text',
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.length).toEqual(1);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
  });

  it('should return an aggregation on a nearObject search', async () => {
    const result = await collection.aggregate.nearObject(uuid, {
      objectLimit: 1000,
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.totalCount).toBeGreaterThan(0);
  });

  it('should return a grouped aggregation on a nearText search', async () => {
    const result = await collection.aggregate.groupBy.nearObject(uuid, {
      objectLimit: 1000,
      groupBy: 'text',
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(result.length).toEqual(1);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
  });
});
