/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import weaviate, { WeaviateClient } from '../../index.js';
import { Collection } from '../collection/index.js';

describe('Testing of the Sort class with a simple collection', () => {
  let client: WeaviateClient;
  type Name = 'TestCollectionSortSimple';
  let collection: Collection<TestType, Name>;
  let collections: (Collection<TestType, Name> | Collection<any, Name>)[];
  const collectionName = 'TestCollectionSortSimple';
  let ids = [
    'd9ebd143-83aa-46c6-80ca-98730debe78c',
    'd9ebd143-83aa-46c6-80ca-98730debe78d',
    'd9ebd143-83aa-46c6-80ca-98730debe78e',
    'd9ebd143-83aa-46c6-80ca-98730debe78f',
  ];

  type TestType = {
    text: string;
    int: number;
    float: number;
    date: Date;
    isCool: boolean;
    nullable?: string;
  };

  afterAll(() => {
    return client.collections.delete(collectionName).catch((err) => {
      console.error(err);
      throw err;
    });
  });

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = client.collections.use(collectionName);
    collections = [collection, client.collections.use(collectionName)];
    ids = await client.collections
      .create({
        name: collectionName,
        properties: [
          {
            name: 'text',
            dataType: 'text',
          },
          {
            name: 'int',
            dataType: 'int',
          },
          {
            name: 'float',
            dataType: 'number',
          },
          {
            name: 'date',
            dataType: 'date',
          },
          {
            name: 'nullable',
            dataType: 'text',
          },
          {
            name: 'isCool',
            dataType: 'boolean',
          },
        ],
      })
      .catch((err) => {
        throw err;
      })
      .then(() =>
        collection.data.insertMany([
          {
            properties: {
              text: 'one',
              int: 1,
              float: 1.1,
              date: new Date('2021-01-01'),
              isCool: true,
            },
            id: ids[0],
          },
          {
            properties: {
              text: 'two',
              int: 2,
              float: 2.2,
              date: new Date('2021-01-02'),
              isCool: false,
            },
            id: ids[1],
          },
          {
            properties: {
              text: 'three',
              int: 3,
              float: 3.3,
              date: new Date('2021-01-03'),
              isCool: false,
            },
            id: ids[2],
          },
          {
            properties: {
              text: 'four',
              int: 4,
              float: 4.4,
              date: new Date('2021-01-04'),
              isCool: false,
              nullable: 'oi',
            },
            id: ids[3],
          },
        ])
      )
      .then((res) => {
        if (res.hasErrors) {
          console.error(res.errors);
          throw new Error('Failed to insert objects');
        }
        return Object.values(res.uuids);
      })
      .catch((err) => {
        throw err;
      });
    return ids;
  });

  it('should sort by text ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('text'),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.text)).toEqual(['four', 'one', 'three', 'two'])
          )
      )
    );
  });

  it('should sort by text descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('text', false),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.text)).toEqual(['two', 'three', 'one', 'four'])
          )
      )
    );
  });

  it('should sort by int ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('int'),
          })
          .then((res) => expect(res.objects.map((o) => o.properties.int)).toEqual([1, 2, 3, 4]))
      )
    );
  });

  it('should sort by int descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('int', false),
          })
          .then((res) => expect(res.objects.map((o) => o.properties.int)).toEqual([4, 3, 2, 1]))
      )
    );
  });

  it('should sort by float ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('float'),
          })
          .then((res) => expect(res.objects.map((o) => o.properties.float)).toEqual([1.1, 2.2, 3.3, 4.4]))
      )
    );
  });

  it('should sort by float descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('float', false),
          })
          .then((res) => expect(res.objects.map((o) => o.properties.float)).toEqual([4.4, 3.3, 2.2, 1.1]))
      )
    );
  });

  it('should sort by date ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('date'),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.date)).toEqual([
              new Date('2021-01-01'),
              new Date('2021-01-02'),
              new Date('2021-01-03'),
              new Date('2021-01-04'),
            ])
          )
      )
    );
  });

  it('should sort by date descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('date', false),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.date)).toEqual([
              new Date('2021-01-04'),
              new Date('2021-01-03'),
              new Date('2021-01-02'),
              new Date('2021-01-01'),
            ])
          )
      )
    );
  });

  it('should sort by boolean ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('isCool'),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.isCool)).toEqual([false, false, false, true])
          )
      )
    );
  });

  it('should sort by boolean descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('isCool', false),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.isCool)).toEqual([true, false, false, false])
          )
      )
    );
  });

  it('should sort with nullable ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('nullable'),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.nullable)).toEqual([
              undefined,
              undefined,
              undefined,
              'oi',
            ])
          )
      )
    );
  });

  it('should sort with nullable descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byProperty('nullable', false),
          })
          .then((res) =>
            expect(res.objects.map((o) => o.properties.nullable)).toEqual([
              'oi',
              undefined,
              undefined,
              undefined,
            ])
          )
      )
    );
  });

  it('should sort by id ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byId(),
          })
          .then((res) => expect(res.objects.map((o) => o.uuid)).toEqual(ids))
      )
    );
  });

  it('should sort by id descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byId(false),
          })
          .then((res) => expect(res.objects.map((o) => o.uuid)).toEqual(ids.slice().reverse()))
      )
    );
  });

  it('should sort by creation time ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byCreationTime(),
            returnMetadata: ['creationTime'],
          })
          .then((res) =>
            expect(res.objects.map((o) => o.metadata?.creationTime?.getTime()!)).toEqual(
              res.objects.map((o) => o.metadata?.creationTime?.getTime()!).sort((a, b) => a - b)
            )
          )
      )
    );
  });

  it('should sort by creation time descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byCreationTime(false),
            returnMetadata: ['creationTime'],
          })
          .then((res) =>
            expect(res.objects.map((o) => o.metadata?.updateTime?.getTime()!)).toEqual(
              res.objects.map((o) => o.metadata?.updateTime?.getTime()!).sort((a, b) => b - a)
            )
          )
      )
    );
  });

  it('should sort by update time ascending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byUpdateTime(),
            returnMetadata: ['updateTime'],
          })
          .then((res) =>
            expect(res.objects.map((o) => o.metadata?.updateTime?.getTime()!)).toEqual(
              res.objects.map((o) => o.metadata?.updateTime?.getTime()!).sort((a, b) => a - b)
            )
          )
      )
    );
  });

  it('should sort by update time descending', async () => {
    await Promise.all(
      collections.map((c) =>
        c.query
          .fetchObjects({
            sort: collection.sort.byUpdateTime(false),
            returnMetadata: ['updateTime'],
          })
          .then((res) =>
            expect(res.objects.map((o) => o.metadata?.updateTime?.getTime()!)).toEqual(
              res.objects.map((o) => o.metadata?.updateTime?.getTime()!).sort((a, b) => b - a)
            )
          )
      )
    );
  });
});
