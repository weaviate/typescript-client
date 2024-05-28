/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateClient } from '../../index.js';
import { v4 } from 'uuid';
import { DataObject, WeaviateObject } from '../types/index.js';
import { CrossReference, CrossReferences, Reference } from '../references/index.js';
import { GeoCoordinate, PhoneNumber } from '../../proto/v1/properties.js';
import { Collection } from '../collection/index.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';

type TestCollectionData = {
  testProp: string;
  testProps?: string[];
  testProp2?: number;
  ref?: CrossReference<TestCollectionData>;
  geo?: GeoCoordinate;
  phone?: PhoneNumber;
  nested?: {
    testProp: string;
  };
};

describe('Testing of the collection.data methods with a single target reference', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionData, 'TestCollectionData'>;
  const collectionName = 'TestCollectionData';

  const existingID = v4();
  const toBeReplacedID = v4();
  const toBeUpdatedID = v4();
  const toBeDeletedID = v4();
  const nonExistingID = v4();

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.get(collectionName);
    await client.collections
      .create<TestCollectionData>({
        name: collectionName,
        properties: [
          {
            name: 'testProp',
            dataType: 'text',
            tokenization: 'field',
          },
          {
            name: 'testProp2',
            dataType: 'int',
          },
          {
            name: 'testProps',
            dataType: 'text[]',
          },
          {
            name: 'geo',
            dataType: 'geoCoordinates',
          },
          {
            name: 'phone',
            dataType: 'phoneNumber',
          },
        ],
        references: [
          {
            name: 'ref',
            targetCollection: collectionName,
          },
        ],
      })
      .then(async (collection) => {
        await collection.data.insert({
          properties: {
            testProp: 'Gon get delet',
          },
          id: toBeDeletedID,
        });
        return collection.data.insertMany([
          { properties: { testProp: 'DELETE ME' } },
          { properties: { testProp: 'DELETE ME' } },
          { properties: { testProp: 'DELETE ME' } },
          {
            properties: {
              testProp: 'EXISTING',
              testProp2: 1,
            },
            id: existingID,
          },
          {
            properties: {
              testProp: 'REPLACE ME',
              testProp2: 1,
            },
            id: toBeReplacedID,
          },
          {
            properties: {
              testProp: 'UPDATE ME',
              testProp2: 1,
            },
            id: toBeUpdatedID,
          },
        ]);
      })
      .then(() => {
        const one = collection.data.referenceAdd({
          fromProperty: 'ref',
          fromUuid: toBeReplacedID,
          to: Reference.to(toBeUpdatedID),
        });
        const two = collection.data.referenceAdd({
          fromProperty: 'ref',
          fromUuid: toBeUpdatedID,
          to: Reference.to(toBeReplacedID),
        });
        return Promise.all([one, two]);
      })
      .catch((err) => {
        throw err;
      });
  });

  it('should be able to insert an object without an id', async () => {
    const insert = await collection.data.insert({
      properties: {
        testProp: 'test',
      },
    });
    expect(insert).toBeDefined();
  });

  it('should be able to insert an object with an id', async () => {
    const id = v4();
    const insert = await collection.data.insert({
      properties: {
        testProp: 'test',
      },
      id: id,
    });
    expect(insert).toEqual(id);
  });

  it('should be able to delete an object by id', async () => {
    const result = await collection.data.deleteById(toBeDeletedID);
    expect(result).toBeTruthy();
    const obj = await collection.query.fetchObjectById(toBeDeletedID);
    expect(obj).toBeNull();
  });

  it('should be able to delete many objects with a filter', async () => {
    const result = await collection.data.deleteMany(
      collection.filter.byProperty('testProp').equal('DELETE ME')
    );
    expect(result.failed).toEqual(0);
    expect(result.matches).toEqual(3);
    expect(result.successful).toEqual(3);
  });

  it('should be able to replace an object', async () => {
    const obj = await collection.query.fetchObjectById(toBeReplacedID);
    expect(obj?.properties.testProp).toEqual('REPLACE ME');
    expect(obj?.properties.testProp2).toEqual(1);
    return collection.data
      .replace({
        id: toBeReplacedID,
        properties: {
          testProp: 'REPLACED',
        },
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById(toBeReplacedID);
        expect(obj?.properties.testProp).toEqual('REPLACED');
        expect(obj?.properties.testProp2).toBeUndefined();
      });
  });

  it('should be able to update an object', async () => {
    const obj = await collection.query.fetchObjectById(toBeUpdatedID);
    expect(obj?.properties.testProp).toEqual('UPDATE ME');
    expect(obj?.properties.testProp2).toEqual(1);
    return collection.data
      .update({
        id: toBeUpdatedID,
        properties: {
          testProp: 'UPDATED',
        },
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById(toBeUpdatedID);
        expect(obj?.properties.testProp).toEqual('UPDATED');
        expect(obj?.properties.testProp2).toEqual(1);
      });
  });

  it('should be able to insert many (10) objects at once', () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 10; j++) {
      objects.push({
        properties: {
          testProp: 'testInsertMany10',
          testProps: [], // test empty array
        },
      });
    }
    return collection.data.insertMany(objects).then(async (insert) => {
      expect(insert.hasErrors).toBeFalsy();
      expect(insert.allResponses.length).toEqual(10);
      expect(Object.values(insert.errors).length).toEqual(0);
      expect(Object.values(insert.uuids).length).toEqual(10);
      const query = await collection.query.fetchObjects({ limit: 100 });
      expect(query.objects.filter((obj) => Object.values(insert.uuids).includes(obj.uuid)).length).toEqual(
        10
      );
      expect(query.objects.filter((obj) => obj.properties.testProp === 'testInsertMany10').length).toEqual(
        10
      );
      expect(query.objects.filter((obj) => obj.properties.testProps?.length === 0).length).toEqual(10);
    });
  });

  it('should be able to insert many (100) objects at once', () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 100; j++) {
      objects.push({
        properties: {
          testProp: 'testInsertMany100',
        },
        references: {
          ref: existingID,
        },
      });
    }
    return collection.data.insertMany(objects).then(async (insert) => {
      expect(insert.hasErrors).toBeFalsy();
      expect(insert.allResponses.length).toEqual(100);
      expect(Object.values(insert.errors).length).toEqual(0);
      expect(Object.values(insert.uuids).length).toEqual(100);
      const query = await collection.query.fetchObjects({ limit: 1000 });
      expect(query.objects.filter((obj) => Object.values(insert.uuids).includes(obj.uuid)).length).toEqual(
        100
      );
      expect(query.objects.filter((obj) => obj.properties.testProp === 'testInsertMany100').length).toEqual(
        100
      );
    });
  });

  it('should be able to insert many (1000) objects at once', () => {
    const objects: any[] = [];
    for (let j = 0; j < 1000; j++) {
      objects.push({
        testProp: 'testInsertMany1000',
      });
    }
    return collection.data.insertMany(objects).then(async (insert) => {
      expect(insert.hasErrors).toBeFalsy();
      expect(insert.allResponses.length).toEqual(1000);
      expect(Object.values(insert.errors).length).toEqual(0);
      expect(Object.values(insert.uuids).length).toEqual(1000);
      const query = await collection.query.fetchObjects({ limit: 2000 });
      expect(query.objects.filter((obj) => Object.values(insert.uuids).includes(obj.uuid)).length).toEqual(
        1000
      );
      expect(query.objects.filter((obj) => obj.properties.testProp === 'testInsertMany1000').length).toEqual(
        1000
      );
    });
  });

  it('should be able to insert a reference between two objects', () => {
    return Promise.all([
      collection.data.referenceAdd({
        fromProperty: 'ref',
        fromUuid: existingID,
        to: Reference.to(existingID), // add using Reference.to syntax
      }),
      collection.data.referenceAdd({
        fromProperty: 'ref',
        fromUuid: existingID,
        to: toBeUpdatedID, // add using string syntax
      }),
      collection.data.referenceAdd({
        fromProperty: 'ref',
        fromUuid: existingID,
        to: [toBeReplacedID], // add using string array syntax
      }),
    ])
      .then(() =>
        collection.query.fetchObjectById(existingID, {
          returnReferences: [{ linkOn: 'ref' }],
        })
      )
      .then((obj) => {
        const ids = obj?.references?.ref?.objects.map((o) => o.uuid);
        expect(obj).not.toBeNull();
        expect(ids).toContain(existingID);
        expect(ids).toContain(toBeUpdatedID);
        expect(ids).toContain(toBeReplacedID);
      });
  });

  it('should be able to replace a reference between two objects', () => {
    const replaceOne = () =>
      collection.data.referenceReplace({
        fromProperty: 'ref',
        fromUuid: toBeReplacedID,
        to: Reference.to(existingID), // replace using Reference.to syntax
      });
    const replaceTwo = () =>
      collection.data.referenceReplace({
        fromProperty: 'ref',
        fromUuid: toBeReplacedID,
        to: toBeUpdatedID, // replace using string syntax
      });
    const replaceThree = () =>
      collection.data.referenceReplace({
        fromProperty: 'ref',
        fromUuid: toBeReplacedID,
        to: [toBeReplacedID], // replace using string array syntax
      });
    const get = () =>
      collection.query.fetchObjectById(toBeReplacedID, {
        returnReferences: [{ linkOn: 'ref' }],
      });
    const assert = (obj: WeaviateObject<TestCollectionData> | null, id: string) => {
      expect(obj).not.toBeNull();
      expect(obj?.references?.ref?.objects[0].uuid).toEqual(id);
    };
    return replaceOne()
      .then(get)
      .then((obj) => assert(obj, existingID))
      .then(replaceTwo)
      .then(get)
      .then((obj) => assert(obj, toBeUpdatedID))
      .then(replaceThree)
      .then(get)
      .then((obj) => assert(obj, toBeReplacedID));
  });

  it('should be able to delete a reference between two objects', () => {
    return Promise.all([
      collection.data.referenceDelete({
        fromProperty: 'ref',
        fromUuid: toBeUpdatedID,
        to: Reference.to(existingID),
      }),
      collection.data.referenceDelete({
        fromProperty: 'ref',
        fromUuid: toBeUpdatedID,
        to: toBeUpdatedID,
      }),
      collection.data.referenceDelete({
        fromProperty: 'ref',
        fromUuid: toBeUpdatedID,
        to: [toBeReplacedID],
      }),
    ])
      .then(() =>
        collection.query.fetchObjectById(toBeUpdatedID, {
          returnReferences: [{ linkOn: 'ref' }],
        })
      )
      .then((obj) => {
        expect(obj).not.toBeNull();
        expect(obj?.references?.ref?.objects).toEqual([]);
      });
  });

  it('should be able to add many references in batch', () => {
    return collection.data
      .referenceAddMany([
        {
          fromProperty: 'ref',
          fromUuid: existingID,
          to: Reference.to([toBeReplacedID]),
        },
        {
          fromProperty: 'ref',
          fromUuid: existingID,
          to: [toBeUpdatedID],
        },
        // {
        //   fromProperty: 'ref',
        //   fromUuid: toBeUpdatedID,
        //   reference: Reference.to({ uuids: existingID }),
        // },
        // currently causes bug in Weaviate due to first deleting last reference in above test and then adding new one
      ])
      .then(async (res) => {
        if (res.hasErrors) console.error(res.errors);
        expect(res.hasErrors).toEqual(false);
        const obj1 = await collection.query.fetchObjectById(existingID, {
          returnReferences: [{ linkOn: 'ref' }],
        });
        expect(obj1).not.toBeNull();
        expect(obj1?.references?.ref?.objects.map((o) => o.uuid)).toContain(toBeReplacedID);
        expect(obj1?.references?.ref?.objects.map((o) => o.uuid)).toContain(toBeUpdatedID);
        // const obj2 = await collection.query.fetchObjectById({
        //   id: toBeUpdatedID
        // });
        // expect(obj2.properties.ref?.objects).toEqual([]);
        // expect(obj2.properties.ref?.targetCollection).toEqual(collectionName);
        // expect(obj2.properties.ref?.uuids?.includes(existingID)).toEqual(true);
      });
  });

  it.skip('should return appropriate errors from add many references in batch', () => {
    // skipped because Weaviate doesn't error if the to UUID doesn't exist
    // it does in referenceAdd, but not in referenceAddMany, due to the /batch implementation
    // difference on the server, needs fixing
    return collection.data
      .referenceAddMany([
        {
          fromProperty: 'ref',
          fromUuid: existingID,
          to: Reference.to([nonExistingID]),
        },
      ])
      .then((res) => {
        expect(res.hasErrors).toEqual(true);
        expect(Object.keys(res.errors).length).toEqual(1);
      });
  });

  it('should be able to add objects with a geo coordinate', async () => {
    const obj = {
      testProp: 'test',
      geo: {
        latitude: 1,
        longitude: 1,
      },
    };
    const id = await collection.data.insert(obj);
    const res = await collection.data.insertMany([obj]);
    const obj1 = await collection.query.fetchObjectById(id, {
      returnProperties: ['geo'],
    });
    const obj2 = await collection.query.fetchObjectById(res.uuids[0], {
      returnProperties: ['geo'],
    });
    expect(obj1?.properties.geo).toEqual({
      latitude: 1,
      longitude: 1,
    });
    expect(obj2?.properties.geo).toEqual({
      latitude: 1,
      longitude: 1,
    });
  });

  it('should be able to add objects with a phone number', async () => {
    const obj = {
      testProp: 'test',
      phone: {
        number: '+441612345000',
      },
    };
    const id = await collection.data.insert(obj);
    const res = await collection.data.insertMany([obj]);
    const obj1 = await collection.query.fetchObjectById(id, {
      returnProperties: ['phone'],
    });
    const obj2 = await collection.query.fetchObjectById(res.uuids[0], {
      returnProperties: ['phone'],
    });
    expect(obj1?.properties.phone?.input).toEqual('+441612345000');
    expect(obj2?.properties.phone?.input).toEqual('+441612345000');
  });

  it('should be able to verify that an object exists', async () => {
    const exists = await collection.data.exists(existingID);
    expect(exists).toBeTruthy();
  });
});

