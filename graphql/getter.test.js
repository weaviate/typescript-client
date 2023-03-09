import Getter from "./getter";
import { Operator } from "../filters/consts";

test("a simple query without params", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person{name}}}`;

  new Getter(mockClient).withClassName("Person").withFields("name").do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test("a simple query with a limit", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7){name}}}`;

  new Getter(mockClient)
    .withClassName("Person")
    .withFields("name")
    .withLimit(7)
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test("a simple query with a limit and offset", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7,offset:2){name}}}`;

  new Getter(mockClient)
    .withClassName("Person")
    .withFields("name")
    .withOffset(2)
    .withLimit(7)
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test("a simple query with a limit and after", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(limit:7,after:"c6f379dd-94b7-4017-acd3-df769a320c92"){name}}}`;

  new Getter(mockClient)
    .withClassName("Person")
    .withFields("name")
    .withAfter("c6f379dd-94b7-4017-acd3-df769a320c92")
    .withLimit(7)
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

test("a simple query with a group", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const expectedQuery = `{Get{Person(group:{type:merge,force:0.7}){name}}}`;

  new Getter(mockClient)
    .withClassName("Person")
    .withFields("name")
    .withGroup({ type: "merge", force: 0.7 })
    .do();

  expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
});

describe("where filters", () => {
  test("a query with a valid where filter", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(where:{operator:Equal,valueString:"John Doe",path:["name"]})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withWhere({ operator: Operator.EQUAL, valueString: "John Doe", path: ["name"] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  // to prevent a regression on
  // https://github.com/semi-technologies/weaviate-javascript-client/issues/6
  test("a query with a where filter containing a geo query", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(where:{operator:WithinGeoRange,valueGeoRange:` +
      `{geoCoordinates:{latitude:51.51,longitude:-0.09},distance:{max:2000}}` +
      `,path:["name"]})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withWhere({
        operator: Operator.WITHIN_GEO_RANGE,
        valueGeoRange: {
          geoCoordinates: {
            latitude: 51.51,
            longitude: -0.09,
          },
          distance: {
            max: 2000,
          },
        },
        path: ["name"],
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nested where filter", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const nestedWhere = {
      operator: Operator.AND,
      operands: [
        { valueString: "foo", operator: Operator.EQUAL, path: ["foo"] },
        { valueString: "bar", operator: Operator.NOT_EQUAL, path: ["bar"] },
      ],
    };
    const expectedQuery =
      `{Get{Person` +
      `(where:{operator:And,operands:[` +
      `{operator:Equal,valueString:"foo",path:["foo"]},` +
      `{operator:NotEqual,valueString:"bar",path:["bar"]}` +
      `]})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withWhere(nestedWhere)
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid nested where filters", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty where",
        where: {},
        msg: "where filter: operator cannot be empty",
      },
      {
        title: "missing value",
        where: { operator: Operator.EQUAL },
        msg: "where filter: value<Type> cannot be empty",
      },
      {
        title: "missing path",
        where: { operator: Operator.EQUAL, valueString: "foo" },
        msg: "where filter: path cannot be empty",
      },
      {
        title: "path is not an array",
        where: { operator: Operator.EQUAL, valueString: "foo", path: "mypath" },
        msg: "where filter: path must be an array",
      },
      {
        title: "unknown value type",
        where: { operator: Operator.EQUAL, valueWrong: "foo" },
        msg: "where filter: unrecognized value prop 'valueWrong'",
      },
      {
        title: "operands is not an array",
        where: { operator: Operator.AND, operands: {} },
        msg: "where filter: operands must be an array",
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withWhere(t.where)
          .do()
          .then(() => {
            fail("it should have error'd");
          })
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("nearText searchers", () => {
  test("a query with a valid nearText", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearText:{concepts:["foo","bar"]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({ concepts: ["foo", "bar"] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        certainty: 0.7,
        moveTo: { concepts: ["foo"], force: 0.7 },
        moveAwayFrom: { concepts: ["bar"], force: 0.5 },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.3,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        distance: 0.3,
        moveTo: { concepts: ["foo"], force: 0.7 },
        moveAwayFrom: { concepts: ["bar"], force: 0.5 },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters and autocorrect (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5},autocorrect:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        certainty: 0.7,
        moveTo: { concepts: ["foo"], force: 0.7 },
        moveAwayFrom: { concepts: ["bar"], force: 0.5 },
        autocorrect: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters and autocorrect (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{concepts:["foo"],force:0.7},moveAwayFrom:{concepts:["bar"],force:0.5},autocorrect:true})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        distance: 0.7,
        moveTo: { concepts: ["foo"], force: 0.7 },
        moveAwayFrom: { concepts: ["bar"], force: 0.5 },
        autocorrect: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearText and autocorrect set to false", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearText:{concepts:["foo","bar"],autocorrect:false})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({ concepts: ["foo", "bar"], autocorrect: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveTo with objects parameter (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        certainty: 0.7,
        moveTo: { force: 0.7, objects: [{ id: "uuid" }, {beacon: "beacon"}] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveTo with objects parameter (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        distance: 0.7,
        moveTo: { force: 0.7, objects: [{ id: "uuid" }, {beacon: "beacon"}] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveAwayFrom with objects parameter (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveAwayFrom:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        certainty: 0.7,
        moveAwayFrom: { force: 0.7, objects: [{ id: "uuid" }, {beacon: "beacon"}] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveAwayFrom with objects parameter (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveAwayFrom:{objects:[{id:"uuid"},{beacon:"beacon"}],force:0.7}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        distance: 0.7,
        moveAwayFrom: { force: 0.7, objects: [{ id: "uuid" }, {beacon: "beacon"}] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveTo and moveAway with objects parameter (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],certainty:0.7,moveTo:{objects:[{id:"uuid"}],force:0.7},moveAwayFrom:{objects:[{beacon:"beacon"}],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        certainty: 0.7,
        moveTo: { force: 0.7, objects: [{ id: "uuid" }] },
        moveAwayFrom: { force: 0.5, objects: [{ beacon: "beacon" }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with moveTo and moveAway with objects parameter (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearText:{concepts:["foo","bar"],distance:0.7,moveTo:{objects:[{id:"uuid"}],force:0.7},moveAwayFrom:{objects:[{beacon:"beacon"}],force:0.5}})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearText({
        concepts: ["foo", "bar"],
        distance: 0.7,
        moveTo: { force: 0.7, objects: [{ id: "uuid" }] },
        moveAwayFrom: { force: 0.5, objects: [{ beacon: "beacon" }] },
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid nearText searchers", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty nearText",
        nearText: {},
        msg: "nearText filter: concepts cannot be empty",
      },
      {
        title: "concepts of wrong type",
        nearText: { concepts: {} },
        msg: "nearText filter: concepts must be an array",
      },
      {
        title: "certainty of wrong type",
        nearText: { concepts: ["foo"], certainty: "foo" },
        msg: "nearText filter: certainty must be a number",
      },
      {
        title: "distance of wrong type",
        nearText: { concepts: ["foo"], distance: "foo" },
        msg: "nearText filter: distance must be a number",
      },
      {
        title: "moveTo empty object",
        nearText: { concepts: ["foo"], moveTo: {} },
        msg: "nearText filter: moveTo.concepts or moveTo.objects must be present",
      },
      {
        title: "moveTo without force with concepts",
        nearText: { concepts: ["foo"], moveTo: { concepts: ["foo"] } },
        msg: "nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: "moveTo without force with objects",
        nearText: { concepts: ["foo"], moveTo: { objects: [{beacon: "beacon"}] } },
        msg: "nearText filter: moveTo must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: "moveAwayFrom without concepts",
        nearText: { concepts: ["foo"], moveAwayFrom: {} },
        msg: "nearText filter: moveAwayFrom.concepts or moveAwayFrom.objects must be present",
      },
      {
        title: "moveAwayFrom without force with concepts",
        nearText: { concepts: ["foo"], moveAwayFrom: { concepts: ["foo"] } },
        msg:
          "nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: "moveAwayFrom without force with objects",
        nearText: { concepts: ["foo"], moveAwayFrom: { objects: [{id: "uuid"}] } },
        msg:
          "nearText filter: moveAwayFrom must have fields 'concepts' or 'objects' and 'force'",
      },
      {
        title: "autocorrect of wrong type",
        nearText: { concepts: ["foo"], autocorrect: "foo" },
        msg: "nearText filter: autocorrect must be a boolean",
      },
      {
        title: "moveTo with empty objects",
        nearText: { concepts: ["foo"], moveTo: { force: 0.8, objects: {} } },
        msg:
          "nearText filter: moveTo.objects must be an array",
      },
      {
        title: "moveTo with empty object in objects",
        nearText: { concepts: ["foo"], moveTo: { force: 0.8, objects: [{}] } },
        msg:
          "nearText filter: moveTo.objects[0].id or moveTo.objects[0].beacon must be present",
      },
      {
        title: "moveTo with objects[0].id not of string type",
        nearText: { concepts: ["foo"], moveTo: { force: 0.8, objects: [{id: 0.8}] } },
        msg:
          "nearText filter: moveTo.objects[0].id must be string",
      },
      {
        title: "moveTo with objects[0].beacon not of string type",
        nearText: { concepts: ["foo"], moveTo: { force: 0.8, objects: [{beacon: 0.8}] } },
        msg:
          "nearText filter: moveTo.objects[0].beacon must be string",
      },
      {
        title: "moveTo with objects[0].id not of string type and objects[1].beacon not of string type",
        nearText: { concepts: ["foo"], moveTo: { force: 0.8, objects: [{id: 0.8},{beacon: 0.8}] } },
        msg:
          "nearText filter: moveTo.objects[0].id must be string, moveTo.objects[1].beacon must be string",
      },
      {
        title: "moveAwayFrom with empty objects",
        nearText: { concepts: ["foo"], moveAwayFrom: { force: 0.8, objects: {} } },
        msg:
          "nearText filter: moveAwayFrom.objects must be an array",
      },
      {
        title: "moveAwayFrom with empty object in objects",
        nearText: { concepts: ["foo"], moveAwayFrom: { force: 0.8, objects: [{}] } },
        msg:
          "nearText filter: moveAwayFrom.objects[0].id or moveAwayFrom.objects[0].beacon must be present",
      },
      {
        title: "moveAwayFrom with objects[0].id not of string type",
        nearText: { concepts: ["foo"], moveAwayFrom: { force: 0.8, objects: [{id: 0.8}] } },
        msg:
          "nearText filter: moveAwayFrom.objects[0].id must be string",
      },
      {
        title: "moveAwayFrom with objects[0].beacon not of string type",
        nearText: { concepts: ["foo"], moveAwayFrom: { force: 0.8, objects: [{beacon: 0.8}] } },
        msg:
          "nearText filter: moveAwayFrom.objects[0].beacon must be string",
      },
      {
        title: "moveAwayFrom with objects[0].id not of string type and objects[1].beacon not of string type",
        nearText: { concepts: ["foo"], moveAwayFrom: { force: 0.8, objects: [{id: 0.8},{beacon: 0.8}] } },
        msg:
          "nearText filter: moveAwayFrom.objects[0].id must be string, moveAwayFrom.objects[1].beacon must be string",
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withNearText(t.nearText)
          .do()
          .then(() => fail("it should have error'd"))
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("nearVector searchers", () => {
  test("a query with a valid nearVector", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearVector:{vector:[0.1234,0.9876]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearVector({ vector: [0.1234, 0.9876] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearVector:{vector:[0.1234,0.9876],certainty:0.7})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearVector({
        vector: [0.1234, 0.9876],
        certainty: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("with optional parameters (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(nearVector:{vector:[0.1234,0.9876],distance:0.7})` +
      `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearVector({
        vector: [0.1234, 0.9876],
        distance: 0.7,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid nearVector searchers", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty nearVector",
        nearVector: {},
        msg: "nearVector filter: vector cannot be empty",
      },
      {
        title: "vector of wrong type",
        nearVector: { vector: {} },
        msg: "nearVector filter: vector must be an array",
      },
      {
        title: "vector as array of wrong type",
        nearVector: { vector: ["foo"] },
        msg: "nearVector filter: vector elements must be a number",
      },
      {
        title: "certainty of wrong type",
        nearVector: { vector: [0.123, 0.987], certainty: "foo" },
        msg: "nearVector filter: certainty must be a number",
      },
      {
        title: "distance of wrong type",
        nearVector: { vector: [0.123, 0.987], distance: "foo" },
        msg: "nearVector filter: distance must be a number",
      },
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withNearVector(t.nearVector)
          .do()
          .then(() => fail("it should have error'd"))
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("nearObject searchers", () => {
  test("a query with a valid nearObject with id", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearObject:{id:"some-uuid"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearObject({ id: "some-uuid" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearObject with beacon", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearObject:{beacon:"weaviate/some-uuid"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearObject({ beacon: "weaviate/some-uuid" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearObject with all params (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearObject:{id:"some-uuid",beacon:"weaviate/some-uuid",certainty:0.7})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearObject({
        id: "some-uuid",
        beacon: "weaviate/some-uuid",
        certainty: 0.7
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearObject with all params (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearObject:{id:"some-uuid",beacon:"weaviate/some-uuid",distance:0.7})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearObject({
        id: "some-uuid",
        beacon: "weaviate/some-uuid",
        distance: 0.7
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid nearObject searchers", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty nearObject",
        nearObject: {},
        msg: "nearObject filter: id or beacon needs to be set",
      },
      {
        title: "id of wrong type",
        nearObject: { id: {} },
        msg: "nearObject filter: id must be a string",
      },
      {
        title: "beacon of wrong type",
        nearObject: { beacon: {} },
        msg: "nearObject filter: beacon must be a string",
      },
      {
        title: "certainty of wrong type",
        nearObject: { id: "foo", certainty: "foo" },
        msg: "nearObject filter: certainty must be a number",
      },
      {
        title: "distance of wrong type",
        nearObject: { id: "foo", distance: "foo" },
        msg: "nearObject filter: distance must be a number",
      }
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withNearObject(t.nearObject)
          .do()
          .then(() => fail("it should have error'd"))
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("ask searchers", () => {
  test("a query with a valid ask with question", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question and properties", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"]})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?", properties: ["prop1", "prop2"] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question, properties, certainty", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],certainty:0.8})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({
        question: "What is Weaviate?",
        properties: ["prop1", "prop2"],
        certainty: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question, properties, distance", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],distance:0.8})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({
        question: "What is Weaviate?",
        properties: ["prop1", "prop2"],
        distance: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with all params (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],certainty:0.8,autocorrect:true,rerank:true})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({
        question: "What is Weaviate?",
        properties: ["prop1", "prop2"],
        certainty: 0.8,
        autocorrect: true,
        rerank: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with all params (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",properties:["prop1","prop2"],distance:0.8,autocorrect:true,rerank:true})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({
        question: "What is Weaviate?",
        properties: ["prop1", "prop2"],
        distance: 0.8,
        autocorrect: true,
        rerank: true,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question and autocorrect", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",autocorrect:true})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?", autocorrect: true })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question and autocorrect set to false", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",autocorrect:false})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?", autocorrect: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question and rerank", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",rerank:true})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?", rerank: true })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid ask with question and rerank set to false", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(ask:{question:"What is Weaviate?",rerank:false})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withAsk({ question: "What is Weaviate?", rerank: false })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid ask searchers", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty ask",
        ask: {},
        msg: "ask filter: question needs to be set",
      },
      {
        title: "question of wrong type",
        ask: { question: {} },
        msg: "ask filter: question must be a string",
      },
      {
        title: "properties of wrong type",
        ask: { properties: {} },
        msg: "ask filter: properties must be an array",
      },
      {
        title: "certainty of wrong type",
        ask: { question: "foo", certainty: "foo" },
        msg: "ask filter: certainty must be a number",
      },
      {
        title: "distance of wrong type",
        ask: { question: "foo", distance: "foo" },
        msg: "ask filter: distance must be a number",
      },
      {
        title: "autocorrect of wrong type",
        ask: { question: "foo", autocorrect: "foo" },
        msg: "ask filter: autocorrect must be a boolean",
      }
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withAsk(t.ask)
          .do()
          .then(() => fail("it should have error'd"))
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("nearImage searchers", () => {
  test("a query with a valid nearImage with image", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearImage:{image:"iVBORw0KGgoAAAANS"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearImage({ image: "iVBORw0KGgoAAAANS" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearImage with all params (with certainty)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearImage:{image:"iVBORw0KGgoAAAANS",certainty:0.8})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearImage({
        image: "iVBORw0KGgoAAAANS",
        certainty: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearImage with all params (with distance)", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearImage:{image:"iVBORw0KGgoAAAANS",distance:0.8})` + `{name}}}`;

      new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearImage({
        image: "iVBORw0KGgoAAAANS",
        distance: 0.8,
      })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid nearImage with base64 encoded image", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` + `(nearImage:{image:"iVBORw0KGgoAAAANS"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withNearImage({ image: "data:image/png;base64,iVBORw0KGgoAAAANS" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  describe("queries with invalid nearImage searchers", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const tests = [
      {
        title: "an empty nearImage",
        nearImage: {},
        msg: "nearImage filter: image or imageBlob must be present",
      },
      {
        title: "image of wrong type",
        nearImage: { image: {} },
        msg: "nearImage filter: image must be a string",
      },
      {
        title: "certainty of wrong type",
        nearImage: { image: "foo", certainty: "foo" },
        msg: "nearImage filter: certainty must be a number",
      },
      {
        title: "distance of wrong type",
        nearImage: { image: "foo", distance: "foo" },
        msg: "nearImage filter: distance must be a number",
      }
    ];

    tests.forEach((t) => {
      test(t.title, () => {
        new Getter(mockClient)
          .withClassName("Person")
          .withFields("name")
          .withNearImage(t.nearImage)
          .do()
          .then(() => fail("it should have error'd"))
          .catch((e) => {
            expect(e.toString()).toContain(t.msg);
          });
      });
    });
  });
});

describe("sort filters", () => {
  test("a query with a valid sort filter", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(sort:[{path:["property"],order:asc}])` +
      `{name}}}`;

    const sort = { path: ["property"], order: "asc" }

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withSort(sort)
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid array of sort filter", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(sort:[{path:["property"],order:asc}])` +
      `{name}}}`;

    const sort = [{ path: ["property"], order: "asc" }]

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withSort(sort)
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("a query with a valid array of sort filters", () => {
    const mockClient = {
      query: jest.fn(),
    };

    const expectedQuery =
      `{Get{Person` +
      `(sort:[{path:["property1"],order:asc},{path:["property2"],order:asc},{path:["property3"],order:desc}])` +
      `{name}}}`;

    const sort = [
      { path: ["property1"], order: "asc" },
      { path: ["property2"], order: "asc" },
      { path: ["property3"], order: "desc" }
    ]

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withSort(sort)
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe("invalid sort filters", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const tests = [
    {
      name: "empty filter",
      sort: {},
      msg: "Error: invalid usage: Error: sort filter: path needs to be set"
    },
    {
      name: "[empty filter]",
      sort: [{}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: path needs to be set"
    },
    {
      name: "empty path",
      sort: {path:[]},
      msg: "Error: invalid usage: Error: sort filter: path cannot be empty"
    },
    {
      name: "[empty path]",
      sort: [{path:[]}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: path cannot be empty"
    },
    {
      name: "only with order",
      sort: {order: "asc"},
      msg: "Error: invalid usage: Error: sort filter: path needs to be set"
    },
    {
      name: "[only with order]",
      sort: [{order: "asc"}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: path needs to be set"
    },
    {
      name: "with wrong order",
      sort: {order: "asce"},
      msg: "Error: invalid usage: Error: sort filter: order parameter not valid, possible values are: asc, desc"
    },
    {
      name: "[with wrong order]",
      sort: [{order: "desce"}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: order parameter not valid, possible values are: asc, desc"
    },
    {
      name: "with wrong order type",
      sort: {order: 1},
      msg: "Error: invalid usage: Error: sort filter: order must be a string"
    },
    {
      name: "[with wrong order type]",
      sort: [{order: 1}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: order must be a string"
    },
    {
      name: "with proper path but wrong order",
      sort: {path:["prop"], order: "asce"},
      msg: "Error: invalid usage: Error: sort filter: order parameter not valid, possible values are: asc, desc"
    },
    {
      name: "with proper path but wrong order",
      sort: [{path:["prop"], order: "asce"}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 0: sort filter: order parameter not valid, possible values are: asc, desc"
    },
    {
      name: "with wrong path in second argument",
      sort: [{path:["prop"]},{path:[]}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 1: sort filter: path cannot be empty"
    },
    {
      name: "with wrong path in second argument",
      sort: [{path:["prop"]},{path:["prop"],order:"asce"},{path:[]}],
      msg: "Error: invalid usage: Error: sort filter: sort argument at 1: sort filter: order parameter not valid, possible values are: asc, desc, sort argument at 2: sort filter: path cannot be empty"
    },
  ]
  tests.forEach((t) => {
    test(t.name, () => {
      new Getter(mockClient)
        .withClassName("Person")
        .withFields("name")
        .withSort(t.sort)
        .do()
        .then(() => fail("it should have error'd"))
        .catch((e) => {
          expect(e.toString()).toEqual(t.msg);
        });
    });
  });
});

describe("bm25 valid searchers", () => {
  const mockClient = {
    query: jest.fn(),
  };

  test("query and no properties", () => {
    const expectedQuery =
      `{Get{Person` + `(bm25:{query:"accountant"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withBm25({ query: "accountant" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and properties", () => {
    const expectedQuery =
      `{Get{Person` + `(bm25:{query:"accountant",properties:["profession","position"]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withBm25({ query: "accountant", properties: ["profession", "position"] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and empty properties", () => {
    const expectedQuery =
      `{Get{Person` + `(bm25:{query:"accountant",properties:[]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withBm25({ query: "accountant", properties: [] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe("bm25 invalid searchers", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const tests = [
    {
      title: "an empty bm25",
      bm25: {},
      msg: "bm25 filter: query cannot be empty",
    },
    {
      title: "an empty query",
      bm25: { query: ""},
      msg: "bm25 filter: query must be a string",
    },
    {
      title: "query of wrong type",
      bm25: { query: {} },
      msg: "bm25 filter: query must be a string",
    },
    {
      title: "an empty property",
      bm25: { query: "query", properties: [""] },
      msg: "bm25 filter: properties must be an array of strings",
    },
    {
      title: "property of wrong type",
      bm25: { query: "query", properties: [123] },
      msg: "bm25 filter: properties must be an array of strings",
    },
    {
      title: "properties of wrong type",
      bm25: { query: "query", properties: {} },
      msg: "bm25 filter: properties must be an array of strings",
    },
  ];

  tests.forEach((t) => {
    test(t.title, () => {
      new Getter(mockClient)
        .withClassName("Person")
        .withFields("name")
        .withBm25(t.bm25)
        .do()
        .then(() => fail("it should have error'd"))
        .catch((e) => {
          expect(e.toString()).toContain(t.msg);
        });
    });
  });
});


describe("hybrid valid searchers", () => {
  const mockClient = {
    query: jest.fn(),
  };

  test("query and no alpha, no vector", () => {
    const expectedQuery =
      `{Get{Person` + `(hybrid:{query:"accountant"})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withHybrid({ query: "accountant" })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and alpha, no vector", () => {
    const expectedQuery =
      `{Get{Person` + `(hybrid:{query:"accountant",alpha:0.75})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withHybrid({ query: "accountant", alpha: 0.75 })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and alpha 0, no vector", () => {
    const expectedQuery =
      `{Get{Person` + `(hybrid:{query:"accountant",alpha:0})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withHybrid({ query: "accountant", alpha: 0 })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and vector, no alpha", () => {
    const expectedQuery =
      `{Get{Person` + `(hybrid:{query:"accountant",vector:[1,2,3]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withHybrid({ query: "accountant", vector: [1,2,3] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });

  test("query and alpha and vector", () => {
    const expectedQuery =
      `{Get{Person` + `(hybrid:{query:"accountant",alpha:0.75,vector:[1,2,3]})` + `{name}}}`;

    new Getter(mockClient)
      .withClassName("Person")
      .withFields("name")
      .withHybrid({ query: "accountant", alpha: 0.75, vector: [1,2,3] })
      .do();

    expect(mockClient.query).toHaveBeenCalledWith(expectedQuery);
  });
});

describe("hybrid invalid searchers", () => {
  const mockClient = {
    query: jest.fn(),
  };

  const tests = [
    {
      title: "an empty hybrid",
      hybrid: {},
      msg: "hybrid filter: query cannot be empty",
    },
    {
      title: "an empty query",
      hybrid: { query: ""},
      msg: "hybrid filter: query must be a string",
    },
    {
      title: "query of wrong type",
      hybrid: { query: {} },
      msg: "hybrid filter: query must be a string",
    },
    {
      title: "alpha on wrong type",
      hybrid: { query: "query", alpha: "alpha" },
      msg: "hybrid filter: alpha must be a number",
    },
    {
      title: "an empty vector",
      hybrid: { query: "query", vector: [] },
      msg: "hybrid filter: vector must be an array of numbers",
    },
    {
      title: "vector element of wrong type",
      hybrid: { query: "query", vector: ["vector"] },
      msg: "hybrid filter: vector must be an array of numbers",
    },
    {
      title: "vector of wrong type",
      hybrid: { query: "query", vector: {} },
      msg: "hybrid filter: vector must be an array of numbers",
    },
  ];

  tests.forEach((t) => {
    test(t.title, () => {
      new Getter(mockClient)
        .withClassName("Person")
        .withFields("name")
        .withHybrid(t.hybrid)
        .do()
        .then(() => fail("it should have error'd"))
        .catch((e) => {
          expect(e.toString()).toContain(t.msg);
        });
    });
  });
});
