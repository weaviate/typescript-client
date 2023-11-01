/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';
import { v4 } from 'uuid';

type TestCollectionData = {
  testProp: string;
};

describe('Testing of the data methods', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const className = 'TestCollectionData';

  beforeAll(async () => {
    const promises = [
      client.collections.create({
        class: className,
        properties: [
          {
            name: 'testProp',
            dataType: ['text'],
          },
        ],
      }),
    ];
    await Promise.all(promises);
  });

  it('should be able to insert an object without an id', async () => {
    const collection = client.collections.get<TestCollectionData>(className);
    const insert = await collection.data.insert({
      properties: {
        testProp: 'test',
      },
    });
    expect(insert).toBeDefined();
  });

  it('should be able to insert an object with an id', async () => {
    const collection = client.collections.get<TestCollectionData>(className);
    const id = v4();
    const insert = await collection.data.insert({
      properties: {
        testProp: 'test',
      },
      id: id,
    });
    expect(insert).toEqual(id);
  });
});
