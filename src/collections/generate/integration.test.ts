/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';
import { GenerateOptions, GroupByOptions } from '../types/index.js';

const maybe = process.env.OPENAI_APIKEY ? describe : describe.skip;

const makeOpenAIClient = () =>
  weaviate.connectToLocal({
    port: 8086,
    grpcPort: 50057,
    headers: {
      'X-Openai-Api-Key': process.env.OPENAI_APIKEY!,
    },
  });

maybe('Testing of the collection.generate methods with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionGenerateSimple, 'TestCollectionGenerateSimple'>;
  const collectionName = 'TestCollectionGenerateSimple';
  let id: string;
  let vector: number[];

  type TestCollectionGenerateSimple = {
    testProp: string;
  };

  const generateOpts: GenerateOptions<TestCollectionGenerateSimple> = {
    singlePrompt: 'Write a haiku about ducks for {testProp}',
    groupedTask: 'What is the value of testProp here?',
    groupedProperties: ['testProp'],
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await makeOpenAIClient();
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
        generative: weaviate.configure.generative.openAI(),
        vectorizers: weaviate.configure.vectorizer.text2VecOpenAI({
          vectorizeCollectionName: false,
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
    vector = res?.vectors.default!;
  });

  describe('using a non-generic collection', () => {
    it('should generate without search', async () => {
      const ret = await client.collections.use(collectionName).generate.fetchObjects({
        singlePrompt: 'Write a haiku about ducks for {testProp}',
        groupedTask: 'What is the value of testProp here?',
        groupedProperties: ['testProp'],
      });
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });
  });

  describe('using a generic collection', () => {
    it('should generate without search', async () => {
      const ret = await collection.generate.fetchObjects(generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it('should generate without search specifying return properties', async () => {
      const ret = await collection.generate.fetchObjects(generateOpts, {
        returnProperties: ['testProp'],
      });
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it('should generate with bm25', async () => {
      const ret = await collection.generate.bm25('test', generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it('should generate with hybrid', async () => {
      const ret = await collection.generate.hybrid('test', generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it.skip('should generate with nearObject', async () => {
      const ret = await collection.generate.nearObject(id, generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it('should generate with nearText', async () => {
      const ret = await collection.generate.nearText(['test'], generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });

    it('should generate with nearVector', async () => {
      const ret = await collection.generate.nearVector(vector, generateOpts);
      expect(ret.objects.length).toEqual(1);
      expect(ret.generated).toBeDefined();
      expect(ret.objects[0].properties.testProp).toEqual('test');
      expect(ret.objects[0].uuid).toEqual(id);
      expect(ret.objects[0].generated).toBeDefined();
    });
  });
});

maybe('Testing of the groupBy collection.generate methods with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionGenerateGroupBySimple, 'TestCollectionGenerateGroupBySimple'>;
  const collectionName = 'TestCollectionGenerateGroupBySimple';
  let id: string;
  let vector: number[];

  type TestCollectionGenerateGroupBySimple = {
    testProp: string;
  };

  const generateOpts: GenerateOptions<TestCollectionGenerateGroupBySimple> = {
    singlePrompt: 'Write a haiku about ducks for {testProp}',
    groupedTask: 'What is the value of testProp here?',
    groupedProperties: ['testProp'],
  };

  const groupByArgs: GroupByOptions<TestCollectionGenerateGroupBySimple> = {
    numberOfGroups: 1,
    objectsPerGroup: 1,
    property: 'testProp',
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await makeOpenAIClient();
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
        generative: weaviate.configure.generative.openAI(),
        vectorizers: weaviate.configure.vectorizer.text2VecOpenAI({
          vectorizeCollectionName: false,
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
    vector = res?.vectors.default!;
  });

  // it('should groupBy without search', async () => {
  //   const ret = await collection.groupBy.fetchObjects(groupByArgs);
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  // it('should groupBy without search specifying return properties', async () => {
  //   const ret = await collection.groupBy.fetchObjects({
  //     returnProperties: ['testProp'],
  //     returnMetadata: ['uuid'],
  //     ...groupByArgs,
  //   });
  //   expect(ret.objects.length).toEqual(1);
  //   expect(ret.groups).toBeDefined();
  //   expect(Object.keys(ret.groups)).toEqual(['test']);
  //   expect(ret.objects[0].properties.testProp).toEqual('test');
  //   expect(ret.objects[0].metadata.uuid).toEqual(id);
  //   expect(ret.objects[0].belongsToGroup).toEqual('test');
  // });

  it('should groupBy with bm25', async () => {
    const query = () =>
      collection.generate.bm25('test', generateOpts, {
        groupBy: groupByArgs,
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with hybrid', async () => {
    const query = () =>
      collection.generate.hybrid('test', generateOpts, {
        groupBy: groupByArgs,
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it.skip('should groupBy with nearObject', async () => {
    const ret = await collection.generate.nearObject(id, generateOpts, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(ret.generated).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.groups.test.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearText', async () => {
    const ret = await collection.generate.nearText(['test'], generateOpts, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(ret.generated).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.groups.test.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearVector', async () => {
    const ret = await collection.generate.nearVector(vector, generateOpts, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(ret.generated).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.groups.test.generated).toBeDefined();
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });
});

maybe('Testing of the collection.generate methods with a multi vector collection', () => {
  let client: WeaviateClient;
  let collection: Collection;
  const collectionName = 'TestCollectionQueryWithMultiVector';

  let id1: string;
  let id2: string;
  let titleVector: number[];
  let title2Vector: number[];

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await makeOpenAIClient();
    collection = client.collections.use(collectionName);
    const query = () =>
      client.collections
        .create({
          name: collectionName,
          properties: [
            {
              name: 'title',
              dataType: 'text',
              vectorizePropertyName: false,
            },
          ],
          vectorizers: [
            weaviate.configure.vectorizer.text2VecOpenAI({
              name: 'title',
              sourceProperties: ['title'],
            }),
            weaviate.configure.vectorizer.text2VecOpenAI({
              name: 'title2',
              sourceProperties: ['title'],
            }),
          ],
        })
        .then(async () => {
          id1 = await collection.data.insert({
            properties: {
              title: 'test',
            },
          });
          id2 = await collection.data.insert({
            properties: {
              title: 'other',
            },
          });
          const res = await collection.query.fetchObjectById(id1, { includeVector: true });
          titleVector = res!.vectors.title!;
          title2Vector = res!.vectors.title2!;
        });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    return query();
  });

  it('should generate with a near vector search on multi vectors', async () => {
    const query = () =>
      collection.generate.nearVector(
        { title: titleVector, title2: title2Vector },
        {
          groupedTask: 'What is the value of title here? {title}',
          groupedProperties: ['title'],
          singlePrompt: 'Write a haiku about ducks for {title}',
        }
      );
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].generated).toBeDefined();
    expect(ret.objects[1].generated).toBeDefined();
  });

  it('should generate with a near vector search on multi vectors', async () => {
    const query = () =>
      collection.generate.nearVector(
        { title: titleVector, title2: title2Vector },
        {
          groupedTask: 'What is the value of title here? {title}',
          groupedProperties: ['title'],
          singlePrompt: 'Write a haiku about ducks for {title}',
        },
        {
          targetVector: ['title', 'title2'],
        }
      );
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.generated).toBeDefined();
    expect(ret.objects[0].generated).toBeDefined();
    expect(ret.objects[1].generated).toBeDefined();
  });
});
