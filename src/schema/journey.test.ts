/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, { WeaviateClient } from '..';
import { WeaviateClass, Property, WeaviateSchema, ShardStatus, ShardStatusList } from '../openapi/types';

describe('schema', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const classObj = newClassObject('MyThingClass');

  it('creates a thing class (implicitly)', () => {
    return client.schema
      .classCreator()
      .withClass(classObj)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toEqual(classObj);
      });
  });

  it('gets an existing class', () => {
    return client.schema
      .classGetter()
      .withClassName(classObj.class)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toEqual(classObj);
      });
  });

  it('extends the thing class with a new property', () => {
    const className = 'MyThingClass';
    const prop: Property = {
      dataType: ['string'],
      name: 'anotherProp',
      tokenization: 'field',
      moduleConfig: {
        'text2vec-contextionary': {
          skip: false,
          vectorizePropertyName: false,
        },
      },
    };

    return client.schema
      .propertyCreator()
      .withClassName(className)
      .withProperty(prop)
      .do()
      .then((res: any) => {
        expect(res).toEqual(prop);
      });
  });

  it('fails to extend the thing class with property having not supported tokenization (1)', () => {
    const className = 'MyThingClass';
    const prop: Property = {
      dataType: ['text'],
      name: 'yetAnotherProp',
      tokenization: 'field',
      moduleConfig: {
        'text2vec-contextionary': {
          skip: false,
          vectorizePropertyName: false,
        },
      },
    };

    return client.schema
      .propertyCreator()
      .withClassName(className)
      .withProperty(prop)
      .do()
      .catch((err: Error) => {
        expect(err.message).toEqual(
          'usage error (422): {"error":[{"message":"Tokenization \'field\' is not allowed for data type \'text\'"}]}'
        );
      });
  });

  it('fails to extend the thing class with property having not supported tokenization (2)', () => {
    const className = 'MyThingClass';
    const prop: Property = {
      dataType: ['int[]'],
      name: 'yetAnotherProp',
      tokenization: 'word',
      moduleConfig: {
        'text2vec-contextionary': {
          skip: false,
          vectorizePropertyName: false,
        },
      },
    };

    return client.schema
      .propertyCreator()
      .withClassName(className)
      .withProperty(prop)
      .do()
      .catch((err: Error) => {
        expect(err.message).toEqual(
          'usage error (422): {"error":[{"message":"Tokenization \'word\' is not allowed for data type \'int[]\'"}]}'
        );
      });
  });

  it('retrieves the schema and it matches the expectations', () => {
    return client.schema
      .getter()
      .do()
      .then((res: WeaviateSchema) => {
        expect(res).toEqual({
          classes: [
            {
              class: 'MyThingClass',
              properties: [
                {
                  dataType: ['string'],
                  name: 'stringProp',
                  tokenization: 'word',
                  moduleConfig: {
                    'text2vec-contextionary': {
                      skip: false,
                      vectorizePropertyName: false,
                    },
                  },
                },
                {
                  dataType: ['string'],
                  name: 'anotherProp',
                  tokenization: 'field',
                  moduleConfig: {
                    'text2vec-contextionary': {
                      skip: false,
                      vectorizePropertyName: false,
                    },
                  },
                },
              ],
              vectorIndexType: 'hnsw',
              vectorizer: 'text2vec-contextionary',
              vectorIndexConfig: {
                cleanupIntervalSeconds: 300,
                distance: 'cosine',
                dynamicEfFactor: 8,
                dynamicEfMax: 500,
                dynamicEfMin: 100,
                ef: -1,
                maxConnections: 64,
                pq: {
                  bitCompression: false,
                  centroids: 256,
                  enabled: false,
                  encoder: {
                    distribution: 'log-normal',
                    type: 'kmeans',
                  },
                  segments: 0,
                },
                skip: false,
                efConstruction: 128,
                vectorCacheMaxObjects: 500000,
                flatSearchCutoff: 40000,
              },
              invertedIndexConfig: {
                cleanupIntervalSeconds: 60,
                bm25: {
                  b: 0.75,
                  k1: 1.2,
                },
                stopwords: {
                  preset: 'en',
                  additions: null,
                  removals: null,
                },
              },
              moduleConfig: {
                'text2vec-contextionary': {
                  vectorizeClassName: true,
                },
              },
              shardingConfig: {
                actualCount: 1,
                actualVirtualCount: 128,
                desiredCount: 1,
                desiredVirtualCount: 128,
                function: 'murmur3',
                key: '_id',
                strategy: 'hash',
                virtualPerPhysical: 128,
              },
              replicationConfig: {
                factor: 1,
              },
            },
          ],
        });
      });
  });

  it('gets the shards of an existing class', () => {
    return client.schema
      .shardsGetter()
      .withClassName(classObj.class!)
      .do()
      .then((res: ShardStatusList) => {
        res.forEach((shard: ShardStatus) => {
          expect(shard.status).toEqual('READY');
        });
      });
  });

  it('updates a shard of an existing class to readonly', async () => {
    const shards = await getShards(client, classObj.class!);
    expect(Array.isArray(shards)).toBe(true);
    expect(shards.length).toEqual(1);

    return client.schema
      .shardUpdater()
      .withClassName(classObj.class!)
      .withShardName(shards[0].name!)
      .withStatus('READONLY')
      .do()
      .then((res: ShardStatus) => {
        expect(res.status).toEqual('READONLY');
      });
  });

  it('updates a shard of an existing class to ready', async () => {
    const shards = await getShards(client, classObj.class!);
    expect(Array.isArray(shards)).toBe(true);
    expect(shards.length).toEqual(1);

    return client.schema
      .shardUpdater()
      .withClassName(classObj.class!)
      .withShardName(shards[0].name!)
      .withStatus('READY')
      .do()
      .then((res: ShardStatus) => {
        expect(res.status).toEqual('READY');
      });
  });

  it('deletes an existing class', () => {
    return client.schema
      .classDeleter()
      .withClassName(classObj.class!)
      .do()
      .then((res: void) => {
        expect(res).toEqual(undefined);
      });
  });

  it('updates all shards in a class', async () => {
    const shardCount = 3;
    const newClass: any = newClassObject('NewClass');
    newClass.shardingConfig.desiredCount = shardCount;

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('shardingConfig.actualCount', 3);
      });

    const shards = await getShards(client, newClass.class);
    expect(Array.isArray(shards)).toBe(true);
    expect(shards.length).toEqual(shardCount);

    await client.schema
      .shardsUpdater()
      .withClassName(newClass.class)
      .withStatus('READONLY')
      .do()
      .then((res: ShardStatusList) => {
        expect(res.length).toEqual(shardCount);
        res.forEach((obj: ShardStatus) => {
          expect(obj.status).toEqual('READONLY');
        });
      });

    await client.schema
      .shardsUpdater()
      .withClassName(newClass.class)
      .withStatus('READY')
      .do()
      .then((res: any) => {
        expect(res.length).toEqual(shardCount);
        res.forEach((obj: any) => {
          expect(obj.status).toEqual('READY');
        });
      });

    return deleteClass(client, newClass.class);
  });

  it('has updated values of bm25 config', async () => {
    const newClass: any = newClassObject('NewClass');
    const bm25Config = { k1: 1.13, b: 0.222 };

    newClass.invertedIndexConfig.bm25 = bm25Config;

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('invertedIndexConfig.bm25', bm25Config);
      });

    return deleteClass(client, newClass.class);
  });

  it('has updated values of stopwords config', async () => {
    const newClass: any = newClassObject('SpaceClass');
    const stopwordConfig: any = {
      preset: 'en',
      additions: ['star', 'nebula'],
      removals: ['a', 'the'],
    };

    newClass.invertedIndexConfig.stopwords = stopwordConfig;

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('invertedIndexConfig.stopwords', stopwordConfig);
      });

    return deleteClass(client, newClass.class);
  });

  it('creates a class with bm25 and stopwords config', async () => {
    const newClass: any = {
      class: 'EmptyClass',
      properties: [{ dataType: ['string'], name: 'stringProp' }],
    };

    const bm25Config: any = { k1: 1.13, b: 0.222 };
    const stopwordConfig: any = {
      preset: 'en',
      additions: ['star', 'nebula'],
      removals: ['a', 'the'],
    };

    newClass.invertedIndexConfig = {
      bm25: bm25Config,
      stopwords: stopwordConfig,
    };

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('invertedIndexConfig.bm25', bm25Config);
        expect(res).toHaveProperty('invertedIndexConfig.stopwords', stopwordConfig);
      });

    return deleteClass(client, newClass.class);
  });

  it('creates a class with explicit replication config', async () => {
    const replicationFactor = 1;
    const newClass: any = newClassObject('SomeClass');
    newClass.replicationConfig.factor = replicationFactor;

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('replicationConfig.factor', replicationFactor);
      });

    return deleteClass(client, newClass.class);
  });

  it('creates a class with implicit replication config', async () => {
    const newClass: any = newClassObject('SomeClass');
    delete newClass.replicationConfig;

    await client.schema
      .classCreator()
      .withClass(newClass)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toHaveProperty('replicationConfig.factor', 1);
      });

    return deleteClass(client, newClass.class);
  });
});