describe('Testing of the collection.data methods with a multi target reference', () => {
  let client: WeaviateClient;
  let collectionOne: Collection<TestCollectionDataMultiOne, 'TestCollectionDataMultiOne'>;
  let collectionTwo: Collection<TestCollectionDataMultiTwo, 'TestCollectionDataMultiTwo'>;

  const classNameOne = 'TestCollectionDataMultiOne';
  const classNameTwo = 'TestCollectionDataMultiTwo';

  type TestCollectionDataMultiOne = {
    one: string;
  };
  type TestCollectionDataMultiTwo = {
    two: string;
    refs: CrossReferences<[TestCollectionDataMultiOne, TestCollectionDataMultiTwo]>;
  };

  let oneId: string;
  let twoId: string;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collectionOne = client.collections.get(classNameOne);
    collectionTwo = client.collections.get(classNameTwo);
    oneId = await client.collections
      .create({
        name: classNameOne,
        properties: [
          {
            name: 'one',
            dataType: 'text',
            tokenization: 'field',
          },
        ],
      })
      .then(() => collectionOne.data.insert({ one: 'one' }));
    twoId = await client.collections
      .create({
        name: classNameTwo,
        properties: [
          {
            name: 'two',
            dataType: 'text',
            tokenization: 'field',
          },
        ],
        references: [
          {
            name: 'refs',
            targetCollections: [classNameOne, classNameTwo],
          },
        ],
      })
      .then(() => collectionTwo.data.insert({ two: 'two' }));
  });

  afterAll(() => client.collections.deleteAll());

  it('should be able to insert an object with a multi target reference', async () => {
    const id = await collectionTwo.data.insert({
      properties: { two: 'multi1' },
      references: {
        refs: [
          Reference.toMultiTarget(oneId, classNameOne),
          { targetCollection: classNameTwo, uuids: twoId },
        ],
      },
    });
    await collectionTwo.data.insertMany([
      {
        properties: { two: 'multi2' },
        references: {
          refs: [
            Reference.toMultiTarget([twoId], classNameTwo),
            { targetCollection: classNameOne, uuids: [oneId] },
          ],
        },
      },
    ]);
    await collectionTwo.query
      .fetchObjectById(id, { returnReferences: [{ linkOn: 'refs', targetCollection: classNameOne }] })
      .then((obj) => expect(obj!.references!.refs.objects[0].uuid).toEqual(oneId));
    await collectionTwo.query
      .fetchObjectById(id, { returnReferences: [{ linkOn: 'refs', targetCollection: classNameTwo }] })
      .then((obj) => expect(obj!.references!.refs.objects[0].uuid).toEqual(twoId));
  });
});

