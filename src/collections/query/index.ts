import Connection from '../../connection/grpc';

import { toBase64FromBlob } from '../../utils/base64';

import { ObjectsPath } from '../../data/path';
import { DbVersionSupport } from '../../utils/dbVersion';
import { ConsistencyLevel } from '../../data';

import { FilterValue } from '../filters';
import Deserialize from '../deserialize';
import Serialize from '../serialize';
import { Sorting } from '../sort';
import {
  MetadataQuery,
  WeaviateObject,
  QueryProperty,
  QueryReference,
  Properties,
  WeaviateReturn,
  GroupByReturn,
  PrimitiveKeys,
  GroupByOptions,
  QueryVector,
  Vectors,
} from '../types';
import { SearchReply } from '../../proto/v1/search_get';

export interface QueryFetchObjectByIdOptions<T, V> {
  includeVector?: boolean | V;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryFetchObjectsOptions<T, V> {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: FilterValue;
  sort?: Sorting<T>;
  includeVector?: V extends (infer U)[] ? boolean | U[] : boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryOptions<T, V> {
  limit?: number;
  autoLimit?: number;
  filters?: FilterValue;
  includeVector?: V extends (infer U)[] ? boolean | U[] : boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryBm25Options<T, V> extends QueryOptions<T, V> {
  queryProperties?: PrimitiveKeys<T>[];
}

export interface QueryHybridOptions<T, V> extends QueryOptions<T, V> {
  alpha?: number;
  vector?: number[];
  queryProperties?: PrimitiveKeys<T>[];
  fusionType?: 'Ranked' | 'RelativeScore';
  targetVector?: string;
}

export interface QueryBaseNearOptions<T, V> extends QueryOptions<T, V> {
  certainty?: number;
  distance?: number;
  targetVector?: V extends (infer U)[] ? U : string;
}
export interface QueryGroupByNearOptions<T, V> extends QueryBaseNearOptions<T, V> {
  groupBy: GroupByOptions<T>;
}

export interface MoveOptions {
  force: number;
  objects?: string[];
  concepts?: string[];
}

export interface QueryNearTextOptions<T, V> extends QueryBaseNearOptions<T, V> {
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
}

export type QueryNearMediaType = 'audio' | 'depth' | 'image' | 'imu' | 'thermal' | 'video';

class QueryManager<T extends Properties, V extends Vectors> implements Query<T, V> {
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
  ): QueryManager<T, V> {
    return new QueryManager<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjectById(
    id: string,
    opts?: QueryFetchObjectByIdOptions<T, V>
  ): Promise<WeaviateObject<T, V> | null> {
    const path = new ObjectsPath(this.dbVersionSupport);
    return this.connection.search(this.name, this.consistencyLevel, this.tenant).then((search) =>
      search
        .withFetch(Serialize.fetchObjectById({ id, ...opts }))
        .then(Deserialize.query<T, V>)
        .then((res) => (res.objects.length === 1 ? res.objects[0] : null))
    );
  }

  public fetchObjects(opts?: QueryFetchObjectsOptions<T, V>): Promise<WeaviateReturn<T, V>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then(Deserialize.query<T, V>);
  }

  public bm25(query: string, opts?: QueryBm25Options<T, V>): Promise<WeaviateReturn<T, V>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withBm25(Serialize.bm25({ query, ...opts })))
      .then(Deserialize.query<T, V>);
  }

