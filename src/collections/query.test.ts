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
  let vector: number[];

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
        vectorizer: weaviate.Configure.Vectorizer.text2VecContextionary(),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById({ id, includeVector: true });
    vector = res.metadata.vector!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
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

  it('should query with hybrid all objects with minimal options', async () => {
    const ret = await collection.query.hybrid({
      query: 'test',
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });

  it('should query with nearObject all objects with minimal options', async () => {
    const ret = await collection.query.nearObject({
      nearObject: id,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });

  it('should query with nearText all objects with minimal options', async () => {
    const ret = await collection.query.nearText({
      query: ['test'],
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });

  it('should query with nearVector all objects with minimal options', async () => {
    const ret = await collection.query.nearVector({
      nearVector: vector,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].metadata.uuid).toEqual(id);
  });
});
