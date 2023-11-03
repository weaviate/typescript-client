/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';

type TestCollectionQuery = {
  testProp: string;
};

describe('Testing of the query methods', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
    grpcAddress: 'localhost:50051',
  });

  const className = 'TestCollectionQuery';
  let id: string;

  const collection = client.collections.get<TestCollectionQuery>(className);

  beforeAll(async () => {
    id = await client.collections
      .create({
        name: className,
        properties: [
          {
            name: 'testProp',
            dataType: ['text'],
          },
        ],
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
  });

  it('should fetch an object by its id', async () => {
    const object = await collection.query.fetchObjectById({ id });
    expect(object.properties.testProp).toEqual('test');
    expect(object.metadata.uuid).toEqual(id);
  });

  it('should query without search all objects with minimal options', async () => {
    const ret = await collection.query.fetchObjects();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });

  it('should query with bm25 all objects with minimal options', async () => {
    const ret = await collection.query.bm25({
      query: 'test',
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });
});
