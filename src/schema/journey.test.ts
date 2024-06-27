/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Meta, Property, ShardStatus, ShardStatusList, Tenant, WeaviateClass } from '../openapi/types.js';
import weaviate, { WeaviateClient } from '../v2/index.js';

const isVer = (client: WeaviateClient, minor: number, patch: number) =>
  client.misc
    .metaGetter()
    .do()
    .then((res: Meta) => res.version)
    .then((version: string | undefined) => {
      if (!version) {
        return false;
      }
      const semver = version.split('.').map((v) => parseInt(v, 10));
      return semver[1] >= minor && semver[2] >= patch;
    });

describe('schema', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const classObjPromise = newClassObject('MyThingClass', isVer(client, 25, 0), isVer(client, 25, 2));

  it('creates a thing class (implicitly)', async () => {
    const classObj = await classObjPromise;
    return client.schema
      .classCreator()
      .withClass(classObj)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toEqual(classObj);
      });
  });

  it('gets an existing class', async () => {
    const classObj = await classObjPromise;
    return client.schema
      .classGetter()
      .withClassName(classObj.class)
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toEqual(classObj);
      });
  });

  it('checks class existence', async () => {
    const classObj = await classObjPromise;
    return client.schema.exists(classObj.class).then((res) => expect(res).toEqual(true));
  });

  it('checks class non-existence', () => {
    return client.schema.exists('NonExistingClass').then((res) => expect(res).toEqual(false));
  });

  it('extends the thing class with a new property', () => {
    const className = 'MyThingClass';
    const prop: Property = {
      dataType: ['text'],
      name: 'anotherProp',
      tokenization: 'field',
      indexFilterable: true,
      indexSearchable: true,
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
          'The request to Weaviate failed with status code: 422 and message: {"error":[{"message":"Tokenization is not allowed for data type \'int[]\'"}]}'
        );
      });
  });

  it('gets the shards of an existing class', async () => {
    const classObj = await classObjPromise;
    return client.schema
      .shardsGetter()
      .withClassName(classObj.class)
      .do()
      .then((res: ShardStatusList) => {
        res.forEach((shard: ShardStatus) => {
          expect(shard.status).toEqual('READY');
        });
      });
  });

  it('updates a shard of an existing class to readonly', async () => {
    const classObj = await classObjPromise;
    const shards = await getShards(client, classObj.class);
    expect(Array.isArray(shards)).toBe(true);
    expect(shards.length).toEqual(1);

    return client.schema
      .shardUpdater()
      .withClassName(classObj.class)
      .withShardName(shards[0].name!)
      .withStatus('READONLY')
      .do()
      .then((res: ShardStatus) => {
        expect(res.status).toEqual('READONLY');
      });
  });

  it('updates a shard of an existing class to ready', async () => {
    const classObj = await classObjPromise;
    const shards = await getShards(client, classObj.class);
    expect(Array.isArray(shards)).toBe(true);
    expect(shards.length).toEqual(1);

    return client.schema
      .shardUpdater()
      .withClassName(classObj.class)
      .withShardName(shards[0].name!)
      .withStatus('READY')
      .do()
      .then((res: ShardStatus) => {
        expect(res.status).toEqual('READY');
      });
  });

  it('deletes an existing class', async () => {
    const classObj = await classObjPromise;
    return client.schema
      .classDeleter()
      .withClassName(classObj.class)
      .do()
      .then((res: void) => {
        expect(res).toEqual(undefined);
      });
  });

  it('updates all shards in a class', async () => {
    const shardCount = 3;
    const newClass: any = await newClassObject('NewClass', isVer(client, 25, 0), isVer(client, 25, 2));
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
    const newClass: any = await newClassObject('NewClass', isVer(client, 25, 0), isVer(client, 25, 2));
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
    const newClass: any = await newClassObject('SpaceClass', isVer(client, 25, 0), isVer(client, 25, 2));
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
    const newClass: any = await newClassObject('SomeClass', isVer(client, 25, 0), isVer(client, 25, 2));
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
    const newClass: any = await newClassObject('SomeClass', isVer(client, 25, 0), isVer(client, 25, 2));
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

  it('delete all data from the schema', async () => {
    const newClass: any = await newClassObject(
      'LetsDeleteThisClass',
      isVer(client, 25, 0),
      isVer(client, 25, 2)
    );
    const newClass2: any = await newClassObject(
      'LetsDeleteThisClassToo',
      isVer(client, 25, 0),
      isVer(client, 25, 2)
    );
    const classNames = [newClass.class, newClass2.class];
    Promise.all([
      client.schema.classCreator().withClass(newClass).do(),
      client.schema.classCreator().withClass(newClass2).do(),
    ])
      .then(() => client.schema.getter().do())
      .then((schema) => classNames.forEach((cn) => expect(schema.classes?.map((c) => c.class)).toContain(cn)))
      .then(() => client.schema.deleteAll())
      .then(() => client.schema.getter().do())
      .then((schema) =>
        classNames.forEach((cn) => expect(schema.classes?.map((c) => c.class)).not.toContain(cn))
      );
  });
});

