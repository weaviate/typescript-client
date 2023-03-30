/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, { WeaviateClient } from '..';
import {
  BatchReference,
  BatchReferenceResponse,
  WeaviateObject,
  BatchDeleteResponse,
  WhereFilter,
} from '../openapi/types';

const thingClassName = 'BatchJourneyTestThing';
const otherThingClassName = 'BatchJourneyTestOtherThing';

const thingIds = [
  'c25365bd-276b-4d88-9d8f-9e924701aa89',
  'e0754de5-1458-4814-b21f-382a77b5d64b',
  '5c345f46-c3c4-4f42-8ad6-65c6c60840b4',
  '5f4b0aa2-0704-4529-919f-c1f614e685f4',
];

const otherThingIds = ['5b354a0f-fe66-4fe7-ad62-4db72ddab815', '8727fa2b-610a-4a5c-af26-e558943f71c7'];

const someObjects: WeaviateObject[] = [
  {
    class: thingClassName,
    id: thingIds[0],
    properties: { stringProp: 'foo1' },
  },
  {
    class: thingClassName,
    id: thingIds[1],
    properties: { stringProp: 'bar1' },
  },
  {
    class: thingClassName,
    id: thingIds[2],
    properties: { stringProp: 'foo2' },
  },
  {
    class: thingClassName,
    id: thingIds[3],
    properties: { stringProp: 'bar2' },
  },
  {
    class: otherThingClassName,
    id: otherThingIds[0],
    properties: { stringProp: 'foo3' },
  },
  {
    class: otherThingClassName,
    id: otherThingIds[1],
    properties: { stringProp: 'bar3' },
  },
];

