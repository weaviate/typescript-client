/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';
import { GenerateArgs } from './generate';

const maybe = process.env.OPENAI_APIKEY ? describe : describe.skip;

maybe('Testing of the collection.generate methods with a simple collection', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8086',
    grpcAddress: 'localhost:50057',
    headers: {
      'X-Openai-Api-Key': process.env.OPENAI_APIKEY!,
    },
  });

  const className = 'TestCollectionGenerateSimple';
  let id: string;
  let vector: number[];

  type TestCollectionGenerateSimple = {
    testProp: string;
  };

  const collection = client.collections.get<TestCollectionGenerateSimple>(className);

  const generateArgs: GenerateArgs<TestCollectionGenerateSimple> = {
    singlePrompt: 'Write a haiku about ducks for {testProp}',
    groupedTask: 'What is the value of testProp here?',
    groupedProperties: ['testProp'],
  };

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
            dataType: ['text'],
          },
        ],
        vectorizer: weaviate.Configure.Vectorizer.text2VecOpenAI({ vectorizeClassName: false }),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById({ id, includeVector: true });
    vector = res.vector!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });

  it('should generate without search', async () => {
    const ret = await collection.generate.fetchObjects(generateArgs);
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should generate without search specifying return properties', async () => {
    const ret = await collection.generate.fetchObjects({
      returnProperties: ['testProp'],
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should generate with bm25', async () => {
    const ret = await collection.generate.bm25({
      query: 'test',
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should generate with hybrid', async () => {
    const ret = await collection.generate.hybrid({
      query: 'test',
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should generate with nearObject', async () => {
    const ret = await collection.generate.nearObject({
      nearObject: id,
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should generate with nearText', async () => {
    const ret = await collection.generate.nearText({
      query: ['test'],
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });

  it('should query with nearVector', async () => {
    const ret = await collection.generate.nearVector({
      nearVector: vector,
      ...generateArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].generated).toBeDefined();
  });
});
