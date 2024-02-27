import Connection from '../../connection/grpc';

import { DbVersionSupport } from '../../utils/dbVersion';
import { ConsistencyLevel } from '../../data';

import Deserialize from '../deserialize';
import Serialize from '../serialize';
import {
  QueryFetchObjectsOptions,
  QueryBm25Options,
  QueryHybridOptions,
  QueryNearTextOptions,
  QueryBaseNearOptions,
  QueryNearMediaType,
} from '../query';
import { GenerativeReturn, GenerativeGroupByReturn, GroupByOptions, Properties, Vectors } from '../types';
import { SearchReply } from '../../proto/v1/search_get';

export interface GenerateOptions<T extends Properties> {
  singlePrompt?: string;
  groupedTask?: string;
  groupedProperties?: (keyof T)[];
}

export interface GenerateFetchObjectsOptions<T extends Properties, V extends Vectors>
  extends QueryFetchObjectsOptions<T, V>,
    GenerateOptions<T> {}
export interface GenerateBm25Options<T extends Properties, V extends Vectors>
  extends QueryBm25Options<T, V>,
    GenerateOptions<T> {}
export interface GenerateHybridOptions<T extends Properties, V extends Vectors>
  extends QueryHybridOptions<T, V>,
    GenerateOptions<T> {}
export interface GenerateNearOptions<T extends Properties, V extends Vectors>
  extends QueryBaseNearOptions<T, V>,
    GenerateOptions<T> {}
export interface GenerateGroupByNearOptions<T extends Properties, V extends Vectors>
  extends GenerateNearOptions<T, V> {
  groupBy: GroupByOptions<T>;
}
export interface GenerateNearTextOptions<T extends Properties, V extends Vectors>
  extends QueryNearTextOptions<T, V>,
    GenerateOptions<T> {}
export interface GenerateGroupByNearTextOptions<T extends Properties, V extends Vectors>
  extends GenerateNearTextOptions<T, V> {
  groupBy: GroupByOptions<T>;
}

class GenerateManager<T extends Properties, V extends Vectors> implements Generate<T, V> {
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

  public static use<T extends Properties, V extends Vectors>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): GenerateManager<T, V> {
    return new GenerateManager<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjects(opts?: GenerateFetchObjectsOptions<T, V>): Promise<GenerativeReturn<T, V>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withFetch({
          ...Serialize.fetchObjects(opts),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T, V>)
    );
  }

  public bm25(query: string, opts?: GenerateBm25Options<T, V>): Promise<GenerativeReturn<T, V>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withBm25({
          ...Serialize.bm25({ query, ...opts }),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T, V>)
    );
  }

  public hybrid(query: string, opts?: GenerateHybridOptions<T, V>): Promise<GenerativeReturn<T, V>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withHybrid({
          ...Serialize.hybrid({ query, ...opts }),
          generative: Serialize.generative(opts),
        })
        .then(Deserialize.generate<T, V>)
    );
  }

  public nearImage<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    image: string,
    opts?: O
  ): GenerateReturn<O, T, V> {
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
              ? Deserialize.generateGroupBy<T, V>(reply)
              : Deserialize.generate<T, V>(reply)
          ) as GenerateReturn<O, T, V>
    );
  }

  public nearObject<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    id: string,
    opts?: O
  ): GenerateReturn<O, T, V> {
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
              ? Deserialize.generateGroupBy<T, V>(reply)
              : Deserialize.generate<T, V>(reply)
          ) as GenerateReturn<O, T, V>
    );
  }

  public nearText<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    query: string | string[],
    opts?: O
  ): GenerateReturn<O, T, V> {
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
              ? Deserialize.generateGroupBy<T, V>(reply)
              : Deserialize.generate<T, V>(reply)
          ) as GenerateReturn<O, T, V>
    );
  }

  public nearVector<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    vector: number[],
    opts?: O
  ): GenerateReturn<O, T, V> {
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
              ? Deserialize.generateGroupBy<T, V>(reply)
              : Deserialize.generate<T, V>(reply)
          ) as GenerateReturn<O, T, V>
    );
  }

  public nearMedia<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    media: string,
    type: QueryNearMediaType,
    opts?: O
  ): GenerateReturn<O, T, V> {
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
        groupBy ? Deserialize.generateGroupBy<T, V>(reply) : Deserialize.generate<T, V>(reply)
      ) as GenerateReturn<O, T, V>;
    });
  }
}

export interface Generate<T extends Properties, V extends Vectors> {
  fetchObjects: (opts?: GenerateFetchObjectsOptions<T, V>) => Promise<GenerativeReturn<T, V>>;
  bm25: (query: string, opts?: GenerateBm25Options<T, V>) => Promise<GenerativeReturn<T, V>>;
  hybrid: (query: string, opts?: GenerateHybridOptions<T, V>) => Promise<GenerativeReturn<T, V>>;

  nearImage<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    image: string,
    opts?: O
  ): GenerateReturn<O, T, V>;
  nearMedia<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    media: string,
    type: QueryNearMediaType,
    opts?: O
  ): GenerateReturn<O, T, V>;
  nearObject<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    id: string,
    opts?: O
  ): GenerateReturn<O, T, V>;
  nearText<O extends GenerateNearTextOptions<T, V> | GenerateGroupByNearTextOptions<T, V>>(
    query: string | string[],
    opts?: O
  ): GenerateReturn<O, T, V>;
  nearVector<O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>>(
    vector: number[],
    opts?: O
  ): GenerateReturn<O, T, V>;
}

export type GenerateReturn<
  O extends GenerateNearOptions<T, V> | GenerateGroupByNearOptions<T, V>,
  T extends Properties,
  V extends Vectors
> = Promise<
  O extends GenerateGroupByNearOptions<T, V> ? GenerativeGroupByReturn<T, V> : GenerativeReturn<T, V>
>;

export default GenerateManager.use;
