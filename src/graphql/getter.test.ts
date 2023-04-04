import Getter from './getter';
import { WhereFilter } from '../openapi/types';
import { NearObjectArgs } from './nearObject';
import { AskArgs } from './ask';
import { NearImageArgs } from './nearImage';
import { SortArgs } from './sort';
import { NearTextArgs } from './nearText';

test('a simple query without params', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person{name}}}`;

  new Getter(mockClient).withClassName('Person').withFields('name').do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test('a simple query with a limit', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7){name}}}`;

  new Getter(mockClient).withClassName('Person').withFields('name').withLimit(7).do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test('a simple query with a limit and offset', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7,offset:2){name}}}`;

  new Getter(mockClient).withClassName('Person').withFields('name').withOffset(2).withLimit(7).do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test('a simple query with a limit and after', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7,after:"c6f379dd-94b7-4017-acd3-df769a320c92"){name}}}`;

  new Getter(mockClient)
    .withClassName('Person')
    .withFields('name')
    .withAfter('c6f379dd-94b7-4017-acd3-df769a320c92')
    .withLimit(7)
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test('a simple query with a group', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(group:{type:merge,force:0.7}){name}}}`;

  new Getter(mockClient)
    .withClassName('Person')
    .withFields('name')
    .withGroup({ type: 'merge', force: 0.7 })
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

describe('where filters', () => {
  test('a query with a valid where filter', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(where:{operator:Equal,valueString:"John Doe",path:["name"]}){name}}}`;
    const where: WhereFilter = {
      operator: 'Equal',
      valueString: 'John Doe',
      path: ['name'],
    };

    new Getter(mockClient).withClassName('Person').withFields('name').withWhere(where).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  // to prevent a regression on
  // https://github.com/weaviate/weaviate-javascript-client/issues/6
  test('a query with a where filter containing a geo query', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(where:{operator:WithinGeoRange,valueGeoRange:` +
      `{geoCoordinates:{latitude:51.51,longitude:-0.09},distance:{max:2000}}` +
      `,path:["name"]})` +
      `{name}}}`;
    const where: WhereFilter = {
      operator: 'WithinGeoRange',
      valueGeoRange: {
        geoCoordinates: {
          latitude: 51.51,
          longitude: -0.09,
        },
        distance: {
          max: 2000,
        },
      },
      path: ['name'],
    };

    new Getter(mockClient).withClassName('Person').withFields('name').withWhere(where).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nested where filter', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(where:{operator:And,operands:[` +
      `{operator:Equal,valueString:"foo",path:["foo"]},` +
      `{operator:NotEqual,valueString:"bar",path:["bar"]}` +
      `]})` +
      `{name}}}`;
    const nestedWhere: WhereFilter = {
      operator: 'And',
      operands: [
        { valueString: 'foo', operator: 'Equal', path: ['foo'] },
        { valueString: 'bar', operator: 'NotEqual', path: ['bar'] },
      ],
    };

    new Getter(mockClient).withClassName('Person').withFields('name').withWhere(nestedWhere).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe('nearText searchers', () => {
  test('a query with a valid nearText', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearText:{concepts:["foo","bar"]})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({ concepts: ['foo', 'bar'] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        certainty: 0.7,
        moveTo: { concepts: ['foo'], force: 0.7 },
        moveAwayFrom: { concepts: ['bar'], force: 0.5 },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.3,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        distance: 0.3,
        moveTo: { concepts: ['foo'], force: 0.7 },
        moveAwayFrom: { concepts: ['bar'], force: 0.5 },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters and autocorrect (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5},autocorrect:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        certainty: 0.7,
        moveTo: { concepts: ['foo'], force: 0.7 },
        moveAwayFrom: { concepts: ['bar'], force: 0.5 },
        autocorrect: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters and autocorrect (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5},autocorrect:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        distance: 0.7,
        moveTo: { concepts: ['foo'], force: 0.7 },
        moveAwayFrom: { concepts: ['bar'], force: 0.5 },
        autocorrect: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearText and autocorrect set to false', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearText:{concepts:["foo","bar"],autocorrect:false}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({ concepts: ['foo', 'bar'], autocorrect: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveTo with objects parameter (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        certainty: 0.7,
        moveTo: { force: 0.7, objects: [{ id: 'uuid' }, { beacon: 'beacon' }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveTo with objects parameter (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        distance: 0.7,
        moveTo: { force: 0.7, objects: [{ id: 'uuid' }, { beacon: 'beacon' }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveAwayFrom with objects parameter (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveAwayFrom:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        certainty: 0.7,
        moveAwayFrom: {
          force: 0.7,
          objects: [{ id: 'uuid' }, { beacon: 'beacon' }],
        },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveAwayFrom with objects parameter (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveAwayFrom:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        distance: 0.7,
        moveAwayFrom: {
          force: 0.7,
          objects: [{ id: 'uuid' }, { beacon: 'beacon' }],
        },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveTo and moveAway with objects parameter (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{objects:[{id:"uuid"}],force:0.7},moveAwayFrom:{objects:[{beacon:"beacon"}],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        certainty: 0.7,
        moveTo: { force: 0.7, objects: [{ id: 'uuid' }] },
        moveAwayFrom: { force: 0.5, objects: [{ beacon: 'beacon' }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with moveTo and moveAway with objects parameter (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{objects:[{id:"uuid"}],force:0.7},moveAwayFrom:{objects:[{beacon:"beacon"}],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearText({
        concepts: ['foo', 'bar'],
        distance: 0.7,
        moveTo: { force: 0.7, objects: [{ id: 'uuid' }] },
        moveAwayFrom: { force: 0.5, objects: [{ beacon: 'beacon' }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe('queries with invalid nearText searchers', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    interface testCase {
      title: string;
      nearText: NearTextArgs;
      msg: string;
    }

    const tests: testCase[] = [
      {
        title: 'moveTo empty object',
        nearText: { concepts: ['foo'], moveTo: {} },
        msg: 'nearText filter: moveTo.concepts or moveTo.objects must be present',
      },
      {
        title: 'moveTo without force with concepts',
        nearText: { concepts: ['foo'], moveTo: { concepts: ['foo'] } },
        msg: "nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: 'moveTo without force with objects',
        nearText: {
          concepts: ['foo'],
          moveTo: { objects: [{ beacon: 'beacon' }] },
        },
        msg: "nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: 'moveAwayFrom without concepts',
        nearText: { concepts: ['foo'], moveAwayFrom: {} },
        msg: 'nearText filter: moveAwayFrom.concepts or moveAwayFrom.objects must be present',
      },
      {
        title: 'moveAwayFrom without force with concepts',
        nearText: { concepts: ['foo'], moveAwayFrom: { concepts: ['foo'] } },
        msg: "nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: 'moveAwayFrom without force with objects',
        nearText: {
          concepts: ['foo'],
          moveAwayFrom: { objects: [{ id: 'uuid' }] },
        },
        msg: "nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: 'moveTo with empty object in objects',
        nearText: { concepts: ['foo'], moveTo: { force: 0.8, objects: [{}] } },
        msg: 'nearText: moveTo.objects[0].id or moveTo.objects[0].beacon must be present',
      },
      {
        title: 'moveAwayFrom with empty object in objects',
        nearText: {
          concepts: ['foo'],
          moveAwayFrom: { force: 0.8, objects: [{}] },
        },
        msg: 'nearText: moveAwayFrom.objects[0].id or moveAwayFrom.objects[0].beacon must be present',
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        expect(() => {
          new Getter(mockClient).withClassName('Person').withFields('name').withNearText(t.nearText);
        }).toThrow(t.msg);
      });
    });
  });
});

describe('nearVector searchers', () => {
  test('a query with a valid nearVector', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearVector:{vector:[0.1234,0.9876]})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearVector({ vector: [0.1234, 0.9876] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearVector:{vector:[0.1234,0.9876],certainty:0.7}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearVector({
        vector: [0.1234, 0.9876],
        certainty: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('with optional parameters (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearVector:{vector:[0.1234,0.9876],distance:0.7}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearVector({
        vector: [0.1234, 0.9876],
        distance: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe('nearObject searchers', () => {
  test('a query with a valid nearObject with id', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearObject:{id:"some-uuid"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearObject({ id: 'some-uuid' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearObject with beacon', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearObject:{beacon:"weaviate/some-uuid"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearObject({ beacon: 'weaviate/some-uuid' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearObject with all params (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearObject:{id:"some-uuid",beacon:"weaviate/some-uuid",certainty:0.7}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearObject({
        id: 'some-uuid',
        beacon: 'weaviate/some-uuid',
        certainty: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearObject with all params (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearObject:{id:"some-uuid",beacon:"weaviate/some-uuid",distance:0.7}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearObject({
        id: 'some-uuid',
        beacon: 'weaviate/some-uuid',
        distance: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe('queries with invalid nearObject searchers', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    interface testCase {
      title: string;
      nearObject: NearObjectArgs;
      msg: string;
    }

    const tests: testCase[] = [
      {
        title: 'an empty nearObject',
        nearObject: {},
        msg: 'nearObject filter: id or beacon needs to be set',
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName('Person')
          .withFields('name')
          .withNearObject(t.nearObject)
          .do()
          .then(() => {
            throw new Error('it should have errord');
          })
          .catch((e: any) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe('ask searchers', () => {
  test('a query with a valid ask with question', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(ask:{question:"What is Weaviate?"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({ question: 'What is Weaviate?' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question and properties', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(ask:{question:"What is Weaviate?",properties:["prop1","prop2"]}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({
        question: 'What is Weaviate?',
        properties: ['prop1', 'prop2'],
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question, properties, certainty', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],certainty:0.8})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({
        question: 'What is Weaviate?',
        properties: ['prop1', 'prop2'],
        certainty: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question, properties, distance', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],distance:0.8})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({
        question: 'What is Weaviate?',
        properties: ['prop1', 'prop2'],
        distance: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with all params (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],certainty:0.8,autocorrect:true,rerank:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({
        question: 'What is Weaviate?',
        properties: ['prop1', 'prop2'],
        certainty: 0.8,
        autocorrect: true,
        rerank: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with all params (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],distance:0.8,autocorrect:true,rerank:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({
        question: 'What is Weaviate?',
        properties: ['prop1', 'prop2'],
        distance: 0.8,
        autocorrect: true,
        rerank: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question and autocorrect', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(ask:{question:"What is Weaviate?",autocorrect:true}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({ question: 'What is Weaviate?', autocorrect: true })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question and autocorrect set to false', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(ask:{question:"What is Weaviate?",autocorrect:false}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({ question: 'What is Weaviate?', autocorrect: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question and rerank', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(ask:{question:"What is Weaviate?",rerank:true}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({ question: 'What is Weaviate?', rerank: true })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid ask with question and rerank set to false', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(ask:{question:"What is Weaviate?",rerank:false}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withAsk({ question: 'What is Weaviate?', rerank: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe('queries with invalid ask searchers', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    interface testCase {
      title: string;
      ask: AskArgs;
      msg: string;
    }

    const tests: testCase[] = [
      {
        title: 'an empty ask',
        ask: {},
        msg: 'ask filter: question needs to be set',
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName('Person')
          .withFields('name')
          .withAsk(t.ask)
          .do()
          .then(() => {
            throw new Error('it should have errord');
          })
          .catch((e: any) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe('nearImage searchers', () => {
  test('a query with a valid nearImage with image', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearImage:{image:"iVBORw0KGgoAAAANS"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearImage({ image: 'iVBORw0KGgoAAAANS' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearImage with all params (with certainty)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearImage:{image:"iVBORw0KGgoAAAANS",certainty:0.8}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearImage({
        image: 'iVBORw0KGgoAAAANS',
        certainty: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearImage with all params (with distance)', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery = `{Get{Person(nearImage:{image:"iVBORw0KGgoAAAANS",distance:0.8}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearImage({
        image: 'iVBORw0KGgoAAAANS',
        distance: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid nearImage with base64 encoded image', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(nearImage:{image:"iVBORw0KGgoAAAANS"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withNearImage({ image: 'data:image/png;base64,iVBORw0KGgoAAAANS' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe('queries with invalid nearImage searchers', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    interface testCase {
      title: string;
      nearImage: NearImageArgs;
      msg: string;
    }

    const tests: testCase[] = [
      {
        title: 'an empty nearImage',
        nearImage: {},
        msg: 'nearImage filter: image field must be present',
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName('Person')
          .withFields('name')
          .withNearImage(t.nearImage)
          .do()
          .then(() => {
            throw new Error('it should have errord');
          })
          .catch((e: any) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe('sort filters', () => {
  test('a query with a valid sort filter', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(sort:[{path:["property"],order:asc}])`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    const sort: SortArgs[] = [{ path: ['property'], order: 'asc' }];

    new Getter(mockClient).withClassName('Person').withFields('name').withSort(sort).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid array of sort filter', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const subQuery = `(sort:[{path:["property"],order:asc}])`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    const sort = [{ path: ['property'], order: 'asc' }];

    new Getter(mockClient).withClassName('Person').withFields('name').withSort(sort).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('a query with a valid array of sort filters', () => {
    const mockClient: any = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(sort:[{path:["property1"],order:asc},{path:["property2"],order:asc},{path:["property3"],order:desc}])` +
      `{name}}}`;

    const sort = [
      { path: ['property1'], order: 'asc' },
      { path: ['property2'], order: 'asc' },
      { path: ['property3'], order: 'desc' },
    ];

    new Getter(mockClient).withClassName('Person').withFields('name').withSort(sort).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe('bm25 valid searchers', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  test('query and no properties', () => {
    const subQuery = `(bm25:{query:"accountant"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient).withClassName('Person').withFields('name').withBm25({ query: 'accountant' }).do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and properties', () => {
    const expectedQuery = `{Get{Person(bm25:{query:"accountant",properties:["profession","position"]}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withBm25({ query: 'accountant', properties: ['profession', 'position'] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and empty properties', () => {
    const subQuery = `(bm25:{query:"accountant",properties:[]})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withBm25({ query: 'accountant', properties: [] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe('hybrid valid searchers', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  test('query and no alpha, no vector', () => {
    const subQuery = `(hybrid:{query:"accountant"})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withHybrid({ query: 'accountant' })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and alpha, no vector', () => {
    const subQuery = `(hybrid:{query:"accountant",alpha:0.75})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withHybrid({ query: 'accountant', alpha: 0.75 })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and alpha 0, no vector', () => {
    const subQuery = `(hybrid:{query:"accountant",alpha:0})`;
    const expectedQuery = `{Get{Person` + subQuery + `{name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withHybrid({ query: 'accountant', alpha: 0 })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and vector, no alpha', () => {
    const expectedQuery = `{Get{Person(hybrid:{query:"accountant",vector:[1,2,3]}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withHybrid({ query: 'accountant', vector: [1, 2, 3] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('query and alpha and vector', () => {
    const expectedQuery = `{Get{Person(hybrid:{query:"accountant",alpha:0.75,vector:[1,2,3]}){name}}}`;

    new Getter(mockClient)
      .withClassName('Person')
      .withFields('name')
      .withHybrid({ query: 'accountant', alpha: 0.75, vector: [1, 2, 3] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe('generative search', () => {
  const mockClient: any = {
    query: jest.fn(),
  };

  test('singlePrompt', () => {
    const expectedQuery =
      '{Get{Mammal{name taxonomy _additional{generate(singleResult:' +
      '{prompt:"When did dogs become mans best friend?"}){error singleResult}}}}}';
    new Getter(mockClient)
      .withClassName('Mammal')
      .withGenerate({
        singlePrompt: 'When did dogs become mans best friend?',
      })
      .withFields('name taxonomy')
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('singlePrompt with newlines', () => {
    const expectedQuery =
      '{Get{Mammal{name taxonomy _additional{generate(singleResult:' +
      '{prompt:"Which mammals can survive in Antarctica?"}){error singleResult}}}}}';

    new Getter(mockClient)
      .withClassName('Mammal')
      .withGenerate({
        singlePrompt: `Which mammals 
can survive 
in Antarctica?`,
      })
      .withFields('name taxonomy')
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('groupedTask', () => {
    const expectedQuery =
      '{Get{Mammal{name taxonomy _additional{generate(groupedResult:' +
      '{task:"Explain why platypi can lay eggs"}){error groupedResult}}}}}';

    new Getter(mockClient)
      .withClassName('Mammal')
      .withGenerate({
        groupedTask: 'Explain why platypi can lay eggs',
      })
      .withFields('name taxonomy')
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('groupedTask with newlines', () => {
    const expectedQuery =
      '{Get{Mammal{name taxonomy _additional{generate(groupedResult:' +
      '{task:"Tell me about how polar bears keep warm"}){error groupedResult}}}}}';

    new Getter(mockClient)
      .withClassName('Mammal')
      .withFields('name taxonomy')
      .withGenerate({
        groupedTask: `Tell 
me 
about 
how 
polar 
bears 
keep 
warm`,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test('single prompt and grouped task', () => {
    const expectedQuery =
      '{Get{Mammal{name taxonomy _additional{generate(singleResult:' +
      '{prompt:"How tall is a baby giraffe?"}groupedResult:{task:' +
      '"Explain how the heights of mammals relate to their prefferred food sources"})' +
      '{error singleResult groupedResult}}}}}';

    new Getter(mockClient)
      .withClassName('Mammal')
      .withFields('name taxonomy')
      .withGenerate({
        singlePrompt: 'How tall is a baby giraffe?',
        groupedTask: 'Explain how the heights of mammals relate to their prefferred food sources',
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});
