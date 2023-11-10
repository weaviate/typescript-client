/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate from '..';
import { v4 } from 'uuid';
import { DataObject } from './types';

type TestCollectionData = {
  testProp: string;
  testProp2?: number;
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
  let toBeReplacedID: string;
  let toBeUpdatedID: string;

  beforeAll(async () => {
    await fetch(`${url}/schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class: className,
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
        ],
      }),
    }).then(async (res) => {
      if (res.status !== 200) {
        console.error(await res.json());
        throw new Error('Failed to create class');
      }
      const promises = ['DELETE ME', 'DELETE ME', 'DELETE ME'].map((text) =>
        fetch(`${url}/objects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            class: className,
            properties: {
              testProp: text,
            },
          }),
        }).then(async (res) => {
          if (res.status !== 200) {
            console.error(await res.json());
            throw new Error('Failed to create object');
          }
        })
      );
      await Promise.all(promises);
      toBeReplacedID = await fetch(`${url}/objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: className,
          properties: {
            testProp: 'REPLACE ME',
            testProp2: 1,
          },
        }),
      }).then(async (res) => {
        if (res.status !== 200) {
          console.error(await res.json());
          throw new Error('Failed to create object');
        }
        const json = await res.json();
        return json.id;
      });
      toBeUpdatedID = await fetch(`${url}/objects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: className,
          properties: {
            testProp: 'UPDATE ME',
            testProp2: 1,
          },
        }),
      }).then(async (res) => {
        if (res.status !== 200) {
          console.error(await res.json());
          throw new Error('Failed to create object');
        }
        const json = await res.json();
        return json.id;
      });
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
    await fetch(`${url}/objects/${toBeReplacedID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        expect(json.properties.testProp).toEqual('REPLACE ME');
        expect(json.properties.testProp2).toEqual(1);
      });
    await collection.data
      .replace({
        id: toBeReplacedID,
        properties: {
          testProp: 'REPLACED',
        },
      })
      .then(async () => {
        await fetch(`${url}/objects/${toBeReplacedID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((json) => {
            expect(json.properties.testProp).toEqual('REPLACED');
            expect(json.properties.testProp2).toBeUndefined();
          });
      });
  });

  it('should be able to update an object', async () => {
    await fetch(`${url}/objects/${toBeUpdatedID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        expect(json.properties.testProp).toEqual('UPDATE ME');
        expect(json.properties.testProp2).toEqual(1);
      });
    await collection.data
      .update({
        id: toBeUpdatedID,
        properties: {
          testProp: 'UPDATED',
        },
      })
      .then(async () => {
        await fetch(`${url}/objects/${toBeUpdatedID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((json) => {
            expect(json.properties.testProp).toEqual('UPDATED');
            expect(json.properties.testProp2).toEqual(1);
          });
      });
  });

  it('should be able to insert many (10) objects at once', async () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 10; j++) {
      objects.push({
        properties: {
          testProp: 'test',
        },
      });
    }
    const insert = await collection.data.insertMany({ objects });
    expect(insert.hasErrors).toBeFalsy();
    expect(insert.allResponses.length).toEqual(10);
    expect(Object.values(insert.errors).length).toEqual(0);
    expect(Object.values(insert.uuids).length).toEqual(10);
  });

  it('should be able to insert many (100) objects at once', async () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 100; j++) {
      objects.push({
        properties: {
          testProp: 'test',
        },
      });
    }
    const insert = await collection.data.insertMany({ objects });
    expect(insert.hasErrors).toBeFalsy();
    expect(insert.allResponses.length).toEqual(100);
    expect(Object.values(insert.errors).length).toEqual(0);
    expect(Object.values(insert.uuids).length).toEqual(100);
  });

  it('should be able to insert many (1000) objects at once', async () => {
    const objects: DataObject<TestCollectionData>[] = [];
    for (let j = 0; j < 1000; j++) {
      objects.push({
        properties: {
          testProp: 'test',
        },
      });
    }
    const insert = await collection.data.insertMany({ objects });
    expect(insert.hasErrors).toBeFalsy();
    expect(insert.allResponses.length).toEqual(1000);
    expect(Object.values(insert.errors).length).toEqual(0);
    expect(Object.values(insert.uuids).length).toEqual(1000);
  });
});
