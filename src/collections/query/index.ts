import Connection from '../../connection';

import { toBase64FromBlob } from '../../utils/base64';

import { WeaviateObject as WeaviateObjectRest } from '../../openapi/types';
import { ObjectsPath } from '../../data/path';
import { DbVersionSupport } from '../../utils/dbVersion';
import { ConsistencyLevel } from '../../data';

import { Filters, FilterValueType, FilterValue } from '../filters';
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
} from '../types';
import { SearchReply } from '../../proto/v1/search_get';

export interface QueryFetchObjectByIdOptions<T> {
  includeVector?: boolean;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryFetchObjectsOptions<T extends Properties> {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: FilterValue;
  sort?: Sorting<T>;
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryOptions<T extends Properties> {
  limit?: number;
  autoLimit?: number;
  filters?: FilterValue;
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

export interface QueryBm25Options<T extends Properties> extends QueryOptions<T> {
  queryProperties?: PrimitiveKeys<T>[];
}

export interface QueryHybridOptions<T extends Properties> extends QueryOptions<T> {
  alpha?: number;
  vector?: number[];
  queryProperties?: PrimitiveKeys<T>[];
  fusionType?: 'Ranked' | 'RelativeScore';
}

export interface QueryNearOptions<T extends Properties> extends QueryOptions<T> {
  certainty?: number;
  distance?: number;
}
export interface QueryGroupByNearOptions<T extends Properties> extends QueryNearOptions<T> {
  groupBy: GroupByOptions<T>;
}

export interface MoveOptions {
  force: number;
  objects?: string[];
  concepts?: string[];
}

export interface QueryNearTextOptions<T extends Properties> extends QueryNearOptions<T> {
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
}

export type QueryNearMediaType = 'audio' | 'depth' | 'image' | 'imu' | 'thermal' | 'video';

class QueryManager<T extends Properties> implements Query<T> {
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
  ): QueryManager<T> {
    return new QueryManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjectById(
    id: string,
    opts?: QueryFetchObjectByIdOptions<T>
  ): Promise<WeaviateObject<T> | null> {
    const path = new ObjectsPath(this.dbVersionSupport);
    return this.connection.search(this.name, this.consistencyLevel, this.tenant).then((search) =>
      search
        .withFetch(Serialize.fetchObjectById({ id, ...opts }))
        .then(Deserialize.query<T>)
        .then((res) => (res.objects.length === 1 ? res.objects[0] : null))
    );
  }

  public fetchObjects(opts?: QueryFetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then(Deserialize.query<T>);
  }

  public bm25(query: string, opts?: QueryBm25Options<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withBm25(Serialize.bm25({ query, ...opts })))
      .then(Deserialize.query<T>);
  }

  public hybrid(query: string, opts?: QueryHybridOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withHybrid(Serialize.hybrid({ query, ...opts })))
      .then(Deserialize.query<T>);
  }

  public nearImage<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    image: string | Blob,
    opts?: O
  ): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => {
        const imagePromise = typeof image === 'string' ? Promise.resolve(image) : toBase64FromBlob(image);
        return imagePromise.then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, ...opts }),
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
        );
      })
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearMedia<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    media: string | Blob,
    type: QueryNearMediaType,
    opts?: O
  ): QueryReturn<O, T> {
    const mediaPromise = typeof media === 'string' ? Promise.resolve(media) : toBase64FromBlob(media);
    return this.connection.search(this.name, this.consistencyLevel, this.tenant).then((search) => {
      let reply: Promise<SearchReply>;
      switch (type) {
        case 'audio':
          reply = mediaPromise.then((media) =>
            search.withNearAudio(Serialize.nearAudio({ audio: media, ...opts }))
          );
          break;
        case 'depth':
          reply = mediaPromise.then((media) =>
            search.withNearDepth(Serialize.nearDepth({ depth: media, ...opts }))
          );
          break;
        case 'image':
          reply = mediaPromise.then((media) =>
            search.withNearImage(Serialize.nearImage({ image: media, ...opts }))
          );
          break;
        case 'imu':
          reply = mediaPromise.then((media) =>
            search.withNearIMU(Serialize.nearIMU({ imu: media, ...opts }))
          );
          break;
        case 'thermal':
          reply = mediaPromise.then((media) =>
            search.withNearThermal(Serialize.nearThermal({ thermal: media, ...opts }))
          );
          break;
        case 'video':
          reply = mediaPromise.then((media) =>
            search.withNearVideo(Serialize.nearVideo({ video: media, ...opts }))
          );
          break;
        default:
          throw new Error(`Invalid media type: ${type}`);
      }
      return reply.then(
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>
      ) as QueryReturn<O, T>;
    });
  }

  public nearObject<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    id: string,
    opts?: O
  ): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, ...opts }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearText<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    query: string | string[],
    opts?: O
  ): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearText({
          ...Serialize.nearText({ query, ...opts }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearVector<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    vector: number[],
    opts?: O
  ): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, ...opts }),
          groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }
}

export interface Query<T extends Properties> {
  fetchObjectById: (id: string, opts?: QueryFetchObjectByIdOptions<T>) => Promise<WeaviateObject<T> | null>;

  fetchObjects: (opts?: QueryFetchObjectsOptions<T>) => Promise<WeaviateReturn<T>>;
  bm25: (query: string, opts?: QueryBm25Options<T>) => Promise<WeaviateReturn<T>>;
  hybrid: (query: string, opts?: QueryHybridOptions<T>) => Promise<WeaviateReturn<T>>;

  nearImage<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    image: string | Blob,
    opts?: O
  ): QueryReturn<O, T>;
  nearMedia<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    media: string | Blob,
    type: QueryNearMediaType,
    opts?: O
  ): QueryReturn<O, T>;
  nearObject<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    id: string,
    opts?: O
  ): QueryReturn<O, T>;
  nearText<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    query: string | string[],
    opts?: O
  ): QueryReturn<O, T>;
  nearVector<O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>>(
    vector: number[],
    opts?: O
  ): QueryReturn<O, T>;
}

export type QueryReturn<
  O extends QueryNearOptions<T> | QueryGroupByNearOptions<T>,
  T extends Properties
> = Promise<O extends QueryGroupByNearOptions<T> ? GroupByReturn<T> : WeaviateReturn<T>>;

export default QueryManager.use;
