/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';
import { v4 } from 'uuid';
import { DataObject } from './types';
import { CrossReference, Reference } from './references';

type TestCollectionData = {
  testProp: string;
  testProp2?: number;
  ref?: CrossReference<TestCollectionData>;
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
            dataType: ['text'],
            tokenization: 'field',
          },
          {
            name: 'testProp2',
            dataType: ['int'],
          },
          {
            name: 'ref',
            dataType: [className],
          },
        ],
      })
      .then(() => {
        return collection.data.insertMany({
          objects: [
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
          ],
        });
      })
      .then(() => {
        const one = collection.data.referenceAdd({
          fromProperty: 'ref',
          fromUuid: toBeReplacedID,
          reference: Reference.to({ uuids: toBeUpdatedID }),
        });
        const two = collection.data.referenceAdd({
          fromProperty: 'ref',
          fromUuid: toBeUpdatedID,
          reference: Reference.to({ uuids: toBeReplacedID }),
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
    const result = await collection.data.deleteMany({
      where: weaviate.Filter.by('testProp').equal('DELETE ME'),
    });
    expect(result.failed).toEqual(0);
    expect(result.matches).toEqual(3);
    expect(result.successful).toEqual(3);
  });

  it('should be able to replace an object', async () => {
    const obj = await collection.query.fetchObjectById({ id: toBeReplacedID });
    expect(obj.properties.testProp).toEqual('REPLACE ME');
    expect(obj.properties.testProp2).toEqual(1);
    await collection.data
      .replace({
        id: toBeReplacedID,
        properties: {
          testProp: 'REPLACED',
        },
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById({ id: toBeReplacedID });
        expect(obj.properties.testProp).toEqual('REPLACED');
        expect(obj.properties.testProp2).toBeUndefined();
      });
  });

  it('should be able to update an object', async () => {
    const obj = await collection.query.fetchObjectById({ id: toBeUpdatedID });
    expect(obj.properties.testProp).toEqual('UPDATE ME');
    expect(obj.properties.testProp2).toEqual(1);
    await collection.data
      .update({
        id: toBeUpdatedID,
        properties: {
          testProp: 'UPDATED',
        },
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById({ id: toBeUpdatedID });
        expect(obj.properties.testProp).toEqual('UPDATED');
        expect(obj.properties.testProp2).toEqual(1);
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
    await collection.data.insertMany({ objects }).then(async (insert) => {
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
    const insert = await collection.data.insertMany({ objects }).then(async (insert) => {
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
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 1000; j++) {
      objects.push({
        properties: {
          testProp: 'testInsertMany1000',
        },
      });
    }
    const insert = await collection.data.insertMany({ objects }).then(async (insert) => {
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
        reference: Reference.to({ uuids: existingID }),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById({
          id: existingID,
        });
        expect(obj.properties.ref?.objects).toEqual([]);
        expect(obj.properties.ref?.targetCollection).toEqual(className);
        expect(obj.properties.ref?.uuids?.includes(existingID)).toEqual(true);
      });
  });

  it('should be able to replace a reference between two objects', async () => {
    await collection.data
      .referenceReplace({
        fromProperty: 'ref',
        fromUuid: toBeReplacedID,
        reference: Reference.to({ uuids: existingID }),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById({
          id: toBeReplacedID,
        });
        expect(obj.properties.ref?.objects).toEqual([]);
        expect(obj.properties.ref?.targetCollection).toEqual(className);
        expect(obj.properties.ref?.uuids).toEqual([existingID]);
      });
  });

  it('should be able to delete a reference between two objects', async () => {
    await collection.data
      .referenceDelete({
        fromProperty: 'ref',
        fromUuid: toBeUpdatedID,
        reference: Reference.to({ uuids: toBeReplacedID }),
      })
      .then(async () => {
        const obj = await collection.query.fetchObjectById({
          id: toBeUpdatedID,
        });
        expect(obj.properties.ref).toBeUndefined();
      });
  });

  it('it should be able to add many references in batch', async () => {
    await collection.data
      .referenceAddMany({
        refs: [
          {
            fromProperty: 'ref',
            fromUuid: existingID,
            reference: Reference.to({ uuids: [toBeReplacedID, toBeUpdatedID] }),
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
        const obj1 = await collection.query.fetchObjectById({
          id: existingID,
        });
        expect(obj1.properties.ref?.objects).toEqual([]);
        expect(obj1.properties.ref?.targetCollection).toEqual(className);
        expect(obj1.properties.ref?.uuids?.includes(toBeReplacedID)).toEqual(true);
        expect(obj1.properties.ref?.uuids?.includes(toBeUpdatedID)).toEqual(true);
        // const obj2 = await collection.query.fetchObjectById({
        //   id: toBeUpdatedID
        // });
        // expect(obj2.properties.ref?.objects).toEqual([]);
        // expect(obj2.properties.ref?.targetCollection).toEqual(className);
        // expect(obj2.properties.ref?.uuids?.includes(existingID)).toEqual(true);
      });
  });
});
