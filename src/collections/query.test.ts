/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';

type TestCollectionQuery = {
  testProp: string;
};

describe('Testing of the query methods', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const className = 'TestCollectionQuery';
  let id: string;

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
        const collection = client.collections.get<TestCollectionQuery>(className);
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
  });

  it('should fetch an object by its id', async () => {
    const collection = client.collections.get<TestCollectionQuery>(className);
    const object = await collection.query.fetchById(id);
    expect(object.class).toEqual(className);
    expect(object.id).toEqual(id);
    expect(object.properties?.testProp).toEqual('test');
  });
});
