/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate from '..';
import { Filters } from './filters';
import { CrossReference, Reference } from './references';

describe('Testing of the filter class with a simple collection', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
    grpcAddress: 'localhost:50051',
  });

  const className = 'TestCollectionFilterSimple';
  let ids: string[];
  let vector: number[];

  type TestType = {
    text: string;
    int: number;
    float: number;
    self?: CrossReference<TestType>;
  };

  const collection = client.collections.get<TestType>(className);
  const startTime = new Date();

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    ids = await client.collections
      .create({
        name: className,
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
            targetCollection: className,
          },
        ],
        invertedIndex: weaviate.Configure.invertedIndex({ indexTimestamps: true }),
        vectorizer: weaviate.Configure.Vectorizer.text2VecContextionary({ vectorizeClassName: false }),
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
    vector = res?.vector!;
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
    const res = await client.collections.get(className).query.fetchObjects({
      filters: client.collections.get(className).filter.byProperty('text').equal('two'),
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
    await collection.data.update({
      properties: {
        text: 'one',
        int: 1,
        float: 1.1,
      },
      id: ids[0],
    });
    const res = await collection.query.fetchObjects({
      filters: collection.filter.byUpdateTime().greaterThan(now),
    });
    expect(res.objects.length).toEqual(1);
    const obj = res.objects[0];
    expect(obj.properties.text).toEqual('one');
    expect(obj.properties.int).toEqual(1);
    expect(obj.properties.float).toEqual(1.1);
    expect(obj.uuid).toEqual(ids[0]);
  });
});
