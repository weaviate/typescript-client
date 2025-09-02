/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Properties,
  Tenant,
  WeaviateClass,
  WeaviateError,
  WeaviateObject,
  WeaviateObjectsList,
} from '../openapi/types.js';
import weaviate, { WeaviateClient } from '../v2/index.js';

const thingClassName = 'DataJourneyTestThing';
const refSourceClassName = 'DataJourneyTestRefSource';
const classCustomVectorClassName = 'ClassCustomVector';

const fail = (msg: string) => {
  throw new Error(msg);
};

describe('data', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  it('creates a schema class', () => {
    // this is just test setup, not part of what we want to test here
    return setup(client);
  });

  it('validates a valid thing', () => {
    const properties = {
      stringProp: 'without-id',
      objectProp: {
        nestedInt: 123,
        nestedNumber: 123.45,
        nestedText: 'some text',
        nestedObjects: [
          {
            nestedBoolLvl2: true,
            nestedDateLvl2: '2022-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [11.1, 22.2],
          },
          {
            nestedBoolLvl2: false,
            nestedDateLvl2: '2023-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [33.3, 44.4],
          },
        ],
      },
    };

    return client.data
      .validator()
      .withId('11992f06-2eac-4f0b-973f-7d230d3bdbaf')
      .withClassName(thingClassName)
      .withProperties(properties)
      .do()
      .then((res: boolean) => {
        expect(res).toEqual(true);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('(validator) errors on an invalid valid object', () => {
    const properties = { stringProp: 234 }; // number is invalid

    return client.data
      .validator()
      .withId('11992f06-2eac-4f0b-973f-7d230d3bdbaf')
      .withClassName(thingClassName)
      .withProperties(properties)
      .do()
      .catch((e: Error) => {
        expect(e.message).toEqual(
          `The request to Weaviate failed with status code: 422 and message: {"error":[{"message":"invalid object: invalid text property 'stringProp' on class 'DataJourneyTestThing': not a string, but json.Number"}]}`
        );
      });
  });

  let implicitThingId: string | undefined;

  it('creates a new thing object without an explicit id', () => {
    const properties = {
      stringProp: 'without-id',
      objectProp: {
        nestedInt: 123,
        nestedNumber: 123.45,
        nestedText: 'some text',
        nestedObjects: [
          {
            nestedBoolLvl2: true,
            nestedDateLvl2: '2022-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [11.1, 22.2],
          },
          {
            nestedBoolLvl2: false,
            nestedDateLvl2: '2023-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [33.3, 44.4],
          },
        ],
      },
    };

    return client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(properties)
      .do()
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual(properties);
        implicitThingId = res.id;
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('creates a new thing object with an explicit id', () => {
    const properties = {
      stringProp: 'with-id',
      objectProp: {
        nestedInt: 999,
        nestedNumber: 88.8,
        nestedText: 'another text',
        nestedObjects: [
          {
            nestedBoolLvl2: false,
            nestedDateLvl2: '2020-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [55.5, 66.6],
          },
          {
            nestedBoolLvl2: true,
            nestedDateLvl2: '2021-01-01T00:00:00+02:00',
            nestedNumbersLvl2: [77.7, 88.8],
          },
        ],
      },
    };
    // explicitly make this an all-zero UUID. This way we can be sure that it's
    // the first to come up when using the cursor API. Since this test suite
    // also contains dynamicaly generated IDs, this is the only way to make
    // sure that this ID is first. This way the tests returning objects after
    // this ID won't be flaky.
    const id = '00000000-0000-0000-0000-000000000000';

    return client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(properties)
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual(properties);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('creates another thing', () => {
    // we need this later for the reference test!
    const properties = {};
    const id = '599a0c64-5ed5-4d30-978b-6c9c45516db1';

    return client.data
      .creator()
      .withClassName(refSourceClassName)
      .withProperties(properties)
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual(properties);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('errors without a className', () => {
    return client.data
      .creator()
      .do()
      .then(() => {
        throw new Error('it should have errord');
      })
      .catch((err: Error) => {
        expect(err.message).toEqual(
          'invalid usage: className must be set - set with .withClassName(className)'
        );
      });
  });

  it('gets all things', () => {
    return client.data
      .getter()
      .do()
      .then((res: WeaviateObjectsList) => {
        expect(res.objects).toHaveLength(3);
        expect(res.objects).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '00000000-0000-0000-0000-000000000000',
              properties: {
                stringProp: 'with-id',
                objectProp: {
                  nestedInt: 999,
                  nestedNumber: 88.8,
                  nestedText: 'another text',
                  nestedObjects: [
                    {
                      nestedBoolLvl2: false,
                      nestedDateLvl2: '2020-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [55.5, 66.6],
                    },
                    {
                      nestedBoolLvl2: true,
                      nestedDateLvl2: '2021-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [77.7, 88.8],
                    },
                  ],
                },
              },
            }),
            expect.objectContaining({
              properties: {
                stringProp: 'without-id',
                objectProp: {
                  nestedInt: 123,
                  nestedNumber: 123.45,
                  nestedText: 'some text',
                  nestedObjects: [
                    {
                      nestedBoolLvl2: true,
                      nestedDateLvl2: '2022-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [11.1, 22.2],
                    },
                    {
                      nestedBoolLvl2: false,
                      nestedDateLvl2: '2023-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [33.3, 44.4],
                    },
                  ],
                },
              },
            }),
          ])
        );
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('gets all classes objects', () => {
    return client.data
      .getter()
      .withClassName(thingClassName)
      .do()
      .then((res: WeaviateObjectsList) => {
        expect(res.objects).toHaveLength(2);
        expect(res.objects).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: '00000000-0000-0000-0000-000000000000',
              properties: {
                stringProp: 'with-id',
                objectProp: {
                  nestedInt: 999,
                  nestedNumber: 88.8,
                  nestedText: 'another text',
                  nestedObjects: [
                    {
                      nestedBoolLvl2: false,
                      nestedDateLvl2: '2020-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [55.5, 66.6],
                    },
                    {
                      nestedBoolLvl2: true,
                      nestedDateLvl2: '2021-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [77.7, 88.8],
                    },
                  ],
                },
              },
            }),
            expect.objectContaining({
              properties: {
                stringProp: 'without-id',
                objectProp: {
                  nestedInt: 123,
                  nestedNumber: 123.45,
                  nestedText: 'some text',
                  nestedObjects: [
                    {
                      nestedBoolLvl2: true,
                      nestedDateLvl2: '2022-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [11.1, 22.2],
                    },
                    {
                      nestedBoolLvl2: false,
                      nestedDateLvl2: '2023-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [33.3, 44.4],
                    },
                  ],
                },
              },
            }),
          ])
        );
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('gets all classes after a specfic object (Cursor API)', () => {
    return client.data
      .getter()
      .withClassName(thingClassName)
      .withLimit(100)
      .withAfter('00000000-0000-0000-0000-000000000000')
      .do()
      .then((res: WeaviateObjectsList) => {
        expect(res.objects).toHaveLength(1);
        expect(res.objects).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              properties: {
                stringProp: 'without-id',
                objectProp: {
                  nestedInt: 123,
                  nestedNumber: 123.45,
                  nestedText: 'some text',
                  nestedObjects: [
                    {
                      nestedBoolLvl2: true,
                      nestedDateLvl2: '2022-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [11.1, 22.2],
                    },
                    {
                      nestedBoolLvl2: false,
                      nestedDateLvl2: '2023-01-01T00:00:00+02:00',
                      nestedNumbersLvl2: [33.3, 44.4],
                    },
                  ],
                },
              },
            }),
          ])
        );
      })
      .catch((e) => fail('it should not have errord: ' + e));
  });

  // it('gets all things with all optional _additional params', () => {
  //   return client.data
  //     .getter()
  //     .withAdditional('classification')
  //     .withAdditional('interpretation')
  //     .withAdditional('nearestNeighbors')
  //     .withAdditional('featureProjection')
  //     .withVector()
  //     .withLimit(2)
  //     .do()
  //     .then((res: WeaviateObjectsList) => {
  //       if (!res.objects) {
  //         throw new Error(`response should have objects: ${JSON.stringify(res)}`);
  //       }
  //       expect(res.objects).toHaveLength(2);
  //       expect(res.objects[0].vector?.length).toBeGreaterThan(10);
  //       expect(res.objects[0].additional?.interpretation).toBeDefined();
  //       expect(res.objects[0].additional?.featureProjection).toBeDefined();
  //       expect(res.objects[0].additional?.nearestNeighbors).toBeDefined();
  //       // not testing for classification as that's only set if the object was
  //       // actually classified, this one wasn't
  //     })
  //     .catch((e: WeaviateError) => {
  //       throw new Error('it should not have errord: ' + e);
  //     });
  // });

  // it('gets all classes objects with all optional _additional params', () => {
  //   return client.data
  //     .getter()
  //     .withClassName(thingClassName)
  //     .withAdditional('classification')
  //     .withAdditional('interpretation')
  //     .withAdditional('nearestNeighbors')
  //     .withAdditional('featureProjection')
  //     .withVector()
  //     .do()
  //     .then((res: WeaviateObjectsList) => {
  //       if (!res.objects) {
  //         throw new Error(`response should have objects: ${JSON.stringify(res)}`);
  //       }
  //       expect(res.objects).toHaveLength(2);
  //       expect(res.objects[0].vector?.length).toBeGreaterThan(10);
  //       expect(res.objects[0].additional?.interpretation).toBeDefined();
  //       expect(res.objects[0].additional?.featureProjection).toBeDefined();
  //       expect(res.objects[0].additional?.nearestNeighbors).toBeDefined();
  //     })
  //     .catch((e: WeaviateError) => {
  //       throw new Error('it should not have errord: ' + e);
  //     });
  // });

  it('gets one thing by id only', () => {
    return client.data
      .getterById()
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .then((res: WeaviateObject) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: '00000000-0000-0000-0000-000000000000',
            properties: {
              stringProp: 'with-id',
              objectProp: {
                nestedInt: 999,
                nestedNumber: 88.8,
                nestedText: 'another text',
                nestedObjects: [
                  {
                    nestedBoolLvl2: false,
                    nestedDateLvl2: '2020-01-01T00:00:00+02:00',
                    nestedNumbersLvl2: [55.5, 66.6],
                  },
                  {
                    nestedBoolLvl2: true,
                    nestedDateLvl2: '2021-01-01T00:00:00+02:00',
                    nestedNumbersLvl2: [77.7, 88.8],
                  },
                ],
              },
            },
          })
        );
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('gets one thing by id and class name', () => {
    return client.data
      .getterById()
      .withClassName(thingClassName)
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .then((res: WeaviateObject) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: '00000000-0000-0000-0000-000000000000',
            properties: {
              stringProp: 'with-id',
              objectProp: {
                nestedInt: 999,
                nestedNumber: 88.8,
                nestedText: 'another text',
                nestedObjects: [
                  {
                    nestedBoolLvl2: false,
                    nestedDateLvl2: '2020-01-01T00:00:00+02:00',
                    nestedNumbersLvl2: [55.5, 66.6],
                  },
                  {
                    nestedBoolLvl2: true,
                    nestedDateLvl2: '2021-01-01T00:00:00+02:00',
                    nestedNumbersLvl2: [77.7, 88.8],
                  },
                ],
              },
            },
          })
        );
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('fails to get one thing by id with invalid class name', () => {
    return client.data
      .getterById()
      .withClassName('DoesNotExist')
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .catch((err: Error) => {
        expect(err.message).toEqual('The request to Weaviate failed with status code: 404 and message: ');
      });
  });

  it('gets one thing by id with all optional additional props', () => {
    return client.data
      .getterById()
      .withId('00000000-0000-0000-0000-000000000000')
      .withAdditional('classification')
      .withAdditional('interpretation')
      .withAdditional('nearestNeighbors')
      .withVector()
      .do()
      .then((res: WeaviateObject) => {
        expect(res.vector?.length).toBeGreaterThan(10);
        expect(res.additional?.interpretation).toBeDefined();
        expect(res.additional?.nearestNeighbors).toBeDefined();
        // not testing for classification as that's only set if the object was
        // actually classified, this one wasn't
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('errors if the id is empty', () => {
    return client.data
      .getterById()
      .do()
      .then(() => {
        throw new Error('it should have errord');
      })
      .catch((e: WeaviateError) => {
        expect(e).toEqual(new Error('invalid usage: id must be set - initialize with getterById(id)'));
      });
  });

  it('updates a thing by id only', () => {
    const id = '00000000-0000-0000-0000-000000000000';
    return client.data
      .getterById()
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        // alter the schema
        const properties: Properties = res.properties!;
        properties!.stringProp = 'thing-updated';
        properties!.objectProp = {
          nestedNumber: 55.5,
          nestedText: 'updated text',
          nestedObjects: [
            {
              nestedBoolLvl2: false,
              nestedNumbersLvl2: [],
            },
            {
              nestedBoolLvl2: true,
              nestedNumbersLvl2: [1.1],
            },
            {
              nestedBoolLvl2: true,
              nestedNumbersLvl2: [2.2, 3.3],
            },
          ],
        };
        return client.data.updater().withId(id).withClassName(thingClassName).withProperties(properties).do();
      })
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual({
          stringProp: 'thing-updated',
          objectProp: {
            nestedNumber: 55.5,
            nestedText: 'updated text',
            nestedObjects: [
              {
                nestedBoolLvl2: false,
                nestedNumbersLvl2: [],
              },
              {
                nestedBoolLvl2: true,
                nestedNumbersLvl2: [1.1],
              },
              {
                nestedBoolLvl2: true,
                nestedNumbersLvl2: [2.2, 3.3],
              },
            ],
          },
        });
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('updates a thing by id and class name', () => {
    const id = '00000000-0000-0000-0000-000000000000';
    return client.data
      .getterById()
      .withId(id)
      .withClassName(thingClassName)
      .do()
      .then((res: WeaviateObject) => {
        const properties: Properties = res.properties!;
        properties!.stringProp = 'thing-updated-with-class-name';
        return client.data.updater().withId(id).withClassName(thingClassName).withProperties(properties).do();
      })
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual({
          stringProp: 'thing-updated-with-class-name',
          objectProp: {
            nestedNumber: 55.5,
            nestedText: 'updated text',
            nestedObjects: [
              {
                nestedBoolLvl2: false,
                nestedNumbersLvl2: [],
              },
              {
                nestedBoolLvl2: true,
                nestedNumbersLvl2: [1.1],
              },
              {
                nestedBoolLvl2: true,
                nestedNumbersLvl2: [2.2, 3.3],
              },
            ],
          },
        });
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('merges a thing', () => {
    const id = '00000000-0000-0000-0000-000000000000';
    return client.data
      .getterById()
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        // alter the schema
        const properties: Properties = res.properties!;
        properties!.intProp = 7;
        return client.data.merger().withId(id).withClassName(thingClassName).withProperties(properties).do();
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('adds a reference to a thing by id only', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId = '00000000-0000-0000-0000-000000000000';

    return client.data
      .referenceCreator()
      .withId(sourceId)
      .withReferenceProperty('refProp')
      .withReference(client.data.referencePayloadBuilder().withId(targetId).payload())
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('replaces all references of a thing by id only', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId: string | undefined = implicitThingId;

    return client.data
      .referenceReplacer()
      .withId(sourceId)
      .withReferenceProperty('refProp')
      .withReferences([client.data.referencePayloadBuilder().withId(targetId!).payload()])
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('deletes a single reference of a thing by id only', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId: string | undefined = implicitThingId;

    return client.data
      .referenceDeleter()
      .withId(sourceId)
      .withReferenceProperty('refProp')
      .withReference(client.data.referencePayloadBuilder().withId(targetId!).payload())
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('adds a reference to a thing by id and class name', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId = '00000000-0000-0000-0000-000000000000';

    return client.data
      .referenceCreator()
      .withId(sourceId)
      .withClassName(refSourceClassName)
      .withReferenceProperty('refProp')
      .withReference(
        client.data.referencePayloadBuilder().withId(targetId).withClassName(thingClassName).payload()
      )
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('replaces all references of a thing by id and class name', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId: string | undefined = implicitThingId;

    return client.data
      .referenceReplacer()
      .withId(sourceId)
      .withClassName(refSourceClassName)
      .withReferenceProperty('refProp')
      .withReferences([
        client.data.referencePayloadBuilder().withId(targetId!).withClassName(thingClassName).payload(),
      ])
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('deletes a single reference of a thing by id and class name', () => {
    const sourceId = '599a0c64-5ed5-4d30-978b-6c9c45516db1';
    const targetId: string | undefined = implicitThingId;

    return client.data
      .referenceDeleter()
      .withId(sourceId)
      .withClassName(refSourceClassName)
      .withReferenceProperty('refProp')
      .withReference(
        client.data.referencePayloadBuilder().withId(targetId!).withClassName(thingClassName).payload()
      )
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('checks that object exists by id only', () => {
    return client.data
      .checker()
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .then((exists: any) => {
        if (!exists) {
          fail('it should exist in DB');
        }
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('checks that object exists by id and class name', () => {
    return client.data
      .checker()
      .withId('00000000-0000-0000-0000-000000000000')
      .withClassName(thingClassName)
      .do()
      .then((exists: any) => {
        if (!exists) {
          fail('it should exist in DB');
        }
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('deletes a thing by id only', () => {
    return client.data
      .deleter()
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it("checks that object doesn't exist anymore with delete by id only", () => {
    return client.data
      .checker()
      .withId('00000000-0000-0000-0000-000000000000')
      .do()
      .then((exists: any) => {
        if (exists) {
          fail('it should not exist in DB');
        }
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('deletes a thing with id and class name', async () => {
    const properties = { stringProp: 'with-id' };
    const id = '6781a974-cfbf-455d-ace8-f1dba4564230';

    await client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(properties)
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual(properties);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });

    return client.data
      .deleter()
      .withId(id)
      .withClassName(thingClassName)
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it("checks that object doesn't exist anymore with delete by id and class name", () => {
    return client.data
      .checker()
      .withId('6781a974-cfbf-455d-ace8-f1dba4564230')
      .do()
      .then((exists: any) => {
        if (exists) {
          fail('it should not exist in DB');
        }
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('verifies there are now fewer things (after delete)', () => {
    return Promise.all([
      client.data
        .getter()
        .do()
        .then((res: WeaviateObjectsList) => {
          expect(res.objects).toHaveLength(2);
        })
        .catch((e: WeaviateError) => {
          throw new Error('it should not have errord: ' + e);
        }),
    ]);
  });

  it('creates a new class with custom vector and explicit id', () => {
    const properties = { foo: 'bar' };
    const id = 'aaaac06c-463f-466c-9092-5930dbac3887';
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    return client.data
      .creator()
      .withClassName(classCustomVectorClassName)
      .withProperties(properties)
      .withVector(vector)
      .withId(id)
      .do()
      .then((res: WeaviateObject) => {
        expect(res.properties).toEqual(properties);
        expect(res.vector).toEqual(vector);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('verifies that class with custom vector has been created', () => {
    const id = 'aaaac06c-463f-466c-9092-5930dbac3887';
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    return client.data
      .getterById()
      .withId(id)
      .withVector()
      .do()
      .then((res: WeaviateObject) => {
        expect(res.vector).toEqual(vector);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('deletes a class with custom vector', () => {
    return client.data
      .deleter()
      .withId('aaaac06c-463f-466c-9092-5930dbac3887')
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('forms a get by id query with node_name set', () => {
    const id = '00000000-0000-0000-0000-000000000000';

    return client.data
      .getterById()
      .withClassName(thingClassName)
      .withId(id)
      .withVector()
      .withNodeName('node1')
      .buildPath()
      .then((path: string) => {
        expect(path).toContain('?include=vector');
        expect(path).toContain('&node_name=node1');
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('forms a get by id query with consistency_level set', () => {
    const id = '00000000-0000-0000-0000-000000000000';

    return client.data
      .getterById()
      .withClassName(thingClassName)
      .withId(id)
      .withVector()
      .withConsistencyLevel('QUORUM')
      .buildPath()
      .then((path: string) => {
        expect(path).toContain('?include=vector');
        expect(path).toContain('consistency_level=QUORUM');
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('forms a exists query with consistency_level set', () => {
    const id = '00000000-0000-0000-0000-000000000000';

    return client.data
      .checker()
      .withClassName(thingClassName)
      .withId(id)
      .withConsistencyLevel('QUORUM')
      .buildPath()
      .then((path: string) => {
        expect(path).toContain('consistency_level=QUORUM');
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('creates object with consistency_level set', async () => {
    const id = '144d1944-3ab4-4aa1-8095-92429d6cbaba';
    const properties = { foo: 'bar' };
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    await client.data
      .creator()
      .withClassName(classCustomVectorClassName)
      .withProperties(properties)
      .withVector(vector)
      .withId(id)
      .withConsistencyLevel('ALL')
      .do()
      .then((res) => {
        expect(res.properties).toEqual(properties);
        expect(res.vector).toEqual(vector);
        expect(res.id).toEqual(id);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: properties,
          })
        );
      })
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('deletes object with consistency_level set', async () => {
    const id = '7a78b029-e7b4-499f-9bd8-70ea11b12345';
    const properties = { foo: 'bar' };
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    await client.data
      .creator()
      .withClassName(classCustomVectorClassName)
      .withProperties(properties)
      .withVector(vector)
      .withId(id)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(properties);
        expect(res.vector).toEqual(vector);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    await client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: properties,
          })
        );
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    return client.data
      .deleter()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .withConsistencyLevel('QUORUM')
      .do()
      .then()
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));
  });

  it('patches object with consistency_level set', async () => {
    const id = '7a78b029-e7b4-499f-9bd8-70ea11b12345';
    const properties: Properties = { foo: 'bar' };
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    await client.data
      .creator()
      .withClassName(classCustomVectorClassName)
      .withProperties(properties)
      .withVector(vector)
      .withId(id)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(properties);
        expect(res.vector).toEqual(vector);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    await client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: properties,
          })
        );
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    const newProperties: Properties = { foo: 'baz' };

    await client.data
      .merger()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .withProperties(newProperties)
      .withConsistencyLevel('QUORUM')
      .do()
      .then()
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: newProperties,
          })
        );
      })
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('updates object with consistency_level set', async () => {
    const id = '55eaf761-11fd-48a9-bf21-60e2048db188';
    const properties: Properties = { foo: 'bar' };
    const vector = [
      -0.26736435, -0.112380296, 0.29648793, 0.39212644, 0.0033650293, -0.07112332, 0.07513781, 0.22459874,
    ];

    await client.data
      .creator()
      .withClassName(classCustomVectorClassName)
      .withProperties(properties)
      .withVector(vector)
      .withId(id)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(properties);
        expect(res.vector).toEqual(vector);
        expect(res.id).toEqual(id);
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    await client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: properties,
          })
        );
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));

    const newProperties: Properties = { foo: 'baz' };

    await client.data
      .updater()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .withProperties(newProperties)
      .withConsistencyLevel('QUORUM')
      .do()
      .then()
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .getterById()
      .withClassName(classCustomVectorClassName)
      .withId(id)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id,
            properties: newProperties,
          })
        );
      })
      .catch((e: WeaviateError) => fail('it should not have errord: ' + e));
  });

  it('creates reference with consistency_level set', async () => {
    const id1 = '5a99f759-400a-453e-b83a-766472994d05';
    const props1 = { stringProp: 'foobar' };

    const id2 = '8d3ae97a-664b-4252-91d5-9886eda9b580';

    await client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(props1)
      .withId(id1)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(props1);
        expect(res.id).toEqual(id1);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .creator()
      .withClassName(refSourceClassName)
      .withId(id2)
      .do()
      .then((res) => {
        expect(res.id).toEqual(id2);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .referenceCreator()
      .withId(id2)
      .withReferenceProperty('refProp')
      .withConsistencyLevel('ONE')
      .withReference(client.data.referencePayloadBuilder().withId(id1).payload())
      .do()
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .getterById()
      .withClassName(refSourceClassName)
      .withId(id2)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id2,
            properties: {
              refProp: [
                {
                  beacon: `weaviate://localhost/DataJourneyTestThing/${id1}`,
                  href: `/v1/objects/DataJourneyTestThing/${id1}`,
                },
              ],
            },
          })
        );
      })
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('replaces reference with consistency_level set', async () => {
    const id1 = '84c58d72-7303-4528-90d2-ebaa39bdd9d4';
    const props1 = { stringProp: 'foobar' };

    const id2 = '6ca5a30f-f3df-400f-92d2-7de1a48d80ac';

    await client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(props1)
      .withId(id1)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(props1);
        expect(res.id).toEqual(id1);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .creator()
      .withClassName(refSourceClassName)
      .withId(id2)
      .do()
      .then((res) => {
        expect(res.id).toEqual(id2);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .referenceReplacer()
      .withId(id2)
      .withReferenceProperty('refProp')
      .withConsistencyLevel('ONE')
      .withReferences(client.data.referencePayloadBuilder().withId(id1).payload())
      .do()
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('deletes reference with consistency_level set', async () => {
    const id1 = 'cfc3151c-6f45-45e2-bb6a-55789c1fbbb2';
    const props1 = { stringProp: 'foobar' };

    const id2 = '70ff8bc0-1d3d-4df4-8bf0-774806ba53e3';

    await client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(props1)
      .withId(id1)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(props1);
        expect(res.id).toEqual(id1);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .creator()
      .withClassName(refSourceClassName)
      .withId(id2)
      .do()
      .then((res) => {
        expect(res.id).toEqual(id2);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .referenceCreator()
      .withId(id2)
      .withReferenceProperty('refProp')
      .withConsistencyLevel('ONE')
      .withReference(client.data.referencePayloadBuilder().withId(id1).payload())
      .do()
      .catch((e) => fail('it should not have errord: ' + e));

    await client.data
      .getterById()
      .withClassName(refSourceClassName)
      .withId(id2)
      .do()
      .then((res) => {
        expect(res).toEqual(
          expect.objectContaining({
            id: id2,
            properties: {
              refProp: [
                {
                  beacon: `weaviate://localhost/DataJourneyTestThing/${id1}`,
                  href: `/v1/objects/DataJourneyTestThing/${id1}`,
                },
              ],
            },
          })
        );
      })
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .referenceDeleter()
      .withId(id2)
      .withReferenceProperty('refProp')
      .withConsistencyLevel('ONE')
      .withReference(client.data.referencePayloadBuilder().withId(id1).payload())
      .do()
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('checks an object exists with consistency_level set', async () => {
    const id = 'e7c7f6d5-4c9d-4a4e-8e1b-9d3d5a0e4d9f';
    const props = { stringProp: 'foobar' };

    await client.data
      .creator()
      .withClassName(thingClassName)
      .withProperties(props)
      .withId(id)
      .do()
      .then((res) => {
        expect(res.properties).toEqual(props);
        expect(res.id).toEqual(id);
      })
      .catch((e) => fail('it should not have errord: ' + e));

    return client.data
      .checker()
      .withId(id)
      .withConsistencyLevel('QUORUM')
      .do()
      .then((exists) => {
        expect(exists).toBe(true);
      })
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('tears down and cleans up', () => {
    return Promise.all([
      client.schema.classDeleter().withClassName(thingClassName).do(),
      client.schema.classDeleter().withClassName(refSourceClassName).do(),
      client.schema.classDeleter().withClassName(classCustomVectorClassName).do(),
    ]);
  });
});

describe('uuid support', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  it('creates class with properties of uuid and uuid[]', async () => {
    const className = 'ClassUUID';
    const id = 'abefd256-8574-442b-9293-9205193737ee';

    await client.schema
      .classCreator()
      .withClass({
        class: className,
        properties: [
          {
            dataType: ['uuid'],
            name: 'uuidProp',
          },
          {
            dataType: ['uuid[]'],
            name: 'uuidArrayProp',
          },
        ],
      })
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toBeTruthy();
      });

    await client.data
      .creator()
      .withClassName(className)
      .withId(id)
      .withProperties({
        uuidProp: '7aaa79d3-a564-45db-8fa8-c49e20b8a39a',
        uuidArrayProp: ['f70512a3-26cb-4ae4-9369-204555917f15', '9e516f40-fd54-4083-a476-f4675b2b5f92'],
      })
      .do()
      .then((res: WeaviateObject) => {
        expect(res).toBeTruthy();
      });

    await client.data
      .getterById()
      .withId(id)
      .withClassName(className)
      .do()
      .then((res: WeaviateObject) => {
        expect(res).toBeTruthy();
        expect(res.properties).toHaveProperty('uuidProp', '7aaa79d3-a564-45db-8fa8-c49e20b8a39a');
        expect(res.properties).toHaveProperty('uuidArrayProp', [
          'f70512a3-26cb-4ae4-9369-204555917f15',
          '9e516f40-fd54-4083-a476-f4675b2b5f92',
        ]);
      });

    return client.schema
      .classDeleter()
      .withClassName(className)
      .do()
      .then((res: void) => {
        expect(res).toEqual(undefined);
      });
  });
});

describe('multi tenancy', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  const documentClassName = 'Document';
  const document: WeaviateClass = {
    class: documentClassName,
    properties: [
      {
        name: 'tenant',
        dataType: ['text'],
      },
      {
        name: 'title',
        dataType: ['text'],
      },
    ],
    multiTenancyConfig: { enabled: true },
  };

  const passageClassName = 'Passage';
  const passage: WeaviateClass = {
    class: passageClassName,
    properties: [
      {
        name: 'tenant',
        dataType: ['text'],
      },
      {
        name: 'content',
        dataType: ['text'],
      },
      {
        name: 'ofDocument',
        dataType: [documentClassName],
      },
    ],
    multiTenancyConfig: { enabled: true },
  };

  const tenants: Array<Tenant> = [{ name: 'tenantA' }, { name: 'tenantB' }, { name: 'tenantC' }];
  const documentIDs = [
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000033',
  ];
  const documentTitles = ['GAN', 'OpenAI', 'SpaceX'];
  const passageIDs = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
  ];
  const txts = [
    'A generative adversarial network (GAN) is a class of machine learning frameworks designed by Ian Goodfellow and his colleagues in June 2014.',
    'OpenAI is an American artificial intelligence (AI) research laboratory consisting of the non-profit OpenAI Incorporated and its for-profit subsidiary corporation OpenAI Limited Partnership.',
    'The Space Exploration Technologies Corporation, commonly referred to as SpaceX is an American spacecraft manufacturer, launcher, and satellite communications company headquartered in Hawthorne, California.',
  ];

  it('create Document and Passage class with tenants', async () => {
    await client.schema
      .classCreator()
      .withClass(document)
      .do()
      .then()
      .catch((e) => fail('it should not have errord: ' + e));

    await client.schema
      .tenantsCreator(documentClassName, tenants)
      .do()
      .then((res) => expect(res).toHaveLength(3))
      .catch((e) => fail('it should not have errord: ' + e));

    await client.schema
      .classCreator()
      .withClass(passage)
      .do()
      .then()
      .catch((e) => fail('it should not have errord: ' + e));

    return client.schema
      .tenantsCreator(passageClassName, tenants)
      .do()
      .then((res) => expect(res).toHaveLength(3))
      .catch((e) => fail('it should not have errord: ' + e));
  });

  it('inserts Documents tenants objects', async () => {
    const expectFn = expect;
    for (let i = 0; i < documentIDs.length; i++) {
      client.data
        .creator()
        .withClassName(documentClassName)
        .withId(documentIDs[i])
        .withTenant(tenants[i].name!)
        .withProperties({
          title: documentTitles[i],
          tenant: tenants[i].name,
        })
        .do()
        .then((r) => {
          expectFn(r.id).toEqual(documentIDs[i]);
        })
        .catch((e) => {
          throw new Error('it should not have errored: ' + e);
        });
    }

    await client.data
      .creator()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .withProperties({
        content: txts[0],
        tenant: tenants[0].name,
      })
      .do()
      .then((r) => {
        expectFn(r.id).toEqual(passageIDs[0]);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });

    await client.data
      .creator()
      .withClassName(passageClassName)
      .withId(passageIDs[1])
      .withTenant(tenants[1].name!)
      .withProperties({
        content: txts[1],
        tenant: tenants[1].name,
      })
      .do()
      .then((r) => {
        expectFn(r.id).toEqual(passageIDs[1]);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });

    return client.data
      .creator()
      .withClassName(passageClassName)
      .withId(passageIDs[2])
      .withTenant(tenants[2].name!)
      .withProperties({
        content: txts[2],
        tenant: tenants[2].name,
      })
      .do()
      .then((r) => {
        expectFn(r.id).toEqual(passageIDs[2]);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('exists Passage tenants objects', () => {
    return client.data
      .checker()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .do()
      .then((r) => {
        expect(r).toBe(true);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('replaces Passage object', () => {
    return client.data
      .updater()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .withProperties({
        content: 'some new content',
        tenant: tenants[0].name,
      })
      .do()
      .then((r) => {
        expect(r.id).toEqual(passageIDs[0]);
        expect(r.properties.content).toEqual('some new content');
      })
      .catch((e) => {
        console.log(`error: ${e}`);
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('gets by id a Passage object', () => {
    return client.data
      .getterById()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .do()
      .then((r) => {
        expect(r.id).toEqual(passageIDs[0]);
        expect(r.properties!.content).toEqual('some new content');
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('adds a referene Passage object', () => {
    return client.data
      .referenceCreator()
      .withId(passageIDs[0])
      .withClassName(passageClassName)
      .withReferenceProperty('ofDocument')
      .withReference(
        client.data
          .referencePayloadBuilder()
          .withId(documentIDs[0])
          .withClassName(documentClassName)
          .payload()
      )
      .withTenant(tenants[0].name!)
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('gets by id a Passage object with reference', () => {
    return client.data
      .getterById()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .do()
      .then((r) => {
        expect(r.id).toEqual(passageIDs[0]);
        expect(r.properties!.ofDocument).toHaveLength(1);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('removes a referene Passage object', () => {
    return client.data
      .referenceDeleter()
      .withId(passageIDs[0])
      .withClassName(passageClassName)
      .withReferenceProperty('ofDocument')
      .withReference(
        client.data
          .referencePayloadBuilder()
          .withId(documentIDs[0])
          .withClassName(documentClassName)
          .payload()
      )
      .withTenant(tenants[0].name!)
      .do()
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('gets by id a Passage object with no reference', () => {
    return client.data
      .getterById()
      .withClassName(passageClassName)
      .withId(passageIDs[0])
      .withTenant(tenants[0].name!)
      .do()
      .then((r) => {
        expect(r.id).toEqual(passageIDs[0]);
        expect(r.properties!.ofDocument).toHaveLength(0);
      })
      .catch((e) => {
        throw new Error('it should not have errored: ' + e);
      });
  });

  it('delete Passage class', () => {
    return client.schema.classDeleter().withClassName(passageClassName).do();
  });

  it('delete Document class', () => {
    return client.schema.classDeleter().withClassName(documentClassName).do();
  });
});

const setup = async (client: WeaviateClient) => {
  const thing: WeaviateClass = {
    class: thingClassName,
    properties: [
      {
        name: 'stringProp',
        dataType: ['string'],
      },
      {
        name: 'intProp',
        dataType: ['int'],
      },
      {
        name: 'objectProp',
        dataType: ['object'],
        nestedProperties: [
          {
            name: 'nestedInt',
            dataType: ['int'],
          },
          {
            name: 'nestedNumber',
            dataType: ['number'],
          },
          {
            name: 'nestedText',
            dataType: ['text'],
          },
          {
            name: 'nestedObjects',
            dataType: ['object[]'],
            nestedProperties: [
              {
                name: 'nestedBoolLvl2',
                dataType: ['boolean'],
              },
              {
                name: 'nestedDateLvl2',
                dataType: ['date'],
              },
              {
                name: 'nestedNumbersLvl2',
                dataType: ['number[]'],
              },
            ],
          },
        ],
      },
    ],
  };

  await Promise.all([client.schema.classCreator().withClass(thing).do()]);

  const classCustomVector = {
    class: classCustomVectorClassName,
    vectorizer: 'none',
    properties: [
      {
        name: 'foo',
        dataType: ['string'],
      },
    ],
  };

  await Promise.all([client.schema.classCreator().withClass(classCustomVector).do()]);

  const refSource = {
    class: refSourceClassName,
    properties: [
      {
        name: 'refProp',
        dataType: [thingClassName],
        cardinality: 'many',
      },
    ],
  };

  return client.schema.classCreator().withClass(refSource).do();
};