describe('Testing of the collection.data.insertMany method with all possible types', () => {
  let client: WeaviateClient;
  let collection: Collection<TestCollectionData, 'TestCollectionData'>;
  const collectionName = 'TestCollectionData';
  let id: string;

  type Primitives = {
    text?: string;
    textArr?: string[];
    int?: number;
    intArr?: number[];
    number?: number;
    numberArr?: number[];
    bool?: boolean;
    boolArr?: boolean[];
    date?: Date;
    dateArr?: Date[];
  };

  type A = Primitives;

  type B = {
    child: A;
  };

  type TestCollectionData = Primitives & {
    self?: CrossReference<TestCollectionData>;
    geo?: GeoCoordinate;
    phone?: PhoneNumber;
    child?: A;
    children?: B[];
  };

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    const primitives = [
      {
        name: 'text' as const,
        dataType: 'text' as const,
      },
      {
        name: 'textArr' as const,
        dataType: 'text[]' as const,
      },
      {
        name: 'int' as const,
        dataType: 'int' as const,
      },
      {
        name: 'intArr' as const,
        dataType: 'int[]' as const,
      },
      {
        name: 'number' as const,
        dataType: 'number' as const,
      },
      {
        name: 'numberArr' as const,
        dataType: 'number[]' as const,
      },
      {
        name: 'bool' as const,
        dataType: 'boolean' as const,
      },
      {
        name: 'boolArr' as const,
        dataType: 'boolean[]' as const,
      },
      {
        name: 'date' as const,
        dataType: 'date' as const,
      },
      {
        name: 'dateArr' as const,
        dataType: 'date[]' as const,
      },
    ];
    collection = await client.collections.create({
      name: collectionName,
      properties: [
        ...primitives,
        {
          name: 'geo' as const,
          dataType: 'geoCoordinates' as const,
        },
        {
          name: 'phone' as const,
          dataType: 'phoneNumber' as const,
        },
        {
          name: 'child',
          dataType: 'object',
          nestedProperties: primitives,
        },
        {
          name: 'children',
          dataType: 'object[]',
          nestedProperties: [
            {
              name: 'child',
              dataType: 'object',
              nestedProperties: primitives,
            },
          ],
        },
      ],
      references: [
        {
          name: 'self',
          targetCollection: collectionName,
        },
      ],
    });
    id = await collection.data.insert();
  });

  it('should insert many objects with all possible types', async () => {
    const date1 = new Date();
    const date2 = new Date();
    const primitives = {
      text: 'text',
      textArr: ['textArr'],
      int: 1,
      intArr: [1],
      number: 1.1,
      numberArr: [1.1],
      bool: true,
      boolArr: [true],
      date: date1,
      dateArr: [date2],
    };
    const objects: DataObject<TestCollectionData>[] = [
      {
        properties: {
          ...primitives,
          geo: {
            latitude: 1,
            longitude: 1,
          },
          phone: {
            number: '+441612345000',
          },
          child: primitives,
          children: [{ child: primitives }],
        },
        references: {
          self: id,
        },
      },
    ];
    const insert = await collection.data.insertMany(objects);
    if (insert.hasErrors) console.error(JSON.stringify(insert.errors));
    expect(insert.hasErrors).toBeFalsy();
    expect(insert.allResponses.length).toEqual(1);
    expect(Object.values(insert.errors).length).toEqual(0);
    expect(Object.values(insert.uuids).length).toEqual(1);
    const obj = await collection.query.fetchObjectById(insert.uuids[0], {
      returnReferences: [{ linkOn: 'self' }],
    });
    expect(obj?.properties).toEqual({
      text: 'text',
      textArr: ['textArr'],
      int: 1,
      intArr: [1],
      number: 1.1,
      numberArr: [1.1],
      bool: true,
      boolArr: [true],
      date: date1,
      dateArr: [date2],
      geo: {
        latitude: 1,
        longitude: 1,
      },
      phone: {
        countryCode: 44,
        defaultCountry: '',
        input: '+441612345000',
        internationalFormatted: '+44 161 234 5000',
        national: 1612345000,
        nationalFormatted: '0161 234 5000',
        valid: true,
      },
      child: {
        text: 'text',
        textArr: ['textArr'],
        int: 1,
        intArr: [1],
        number: 1.1,
        numberArr: [1.1],
        bool: true,
        boolArr: [true],
        date: date1,
        dateArr: [date2],
      },
      children: [
        {
          child: {
            text: 'text',
            textArr: ['textArr'],
            int: 1,
            intArr: [1],
            number: 1.1,
            numberArr: [1.1],
            bool: true,
            boolArr: [true],
            date: date1,
            dateArr: [date2],
          },
        },
      ],
    });
    expect(obj?.references?.self?.objects[0].uuid).toEqual(id);
  });
});

