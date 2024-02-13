/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate from '..';
import { v4 } from 'uuid';
import { DataObject } from './types';
import { CrossReference, Reference } from './references';
import { Metrics } from './aggregate';

type TestCollectionAggregate = {
  text: string;
  texts: string[];
  int: number;
  ints: number[];
  number: number;
  numbers: number[];
  date: string;
  dates: string[];
  boolean: boolean;
  booleans: boolean[];
  ref?: CrossReference<TestCollectionAggregate>;
};

describe('Testing of the collection.aggregate methods', () => {
  const client = weaviate.next({
    http: {
      secure: false,
      host: 'localhost',
      port: 8080,
    },
    grpc: {
      secure: false,
      host: 'localhost',
      port: 50051,
    },
  });

  const className = 'TestCollectionAggregate';
  const collection = client.collections.get<TestCollectionAggregate>(className);

  const date0 = '2023-01-01T00:00:00Z';
  const date1 = '2023-01-01T00:00:00Z';
  const date2 = '2023-01-02T00:00:00Z';
  const dateMid = '2023-01-01T12:00:00Z';

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
            name: 'text',
            dataType: 'text',
          },
          {
            name: 'texts',
            dataType: 'text[]',
          },
          {
            name: 'int',
            dataType: 'int',
          },
          {
            name: 'ints',
            dataType: 'int[]',
          },
          {
            name: 'number',
            dataType: 'number',
          },
          {
            name: 'numbers',
            dataType: 'number[]',
          },
          {
            name: 'date',
            dataType: 'date',
          },
          {
            name: 'dates',
            dataType: 'date[]',
          },
          {
            name: 'boolean',
            dataType: 'boolean',
          },
          {
            name: 'booleans',
            dataType: 'boolean[]',
          },
          // {
          //   name: 'ref',
          //   dataType: [className],
          // },
        ],
      })
      .then(async () => {
        const data: DataObject<TestCollectionAggregate>[] = [];
        for (let i = 0; i < 100; i++) {
          data.push({
            properties: {
              text: 'test',
              texts: ['tests', 'tests'],
              int: 1,
              ints: [1, 2],
              number: 1.0,
              numbers: [1.0, 2.0],
              date: date0,
              dates: [date1, date2],
              boolean: true,
              booleans: [true, false],
            },
          });
        }
        const res = await collection.data.insertMany(data);
        return res;
      });
    // .then(async (res) => {
    //   const uuid1 = res.uuids[0];
    //   await collection.data.referenceAddMany({
    //     refs: Object.values(res.uuids).map((uuid) => {
    //       return {
    //         fromProperty: 'ref',
    //         fromUuid: uuid1,
    //         reference: Reference.to({ uuids: [uuid] })
    //       }
    //     })
    //   })
    // })
  });

  it('should aggregate data without a search and no property metrics', async () => {
    const result = await collection.aggregate.overAll();
    expect(result.totalCount).toEqual(100);
  });

  it('should aggregate grouped by data without a search and no property metrics', async () => {
    const result = await collection.aggregate.groupBy.overAll({ groupBy: 'text' });
    expect(result.length).toEqual(1);
    expect(result[0].totalCount).toEqual(100);
    expect(result[0].groupedBy.prop).toEqual('text');
    expect(result[0].groupedBy.value).toEqual('test');
  });

  it('should aggregate data without a search and one property metric', async () => {
    const result = await collection.aggregate.overAll({
      returnMetrics: Metrics.aggregate('text').text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
    });
    expect(result.totalCount).toEqual(100);
    expect(result.properties?.text.count).toEqual(100);
    expect(result.properties?.text.topOccurrences![0].occurs).toEqual(100);
    expect(result.properties?.text.topOccurrences![0].value).toEqual('test');
  });

  it('should aggregate data without a search and all property metrics', async () => {
    const result = await collection.aggregate.overAll({
      returnMetrics: [
        Metrics.aggregate('text').text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
        Metrics.aggregate('texts').text(['count', 'topOccurrencesOccurs', 'topOccurrencesValue']),
        Metrics.aggregate('int').integer(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        Metrics.aggregate('ints').integer(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        Metrics.aggregate('number').number(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        Metrics.aggregate('numbers').number(['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum']),
        Metrics.aggregate('date').date(['count', 'maximum', 'median', 'minimum', 'mode']),
        Metrics.aggregate('dates').date(['count', 'maximum', 'median', 'minimum', 'mode']),
        Metrics.aggregate('boolean').boolean([
          'count',
          'percentageFalse',
          'percentageTrue',
          'totalFalse',
          'totalTrue',
        ]),
        Metrics.aggregate('booleans').boolean([
          'count',
          'percentageFalse',
          'percentageTrue',
          'totalFalse',
          'totalTrue',
        ]),
        // Metrics.aggregate('ref').reference(['pointingTo'])
      ],
    });
    expect(result.totalCount).toEqual(100);
    expect(result.properties?.text.count).toEqual(100);
    expect(result.properties?.text.topOccurrences![0].occurs).toEqual(100);
    expect(result.properties?.text.topOccurrences![0].value).toEqual('test');
    expect(result.properties?.texts.count).toEqual(200);
    expect(result.properties?.texts.topOccurrences![0].occurs).toEqual(200);
    expect(result.properties?.texts.topOccurrences![0].value).toEqual('tests');
    expect(result.properties?.int.count).toEqual(100);
    expect(result.properties?.int.maximum).toEqual(1);
    expect(result.properties?.int.mean).toEqual(1);
    expect(result.properties?.int.median).toEqual(1);
    expect(result.properties?.int.minimum).toEqual(1);
    expect(result.properties?.int.mode).toEqual(1);
    expect(result.properties?.int.sum).toEqual(100);
    expect(result.properties?.ints.count).toEqual(200);
    expect(result.properties?.ints.maximum).toEqual(2);
    expect(result.properties?.ints.mean).toEqual(1.5);
    expect(result.properties?.ints.median).toEqual(1.5);
    expect(result.properties?.ints.minimum).toEqual(1);
    expect(result.properties?.ints.mode).toEqual(1);
    expect(result.properties?.ints.sum).toEqual(300);
    expect(result.properties?.number.count).toEqual(100);
    expect(result.properties?.number.maximum).toEqual(1);
    expect(result.properties?.number.mean).toEqual(1);
    expect(result.properties?.number.median).toEqual(1);
    expect(result.properties?.number.minimum).toEqual(1);
    expect(result.properties?.number.mode).toEqual(1);
    expect(result.properties?.number.sum).toEqual(100);
    expect(result.properties?.numbers.count).toEqual(200);
    expect(result.properties?.numbers.maximum).toEqual(2);
    expect(result.properties?.numbers.mean).toEqual(1.5);
    expect(result.properties?.numbers.median).toEqual(1.5);
    expect(result.properties?.numbers.minimum).toEqual(1);
    expect(result.properties?.numbers.mode).toEqual(1);
    expect(result.properties?.numbers.sum).toEqual(300);
    expect(result.properties?.date.count).toEqual(100);
    expect(result.properties?.date.maximum).toEqual(date0);
    expect(result.properties?.date.median).toEqual(date0);
    expect(result.properties?.date.minimum).toEqual(date0);
    expect(result.properties?.date.mode).toEqual(date0);
    expect(result.properties?.dates.count).toEqual(200);
    expect(result.properties?.dates.maximum).toEqual(date2);
    expect(result.properties?.dates.median).toEqual(dateMid);
    expect(result.properties?.dates.minimum).toEqual(date1);
    // expect(result.properties?.dates.mode).toEqual(date1); // randomly switches between date1 and date2
    expect(result.properties?.boolean.count).toEqual(100);
    expect(result.properties?.boolean.percentageFalse).toEqual(0);
    expect(result.properties?.boolean.percentageTrue).toEqual(1);
    expect(result.properties?.boolean.totalFalse).toEqual(0);
    expect(result.properties?.boolean.totalTrue).toEqual(100);
    expect(result.properties?.booleans.count).toEqual(200);
    expect(result.properties?.booleans.percentageFalse).toEqual(0.5);
    expect(result.properties?.booleans.percentageTrue).toEqual(0.5);
    expect(result.properties?.booleans.totalFalse).toEqual(100);
    expect(result.properties?.booleans.totalTrue).toEqual(100);
    // expect(result.properties?.ref.pointingTo).toEqual(className);
  });
});
