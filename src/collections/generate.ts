import Connection from '../connection';

import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import Deserialize from './deserialize';
import Serialize from './serialize';
import {
  QueryFetchObjectsOptions,
  QueryBm25Options,
  QueryHybridOptions,
  QueryNearTextOptions,
  QueryNearOptions,
  QueryNearMediaType,
} from './query';
import {
  GenerativeReturn,
  GenerativeGroupByReturn,
  GroupByOptions,
  Properties,
  WeaviateReturn,
} from './types';
import { SearchReply } from '../proto/v1/search_get';

export interface GenerateOptions<T extends Properties> {
  singlePrompt?: string;
  groupedTask?: string;
  groupedProperties?: (keyof T)[];
}

export interface GenerateFetchObjectsOptions<T extends Properties>
  extends QueryFetchObjectsOptions<T>,
    GenerateOptions<T> {}
export interface GenerateBm25Options<T extends Properties> extends QueryBm25Options<T>, GenerateOptions<T> {}
export interface GenerateHybridOptions<T extends Properties>
  extends QueryHybridOptions<T>,
    GenerateOptions<T> {}
export interface GenerateNearOptions<T extends Properties> extends QueryNearOptions<T>, GenerateOptions<T> {}
export interface GenerateGroupByNearOptions<T extends Properties> extends GenerateNearOptions<T> {
  groupBy: GroupByOptions<T>;
}
export interface GenerateNearTextOptions<T extends Properties>
  extends QueryNearTextOptions<T>,
    GenerateOptions<T> {}
export interface GenerateGroupByNearTextOptions<T extends Properties> extends GenerateNearTextOptions<T> {
  groupBy: GroupByOptions<T>;
}

class GenerateManager<T extends Properties> implements Generate<T> {
  connection: Connection;
  name: string;
  dbVersionSupport: DbVersionSupport;
  consistencyLevel?: ConsistencyLevel;
  tenant?: string;

  private constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }

  public static use<T extends Properties>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): GenerateManager<T> {
    return new GenerateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjects(opts?: GenerateFetchObjectsOptions<T>): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withFetch({
          ...Serialize.fetchObjects(opts),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public bm25(query: string, opts?: GenerateBm25Options<T>): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withBm25({
          ...Serialize.bm25({ query, ...opts }),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public hybrid(query: string, opts?: GenerateHybridOptions<T>): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withHybrid({
          ...Serialize.hybrid({ query, ...opts }),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public nearImage<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    image: string,
    opts?: O
  ): GenerateReturn<O, T> {
    return this.connection.search(this.name).then(
      (search) =>
        search
          .withNearImage({
            ...Serialize.nearImage({ image, ...opts }),
            generative: Serialize.generative(opts),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
          .then((reply) =>
            Serialize.isGenerateGroupBy(opts)
              ? Deserialize.generateGroupBy<T>(reply)
              : Deserialize.generate<T>(reply)
          ) as GenerateReturn<O, T>
    );
  }

  public nearObject<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    id: string,
    opts?: O
  ): GenerateReturn<O, T> {
    return this.connection.search(this.name).then(
      (search) =>
        search
          .withNearObject({
            ...Serialize.nearObject({ id, ...opts }),
            generative: Serialize.generative(opts),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
          .then((reply) =>
            Serialize.isGenerateGroupBy(opts)
              ? Deserialize.generateGroupBy<T>(reply)
              : Deserialize.generate<T>(reply)
          ) as GenerateReturn<O, T>
    );
  }

  public nearText<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    query: string | string[],
    opts?: O
  ): GenerateReturn<O, T> {
    return this.connection.search(this.name).then(
      (search) =>
        search
          .withNearText({
            ...Serialize.nearText({ query, ...opts }),
            generative: Serialize.generative(opts),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
          .then((reply) =>
            Serialize.isGenerateGroupBy(opts)
              ? Deserialize.generateGroupBy<T>(reply)
              : Deserialize.generate<T>(reply)
          ) as GenerateReturn<O, T>
    );
  }

  public nearVector<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    vector: number[],
    opts?: O
  ): GenerateReturn<O, T> {
    return this.connection.search(this.name).then(
      (search) =>
        search
          .withNearVector({
            ...Serialize.nearVector({ vector, ...opts }),
            generative: Serialize.generative(opts),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
          .then((reply) =>
            Serialize.isGenerateGroupBy(opts)
              ? Deserialize.generateGroupBy<T>(reply)
              : Deserialize.generate<T>(reply)
          ) as GenerateReturn<O, T>
    );
  }

  public nearMedia<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    media: string,
    type: QueryNearMediaType,
    opts?: O
  ): GenerateReturn<O, T> {
    return this.connection.search(this.name).then((search) => {
      let reply: Promise<SearchReply>;
      const generative = Serialize.generative(opts);
      const groupBy = Serialize.isGenerateGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined;
      switch (type) {
        case 'audio':
          reply = search.withNearAudio({
            ...Serialize.nearAudio({ audio: media, ...opts }),
            generative,
            groupBy,
          });
          break;
        case 'depth':
          reply = search.withNearDepth({
            ...Serialize.nearDepth({ depth: media, ...opts }),
            generative,
            groupBy,
          });
          break;
        case 'image':
          reply = search.withNearImage({
            ...Serialize.nearImage({ image: media, ...opts }),
            generative,
            groupBy,
          });
          break;
        case 'imu':
          reply = search.withNearIMU({ ...Serialize.nearIMU({ imu: media, ...opts }), generative, groupBy });
          break;
        case 'thermal':
          reply = search.withNearThermal({
            ...Serialize.nearThermal({ thermal: media, ...opts }),
            generative,
            groupBy,
          });
          break;
        case 'video':
          reply = search.withNearVideo({
            ...Serialize.nearVideo({ video: media, ...opts }),
            generative,
            groupBy,
          });
          break;
        default:
          throw new Error(`Invalid media type: ${type}`);
      }
      return reply.then((reply) =>
        groupBy ? Deserialize.generateGroupBy<T>(reply) : Deserialize.generate<T>(reply)
      ) as GenerateReturn<O, T>;
    });
  }
}

export interface Generate<T extends Properties> {
  fetchObjects: (opts?: GenerateFetchObjectsOptions<T>) => Promise<GenerativeReturn<T>>;
  bm25: (query: string, opts?: GenerateBm25Options<T>) => Promise<GenerativeReturn<T>>;
  hybrid: (query: string, opts?: GenerateHybridOptions<T>) => Promise<GenerativeReturn<T>>;

  nearImage<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    image: string,
    opts?: O
  ): GenerateReturn<O, T>;
  nearMedia<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    media: string,
    type: QueryNearMediaType,
    opts?: O
  ): GenerateReturn<O, T>;
  nearObject<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    id: string,
    opts?: O
  ): GenerateReturn<O, T>;
  nearText<O extends GenerateNearTextOptions<T> | GenerateGroupByNearTextOptions<T>>(
    query: string | string[],
    opts?: O
  ): GenerateReturn<O, T>;
  nearVector<O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>>(
    vector: number[],
    opts?: O
  ): GenerateReturn<O, T>;
}

export type GenerateReturn<
  O extends GenerateNearOptions<T> | GenerateGroupByNearOptions<T>,
  T extends Properties
> = Promise<O extends GenerateGroupByNearOptions<T> ? GenerativeGroupByReturn<T> : GenerativeReturn<T>>;

export default GenerateManager.use;
