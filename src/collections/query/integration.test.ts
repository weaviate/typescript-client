/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';
import { CrossReference, Reference } from '../references/index.js';
import { GroupByOptions } from '../types/index.js';

describe('Testing of the collection.query methods with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionQueryMinimalOptions, 'TestCollectionQueryMinimalOptions'>;
  const collectionName = 'TestCollectionQueryMinimalOptions';
  let id: string;
  let vector: number[];

  type TestCollectionQueryMinimalOptions = {
    testProp: string;
    testProp2: string;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.get(collectionName);
    id = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
          {
            name: 'testProp2',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary({
          vectorizeCollectionName: false,
        }),
      })
      .then(async () => {
        await collection.data.insert({
          properties: {
            testProp: 'apple',
            testProp2: 'banana',
          },
        });
        return collection.data.insert({
          properties: {
            testProp: 'test',
            testProp2: 'test2',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default!;
  });

  it('should fetch an object by its id', async () => {
    const object = await collection.query.fetchObjectById(id);
    expect(object?.properties.testProp).toEqual('test');
    expect(object?.uuid).toEqual(id);
  });

  it('should query without search', async () => {
    const ret = await collection.query.fetchObjects();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.testProp).toBeDefined();
    expect(ret.objects[0].uuid).toBeDefined();
  });

  it('should query without search specifying return properties', async () => {
    const ret = await collection.query.fetchObjects({
      returnProperties: ['testProp'],
    });
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.testProp).toBeDefined();
    expect(ret.objects[0].properties.testProp2).toBeUndefined();
    expect(ret.objects[0].uuid).toBeDefined();
  });

  it('should query with bm25', async () => {
    const ret = await collection.query.bm25('test');
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid', async () => {
    const ret = await collection.query.hybrid('test', { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid and vector', async () => {
    const ret = await collection.query.hybrid('test', {
      limit: 1,
      vector: vector,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid and near text subsearch', async () => {
    const query = () =>
      collection.query.hybrid('test', {
        limit: 1,
        vector: {
          query: 'apple',
          distance: 0.9,
          moveTo: {
            concepts: ['banana'],
            force: 0.9,
          },
          moveAway: {
            concepts: ['test'],
            force: 0.1,
          },
        },
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('apple');
    expect(ret.objects[0].properties.testProp2).toEqual('banana');
  });

  it('should query with hybrid and near vector subsearch', async () => {
    const query = () =>
      collection.query.hybrid('test', {
        limit: 1,
        vector: {
          vector: vector,
          distance: 0.9,
        },
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 25, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
  });

  it.skip('should query with nearObject', async () => {
    const ret = await collection.query.nearObject(id, { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearText', async () => {
    const ret = await collection.query.nearText(['test'], { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearVector', async () => {
    const ret = await collection.query.nearVector(vector, { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].properties.testProp2).toEqual('test2');
    expect(ret.objects[0].uuid).toEqual(id);
  });
});

describe('Testing of the collection.query methods with a collection with a reference property', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionQueryWithRefProp, 'TestCollectionQueryWithRefProp'>;
  const collectionName = 'TestCollectionQueryWithRefProp';

  let id1: string;
  let id2: string;

  type TestCollectionQueryWithRefProp = {
    testProp: string;
    refProp?: CrossReference<TestCollectionQueryWithRefProp>;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.get(collectionName);
    return client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
            vectorizePropertyName: false,
          },
        ],
        references: [
          {
            name: 'refProp',
            targetCollection: collectionName,
          },
        ],
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary({
          vectorizeCollectionName: false,
        }),
      })
      .then(async () => {
        id1 = await collection.data.insert({
          properties: {
            testProp: 'test',
          },
        });
        id2 = await collection.data.insert({
          properties: {
            testProp: 'other',
          },
          references: {
            refProp: Reference.to<TestCollectionQueryWithRefProp>(id1),
          },
        });
      });
  });

  describe('using a non-generic collection', () => {
    it('should query without searching returning the referenced object', async () => {
      const ret = await client.collections.get(collectionName).query.fetchObjects({
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
            returnReferences: [
              {
                linkOn: 'refProp',
                returnProperties: ['testProp'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) =>
        (a.properties.testProp as string).localeCompare(b.properties.testProp as string)
      );
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].references?.refProp?.objects[0].properties?.testProp).toEqual('test');
      expect(ret.objects[0].references?.refProp?.objects[0].references).toBeUndefined();
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].references?.refProp).toBeUndefined();
    });
  });

  describe('using a generic collection', () => {
    it('should query without searching returning the referenced object', async () => {
      const ret = await collection.query.fetchObjects({
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
            returnReferences: [
              {
                linkOn: 'refProp',
                returnProperties: ['testProp'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) => a.properties.testProp.localeCompare(b.properties.testProp));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].references?.refProp?.objects[0].properties?.testProp).toEqual('test');
      expect(ret.objects[0].references?.refProp?.objects[0].references).toBeUndefined();
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].references?.refProp).toBeUndefined();
    });

    it('should query with bm25 returning the referenced object', async () => {
      const ret = await collection.query.bm25('other', {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(1);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it('should query with hybrid returning the referenced object', async () => {
      const ret = await collection.query.hybrid('other', {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it.skip('should query with nearObject returning the referenced object', async () => {
      const ret = await collection.query.nearObject(id2, {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });

    it('should fetch an object by its ID returning its references', async () => {
      const res = await collection.query.fetchObjectById(id2, {
        returnReferences: [{ linkOn: 'refProp' }],
      });
      expect(res?.properties.testProp).toEqual('other');
      expect(res?.references?.refProp?.objects.length).toEqual(1);
      expect(res?.references?.refProp?.objects[0].properties?.testProp).toEqual('test');
    });

    it('should query with nearVector returning the referenced object', async () => {
      const res = await collection.query.fetchObjectById(id2, { includeVector: true });
      const ret = await collection.query.nearVector(res?.vectors.default!, {
        returnProperties: ['testProp'],
        returnReferences: [
          {
            linkOn: 'refProp',
            returnProperties: ['testProp'],
          },
        ],
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects.map((obj) => obj.properties.testProp).includes('other')).toEqual(true);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects.length
      ).toEqual(1);
      expect(
        ret.objects.find((obj) => obj.properties.testProp === 'other')?.references?.refProp?.objects[0]
          .properties?.testProp
      ).toEqual('test');
    });
  });

  describe('Testing of the collection.query methods with a collection with a nested property', () => {
    let client: WeaviateClient;
    let collection: Collection<TestCollectionQueryWithNestedProps, 'TestCollectionQueryWithNestedProps'>;
    const collectionName = 'TestCollectionQueryWithNestedProps';

    let id1: string;
    let id2: string;

    type TestCollectionQueryWithNestedProps = {
      testProp: string;
      nestedProp?: {
        one: string;
        two: string;
        again?: {
          three: string;
        };
        onceMore?: {
          four: string;
        };
      };
    };

    afterAll(() => {
      return client.collections.delete(collectionName).catch((err) => {
        console.error(err);
        throw err;
      });
    });

    beforeAll(async () => {
      client = await weaviate.connectToLocal();
      collection = client.collections.get(collectionName);
      return client.collections
        .create<TestCollectionQueryWithNestedProps>({
          name: collectionName,
          properties: [
            {
              name: 'testProp',
              dataType: 'text',
              vectorizePropertyName: false,
            },
            {
              name: 'nestedProp',
              dataType: 'object',
              vectorizePropertyName: false,
              nestedProperties: [
                {
                  name: 'one',
                  dataType: 'text',
                },
                {
                  name: 'two',
                  dataType: 'text',
                },
                {
                  name: 'again',
                  dataType: 'object',
                  nestedProperties: [
                    {
                      name: 'three',
                      dataType: 'text',
                    },
                  ],
                },
                {
                  name: 'onceMore',
                  dataType: 'object',
                  nestedProperties: [
                    {
                      name: 'four',
                      dataType: 'text',
                    },
                  ],
                },
              ],
            },
          ],
          vectorizers: weaviate.configure.vectorizer.text2VecContextionary(),
        })
        .then(async () => {
          id1 = await collection.data.insert({
            properties: {
              testProp: 'test',
            },
          });
          id2 = await collection.data.insert({
            properties: {
              testProp: 'other',
              nestedProp: {
                one: 'test',
                two: 'test',
                again: {
                  three: 'test',
                },
                onceMore: {
                  four: 'test',
                },
              },
            },
          });
        });
    });

    it('should query without searching returning the nested object', async () => {
      const ret = await collection.query.fetchObjects({
        returnProperties: [
          'testProp',
          {
            name: 'nestedProp',
            properties: [
              'one',
              {
                name: 'again',
                properties: ['three'],
              },
              {
                name: 'onceMore',
                properties: ['four'],
              },
            ],
          },
        ],
      });
      ret.objects.sort((a, b) => a.properties.testProp.localeCompare(b.properties.testProp));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.testProp).toEqual('other');
      expect(ret.objects[0].properties.nestedProp?.one).toEqual('test');
      expect(ret.objects[0].properties.nestedProp?.two).toBeUndefined();
      expect(ret.objects[0].properties.nestedProp?.again?.three).toEqual('test');
      expect(ret.objects[0].properties.nestedProp?.onceMore?.four).toEqual('test');
      expect(ret.objects[1].properties.testProp).toEqual('test');
      expect(ret.objects[1].properties.nestedProp).toBeUndefined();
    });
  });

  describe('Testing of the collection.query methods with a collection with multiple vectors', () => {
    let client: WeaviateClient;
    let collection: Collection<TestCollectionQueryWithMultiVector, 'TestCollectionQueryWithMultiVector'>;
    const collectionName = 'TestCollectionQueryWithMultiVector';

    let id1: string;
    let id2: string;

    type TestCollectionQueryWithMultiVector = {
      title: string;
    };

    afterAll(() => {
      return client.collections.delete(collectionName).catch((err) => {
        console.error(err);
        throw err;
      });
    });

    beforeAll(async () => {
      client = await weaviate.connectToLocal();
      collection = client.collections.get(collectionName);
      const query = () =>
        client.collections
          .create<TestCollectionQueryWithMultiVector>({
            name: collectionName,
            properties: [
              {
                name: 'title',
                dataType: 'text',
                vectorizePropertyName: false,
              },
            ],
            vectorizers: [
              weaviate.configure.vectorizer.text2VecContextionary({
                name: 'title',
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
          });
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      return query();
    });

    it('should query returning the named vector', async () => {
      const query = () =>
        collection.query.fetchObjects({
          returnProperties: ['title'],
          includeVector: ['title'],
        });
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
        await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
        return;
      }
      const ret = await query();
      ret.objects.sort((a, b) => a.properties.title.localeCompare(b.properties.title));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.title).toEqual('other');
      expect(ret.objects[0].vectors.title).toBeDefined();
      expect(ret.objects[1].properties.title).toEqual('test');
      expect(ret.objects[1].vectors.title).toBeDefined();
    });

    it('should query without searching returning named vector', async () => {
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
        return;
      }
      const ret = await collection.query.fetchObjects({
        returnProperties: ['title'],
        includeVector: ['title'],
      });
      ret.objects.sort((a, b) => a.properties.title.localeCompare(b.properties.title));
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.title).toEqual('other');
      expect(ret.objects[0].vectors.title).toBeDefined();
      expect(ret.objects[1].properties.title).toEqual('test');
      expect(ret.objects[1].vectors.title).toBeDefined();
    });

    it('should query with a vector search over the named vector space', async () => {
      if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
        return;
      }
      const ret = await collection.query.nearObject(id1, {
        returnProperties: ['title'],
        targetVector: 'title',
      });
      expect(ret.objects.length).toEqual(2);
      expect(ret.objects[0].properties.title).toEqual('test');
      expect(ret.objects[1].properties.title).toEqual('other');
    });
  });
});

describe('Testing of the groupBy collection.query methods with a simple collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionGroupBySimple, 'TestCollectionGroupBySimple'>;
  const collectionName = 'TestCollectionGroupBySimple';
  let id: string;
  let vector: number[];

  type TestCollectionGroupBySimple = {
    testProp: string;
  };

  const groupByArgs: GroupByOptions<TestCollectionGroupBySimple> = {
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
    client = await weaviate.connectToLocal();
    collection = client.collections.get(collectionName);
    id = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary({
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
      collection.query.bm25('test', {
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
      collection.query.hybrid('test', {
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
    const ret = await collection.query.nearObject(id, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearText', async () => {
    const ret = await collection.query.nearText(['test'], {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearVector', async () => {
    const ret = await collection.query.nearVector(vector, {
      groupBy: groupByArgs,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });

  it('should groupBy with nearVector and a non-generic collection', async () => {
    const ret = await client.collections.get(collectionName).query.nearVector(vector, {
      groupBy: {
        numberOfGroups: 1,
        objectsPerGroup: 1,
        property: 'testProp',
      },
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.groups).toBeDefined();
    expect(Object.keys(ret.groups)).toEqual(['test']);
    expect(ret.objects[0].properties.testProp).toEqual('test');
    expect(ret.objects[0].uuid).toEqual(id);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
  });
});

describe('Testing of the collection.query methods with a multi-tenancy collection', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionMultiTenancy, 'TestCollectionMultiTenancy'>;
  const collectionName = 'TestCollectionMultiTenancy';
  let id1: string;
  let id2: string;

  const tenantOne = { name: 'one' };
  const tenantTwo = { name: 'two' };

  type TestCollectionMultiTenancy = {
    testProp: string;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.get(collectionName);
    [id1, id2] = await client.collections
      .create<TestCollectionMultiTenancy>({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
          },
        ],
        multiTenancy: weaviate.configure.multiTenancy({ enabled: true }),
        vectorizers: weaviate.configure.vectorizer.text2VecContextionary({
          vectorizeCollectionName: false,
        }),
      })
      .then(async (col) => {
        await col.tenants.create([tenantOne, tenantTwo]);
        return col;
      })
      .then((col) =>
        Promise.all([
          col.withTenant(tenantOne).data.insert({
            properties: {
              testProp: 'one',
            },
          }),
          col.withTenant(tenantTwo).data.insert({
            properties: {
              testProp: 'two',
            },
          }),
        ])
      );
  });

  it('should find the objects in their tenants by ID', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.fetchObjectById(id1);
    const obj2 = await collection.withTenant(tenantTwo).query.fetchObjectById(id2);
    expect(obj1?.properties.testProp).toEqual('one');
    expect(obj1?.uuid).toEqual(id1);
    expect(obj2?.properties.testProp).toEqual('two');
    expect(obj2?.uuid).toEqual(id2);
  });

  it('should return null if searching in the wrong tenant', async () => {
    const obj1 = await collection.withTenant(tenantTwo).query.fetchObjectById(id1);
    const obj2 = await collection.withTenant(tenantOne).query.fetchObjectById(id2);
    expect(obj1).toBeNull();
    expect(obj2).toBeNull();
  });

  it('should find the objects in their tenants by fetch', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.fetchObjects();
    const obj2 = await collection.withTenant(tenantTwo).query.fetchObjects();
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });

  it('should find the objects in their tenants by bm25', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.bm25('one');
    const obj2 = await collection.withTenant(tenantTwo).query.bm25('two');
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });

  it('should find the objects in their tenants by hybrid', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.hybrid('one');
    const obj2 = await collection.withTenant(tenantTwo).query.hybrid('two');
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });

  it('should find the objects in their tenants by nearObject', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.nearObject(id1);
    const obj2 = await collection.withTenant(tenantTwo).query.nearObject(id2);
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });

  it('should find the objects in their tenants by nearText', async () => {
    const obj1 = await collection.withTenant(tenantOne).query.nearText(['one']);
    const obj2 = await collection.withTenant(tenantTwo).query.nearText(['two']);
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });

  it('should find the objects in their tenants by nearVector', async () => {
    const { vectors: vecs1 } = (await collection
      .withTenant(tenantOne)
      .query.fetchObjectById(id1, { includeVector: true }))!;
    const { vectors: vecs2 } = (await collection
      .withTenant(tenantTwo)
      .query.fetchObjectById(id2, { includeVector: true }))!;
    const obj1 = await collection.withTenant(tenantOne).query.nearVector(vecs1.default);
    const obj2 = await collection.withTenant(tenantTwo).query.nearVector(vecs2.default);
    expect(obj1.objects.length).toEqual(1);
    expect(obj1.objects[0].properties.testProp).toEqual('one');
    expect(obj1.objects[0].uuid).toEqual(id1);
    expect(obj2.objects.length).toEqual(1);
    expect(obj2.objects[0].properties.testProp).toEqual('two');
    expect(obj2.objects[0].uuid).toEqual(id2);
  });
});

// const maybe = process.env.OPENAI_APIKEY ? describe : describe.skip;

// maybe('Testing of collection.query using rerank functionality', () => {
//   let client: WeaviateClient;
//   let collection: Collection;
//   const collectionName = 'TestCollectionRerank';
//   let id1: string;
//   let id2: string;

//   afterAll(() => {
//     return client.collections.delete(collectionName).catch((err) => {
//       console.error(err);
//       throw err;
//     });
//   });

//   beforeAll(async () => {
//     client = await weaviate.connectToLocal({
//       port: 8079,
//       grpcPort: 50050,
//       headers: {
//         'X-OpenAI-Api-Key': process.env.OPENAI_APIKEY as string,
//       },
//     });
//     collection = client.collections.get(collectionName);
//     [id1, id2] = await client.collections
//       .create({
//         name: collectionName,
//         properties: [
//           {
//             name: 'text',
//             dataType: 'text',
//           },
//         ],
//         reranker: weaviate.configure.reranker.transformers(),
//         vectorizers: weaviate.configure.vectorizer.text2VecOpenAI(),
//       })
//       .then(() =>
//         Promise.all([
//           collection.data.insert({
//             properties: {
//               text: 'This is a test',
//             },
//           }),
//           collection.data.insert({
//             properties: {
//               text: 'This is another test',
//             },
//           }),
//         ])
//       );
//   });

//   it('should rerank the results in a bm25 query', async () => {
//     const ret = await collection.query.bm25('test', {
//       rerank: {
//         property: 'text',
//         query: 'another',
//       },
//     });
//     const objects = ret.objects;
//     expect(objects.length).toEqual(2);
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[0].properties.text).toEqual('This is another test');
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[1].properties.text).toEqual('This is a test');
//   });

//   it('should rerank the results in a hybrid query', async () => {
//     const ret = await collection.query.hybrid('test', {
//       rerank: {
//         property: 'text',
//         query: 'another',
//       },
//     });
//     const objects = ret.objects;
//     expect(objects.length).toEqual(2);
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[0].properties.text).toEqual('This is another test');
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[1].properties.text).toEqual('This is a test');
//   });

//   it.skip('should rerank the results in a nearObject query', async () => {
//     const ret = await collection.query.nearObject(id1, {
//       rerank: {
//         property: 'text',
//         query: 'another',
//       },
//     });
//     const objects = ret.objects;
//     expect(objects.length).toEqual(2);
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[0].properties.text).toEqual('This is another test');
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[1].properties.text).toEqual('This is a test');
//   });

//   it('should rerank the results in a nearText query', async () => {
//     const ret = await collection.query.nearText('text', {
//       rerank: {
//         property: 'text',
//         query: 'another',
//       },
//     });
//     const objects = ret.objects;
//     expect(objects.length).toEqual(2);
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[0].properties.text).toEqual('This is another test');
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[1].properties.text).toEqual('This is a test');
//   });

//   it.skip('should rerank the results in a nearObject query', async () => {
//     const obj = await collection.query.fetchObjectById(id1, { includeVector: true });
//     const ret = await collection.query.nearVector(obj?.vectors.default!, {
//       rerank: {
//         property: 'text',
//         query: 'another',
//       },
//     });
//     const objects = ret.objects;
//     expect(objects.length).toEqual(2);
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[0].properties.text).toEqual('This is another test');
//     expect(objects[0].metadata?.rerankScore).toBeDefined();
//     expect(objects[1].properties.text).toEqual('This is a test');
//   });
// });
