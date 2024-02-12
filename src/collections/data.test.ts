/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate from '..';
import { v4 } from 'uuid';
import { DataObject } from './types';
import { CrossReference, Reference } from './references';
import { GeoCoordinate, PhoneNumber } from '../proto/v1/properties';

type TestCollectionData = {
  testProp: string;
  testProp2?: number;
  ref?: CrossReference<TestCollectionData>;
  geo?: GeoCoordinate;
  phone?: PhoneNumber;
  nested?: {
    testProp: string;
  };
};

describe('Testing of the collection.data methods', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
    grpcAddress: 'localhost:50051',
  });
  const url = 'http://localhost:8080/v1';

  const className = 'TestCollectionData';
  const collection = client.collections.get<TestCollectionData>(className);

  const existingID = v4();
  const toBeReplacedID = v4();
  const toBeUpdatedID = v4();

  afterAll(() => {
    return client.collections.delete(className).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(() => {
    return client.collections
      .create({
        name: className,
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
            name: 'geo',
            dataType: 'geoCoordinates',
          },
        ],
        references: [
          {
            name: 'ref',
            targetCollection: className,
          },
        ],
      })
      .then(() => {
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
    await collection.data
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
    await collection.data
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

  it('should be able to insert many (10) objects at once', async () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 10; j++) {
      objects.push({
        properties: {
          testProp: 'testInsertMany10',
        },
      });
    }
    await collection.data.insertMany(objects).then(async (insert) => {
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
    });
  });

  it('should be able to insert many (100) objects at once', async () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 100; j++) {
      objects.push({
        properties: {
          testProp: 'testInsertMany100',
        },
      });
    }
    const insert = await collection.data.insertMany(objects).then(async (insert) => {
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

  it('should be able to insert many (1000) objects at once', async () => {
    const objects: any[] = [];
    for (let j = 0; j < 1000; j++) {
      objects.push({
        testProp: 'testInsertMany1000',
      });
    }
    const insert = await collection.data.insertMany(objects).then(async (insert) => {
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

  it('should be able to insert a reference between two objects', async () => {
    await collection.data
      .referenceAdd({
        fromProperty: 'ref',
        fromUuid: existingID,
        to: Reference.to(existingID),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById(existingID, {
          returnReferences: [{ linkOn: 'ref' }],
        });
        expect(obj).not.toBeNull();
        expect(obj?.references?.ref?.objects[0].uuid).toEqual(existingID);
      });
  });

  it('should be able to replace a reference between two objects', async () => {
    await collection.data
      .referenceReplace({
        fromProperty: 'ref',
        fromUuid: toBeReplacedID,
        to: Reference.to(existingID),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById(toBeReplacedID, {
          returnReferences: [{ linkOn: 'ref' }],
        });
        expect(obj).not.toBeNull();
        expect(obj?.references?.ref?.objects[0].uuid).toEqual(existingID);
      });
  });

  it('should be able to delete a reference between two objects', async () => {
    await collection.data
      .referenceDelete({
        fromProperty: 'ref',
        fromUuid: toBeUpdatedID,
        to: Reference.to(toBeReplacedID),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById(toBeUpdatedID, {
          returnReferences: [{ linkOn: 'ref' }],
        });
        expect(obj).not.toBeNull();
        expect(obj?.references?.ref?.objects).toEqual([]);
      });
  });

  it('should be able to add many references in batch', async () => {
    await collection.data
      .referenceAddMany({
        refs: [
          {
            fromProperty: 'ref',
            fromUuid: existingID,
            to: Reference.to([toBeReplacedID, toBeUpdatedID]),
          },
          // {
          //   fromProperty: 'ref',
          //   fromUuid: toBeUpdatedID,
          //   reference: Reference.to({ uuids: existingID }),
          // },
          // currently causes bug in Weaviate due to first deleting last reference in above test and then adding new one
        ],
      })
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
        // expect(obj2.properties.ref?.targetCollection).toEqual(className);
        // expect(obj2.properties.ref?.uuids?.includes(existingID)).toEqual(true);
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
    console.log(obj1);
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
});
