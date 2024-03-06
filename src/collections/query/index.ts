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
  WeaviateReturn,
  GroupByReturn,
  PrimitiveKeys,
  GroupByOptions,
} from '../types';
import { SearchReply } from '../../proto/v1/search_get';

export type QueryFetchObjectByIdOptions<T> = {
  includeVector?: boolean | string[];
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type QueryFetchObjectsOptions<T> = {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: FilterValue;
  sort?: Sorting<T>;
  includeVector?: boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type QueryOptions<T> = {
  limit?: number;
  autoLimit?: number;
  filters?: FilterValue;
  includeVector?: boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type QueryBm25Options<T> = QueryOptions<T> & {
  queryProperties?: PrimitiveKeys<T>[];
};

export type QueryHybridOptions<T> = QueryOptions<T> & {
  alpha?: number;
  vector?: number[];
  queryProperties?: PrimitiveKeys<T>[];
  fusionType?: 'Ranked' | 'RelativeScore';
  targetVector?: string;
};

export type QueryBaseNearOptions<T> = QueryOptions<T> & {
  certainty?: number;
  distance?: number;
  targetVector?: string;
};
export type QueryGroupByNearOptions<T> = QueryBaseNearOptions<T> & {
  groupBy: GroupByOptions<T>;
};

export type MoveOptions = {
  force: number;
  objects?: string[];
  concepts?: string[];
};

export type QueryBaseNearTextOptions<T> = QueryBaseNearOptions<T> & {
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
};
export type QueryGroupByNearTextOptions<T> = QueryBaseNearTextOptions<T> & {
  groupBy: GroupByOptions<T>;
};

export type QueryNearMediaType = 'audio' | 'depth' | 'image' | 'imu' | 'thermal' | 'video';

class QueryManager<T> implements Query<T> {
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

  public static use<T>(
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

  public nearImage<O extends QueryNearOptions<T>>(image: string | Blob, opts?: O): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => {
        const imagePromise = typeof image === 'string' ? Promise.resolve(image) : toBase64FromBlob(image);
        return imagePromise.then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, ...(opts ? opts : {}) }),
            groupBy: Serialize.isGroupBy<QueryGroupByNearOptions<T>>(opts)
              ? Serialize.groupBy(opts.groupBy)
              : undefined,
          })
        );
      })
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearMedia<O extends QueryNearOptions<T>>(
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
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>
      ) as QueryReturn<O, T>;
    });
  }

  public nearObject<O extends QueryNearOptions<T>>(id: string, opts?: O): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<QueryGroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearText<O extends QueryNearTextOptions<T>>(query: string | string[], opts?: O): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearText({
          ...Serialize.nearText({ query, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<QueryGroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }

  public nearVector<O extends QueryNearOptions<T>>(vector: number[], opts?: O): QueryReturn<O, T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<QueryGroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<O, T>;
  }
}

export interface Query<T> {
  fetchObjectById: (id: string, opts?: QueryFetchObjectByIdOptions<T>) => Promise<WeaviateObject<T> | null>;

  fetchObjects: (opts?: QueryFetchObjectsOptions<T>) => Promise<WeaviateReturn<T>>;
  bm25: (query: string, opts?: QueryBm25Options<T>) => Promise<WeaviateReturn<T>>;
  hybrid: (query: string, opts?: QueryHybridOptions<T>) => Promise<WeaviateReturn<T>>;

  nearImage<O extends QueryNearOptions<T>>(image: string | Blob, opts?: O): QueryReturn<O, T>;
  nearMedia<O extends QueryNearOptions<T>>(
    media: string | Blob,
    type: QueryNearMediaType,
    opts?: O
  ): QueryReturn<O, T>;
  nearObject<O extends QueryNearOptions<T>>(id: string, opts?: O): QueryReturn<O, T>;
  nearText<O extends QueryNearTextOptions<T>>(query: string | string[], opts?: O): QueryReturn<O, T>;
  nearVector<O extends QueryNearOptions<T>>(vector: number[], opts?: O): QueryReturn<O, T>;
}

export type QueryNearOptions<T> = QueryBaseNearOptions<T> | QueryGroupByNearOptions<T> | undefined;

export type QueryNearTextOptions<T> =
  | QueryBaseNearTextOptions<T>
  | QueryGroupByNearTextOptions<T>
  | undefined;

export type QueryReturn<O, T> = Promise<
  O extends QueryGroupByNearOptions<T> ? GroupByReturn<T> : WeaviateReturn<T>
>;

export default QueryManager.use;