describe('property setting defaults and migrations', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  test.each([
    ['text', null, 'text', 'word'],
    ['text', '', 'text', 'word'],
    ['text', 'word', 'text', 'word'],
    ['text', 'lowercase', 'text', 'lowercase'],
    ['text', 'whitespace', 'text', 'whitespace'],
    ['text', 'field', 'text', 'field'],

    ['text[]', null, 'text[]', 'word'],
    ['text[]', '', 'text[]', 'word'],
    ['text[]', 'word', 'text[]', 'word'],
    ['text[]', 'lowercase', 'text[]', 'lowercase'],
    ['text[]', 'whitespace', 'text[]', 'whitespace'],
    ['text[]', 'field', 'text[]', 'field'],

    ['string', null, 'text', 'whitespace'],
    ['string', '', 'text', 'whitespace'],
    ['string', 'word', 'text', 'whitespace'],
    ['string', 'field', 'text', 'field'],

    ['string[]', null, 'text[]', 'whitespace'],
    ['string[]', '', 'text[]', 'whitespace'],
    ['string[]', 'word', 'text[]', 'whitespace'],
    ['string[]', 'field', 'text[]', 'field'],

    ['int', null, 'int', null],
    ['int', '', 'int', null],

    ['int[]', null, 'int[]', null],
    ['int[]', '', 'int[]', null],
  ])(
    'succeeds creating prop with data type and tokenization',
    async (
      dataType: string,
      tokenization: string | null,
      expectedDataType: string,
      expectedTokenization: string | null
    ) => {
      await client.schema
        .classCreator()
        .withClass({
          class: 'SomeClass',
          properties: [
            {
              dataType: [dataType],
              name: 'property',
              tokenization: tokenization,
            },
          ],
        })
        .do()
        .then((res: WeaviateClass) => {
          expect(res).toBeDefined();
          expect(res.properties).toHaveLength(1);
          expect(res.properties![0]).toHaveProperty('dataType', [expectedDataType]);
          if (expectedTokenization != null) {
            expect(res.properties![0]).toHaveProperty('tokenization', expectedTokenization);
          } else {
            expect(res.properties![0]).not.toHaveProperty('tokenization');
          }
        });

      return deleteClass(client, 'SomeClass');
    }
  );

  test.each([
    ['string', 'whitespace'],
    ['string', 'lowercase'],

    ['string[]', 'whitespace'],
    ['string[]', 'lowercase'],

    ['int', 'word'],
    ['int', 'whitespace'],
    ['int', 'lowercase'],
    ['int', 'field'],

    ['int[]', 'word'],
    ['int[]', 'whitespace'],
    ['int[]', 'lowercase'],
    ['int[]', 'field'],
  ])(
    'fails creating prop with data type and tokenization',
    async (dataType: string, tokenization: string | null) => {
      await client.schema
        .classCreator()
        .withClass({
          class: 'SomeClass',
          properties: [
            {
              dataType: [dataType],
              name: 'property',
              tokenization: tokenization,
            },
          ],
        })
        .do()
        .catch((e: Error) => {
          expect(e.message).toContain('is not allowed for data type');
        });
    }
  );

  test.each([
    ['text', null, null, null, true, true],
    ['text', null, null, false, true, false],
    ['text', null, null, true, true, true],
    ['text', null, false, null, false, true],
    ['text', null, false, false, false, false],
    ['text', null, false, true, false, true],
    ['text', null, true, null, true, true],
    ['text', null, true, false, true, false],
    ['text', null, true, true, true, true],
    ['text', false, null, null, false, false],
    ['text', true, null, null, true, true],

    ['int', null, null, null, true, false],
    ['int', null, null, false, true, false],
    ['int', null, false, null, false, false],
    ['int', null, false, false, false, false],
    ['int', null, true, null, true, false],
    ['int', null, true, false, true, false],
    ['int', false, null, null, false, false],
    ['int', true, null, null, true, false],
  ])(
    'succeeds creating prop with data type and indexing',
    async (
      dataType: string,
      inverted: boolean | null,
      filterable: boolean | null,
      searchable: boolean | null,
      expectedFilterable: boolean,
      expectedSearchable: boolean
    ) => {
      await client.schema
        .classCreator()
        .withClass({
          class: 'SomeClass',
          properties: [
            {
              dataType: [dataType],
              name: 'property',
              indexInverted: inverted,
              indexFilterable: filterable,
              indexSearchable: searchable,
            },
          ],
        })
        .do()
        .then((res: WeaviateClass) => {
          expect(res).toBeDefined();
          expect(res.properties).toHaveLength(1);
          expect(res.properties![0]).toHaveProperty('indexFilterable', expectedFilterable);
          expect(res.properties![0]).toHaveProperty('indexSearchable', expectedSearchable);
          expect(res.properties![0]).not.toHaveProperty('indexInverted');
        });

      return deleteClass(client, 'SomeClass');
    }
  );

  const errMsg1 =
    '`indexInverted` is deprecated and can not be set together with `indexFilterable` or `indexSearchable`';
  const errMsg2 = '`indexSearchable`';
  test.each([
    ['text', false, null, false, errMsg1],
    ['text', false, null, true, errMsg1],
    ['text', false, false, null, errMsg1],
    ['text', false, false, false, errMsg1],
    ['text', false, false, true, errMsg1],
    ['text', false, true, null, errMsg1],
    ['text', false, true, false, errMsg1],
    ['text', false, true, true, errMsg1],
    ['text', true, null, false, errMsg1],
    ['text', true, null, true, errMsg1],
    ['text', true, false, null, errMsg1],
    ['text', true, false, false, errMsg1],
    ['text', true, false, true, errMsg1],
    ['text', true, true, null, errMsg1],
    ['text', true, true, false, errMsg1],
    ['text', true, true, true, errMsg1],

    ['int', false, null, false, errMsg1],
    ['int', false, null, true, errMsg1],
    ['int', false, false, null, errMsg1],
    ['int', false, false, false, errMsg1],
    ['int', false, false, true, errMsg1],
    ['int', false, true, null, errMsg1],
    ['int', false, true, false, errMsg1],
    ['int', false, true, true, errMsg1],
    ['int', true, null, false, errMsg1],
    ['int', true, null, true, errMsg1],
    ['int', true, false, null, errMsg1],
    ['int', true, false, false, errMsg1],
    ['int', true, false, true, errMsg1],
    ['int', true, true, null, errMsg1],
    ['int', true, true, false, errMsg1],
    ['int', true, true, true, errMsg1],

    ['int', null, null, true, errMsg2],
    ['int', null, false, true, errMsg2],
    ['int', null, true, true, errMsg2],
  ])(
    'fails creating prop with data type and indexing',
    async (
      dataType: string,
      inverted: boolean | null,
      filterable: boolean | null,
      searchable: boolean | null,
      errMsg: string
    ) => {
      await client.schema
        .classCreator()
        .withClass({
          class: 'SomeClass',
          properties: [
            {
              dataType: [dataType],
              name: 'property',
              indexInverted: inverted,
              indexFilterable: filterable,
              indexSearchable: searchable,
            },
          ],
        })
        .do()
        .catch((e: Error) => {
          expect(e.message).toContain(errMsg);
        });
    }
  );
});

