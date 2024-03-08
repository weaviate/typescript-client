/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateNextClient } from '../..';
import { Filters } from '.';
import { CrossReference, Reference } from '../references';
import { Collection } from '../collection';
import { GeoCoordinate } from '../types';

describe('Testing of the filter class with a simple collection', () => {
  let client: WeaviateNextClient;
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
    collection = client.collections.get(collectionName);
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
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
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
    const res = await client.collections.get(collectionName).query.fetchObjects({
      filters: client.collections.get(collectionName).filter.byProperty('text').equal('two'),
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

    const obj1 = res.objects[0];
    const obj2 = res.objects[1];

    expect(obj1.properties.text).toEqual('two');
    expect(obj1.properties.int).toEqual(2);
    expect(obj1.properties.float).toEqual(2.2);
    expect(obj1.uuid).toEqual(ids[1]);

    expect(obj2.properties.text).toEqual('three');
    expect(obj2.properties.int).toEqual(3);
    expect(obj2.properties.float).toEqual(3.3);
    expect(obj2.uuid).toEqual(ids[2]);
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
        vector: vec,
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

describe('Testing of the filter class with complex data type', () => {
  let client: WeaviateNextClient;
  let collection: Collection<TestCollectionFilterComplex, 'TestCollectionFilterComplex'>;

  const collectionName = 'TestCollectionFilterComplex';
  type TestCollectionFilterComplex = {
    location: GeoCoordinate;
  };

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
    collection = client.collections.get(collectionName);
    await client.collections
      .create<TestCollectionFilterComplex>({
        name: collectionName,
        properties: [
          {
            name: 'location',
            dataType: 'geoCoordinates',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.none(),
      })
      .then(() =>
        collection.data.insertMany([
          {
            location: {
              latitude: 52.52,
              longitude: 13.405,
            },
          },
          {
            location: {
              latitude: 53.55,
              longitude: 10.0,
            },
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
});
