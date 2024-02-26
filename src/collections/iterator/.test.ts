/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateNextClient } from '../../index.node';
import { Collection } from '../collection';

describe('Testing of the collection.iterator method with a simple collection', () => {
  let client: WeaviateNextClient;
  let collection: Collection<TestCollectionIterator>;
  const className = 'TestCollectionIterator';
  let id: string;
  let vector: number[];

  type TestCollectionIterator = {
    testProp: string;
  };

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
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
    collection = client.collections.get(className);
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizer: weaviate.configure.vectorizer.text2VecContextionary({ vectorizeClassName: false }),
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
