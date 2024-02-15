/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate from '../..';
import { CrossReference, Reference } from '../references';
import { GroupByOptions } from '../types';

describe('Testing of the collection.iterator method with a simple collection', () => {
  const client = weaviate.next({
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

  const className = 'TestCollectionIterator';
  let id: string;
  let vector: number[];

  type TestCollectionIterator = {
    testProp: string;
  };

  const collection = client.collections.get<TestCollectionIterator>(className);

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.Configure.Vectorizer.text2VecContextionary({ vectorizeClassName: false }),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vector!;
  });

  it('should iterate through the collection with no options returning the objects', async () => {
    let count = 0;
    for await (const obj of collection.iterator()) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vector).toBeUndefined();
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });

  it('should iterate through the collection specifying return properties', async () => {
    let count = 0;
    for await (const obj of collection.iterator({ returnProperties: ['testProp'] })) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vector).toBeUndefined();
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });

  it('should iterate through the collection specifying return metadata', async () => {
    let count = 0;
    for await (const obj of collection.iterator({ returnMetadata: ['creationTime'] })) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vector).toBeUndefined();
      expect(obj.metadata?.creationTime).toBeDefined();
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });

  it('should iterate through the collection specifying include vector', async () => {
    let count = 0;
    for await (const obj of collection.iterator({ includeVector: true })) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vector).toEqual(vector);
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });
});
