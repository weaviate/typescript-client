/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { requireAtLeast } from '../../../test/version.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';
import { CrossReference, Reference } from '../references/index.js';
import { GroupByOptions } from '../types/index.js';
import { Bm25Operator } from './utils.js';

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
    collection = client.collections.use(collectionName);
    id = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
            vectorizePropertyName: false,
          },
          {
            name: 'testProp2',
            dataType: 'text',
            vectorizePropertyName: false,
          },
        ],
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
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
            testProp: 'carrot',
            testProp2: 'parsnip',
          },
        });
      });
    const res = await collection.query.fetchObjectById(id, { includeVector: true });
    vector = res?.vectors.default!;
  });

  it('should fetch an object by its id', async () => {
    const object = await collection.query.fetchObjectById(id);
    expect(object?.properties.testProp).toEqual('carrot');
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
    const ret = await collection.query.bm25('carrot');
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with bm25 and weighted query properties', async () => {
    const ret = await collection.query.bm25('carrot', {
      queryProperties: [
        {
          name: 'testProp',
          weight: 2,
        },
        'testProp2',
      ],
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with bm25 and weighted query properties with a non-generic collection', async () => {
    const ret = await client.collections.use(collectionName).query.bm25('carrot', {
      queryProperties: [
        {
          name: 'testProp',
          weight: 2,
        },
        'testProp2',
      ],
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid', async () => {
    const ret = await collection.query.hybrid('carrot', { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  requireAtLeast(1, 31, 0).describe('bm25 search operator (minimum_should_match)', () => {
    it('should query with bm25 + operator', async () => {
      const ret = await collection.query.bm25('carrot', {
        limit: 1,
        operator: Bm25Operator.or({ minimumMatch: 1 }),
      });
      expect(ret.objects.length).toEqual(1);
      expect(ret.objects[0].properties.testProp).toEqual('carrot');
      expect(ret.objects[0].uuid).toEqual(id);
    });

    it('should query with hybrid + bm25Operator', async () => {
      const ret = await collection.query.hybrid('carrot', {
        limit: 1,
        bm25Operator: Bm25Operator.and(),
      });
      expect(ret.objects.length).toEqual(1);
      expect(ret.objects[0].properties.testProp).toEqual('carrot');
      expect(ret.objects[0].uuid).toEqual(id);
    });
  });

  it('should query with hybrid and vector', async () => {
    const ret = await collection.query.hybrid('carrot', {
      limit: 1,
      vector: vector,
    });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with hybrid and near text subsearch', async () => {
    const query = () =>
      collection.query.hybrid('carrot', {
        limit: 1,
        vector: {
          query: 'apple',
          distance: 0.9,
          moveTo: {
            concepts: ['banana'],
            force: 0.9,
          },
          moveAway: {
            concepts: ['carrot'],
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
  });

  it('should query with hybrid and near vector subsearch', async () => {
    const query = () =>
      collection.query.hybrid('carrot', {
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
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
  });

  it('should query with nearObject', async () => {
    const ret = await collection.query.nearObject(id, { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearText', async () => {
    const ret = await collection.query.nearText(['carrot'], { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
    expect(ret.objects[0].uuid).toEqual(id);
  });

  it('should query with nearVector', async () => {
    const ret = await collection.query.nearVector(vector, { limit: 1 });
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.testProp).toEqual('carrot');
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
    collection = client.collections.use(collectionName);
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
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
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
      const ret = await client.collections.use(collectionName).query.fetchObjects({
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

    it('should query with nearObject returning the referenced object', async () => {
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
    collection = client.collections.use(collectionName);
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
        vectorizers: weaviate.configure.vectors.text2VecContextionary(),
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

describe('Testing of the collection.query methods with a collection with a multiple vectors', () => {
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
    collection = client.collections.use(collectionName);
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
            weaviate.configure.vectors.text2VecContextionary({
              name: 'title',
              sourceProperties: ['title'],
            }),
            weaviate.configure.vectors.text2VecContextionary({
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
        });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    return query();
  });

  it('should query returning a named vector', async () => {
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

  it('should query without searching returning a named vector', async () => {
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

  it('should query a nearObject multi-target vector search over the named vector spaces', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      return;
    }
    const ret = await collection.query.nearObject(id1, {
      returnProperties: ['title'],
      targetVector: ['title', 'title2'],
    });
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('test');
    expect(ret.objects[1].properties.title).toEqual('other');
  });

  it('should group-by query a nearObject multi-target vector search over the named vector spaces', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      return;
    }
    const ret = await collection.query.nearObject(id1, {
      returnProperties: ['title'],
      targetVector: ['title', 'title2'],
      groupBy: {
        numberOfGroups: 2,
        objectsPerGroup: 1,
        property: 'title',
      },
    });
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
    expect(ret.objects[1].belongsToGroup).toEqual('other');
  });

  it('should query a weighted multi-target nearObject vector search over the named vector spaces', async () => {
    const query = () =>
      collection.query.nearObject(id1, {
        distance: 0.01,
        returnProperties: ['title'],
        targetVector: collection.multiTargetVector.manualWeights({
          title: 5,
          title2: 0.1,
        }),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.title).toEqual('test');
  });

  it('should query a weighted multi-target nearObject vector search with multiple weights over the named vector spaces', async () => {
    const query = () =>
      collection.query.nearObject(id1, {
        distance: 0.01,
        returnProperties: ['title'],
        targetVector: collection.multiTargetVector.manualWeights({
          title: 5,
          title2: [0.1, 0.2],
        }),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(1);
    expect(ret.objects[0].properties.title).toEqual('test');
  });

  it('should group-by query a weighted multi-target nearObject vector search over the named vector spaces', async () => {
    const query = () =>
      collection.query.nearObject(id1, {
        returnProperties: ['title'],
        targetVector: collection.multiTargetVector.sum(['title', 'title2']),
        groupBy: {
          numberOfGroups: 2,
          objectsPerGroup: 1,
          property: 'title',
        },
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
    expect(ret.objects[1].belongsToGroup).toEqual('other');
  });

  it('should perform a hybrid query over the named vector spaces', async () => {
    const query = () =>
      collection.query.hybrid('test', {
        returnProperties: ['title'],
        targetVector: ['title', 'title2'],
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('test');
    expect(ret.objects[1].properties.title).toEqual('other');
  });

  it('should perform a group-by hybrid query over the named vector spaces', async () => {
    const query = () =>
      collection.query.hybrid('test', {
        returnProperties: ['title'],
        targetVector: ['title', 'title2'],
        groupBy: {
          numberOfGroups: 2,
          objectsPerGroup: 1,
          property: 'title',
        },
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].belongsToGroup).toEqual('test');
    expect(ret.objects[1].belongsToGroup).toEqual('other');
  });

  it('should perform a weighted sum hybrid query over the named vector spaces', async () => {
    const query = () =>
      collection.query.hybrid('test', {
        returnProperties: ['title'],
        targetVector: collection.multiTargetVector.sum(['title', 'title2']),
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('test');
    expect(ret.objects[1].properties.title).toEqual('other');
  });

  it('should perform a multi-vector hybrid search over the named vector spaces', async () => {
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          title: two?.vectors.title!,
          title2: two?.vectors.title2!,
        },
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a multi-vector hybrid search over the named vector spaces with a combination', async () => {
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          title: two?.vectors.title!,
          title2: two?.vectors.title2!,
        },
        targetVector: collection.multiTargetVector.sum(['title', 'title2']),
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a multi-vector hybrid nearVector subsearch over the named vector spaces', async () => {
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          vector: {
            title: two?.vectors.title!,
            title2: two?.vectors.title2!,
          },
        },
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a multi-vector hybrid nearVector subsearch over the named vector spaces with combination', async () => {
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          vector: {
            title: two?.vectors.title!,
            title2: two?.vectors.title2!,
          },
        },
        targetVector: collection.multiTargetVector.sum(['title', 'title2']),
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a multi-vector-per-target hybrid nearVector subsearch over the named vector spaces without weights', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          vector: {
            title: [one?.vectors.title!, two?.vectors.title!],
          },
        },
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
  });

  it('should perform a multi-vector-per-target hybrid nearVector subsearch over the named vector spaces with weights', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          vector: {
            title: [one?.vectors.title!, two?.vectors.title!],
          },
        },
        targetVector: collection.multiTargetVector.manualWeights({
          title: [0.1, 0.9],
        }),
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a multi-vector-per-target hybrid search over the named vector spaces', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          title: [one?.vectors.title!, two?.vectors.title!],
        },
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
  });

  it('should perform a multi-vector-per-target hybrid search with weights over the named vector spaces', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.hybrid('', {
        alpha: 1,
        returnProperties: ['title'],
        vector: {
          title: [one?.vectors.title!, two?.vectors.title!],
        },
        targetVector: collection.multiTargetVector.manualWeights({
          title: [0.1, 0.9],
        }),
      });

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    // We are weighted the second vector higher, so we expect the second object to be returned first
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
  });

  it('should perform a nearVector vector search over two named vector spaces', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });

    const query = () =>
      collection.query.nearVector(
        {
          title: one?.vectors.title!,
          title2: one?.vectors.title2!,
        },
        {
          returnProperties: ['title'],
        }
      );

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 26, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    // Since no bm25, the order is not guaranteed since we're searching on both vectors equally
    expect(ret.objects[0].properties.title).toEqual('test');
    expect(ret.objects[1].properties.title).toEqual('other');
  });

  it('should perform a multi-vector-per-target nearVector search over one named vector with weights', async () => {
    const one = await collection.query.fetchObjectById(id1, { includeVector: true });
    const two = await collection.query.fetchObjectById(id2, { includeVector: true });

    const query = () =>
      collection.query.nearVector(
        {
          title: [one?.vectors.title!, two?.vectors.title!],
        },
        {
          returnProperties: ['title'],
          targetVector: collection.multiTargetVector.manualWeights({
            title: [0.1, 0.9],
          }),
        }
      );

    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 27, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    const ret = await query();
    expect(ret.objects.length).toEqual(2);
    // We are weighted the second vector higher, so we expect the second object to be returned first
    expect(ret.objects[0].properties.title).toEqual('other');
    expect(ret.objects[1].properties.title).toEqual('test');
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
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
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

  it('should groupBy with nearObject', async () => {
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
    const ret = await client.collections.use(collectionName).query.nearVector(vector, {
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
    collection = client.collections.use(collectionName);
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
        vectorizers: weaviate.configure.vectors.text2VecContextionary({
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
//     collection = client.collections.use(collectionName);
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
//         vectorizers: weaviate.configure.vectors.text2VecOpenAI(),
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
