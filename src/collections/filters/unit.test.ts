import maker, { Filters } from '.';
import { CrossReference } from '../references';
import Serialize from '../serialize';

describe('Unit testing of filters', () => {
  type Person = {
    name: string;
    age: number;
    self: CrossReference<Person>;
  };
  const filter = maker<Person>();

  describe('for properties', () => {
    it('should create an is null filter', () => {
      const f = filter.byProperty('name').isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          property: 'name',
        },
        value: true,
      });
    });

    it('should create a contains all filter', () => {
      const f = filter.byProperty('name').containsAll(['John', 'Doe']);
      expect(f).toEqual({
        operator: 'ContainsAll',
        target: {
          property: 'name',
        },
        value: ['John', 'Doe'],
      });
    });

    it('should create a contains any filter', () => {
      const f = filter.byProperty('name').containsAny(['John', 'Doe']);
      expect(f).toEqual({
        operator: 'ContainsAny',
        target: {
          property: 'name',
        },
        value: ['John', 'Doe'],
      });
    });

    it('should create an equal filter', () => {
      const f = filter.byProperty('name').equal('John');
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          property: 'name',
        },
        value: 'John',
      });
    });

    it('should create an not equal filter', () => {
      const f = filter.byProperty('name').notEqual('John');
      expect(f).toEqual({
        operator: 'NotEqual',
        target: {
          property: 'name',
        },
        value: 'John',
      });
    });

    it('should create a less than filter', () => {
      const f = filter.byProperty('age').lessThan(18);
      expect(f).toEqual({
        operator: 'LessThan',
        target: {
          property: 'age',
        },
        value: 18,
      });
    });

    it('should create a less than or equal filter', () => {
      const f = filter.byProperty('age').lessOrEqual(18);
      expect(f).toEqual({
        operator: 'LessThanEqual',
        target: {
          property: 'age',
        },
        value: 18,
      });
    });

    it('should create a greater than filter', () => {
      const f = filter.byProperty('age').greaterThan(18);
      expect(f).toEqual({
        operator: 'GreaterThan',
        target: {
          property: 'age',
        },
        value: 18,
      });
    });

    it('should create a greater than or equal filter', () => {
      const f = filter.byProperty('age').greaterOrEqual(18);
      expect(f).toEqual({
        operator: 'GreaterThanEqual',
        target: {
          property: 'age',
        },
        value: 18,
      });
    });

    it('should create a like filter', () => {
      const f = filter.byProperty('name').like('John');
      expect(f).toEqual({
        operator: 'Like',
        target: {
          property: 'name',
        },
        value: 'John',
      });
    });

    it('should create a geo range filter', () => {
      const f = filter.byProperty<any>('location').withinGeoRange({
        latitude: 1,
        longitude: 2,
        distance: 3,
      });
      expect(f).toEqual({
        operator: 'WithinGeoRange',
        target: {
          property: 'location',
        },
        value: {
          latitude: 1,
          longitude: 2,
          distance: 3,
        },
      });
    });
  });

  describe('for reference counts', () => {
    it('should create an equal filter', () => {
      const f = filter.byRefCount('self').equal(2);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });

    it('should create a not equal than filter', () => {
      const f = filter.byRefCount('self').notEqual(2);
      expect(f).toEqual({
        operator: 'NotEqual',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });

    it('should create a less than filter', () => {
      const f = filter.byRefCount('self').lessThan(2);
      expect(f).toEqual({
        operator: 'LessThan',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });

    it('should create a less than or equal filter', () => {
      const f = filter.byRefCount('self').lessOrEqual(2);
      expect(f).toEqual({
        operator: 'LessThanEqual',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });

    it('should create a greater than filter', () => {
      const f = filter.byRefCount('self').greaterThan(2);
      expect(f).toEqual({
        operator: 'GreaterThan',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });

    it('should create a greater than or equal filter', () => {
      const f = filter.byRefCount('self').greaterOrEqual(2);
      expect(f).toEqual({
        operator: 'GreaterThanEqual',
        target: {
          count: {
            on: 'self',
          },
        },
        value: 2,
      });
    });
  });

  describe('for single target references', () => {
    it('should create a property filter', () => {
      const f = filter.byRef('self').byProperty('name').isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          singleTarget: {
            on: 'self',
            target: {
              property: 'name',
            },
          },
        },
        value: true,
      });
    });

    it('should create an ID filter', () => {
      const f = filter.byRef('self').byId().equal('123');
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          singleTarget: {
            on: 'self',
            target: {
              property: '_id',
            },
          },
        },
        value: '123',
      });
    });

    it('should create a creation time filter', () => {
      const now = new Date();
      const f = filter.byRef('self').byCreationTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          singleTarget: {
            on: 'self',
            target: {
              property: '_creationTimeUnix',
            },
          },
        },
        value: now.toISOString(),
      });
    });

    it('should create a update time filter', () => {
      const now = new Date();
      const f = filter.byRef('self').byUpdateTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          singleTarget: {
            on: 'self',
            target: {
              property: '_lastUpdateTimeUnix',
            },
          },
        },
        value: now.toISOString(),
      });
    });

    it('should create a nested reference filter', () => {
      const f = filter.byRef('self').byRef('self').byProperty('name').isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          singleTarget: {
            on: 'self',
            target: {
              singleTarget: {
                on: 'self',
                target: {
                  property: 'name',
                },
              },
            },
          },
        },
        value: true,
      });
    });
  });

  describe('for multiple target references', () => {
    it('should create a property filter', () => {
      const f = filter.byRefMultiTarget('self', 'Person').byProperty('name').isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              property: 'name',
            },
          },
        },
        value: true,
      });
    });

    it('should create an ID filter', () => {
      const f = filter.byRefMultiTarget('self', 'Person').byId().equal('123');
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              property: '_id',
            },
          },
        },
        value: '123',
      });
    });

    it('should create a creation time filter', () => {
      const now = new Date();
      const f = filter.byRefMultiTarget('self', 'Person').byCreationTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              property: '_creationTimeUnix',
            },
          },
        },
        value: now.toISOString(),
      });
    });

    it('should create a update time filter', () => {
      const now = new Date();
      const f = filter.byRefMultiTarget('self', 'Person').byUpdateTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              property: '_lastUpdateTimeUnix',
            },
          },
        },
        value: now.toISOString(),
      });
    });

    it('should create a nested single target reference filter', () => {
      const f = filter.byRefMultiTarget('self', 'Person').byRef('self').byProperty('name').isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              singleTarget: {
                on: 'self',
                target: {
                  property: 'name',
                },
              },
            },
          },
        },
        value: true,
      });
    });

    it('should create a nested multi target reference filter', () => {
      const f = filter
        .byRefMultiTarget('self', 'Person')
        .byRefMultiTarget('self', 'Person')
        .byProperty('name')
        .isNull(true);
      expect(f).toEqual({
        operator: 'IsNull',
        target: {
          multiTarget: {
            on: 'self',
            targetCollection: 'Person',
            target: {
              multiTarget: {
                on: 'self',
                targetCollection: 'Person',
                target: {
                  property: 'name',
                },
              },
            },
          },
        },
        value: true,
      });
    });
  });

  describe('for ID', () => {
    it('should create an equal filter', () => {
      const f = filter.byId().equal('123');
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          property: '_id',
        },
        value: '123',
      });
    });

    it('should create a not equal filter', () => {
      const f = filter.byId().notEqual('123');
      expect(f).toEqual({
        operator: 'NotEqual',
        target: {
          property: '_id',
        },
        value: '123',
      });
    });

    it('should create a contains any filter', () => {
      const f = filter.byId().containsAny(['123', '456']);
      expect(f).toEqual({
        operator: 'ContainsAny',
        target: {
          property: '_id',
        },
        value: ['123', '456'],
      });
    });
  });

  describe('for creation time', () => {
    it('should create an equal filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a not equal filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().notEqual(now);
      expect(f).toEqual({
        operator: 'NotEqual',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a less than filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().lessThan(now);
      expect(f).toEqual({
        operator: 'LessThan',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a less than or equal filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().lessOrEqual(now);
      expect(f).toEqual({
        operator: 'LessThanEqual',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a greater than filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().greaterThan(now);
      expect(f).toEqual({
        operator: 'GreaterThan',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a greater than or equal filter', () => {
      const now = new Date();
      const f = filter.byCreationTime().greaterOrEqual(now);
      expect(f).toEqual({
        operator: 'GreaterThanEqual',
        target: {
          property: '_creationTimeUnix',
        },
        value: now.toISOString(),
      });
    });
  });

  describe('for update time', () => {
    it('should create an equal filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().equal(now);
      expect(f).toEqual({
        operator: 'Equal',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a not equal filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().notEqual(now);
      expect(f).toEqual({
        operator: 'NotEqual',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a less than filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().lessThan(now);
      expect(f).toEqual({
        operator: 'LessThan',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a less than or equal filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().lessOrEqual(now);
      expect(f).toEqual({
        operator: 'LessThanEqual',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a greater than filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().greaterThan(now);
      expect(f).toEqual({
        operator: 'GreaterThan',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });

    it('should create a greater than or equal filter', () => {
      const now = new Date();
      const f = filter.byUpdateTime().greaterOrEqual(now);
      expect(f).toEqual({
        operator: 'GreaterThanEqual',
        target: {
          property: '_lastUpdateTimeUnix',
        },
        value: now.toISOString(),
      });
    });
  });

  describe('for the REST schema', () => {
    const anyFilter = maker<any>();
    it('should map a text property filter', () => {
      const f = filter.byProperty('name').equal('John');
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['name'],
        valueText: 'John',
      });
    });

    it('should map an int property filter', () => {
      const f = filter.byProperty('age').equal(18);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['age'],
        valueInt: 18,
      });
    });

    it('should map a boolean property filter', () => {
      const f = anyFilter.byProperty('isAdult').equal(true);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['isAdult'],
        valueBoolean: true,
      });
    });

    it('should map a float property filter', () => {
      const f = anyFilter.byProperty('age').equal(18.5);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['age'],
        valueNumber: 18.5,
      });
    });

    it('should map a date property filter', () => {
      const now = new Date();
      const f = anyFilter.byProperty('date').equal(now);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['date'],
        valueDate: now.toISOString(),
      });
    });

    it('should map a text array property filter', () => {
      const f = anyFilter.byProperty('names').equal(['John', 'Doe']);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['names'],
        valueTextArray: ['John', 'Doe'],
      });
    });

    it('should map an int array property filter', () => {
      const f = anyFilter.byProperty('ages').equal([18, 19]);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['ages'],
        valueIntArray: [18, 19],
      });
    });

    it('should map a boolean array property filter', () => {
      const f = anyFilter.byProperty('bools').equal([true, false]);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['bools'],
        valueBooleanArray: [true, false],
      });
    });

    it('should map a float array property filter', () => {
      const f = anyFilter.byProperty('ages').equal([18.5, 19.5]);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['ages'],
        valueNumberArray: [18.5, 19.5],
      });
    });

    it('should map a date array property filter', () => {
      const now1 = new Date();
      const now2 = new Date();
      const f = anyFilter.byProperty('dates').equal([now1, now2]);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Equal',
        path: ['dates'],
        valueDateArray: [now1.toISOString(), now2.toISOString()],
      });
    });

    it('should map a geo range property filter', () => {
      const f = anyFilter.byProperty('location').withinGeoRange({
        latitude: 1,
        longitude: 2,
        distance: 3,
      });
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'WithinGeoRange',
        path: ['location'],
        valueGeoRange: {
          geoCoordinates: {
            latitude: 1,
            longitude: 2,
          },
          distance: {
            max: 3,
          },
        },
      });
    });

    it('should map a single target reference filter', () => {
      const f = filter.byRef('self').byProperty('name').isNull(true);
      expect(() => Serialize.filtersREST(f)).toThrow(
        'Cannot use Filter.byRef() in the aggregate API currently. Instead use Filter.byRefMultiTarget() and specify the target collection explicitly.'
      );
    });

    it('should map a multi target reference filter', () => {
      const f = filter.byRefMultiTarget('self', 'Person').byProperty('name').isNull(true);
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'IsNull',
        path: ['self', 'Person', 'name'],
        valueBoolean: true,
      });
    });

    it('should map an AND filter', () => {
      const f = Filters.and(filter.byProperty('name').equal('John'), filter.byProperty('age').equal(18));
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'And',
        operands: [
          {
            operator: 'Equal',
            path: ['name'],
            valueText: 'John',
          },
          {
            operator: 'Equal',
            path: ['age'],
            valueInt: 18,
          },
        ],
      });
    });

    it('should map an OR filter', () => {
      const f = Filters.or(filter.byProperty('name').equal('John'), filter.byProperty('age').equal(18));
      const s = Serialize.filtersREST(f);
      expect(s).toEqual({
        operator: 'Or',
        operands: [
          {
            operator: 'Equal',
            path: ['name'],
            valueText: 'John',
          },
          {
            operator: 'Equal',
            path: ['age'],
            valueInt: 18,
          },
        ],
      });
    });
  });
});
