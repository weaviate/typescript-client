/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateClient, Collection } from '@weaviate/node';
import { CrossReference, Reference } from '@weaviate/core/references';
import { GeoCoordinate } from '@weaviate/core/types';
import { Filters } from '@weaviate/core/filters';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Testing of the filter class with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestType, 'TestCollectionFilterSimple'>;

  const collectionName = 'TestCollectionFilterSimple';
  let ids: string[];
  let vector: number[];

  type TestType = {
    text: string;
    int: number;
    float: number;
    self?: CrossReference<TestType>;
  };

  const startTime = new Date();

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    ids = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
          {
            name: 'int',
            dataType: 'int',
          },
          {
            name: 'float',
            dataType: 'number',
          },
        ],
        references: [
          {
            name: 'self',
            targetCollection: collectionName,
          },
        ],
        invertedIndex: weaviate.configure.invertedIndex({ indexTimestamps: true }),
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary({
          vectorizeCollectionName: false,
        }),
      })
      .then(() =>
        collection.data.insertMany([
          {
            text: 'one',
            int: 1,
            float: 1.1,
          },
          {
            text: 'two',
            int: 2,
            float: 2.2,
          },
          {
            text: 'three',
            int: 3,
            float: 3.3,
          },
          {
            text: 'one',
            int: 4,
            float: 4.4,
          },
        ])
      )
      .then(async (res) => {
        const uuids = Object.values(res.uuids);
        await collection.data.referenceAdd({
          fromUuid: res.uuids[2],
          fromProperty: 'self',
          to: Reference.to(uuids[3]),
        });
        return uuids;
      });
    const res = await collection.query.fetchObjectById(ids[0], { includeVector: true });
    vector = res?.vectors.default!;
  });

  it('should filter a fetch objects query with a single filter and generic collection', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byProperty('text').equal('two'),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('two');
    expect(obj.properties.int).toEqual(2);
    expect(obj.properties.float).toEqual(2.2);
    expect(obj.uuid).toEqual(ids[1]);
  });

  it('should filter a fetch objects query with a single filter and non-generic collection', async () => {
    const res = await client.collections.use(collectionName).query.fetchObjects({
      filters: weaviate.filter.byProperty('text').equal('two'),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('two');
    expect(obj.properties.int).toEqual(2);
    expect(obj.properties.float).toEqual(2.2);
    expect(obj.uuid).toEqual(ids[1]);
  });

  it('should filter a fetch objects query with an AND filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: Filters.and(
        collection.filter.byProperty('text').equal('one'),
        collection.filter.byProperty('int').equal(1)
      ),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('one');
    expect(obj.properties.int).toEqual(1);
    expect(obj.properties.float).toEqual(1.1);
    expect(obj.uuid).toEqual(ids[0]);
  });

  it('should filter a fetch objects query with an OR filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: Filters.or(
        collection.filter.byProperty('text').equal('three'),
        collection.filter.byProperty('int').equal(2)
      ),
    });
    expect(res.objects.length).toEqual(2);

    // Return of fetch not necessarily in order due to filter
    expect(res.objects.map((o) => o.properties.text)).toContain('two');
    expect(res.objects.map((o) => o.properties.text)).toContain('three');

    expect(res.objects.map((o) => o.properties.int)).toContain(2);
    expect(res.objects.map((o) => o.properties.int)).toContain(3);

    expect(res.objects.map((o) => o.properties.float)).toContain(2.2);
    expect(res.objects.map((o) => o.properties.float)).toContain(3.3);

    expect(res.objects.map((o) => o.uuid)).toContain(ids[1]);
    expect(res.objects.map((o) => o.uuid)).toContain(ids[2]);
  });

  it('should filter a fetch objects query with a reference filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byRef('self').byProperty('text').equal('one'),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('three');
    expect(obj.properties.int).toEqual(3);
    expect(obj.properties.float).toEqual(3.3);
    expect(obj.uuid).toEqual(ids[2]);
  });

  it('should filter a fetch objects query with a greater than reference count filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byRefCount('self').greaterThan(0),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('three');
    expect(obj.properties.int).toEqual(3);
    expect(obj.properties.float).toEqual(3.3);
    expect(obj.uuid).toEqual(ids[2]);
  });

  it('should filter a fetch objects query with a greater than or equal reference count filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byRefCount('self').greaterOrEqual(1),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('three');
    expect(obj.properties.int).toEqual(3);
    expect(obj.properties.float).toEqual(3.3);
    expect(obj.uuid).toEqual(ids[2]);
  });

  it('should filter a fetch objects query with an equal reference count filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byRefCount('self').equal(1),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('three');
    expect(obj.properties.int).toEqual(3);
    expect(obj.properties.float).toEqual(3.3);
    expect(obj.uuid).toEqual(ids[2]);
  });

  it('should filter a fetch objects query with an equal ID filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byId().equal(ids[0]),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('one');
    expect(obj.properties.int).toEqual(1);
    expect(obj.properties.float).toEqual(1.1);
    expect(obj.uuid).toEqual(ids[0]);
  });

  it('should filter a fetch objects query with a less than creation time filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byCreationTime().lessThan(startTime),
    });
    expect(res.objects.length).toEqual(0);
  });

  it('should filter a fetch objects query with a greater than last updated time filter', async () => {
    const now = new Date();
    const vec = Array.from({ length: 300 }, () => Math.floor(Math.random() * 10));
    await collection.data
      .update({
        id: ids[0],
        vectors: vec,
      })
      .then(async () => {
        const res = await collection.query.fetchObjects({
          filters: collection.filter.byUpdateTime().greaterOrEqual(now),
          includeVector: true,
        });
        expect(res.objects.length).toEqual(1);
        const obj = res.objects[0];
        expect(obj.properties.text).toEqual('one');
        expect(obj.properties.int).toEqual(1);
        expect(obj.properties.float).toEqual(1.1);
        expect(obj.uuid).toEqual(ids[0]);
        expect(obj.vectors.default).toEqual(vec);
      });
  });

  it('should filter an aggregate query with a single filter', async () => {
    const res = await collection.aggregate.overAll({
      filters: collection.filter.byProperty('text').equal('one'),
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(res.properties.text.count).toEqual(2);
  });

  it('should filter an aggregate query with an AND filter', async () => {
    const res = await collection.aggregate.overAll({
      filters: Filters.and(
        collection.filter.byProperty('text').equal('one'),
        collection.filter.byProperty('int').equal(1)
      ),
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(res.properties.text.count).toEqual(1);
  });

  it('should filter an aggregate query with an OR filter', async () => {
    const res = await collection.aggregate.overAll({
      filters: Filters.or(
        collection.filter.byProperty('text').equal('one'),
        collection.filter.byProperty('int').equal(2)
      ),
      returnMetrics: collection.metrics.aggregate('text').text(['count']),
    });
    expect(res.properties.text.count).toEqual(3);
  });
});

describe('Testing of the filter class with complex data types', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionFilterComplex, 'TestCollectionFilterComplex'>;

  const collectionName = 'TestCollectionFilterComplex';
  type TestCollectionFilterComplex = {
    name: string;
    location: GeoCoordinate;
    date?: Date;
    personId: string;
  };

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    await client.collections
      .create<TestCollectionFilterComplex>({
        name: collectionName,
        invertedIndex: {
          indexNullState: true,
        },
        properties: [
          {
            name: 'name',
            dataType: 'text',
          },
          {
            name: 'location',
            dataType: 'geoCoordinates',
          },
          {
            name: 'date',
            dataType: 'date',
          },
          {
            name: 'personId',
            dataType: 'uuid',
          },
        ],
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary(),
      })
      .then(() =>
        collection.data.insertMany([
          {
            name: 'Tim',
            location: {
              latitude: 52.52,
              longitude: 13.405,
            },
            date: new Date('2021-01-01T00:00:00Z'),
            personId: '00000000-0000-0000-0000-000000000000',
          },
          {
            name: 'Tom',
            location: {
              latitude: 53.55,
              longitude: 10.0,
            },
            personId: '00000000-0000-0000-0000-000000000001',
          },
        ])
      );
  });

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  it('should filter a fetch objects query with a geo filter', async () => {
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byProperty('location').withinGeoRange({
        latitude: 52.52,
        longitude: 13.405,
        distance: 1,
      }),
    });
    expect(res.objects.length).toEqual(1);
  });

  it('should filter a fetch objects query with a date filter', async () => {
    const res = await collection.query.nearText(['Tom'], {
      filters: Filters.and(
        collection.filter.byProperty('date').isNull(true),
        collection.filter.byProperty('personId').equal('00000000-0000-0000-0000-000000000001')
      ),
    });
    expect(res.objects.length).toEqual(1);
    expect(res.objects[0].properties.name).toEqual('Tom');
  });
});