const someReferences = [
  {
    from: `weaviate://localhost/${thingClassName}/${thingIds[0]}/refProp`,
    to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[0]}`,
  },
  {
    from: `weaviate://localhost/${thingClassName}/${thingIds[1]}/refProp`,
    to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`,
  },
  {
    from: `weaviate://localhost/${thingClassName}/${thingIds[2]}/refProp`,
    to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`,
  },
  {
    from: `weaviate://localhost/${thingClassName}/${thingIds[3]}/refProp`,
    to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`,
  },
];

describe('batch importing', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  it('can add objects with different methods', () => {
    const batcher = client.batch
      .objectsBatcher()
      .withObject(someObjects[0])
      .withObjects(someObjects[1])
      .withObjects(someObjects[2], someObjects[3])
      .withObjects(...[someObjects[4], someObjects[5]]);

    expect(batcher.objects).toHaveLength(someObjects.length);
    batcher.objects.forEach((obj: WeaviateObject, i: number) => {
      expect(obj.class).toBe(someObjects[i].class);
      expect(obj.id).toBe(someObjects[i].id);
    });
  });

  it('sets up', () => setup(client));

  describe('import thing objects', () => {
    describe('hand assembling the objects', () => {
      const toImport = [
        {
          class: thingClassName,
          id: thingIds[0],
          properties: { stringProp: 'foo' },
        },
        {
          class: thingClassName,
          id: thingIds[1],
          properties: { stringProp: 'bar' },
        },
      ];

      it('imports them', () => {
        client.batch
          .objectsBatcher()
          .withObject(toImport[0])
          .withObject(toImport[1])
          .do()
          .then()
          .catch((e: Error) => {
            throw new Error('it should not have errord ' + e);
          });
      });

      it('waits for es index refresh', () => {
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });

      it('verifies they are now queryable', () => {
        return Promise.all([
          client.data.getterById().withId(thingIds[0]).withClassName(thingClassName).do(),
          client.data.getterById().withId(thingIds[1]).withClassName(thingClassName).do(),
        ]).catch((e: Error) => {
          throw new Error('it should not have errord ' + e);
        });
      });
    });

    describe('using the thing builder to assemble the objects', () => {
      const toImport = [
        client.data
          .creator()
          .withClassName(thingClassName)
          .withId(thingIds[2])
          .withProperties({ stringProp: 'foo' })
          .payload(), // note the .payload(), not .do()!
        client.data
          .creator()
          .withClassName(thingClassName)
          .withId(thingIds[3])
          .withProperties({ stringProp: 'foo' })
          .payload(), // note the .payload(), not .do()!
      ];

      it('imports them', () => {
        client.batch
          .objectsBatcher()
          .withObjects(toImport[0], toImport[1])
          .do()
          .then()
          .catch((e: any) => {
            throw new Error('it should not have errord ' + e);
          });
      });

      it('waits for es index refresh', () => {
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });

      it('verifies they are now queryable', () => {
        return Promise.all([
          client.data.getterById().withId(thingIds[2]).withClassName(thingClassName).do(),
          client.data.getterById().withId(thingIds[3]).withClassName(thingClassName).do(),
        ]).catch((e: any) => {
          throw new Error('it should not have errord ' + e);
        });
      });
    });
  });

  describe('import other thing objects', () => {
    describe('hand assembling the objects', () => {
      const toImport = [
        {
          class: otherThingClassName,
          id: otherThingIds[0],
          properties: { stringProp: 'foo' },
        },
        {
          class: otherThingClassName,
          id: otherThingIds[1],
          properties: { stringProp: 'bar' },
        },
      ];

      it('imports them with consistency level', () => {
        client.batch
          .objectsBatcher()
          .withConsistencyLevel('ONE')
          .withObjects(...[toImport[0], toImport[1]])
          .do()
          .then()
          .catch((e: any) => {
            throw new Error('it should not have errord ' + e);
          });
      });

      it('waits for es index refresh', () => {
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });

      it('verifies they are now queryable', () => {
        return Promise.all([
          client.data.getterById().withId(toImport[0].id).withClassName(toImport[0].class).do(),
          client.data.getterById().withId(toImport[1].id).withClassName(toImport[1].class).do(),
        ]).catch((e: any) => {
          throw new Error('it should not have errord ' + e);
        });
      });
    });
  });

  describe('batch reference between the thing and otherThing objects', () => {
    it('can add references with different methods', () => {
      const batcher = client.batch
        .referencesBatcher()
        .withReference(someReferences[0])
        .withReferences(someReferences[1], someReferences[2])
        .withReferences(...[someReferences[3]]);

      expect(batcher.references).toHaveLength(someReferences.length);
      batcher.references.forEach((ref: BatchReference, i: number) => {
        expect(ref.from).toBe(someReferences[i].from);
        expect(ref.to).toBe(someReferences[i].to);
      });
    });

    it('imports the refs with raw objects and consistency level', () => {
      return client.batch
        .referencesBatcher()
        .withReference({
          from: `weaviate://localhost/${thingClassName}/${thingIds[0]}/refProp`,
          to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[0]}`,
        })
        .withReference({
          from: `weaviate://localhost/${thingClassName}/${thingIds[1]}/refProp`,
          to: `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`,
        })
        .withConsistencyLevel('ALL')
        .do()
        .then((res: BatchReferenceResponse[]) => {
          res.forEach((elem: BatchReferenceResponse) => {
            expect(elem.result!.errors).toBeUndefined();
          });
        })
        .catch((e: any) => {
          throw new Error('it should not have errord ' + e);
        });
    });

    it('imports more refs with a builder pattern', () => {
      const reference1 = client.batch
        .referencePayloadBuilder()
        .withFromClassName(thingClassName)
        .withFromRefProp('refProp')
        .withFromId(thingIds[2])
        .withToId(otherThingIds[0])
        .withToClassName(otherThingClassName)
        .payload();
      const reference2 = client.batch
        .referencePayloadBuilder()
        .withFromClassName(thingClassName)
        .withFromRefProp('refProp')
        .withFromId(thingIds[3])
        .withToId(otherThingIds[1])
        .withToClassName(otherThingClassName)
        .payload();
      return client.batch
        .referencesBatcher()
        .withReferences(reference1, reference2)
        .do()
        .then((res: BatchReferenceResponse[]) => {
          res.forEach((elem: BatchReferenceResponse) => {
            expect(elem.result!.errors).toBeUndefined();
          });
        })
        .catch((e: any) => {
          throw new Error('it should not have errord ' + e);
        });
    });

    it('waits for es index refresh', () => {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('verifies the refs are now set', () => {
      return Promise.all([
        client.data
          .getterById()
          .withId(thingIds[0])
          .withClassName(thingClassName)
          .do()
          .then((res: any) => {
            expect(res.properties.refProp[0].beacon).toEqual(
              `weaviate://localhost/${otherThingClassName}/${otherThingIds[0]}`
            );
          }),
        client.data
          .getterById()
          .withId(thingIds[1])
          .withClassName(thingClassName)
          .do()
          .then((res: any) => {
            expect(res.properties.refProp[0].beacon).toEqual(
              `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`
            );
          }),
        client.data
          .getterById()
          .withId(thingIds[2])
          .withClassName(thingClassName)
          .do()
          .then((res: any) => {
            expect(res.properties.refProp[0].beacon).toEqual(
              `weaviate://localhost/${otherThingClassName}/${otherThingIds[0]}`
            );
          }),
        client.data
          .getterById()
          .withId(thingIds[3])
          .withClassName(thingClassName)
          .do()
          .then((res: any) => {
            expect(res.properties.refProp[0].beacon).toEqual(
              `weaviate://localhost/${otherThingClassName}/${otherThingIds[1]}`
            );
          }),
      ]).catch((e: any) => {
        throw new Error('it should not have errord ' + e);
      });
    });
  });

  it('tears down and cleans up', () => cleanup(client));
});