describe('multi tenancy', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });
  const classObj: WeaviateClass = {
    class: 'MultiTenancy',
    properties: [
      {
        dataType: ['text'],
        name: 'tenant',
      },
      {
        dataType: ['text'],
        name: 'content',
      },
    ],
    vectorIndexType: 'hnsw',
    vectorizer: 'text2vec-contextionary',
    multiTenancyConfig: {
      autoTenantActivation: true,
      autoTenantCreation: true,
      enabled: true,
    },
  };
  const tenants: Array<Tenant> = [{ name: 'tenantA' }, { name: 'tenantB' }, { name: 'tenantC' }];

  it('creates a MultiTenancy class', async () => {
    if (!(await isVer(client, 25, 0))) {
      delete classObj.multiTenancyConfig?.autoTenantCreation;
    }
    if (!(await isVer(client, 25, 2))) {
      delete classObj.multiTenancyConfig?.autoTenantActivation;
    }
    return client.schema
      .classCreator()
      .withClass(classObj)
      .do()
      .then((res: WeaviateClass) => {
        expect(res.class).toEqual(classObj.class);
        expect(res.multiTenancyConfig).toEqual(classObj.multiTenancyConfig);
      });
  });

  it('defines tenants for MultiTenancy class', () => {
    return client.schema
      .tenantsCreator(classObj.class!, tenants)
      .do()
      .then((res: Array<Tenant>) => {
        expect(res).toHaveLength(tenants.length);
        expect(res).toEqual(expect.arrayContaining(tenants));
      });
  });

  it('gets tenants for MultiTenancy class', () => {
    return client.schema
      .tenantsGetter(classObj.class!)
      .do()
      .then((res: Array<Tenant>) => {
        expect(res).toHaveLength(3);
      });
  });

  it('delete one tenant in MultiTenancy class', () => {
    return client.schema
      .tenantsDeleter(classObj.class!, [tenants[0].name!])
      .do()
      .then((res) => {
        expect(res).toEqual(undefined);
      });
  });

  it('get tenants after delete for MultiTenancy class', () => {
    return client.schema
      .tenantsGetter(classObj.class!)
      .do()
      .then((res: Array<Tenant>) => {
        expect(res).toHaveLength(2);
      });
  });

  it('successfully finds an existing tenant for MultiTenancy class', async () => {
    if (!(await isVer(client, 25, 0))) {
      return Promise.resolve();
    }
    return client.schema
      .tenantsExists(classObj.class!, tenants[1].name!)
      .do()
      .then((res) => expect(res).toEqual(true));
  });

  it('successfully fails to find a non-existant tenant for MultiTenancy class', async () => {
    if (!(await isVer(client, 25, 0))) {
      return Promise.resolve();
    }
    return client.schema
      .tenantsExists(classObj.class!, 'nonExistantTenant')
      .do()
      .then((res) => expect(res).toEqual(false));
  });

  it('deletes MultiTenancy class', () => {
    return deleteClass(client, classObj.class!);
  });

  const classObjWithoutMultiTenancyConfig = newClassObject(
    'NoMultiTenancy',
    isVer(client, 25, 0),
    isVer(client, 25, 2)
  );

  it('creates a NoMultiTenancy class', async () => {
    return client.schema
      .classCreator()
      .withClass(await classObjWithoutMultiTenancyConfig)
      .do()
      .then(async (res: WeaviateClass) => {
        expect(res).toEqual(await classObjWithoutMultiTenancyConfig);
      });
  });

  it('fails to define tenants for NoMultiTenancy class', async () => {
    return client.schema
      .tenantsCreator((await classObjWithoutMultiTenancyConfig).class!, tenants)
      .do()
      .catch((e: Error) => {
        expect(e.message).toContain('multi-tenancy is not enabled for class \\"NoMultiTenancy\\"');
      });
  });

  it('deletes NoMultiTenancy class', async () => {
    return deleteClass(client, (await classObjWithoutMultiTenancyConfig).class);
  });
});

async function newClassObject(
  className: string,
  is1250Promise: Promise<boolean>,
  is1252Promise: Promise<boolean>
) {
  return {
    class: className,
    properties: [
      {
        dataType: ['text'],
        name: 'stringProp',
        tokenization: 'word',
        indexFilterable: true,
        indexSearchable: true,
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
        trainingLimit: 100000,
      },
      bq: {
        enabled: false,
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
    multiTenancyConfig: {
      autoTenantActivation: (await is1252Promise) ? false : undefined,
      autoTenantCreation: (await is1250Promise) ? false : undefined,
      enabled: false,
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
