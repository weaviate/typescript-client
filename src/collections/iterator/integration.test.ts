/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';

describe('Testing of the collection.iterator method with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionIterator, 'TestCollectionIterator'>;
  const collectionName = 'TestCollectionIterator';
  let id: string;
  let vector: number[];

  type TestCollectionIterator = {
    testProp: string;
  };

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
    collection = client.collections.use(collectionName);
    id = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.namedVectorizer.text2VecContextionary('vector', {
          vectorizeClassName: false,
        }),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.vector!;
  });

  it('should iterate through the collection with no options returning the objects', async () => {
    let count = 0;
    for await (const obj of collection.iterator()) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vectors.vector).toBeUndefined();
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });

  it('should iterate through the collection specifying return properties', async () => {
    let count = 0;
    for await (const obj of collection.iterator({ returnProperties: ['testProp'] })) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vectors.vector).toBeUndefined();
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });

  it('should iterate through the collection specifying return metadata', async () => {
    let count = 0;
    for await (const obj of collection.iterator({ returnMetadata: ['creationTime'] })) {
      expect(obj.properties.testProp).toBe('test');
      expect(obj.uuid).toBe(id);
      expect(obj.vectors.vector).toBeUndefined();
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
      expect(obj.vectors.vector).toEqual(vector);
      count++; // eslint-disable-line no-plusplus
    }
    expect(count).toBe(1);
  });
});