  public hybrid(query: string, opts?: QueryHybridOptions<T, V>): Promise<WeaviateReturn<T, V>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withHybrid(Serialize.hybrid({ query, ...opts })))
      .then(Deserialize.query<T, V>);
  }

  public nearImage<O extends QueryNearOptions<T, V>>(image: string | Blob, opts?: O): QueryReturn<O, T, V> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => {
        const imagePromise = typeof image === 'string' ? Promise.resolve(image) : toBase64FromBlob(image);
        return imagePromise.then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, ...(opts ? opts : {}) }),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
        );
      })
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T, V> : Deserialize.query<T, V>) as QueryReturn<
      O,
      T,
      V
    >;
  }

  public nearMedia<O extends QueryNearOptions<T, V>>(
    media: string | Blob,
    type: QueryNearMediaType,
    opts?: O
  ): QueryReturn<O, T, V> {
    const mediaPromise = typeof media === 'string' ? Promise.resolve(media) : toBase64FromBlob(media);
    return this.connection.search(this.name, this.consistencyLevel, this.tenant).then((search) => {
      let reply: Promise<SearchReply>;
      switch (type) {
        case 'audio':
          reply = mediaPromise.then((media) =>
            search.withNearAudio(Serialize.nearAudio({ audio: media, ...(opts ? opts : {}) }))
          );
          break;
        case 'depth':
          reply = mediaPromise.then((media) =>
            search.withNearDepth(Serialize.nearDepth({ depth: media, ...(opts ? opts : {}) }))
          );
          break;
        case 'image':
          reply = mediaPromise.then((media) =>
            search.withNearImage(Serialize.nearImage({ image: media, ...(opts ? opts : {}) }))
          );
          break;
        case 'imu':
          reply = mediaPromise.then((media) =>
            search.withNearIMU(Serialize.nearIMU({ imu: media, ...(opts ? opts : {}) }))
          );
          break;
        case 'thermal':
          reply = mediaPromise.then((media) =>
            search.withNearThermal(Serialize.nearThermal({ thermal: media, ...(opts ? opts : {}) }))
          );
          break;
        case 'video':
          reply = mediaPromise.then((media) =>
            search.withNearVideo(Serialize.nearVideo({ video: media, ...(opts ? opts : {}) }))
          );
          break;
        default:
          throw new Error(`Invalid media type: ${type}`);
      }
      return reply.then(
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T, V> : Deserialize.query<T, V>
      ) as QueryReturn<O, T, V>;
    });
  }

  public nearObject<O extends QueryNearOptions<T, V>>(id: string, opts?: O): QueryReturn<O, T, V> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T, V> : Deserialize.query<T, V>) as QueryReturn<
      O,
      T,
      V
    >;
  }

  public nearText<O extends QueryNearOptions<T, V>>(
    query: string | string[],
    opts?: O
  ): QueryReturn<O, T, V> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearText({
          ...Serialize.nearText({ query, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T, V> : Deserialize.query<T, V>) as QueryReturn<
      O,
      T,
      V
    >;
  }

  public nearVector<O extends QueryNearOptions<T, V>>(vector: number[], opts?: O): QueryReturn<O, T, V> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T, V> : Deserialize.query<T, V>) as QueryReturn<
      O,
      T,
      V
    >;
  }
}

export interface Query<T extends Properties, V extends Vectors> {
  fetchObjectById: (
    id: string,
    opts?: QueryFetchObjectByIdOptions<T, V>
  ) => Promise<WeaviateObject<T, V> | null>;

  fetchObjects: (opts?: QueryFetchObjectsOptions<T, V>) => Promise<WeaviateReturn<T, V>>;
  bm25: (query: string, opts?: QueryBm25Options<T, V>) => Promise<WeaviateReturn<T, V>>;
  hybrid: (query: string, opts?: QueryHybridOptions<T, V>) => Promise<WeaviateReturn<T, V>>;

  nearImage<O extends QueryNearOptions<T, V>>(image: string | Blob, opts?: O): QueryReturn<O, T, V>;
  nearMedia<O extends QueryNearOptions<T, V>>(
    media: string | Blob,
    type: QueryNearMediaType,
    opts?: O
  ): QueryReturn<O, T, V>;
  nearObject<O extends QueryNearOptions<T, V>>(id: string, opts?: O): QueryReturn<O, T, V>;
  nearText<O extends QueryNearOptions<T, V>>(query: string | string[], opts?: O): QueryReturn<O, T, V>;
  nearVector<O extends QueryNearOptions<T, V>>(vector: number[], opts?: O): QueryReturn<O, T, V>;
}

export type QueryNearOptions<T, V> = QueryBaseNearOptions<T, V> | QueryGroupByNearOptions<T, V> | undefined;

export type QueryReturn<O, T, V> = Promise<
  O extends QueryGroupByNearOptions<T, V> ? GroupByReturn<T, V> : WeaviateReturn<T, V>
>;

export default QueryManager.use;
