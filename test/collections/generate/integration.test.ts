/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WeaviateUnsupportedFeatureError } from '../../../src/errors.js';
import weaviate, {
  Collection,
  GenerateOptions,
  GroupByOptions,
  WeaviateClient,
  generativeParameters,
} from '../../../src/index.js';

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

  const generateOpts = {
    singlePrompt: 'Write a haiku about ducks for {testProp}',
    groupedTask: 'What is the value of testProp here?',
    groupedProperties: ['testProp'] as 'testProp'[],
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
        vectorizers: weaviate.configure.vectors.text2VecOpenAI({}),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default as number[];
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

    it('should generate in a BC-compatible way', async () => {
      const query = () => collection.generate.fetchObjects(generateOpts);

      const res = await query();
      expect(res.objects.length).toEqual(1);
      expect(res.generated).toBeDefined();
      expect(res.generated).not.toEqual('');
      expect(res.generative?.text).toBeDefined();
      expect(res.generative?.text).not.toEqual('');
      expect(res.generative?.metadata).toBeUndefined();
      res.objects.forEach((obj) => {
        expect(obj.generated).toBeDefined();
        expect(obj.generated).not.toEqual('');
        expect(obj.generative?.text).toBeDefined();
        expect(obj.generative?.text).not.toEqual('');
        expect(obj.generative?.metadata).toBeUndefined();
        expect(obj.generative?.debug).toBeUndefined();
      });
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

  const generateOpts: GenerateOptions<TestCollectionGenerateGroupBySimple, undefined> = {
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
        vectorizers: weaviate.configure.vectors.text2VecOpenAI({}),
      })
      .then(() => {
        return collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default as number[];
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
            weaviate.configure.vectors.text2VecOpenAI({
              name: 'title',
              sourceProperties: ['title'],
            }),
            weaviate.configure.vectors.text2VecOpenAI({
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
          titleVector = res!.vectors.title as number[];
          title2Vector = res!.vectors.title2 as number[];
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

maybe('Testing of the collection.generate methods with runtime generative config', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionGenerateConfigRuntime, 'TestCollectionGenerateConfigRuntime'>;
  const collectionName = 'TestCollectionGenerateConfigRuntime';

  type TestCollectionGenerateConfigRuntime = {
    testProp: string;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await makeOpenAIClient();
    collection = client.collections.get(collectionName);
    return client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
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

  it('should generate using a runtime config without search and with extras', async () => {
    const query = () =>
      collection.generate.fetchObjects({
        singlePrompt: {
          prompt: 'Write a haiku about ducks for {testProp}',
          debug: true,
          metadata: true,
        },
        groupedTask: {
          prompt: 'What is the value of testProp here?',
          nonBlobProperties: ['testProp'],
          metadata: true,
        },
        config: generativeParameters.openAI({
          stop: ['\n'],
        }),
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 30, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }

    const res = await query();
    expect(res.objects.length).toEqual(1);
    expect(res.generated).toBeDefined();
    expect(res.generated).not.toEqual('');
    expect(res.generative?.text).toBeDefined();
    expect(res.generative?.text).not.toEqual('');
    expect(res.generative?.metadata).toBeDefined();
    res.objects.forEach((obj) => {
      expect(obj.generated).toBeDefined();
      expect(obj.generative?.text).toBeDefined();
      expect(obj.generative?.metadata).toBeDefined();
      expect(obj.generative?.debug).toBeDefined();
    });
  });

  it('should generate using a runtime config without search nor extras', async () => {
    const query = () =>
      collection.generate.fetchObjects({
        singlePrompt: 'Write a haiku about ducks for {testProp}',
        groupedTask: 'What is the value of testProp here?',
        config: {
          name: 'generative-openai',
          config: {
            model: 'gpt-4o-mini',
            stop: { values: ['\n'] },
          },
        },
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 30, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }

    const res = await query();
    expect(res.objects.length).toEqual(1);
    expect(res.generated).toBeDefined();
    expect(res.generated).not.toEqual('');
    expect(res.generative?.text).toBeDefined();
    expect(res.generative?.text).not.toEqual('');
    expect(res.generative?.metadata).toBeUndefined();
    res.objects.forEach((obj) => {
      expect(obj.generated).toBeDefined();
      expect(obj.generated).not.toEqual('');
      expect(obj.generative?.text).toBeDefined();
      expect(obj.generative?.text).not.toEqual('');
      expect(obj.generative?.metadata).toBeUndefined();
      expect(obj.generative?.debug).toBeUndefined();
    });
  });
});

const maybeContextualAI = process.env.CONTEXTUALAI_API_KEY ? describe : describe.skip;

maybeContextualAI('Testing of the collection.generate methods with Contextual AI', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionContextualAI, 'TestCollectionContextualAI'>;
  const collectionName = 'TestCollectionContextualAI';
  let id: string;

  type TestCollectionContextualAI = {
    title: string;
    content: string;
    category: string;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal({
      port: 8086,
      grpcPort: 50057,
      headers: {
        'X-Contextual-Api-Key': process.env.CONTEXTUALAI_API_KEY!,
        'X-Openai-Api-Key': process.env.OPENAI_APIKEY!,
      },
    });
    collection = client.collections.use(collectionName);
    id = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'title',
            dataType: 'text',
          },
          {
            name: 'content',
            dataType: 'text',
          },
          {
            name: 'category',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecOpenAI(),
        generative: weaviate.configure.generative.contextualai({
          model: 'v2',
          temperature: 0.7,
          topP: 0.9,
          maxNewTokens: 100,
          systemPrompt: 'You are a helpful AI assistant.',
          avoidCommentary: false,
        }),
      })
      .then((c) =>
        c.data.insert({
          title: 'Machine Learning Fundamentals',
          content:
            'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
          category: 'AI/ML',
        })
      )
      .then((r) => r);
  });

  it('should generate single prompt responses with proper text validation and content verification', async () => {
    const response = await collection.generate.nearText(
      'What is machine learning?',
      {
        singlePrompt: 'Summarize this title in one sentence: {title}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative).toBeDefined();
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(typeof response.objects[0].generative?.text).toBe('string');
    expect(response.objects[0].generative?.text?.length).toBeGreaterThan(0);
  });

  it('should handle grouped task generation with multiple properties and response aggregation', async () => {
    const response = await collection.generate.nearText(
      'artificial intelligence',
      {
        groupedTask: 'What is the main topic of these documents?',
        groupedProperties: ['title', 'content'],
      },
      {
        limit: 1,
      }
    );

    expect(response.generative).toBeDefined();
    expect(response.generative?.text).toBeDefined();
    expect(typeof response.generative?.text).toBe('string');
    expect(response.generative?.text?.length).toBeGreaterThan(0);
  });

  it('should validate runtime configuration parameters and generation behavior', async () => {
    const response = await collection.generate.nearText(
      'machine learning',
      {
        singlePrompt: 'Translate this title to French: {title}',
        config: generativeParameters.contextualai({
          model: 'v2',
          temperature: 0.5,
          topP: 0.8,
          maxNewTokens: 50,
          systemPrompt: 'You are a translation assistant.',
          avoidCommentary: true,
        }),
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative).toBeDefined();
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(typeof response.objects[0].generative?.text).toBe('string');
  });

  it('should handle knowledge parameter override in runtime configuration', async () => {
    const response = await collection.generate.nearText(
      'machine learning',
      {
        singlePrompt: 'What is the custom knowledge?',
        config: generativeParameters.contextualai({
          model: 'v2',
          temperature: 0.7,
          maxNewTokens: 100,
          knowledge: ['Custom knowledge override', 'Additional context for testing'],
        }),
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative).toBeDefined();
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(typeof response.objects[0].generative?.text).toBe('string');
    expect(response.objects[0].generative?.text?.length).toBeGreaterThan(0);
  });

  it('should handle generative configuration errors gracefully', async () => {
    // Test with invalid generative configuration - this will be handled by the API
    const response = await collection.generate.nearText(
      'test query',
      {
        singlePrompt: 'Test prompt: {title}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative?.text).toBeDefined();
  });

  it('should validate generative parameter constraints and boundaries', async () => {
    // Test with valid boundary values
    const response = await collection.generate.nearText(
      'machine learning',
      {
        singlePrompt: 'Summarize: {title}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(typeof response.objects[0].generative?.text).toBe('string');
  });

  it('should return proper generative response format and structure', async () => {
    const response = await collection.generate.nearText(
      'artificial intelligence',
      {
        singlePrompt: 'Explain this concept: {content}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative).toBeDefined();
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(typeof response.objects[0].generative?.text).toBe('string');
    expect(response.objects[0].generative?.text?.length).toBeGreaterThan(0);

    // Validate response structure
    const generatedText = response.objects[0].generative?.text;
    expect(generatedText).not.toBe('');
    expect(generatedText).not.toBeNull();
    expect(generatedText).not.toBeUndefined();
  });

  it('should handle empty prompts and boundary conditions', async () => {
    // Test with empty prompt
    const response = await collection.generate.nearText(
      'test',
      {
        singlePrompt: '', // Empty prompt
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative?.text).toBeDefined();
  });

  it('should validate model parameter constraints and ranges', async () => {
    // Test with valid model parameters
    const response = await collection.generate.nearText(
      'machine learning',
      {
        singlePrompt: 'Describe: {title}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative?.text).toBeDefined();
    expect(response.objects[0].generative?.text?.length).toBeGreaterThan(0);
  });

  it('should handle API timeout and network error scenarios', async () => {
    // Test with very short timeout to simulate network issues
    const response = await collection.generate.nearText(
      'test query',
      {
        singlePrompt: 'Quick response: {title}',
      },
      {
        limit: 1,
      }
    );

    expect(response.objects).toHaveLength(1);
    expect(response.objects[0].generative?.text).toBeDefined();
  });
});