describe('Testing of the collection.data methods with bring your own multi vectors', () => {
  let client: WeaviateClient;
  let collection: Collection;
  let uuid: string;
  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    const query = () =>
      client.collections.create({
        name: 'TestCollectionDataMultiVectors',
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
        ],
        vectorizers: [
          weaviate.configure.vectorizer.none({ name: 'one' }),
          weaviate.configure.vectorizer.none({ name: 'two' }),
        ],
      });
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      await expect(query()).rejects.toThrow(WeaviateUnsupportedFeatureError);
      return;
    }
    collection = await query();
  });

  afterAll(() => client.collections.delete('TestCollectionDataMultiVectors'));

  it('should be able to insert an object with multi vectors', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    uuid = await collection.data.insert({
      properties: {
        text: 'test',
      },
      vectors: {
        one: [1, 2, 3],
        two: [4, 5, 6],
      },
    });
  });

  it('should be able to fetch the object with multi vectors', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    const obj = await collection.query.fetchObjectById(uuid, {
      includeVector: true,
    });
    expect(obj?.vectors?.one).toEqual([1, 2, 3]);
    expect(obj?.vectors?.two).toEqual([4, 5, 6]);
  });

  it('should be able to update the vectors of an object', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    await collection.data.update({
      id: uuid,
      vectors: {
        one: [7, 8, 9],
        two: [10, 11, 12],
      },
    });
    const obj = await collection.query.fetchObjectById(uuid, {
      includeVector: true,
    });
    expect(obj?.vectors?.one).toEqual([7, 8, 9]);
    expect(obj?.vectors?.two).toEqual([10, 11, 12]);
  });

  it('should be able to replace the vectors of an object', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    await collection.data.replace({
      id: uuid,
      vectors: {
        one: [7, 8, 9],
        two: [10, 11, 12],
      },
    });
    const obj = await collection.query.fetchObjectById(uuid, {
      includeVector: true,
    });
    expect(obj?.vectors?.one).toEqual([7, 8, 9]);
    expect(obj?.vectors?.two).toEqual([10, 11, 12]);
  });

  it('should be able to insert many objects with multi vectors', async () => {
    if (await client.getWeaviateVersion().then((ver) => ver.isLowerThan(1, 24, 0))) {
      return;
    }
    const objects = [
      {
        properties: {
          text: 'test',
        },
        vectors: {
          one: [1, 2, 3],
          two: [4, 5, 6],
        },
      },
      {
        properties: {
          text: 'test',
        },
        vectors: {
          one: [7, 8, 9],
          two: [10, 11, 12],
        },
      },
    ];
    const insert = await collection.data.insertMany(objects);
    expect(insert.hasErrors).toBeFalsy();
    expect(insert.allResponses.length).toEqual(2);
    expect(Object.values(insert.errors).length).toEqual(0);
    expect(Object.values(insert.uuids).length).toEqual(2);
    const obj1 = await collection.query.fetchObjectById(insert.uuids[0], {
      includeVector: true,
    });
    expect(obj1?.vectors?.one).toEqual([1, 2, 3]);
    expect(obj1?.vectors?.two).toEqual([4, 5, 6]);
    const obj2 = await collection.query.fetchObjectById(insert.uuids[1], {
      includeVector: true,
    });
    expect(obj2?.vectors?.one).toEqual([7, 8, 9]);
    expect(obj2?.vectors?.two).toEqual([10, 11, 12]);
  });
});