function newClassObject(className: string) {
  return {
    class: className,
    properties: [
      {
        dataType: ['string'],
        name: 'stringProp',
        tokenization: 'word',
        moduleConfig: {
          'text2vec-contextionary': {
            skip: false,
            vectorizePropertyName: false,
          },
        },
      },
    ],
    vectorIndexType: 'hnsw',
    vectorizer: 'text2vec-contextionary',
    vectorIndexConfig: {
      cleanupIntervalSeconds: 300,
      distance: 'cosine',
      dynamicEfFactor: 8,
      dynamicEfMax: 500,
      dynamicEfMin: 100,
      ef: -1,
      maxConnections: 64,
      pq: {
        bitCompression: false,
        centroids: 256,
        enabled: false,
        encoder: {
          distribution: 'log-normal',
          type: 'kmeans',
        },
        segments: 0,
      },
      skip: false,
      efConstruction: 128,
      vectorCacheMaxObjects: 500000,
      flatSearchCutoff: 40000,
    },
    invertedIndexConfig: {
      cleanupIntervalSeconds: 60,
      bm25: {
        b: 0.75,
        k1: 1.2,
      },
      stopwords: {
        preset: 'en',
        additions: null,
        removals: null,
      },
    },
    moduleConfig: {
      'text2vec-contextionary': {
        vectorizeClassName: true,
      },
    },
    shardingConfig: {
      actualCount: 1,
      actualVirtualCount: 128,
      desiredCount: 1,
      desiredVirtualCount: 128,
      function: 'murmur3',
      key: '_id',
      strategy: 'hash',
      virtualPerPhysical: 128,
    },
    replicationConfig: {
      factor: 1,
    },
  };
}

function getShards(client: WeaviateClient, className: string): Promise<ShardStatusList> {
  return client.schema
    .shardsGetter()
    .withClassName(className)
    .do()
    .then((res: ShardStatusList) => {
      return res;
    });
}

function deleteClass(client: WeaviateClient, className: string) {
  return client.schema
    .classDeleter()
    .withClassName(className)
    .do()
    .then((res: void) => {
      expect(res).toEqual(undefined);
    });
}