describe('batch deleting', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  it('sets up schema', () => setup(client));
  it('sets up data', () => setupData(client));

  it('batch deletes with dryRun and verbose output', () =>
    client.batch
      .objectsBatchDeleter()
      .withClassName(thingClassName)
      .withWhere({
        operator: 'Equal',
        valueString: 'bar1',
        path: ['stringProp'],
      })
      .withDryRun(true)
      .withOutput('verbose')
      .do()
      .then((result: any) => {
        expect(result.dryRun).toBe(true);
        expect(result.output).toBe('verbose');
        expect(result.match).toEqual({
          class: thingClassName,
          where: {
            operands: null,
            operator: 'Equal',
            valueString: 'bar1',
            path: ['stringProp'],
          },
        });
        expect(result.results).toEqual({
          successful: 0,
          failed: 0,
          matches: 1,
          limit: 10000,
          objects: [
            {
              id: thingIds[1],
              status: 'DRYRUN',
            },
          ],
        });
      }));

  it('batch deletes with dryRun and minimal output', () =>
    client.batch
      .objectsBatchDeleter()
      .withClassName(otherThingClassName)
      .withWhere({
        operator: 'Like',
        valueString: 'foo3',
        path: ['stringProp'],
      })
      .withDryRun(true)
      .withOutput('minimal')
      .do()
      .then((result: BatchDeleteResponse) => {
        expect(result.dryRun).toBe(true);
        expect(result.output).toBe('minimal');
        expect(result.match).toEqual({
          class: otherThingClassName,
          where: {
            operands: null,
            operator: 'Like',
            valueString: 'foo3',
            path: ['stringProp'],
          },
        });
        expect(result.results).toEqual({
          successful: 0,
          failed: 0,
          matches: 1,
          limit: 10000,
          objects: null,
        });
      }));

  it('batch deletes but no matches with default dryRun and output', () =>
    client.batch
      .objectsBatchDeleter()
      .withClassName(otherThingClassName)
      .withWhere({
        operator: 'Equal',
        valueString: 'doesNotExist',
        path: ['stringProp'],
      })
      .do()
      .then((result: any) => {
        expect(result.dryRun).toBe(false);
        expect(result.output).toBe('minimal');
        expect(result.match).toEqual({
          class: otherThingClassName,
          where: {
            operands: null,
            operator: 'Equal',
            valueString: 'doesNotExist',
            path: ['stringProp'],
          },
        });
        expect(result.results).toEqual({
          successful: 0,
          failed: 0,
          matches: 0,
          limit: 10000,
          objects: null,
        });
      }));

  it('batch deletes with default dryRun and consistency level', () => {
    const inAMinute = '' + (new Date().getTime() + 60 * 1000);
    return client.batch
      .objectsBatchDeleter()
      .withClassName(otherThingClassName)
      .withWhere({
        operator: 'LessThan',
        valueString: inAMinute,
        path: ['_creationTimeUnix'],
      })
      .withOutput('verbose')
      .withConsistencyLevel('QUORUM')
      .do()
      .then((result: any) => {
        expect(result.dryRun).toBe(false);
        expect(result.output).toBe('verbose');
        expect(result.match).toEqual({
          class: otherThingClassName,
          where: {
            operands: null,
            operator: 'LessThan',
            valueString: inAMinute,
            path: ['_creationTimeUnix'],
          },
        });
        expect(result.results.successful).toBe(2);
        expect(result.results.failed).toBe(0);
        expect(result.results.matches).toBe(2);
        expect(result.results.limit).toBe(10000);
        expect(result.results.objects).toHaveLength(2);
        expect(result.results.objects).toContainEqual({
          id: otherThingIds[0],
          status: 'SUCCESS',
        });
        expect(result.results.objects).toContainEqual({
          id: otherThingIds[1],
          status: 'SUCCESS',
        });
      });
  });

  it('tears down and cleans up', () => cleanup(client));
});

const setup = async (client: WeaviateClient) => {
  // first import the classes
  await Promise.all([
    client.schema
      .classCreator()
      .withClass({
        class: thingClassName,
        properties: [
          {
            name: 'stringProp',
            dataType: ['string'],
          },
        ],
      })
      .do(),
    client.schema
      .classCreator()
      .withClass({
        class: otherThingClassName,
        properties: [
          {
            name: 'stringProp',
            dataType: ['string'],
          },
        ],
        invertedIndexConfig: {
          indexTimestamps: true,
        },
      })
      .do(),
  ]);

  // now set a link from thing to otherThing class, so we can batch import
  // references

  return client.schema
    .propertyCreator()
    .withClassName(thingClassName)
    .withProperty({ name: 'refProp', dataType: [otherThingClassName] })
    .do();
};

const setupData = (client: WeaviateClient) => {
  return client.batch
    .objectsBatcher()
    .withObjects(...someObjects)
    .do();
};

const cleanup = (client: WeaviateClient) =>
  Promise.all([
    client.schema.classDeleter().withClassName(thingClassName).do(),
    client.schema.classDeleter().withClassName(otherThingClassName).do(),
  ]);
