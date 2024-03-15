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
  GroupByOptions,
} from '../types';
import { PrimitiveKeys } from '../types/internal';
import { SearchReply } from '../../proto/v1/search_get';

export type FetchObjectByIdOptions<T> = {
  includeVector?: boolean | string[];
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type FetchObjectsOptions<T> = {
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
  offset?: number;
  autoLimit?: number;
  filters?: FilterValue;
  includeVector?: boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type Bm25Options<T> = QueryOptions<T> & {
  queryProperties?: PrimitiveKeys<T>[];
};

export type HybridOptions<T> = QueryOptions<T> & {
  alpha?: number;
  vector?: number[];
  queryProperties?: PrimitiveKeys<T>[];
  fusionType?: 'Ranked' | 'RelativeScore';
  targetVector?: string;
};

export type BaseNearOptions<T> = QueryOptions<T> & {
  certainty?: number;
  distance?: number;
  targetVector?: string;
};
export type GroupByNearOptions<T> = BaseNearOptions<T> & {
  groupBy: GroupByOptions<T>;
};

export type MoveOptions = {
  force: number;
  objects?: string[];
  concepts?: string[];
};

export type BaseNearTextOptions<T> = BaseNearOptions<T> & {
  moveTo?: MoveOptions;
  moveAway?: MoveOptions;
};
export type GroupByNearTextOptions<T> = BaseNearTextOptions<T> & {
  groupBy: GroupByOptions<T>;
};

export type NearMediaType = 'audio' | 'depth' | 'image' | 'imu' | 'thermal' | 'video';

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

  public fetchObjectById(id: string, opts?: FetchObjectByIdOptions<T>): Promise<WeaviateObject<T> | null> {
    const path = new ObjectsPath(this.dbVersionSupport);
    return this.connection.search(this.name, this.consistencyLevel, this.tenant).then((search) =>
      search
        .withFetch(Serialize.fetchObjectById({ id, ...opts }))
        .then(Deserialize.query<T>)
        .then((res) => (res.objects.length === 1 ? res.objects[0] : null))
    );
  }

  public fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then(Deserialize.query<T>);
  }

  public bm25(query: string, opts?: Bm25Options<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withBm25(Serialize.bm25({ query, ...opts })))
      .then(Deserialize.query<T>);
  }

  public hybrid(query: string, opts?: HybridOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withHybrid(Serialize.hybrid({ query, ...opts })))
      .then(Deserialize.query<T>);
  }

  public nearImage(image: string | Blob): Promise<WeaviateReturn<T>>;
  public nearImage(image: string | Blob, opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearImage(image: string | Blob, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearImage(image: string | Blob, opts?: NearOptions<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => {
        const imagePromise = typeof image === 'string' ? Promise.resolve(image) : toBase64FromBlob(image);
        return imagePromise.then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, ...(opts ? opts : {}) }),
            groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
              ? Serialize.groupBy(opts.groupBy)
              : undefined,
          })
        );
      })
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>);
  }

  public nearMedia(media: string | Blob, type: NearMediaType): Promise<WeaviateReturn<T>>;
  public nearMedia(
    media: string | Blob,
    type: NearMediaType,
    opts: BaseNearOptions<T>
  ): Promise<WeaviateReturn<T>>;
  public nearMedia(
    media: string | Blob,
    type: NearMediaType,
    opts: GroupByNearOptions<T>
  ): Promise<GroupByReturn<T>>;
  public nearMedia(media: string | Blob, type: NearMediaType, opts?: NearOptions<T>): QueryReturn<T> {
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
      return reply.then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>);
    });
  }

  public nearObject(id: string): Promise<WeaviateReturn<T>>;
  public nearObject(id: string, opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearObject(id: string, opts?: NearOptions<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>) as QueryReturn<T>;
  }

  public nearText(query: string | string[]): Promise<WeaviateReturn<T>>;
  public nearText(query: string | string[], opts: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  public nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  public nearText(query: string | string[], opts?: NearTextOptions<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearText({
          ...Serialize.nearText({ query, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>);
  }

  public nearVector(vector: number[]): Promise<WeaviateReturn<T>>;
  public nearVector(vector: number[], opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearVector(vector: number[], opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearVector(vector: number[], opts?: NearOptions<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then(Serialize.isGroupBy(opts) ? Deserialize.groupBy<T> : Deserialize.query<T>);
  }
}

export interface Query<T> {
  fetchObjectById: (id: string, opts?: FetchObjectByIdOptions<T>) => Promise<WeaviateObject<T> | null>;

  fetchObjects: (opts?: FetchObjectsOptions<T>) => Promise<WeaviateReturn<T>>;
  bm25: (query: string, opts?: Bm25Options<T>) => Promise<WeaviateReturn<T>>;
  hybrid: (query: string, opts?: HybridOptions<T>) => Promise<WeaviateReturn<T>>;

  nearImage(image: string | Blob): Promise<WeaviateReturn<T>>;
  nearImage(image: string | Blob, opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearImage(image: string | Blob, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  nearImage(image: string | Blob, opts?: NearOptions<T>): QueryReturn<T>;

  nearMedia(media: string | Blob, type: NearMediaType): Promise<WeaviateReturn<T>>;
  nearMedia(media: string | Blob, type: NearMediaType, opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearMedia(
    media: string | Blob,
    type: NearMediaType,
    opts: GroupByNearOptions<T>
  ): Promise<GroupByReturn<T>>;
  nearMedia(media: string | Blob, type: NearMediaType, opts?: NearOptions<T>): QueryReturn<T>;

  nearObject(id: string): Promise<WeaviateReturn<T>>;
  nearObject(id: string, opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  nearObject(id: string, opts?: NearOptions<T>): QueryReturn<T>;

  nearText(query: string | string[]): Promise<WeaviateReturn<T>>;
  nearText(query: string | string[], opts: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  nearText(query: string | string[], opts?: NearTextOptions<T>): QueryReturn<T>;

  nearVector(vector: number[]): Promise<WeaviateReturn<T>>;
  nearVector(vector: number[], opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearVector(vector: number[], opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  nearVector(vector: number[], opts?: NearOptions<T>): QueryReturn<T>;
}

export type NearOptions<T> = BaseNearOptions<T> | GroupByNearOptions<T> | undefined;

export type NearTextOptions<T> = BaseNearTextOptions<T> | GroupByNearTextOptions<T> | undefined;

export type QueryReturn<T> = Promise<WeaviateReturn<T>> | Promise<GroupByReturn<T>>;

export default QueryManager.use;
