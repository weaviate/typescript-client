export type { Query, QueryReturn } from './types.js';

import Connection from '../../connection/grpc.js';

import { toBase64FromBlob } from '../../utils/base64.js';

import { ObjectsPath } from '../../data/path.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { ConsistencyLevel } from '../../data/index.js';

import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { WeaviateObject, WeaviateReturn, GroupByReturn } from '../types/index.js';
import { SearchReply } from '../../proto/v1/search_get.js';

import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  Bm25Options,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  GroupByBm25Options,
  GroupByHybridOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
  HybridOptions,
  NearMediaType,
  NearOptions,
  NearTextOptions,
  Query,
  QueryReturn,
} from './types.js';

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
        .then((reply) => Deserialize.generate<T>(reply))
        .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null))
    );
  }

  public fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then((reply) => Deserialize.query<T>(reply));
  }

  public bm25(query: string, opts?: BaseBm25Options<T>): Promise<WeaviateReturn<T>>;
  public bm25(query: string, opts: GroupByBm25Options<T>): Promise<GroupByReturn<T>>;
  public bm25(query: string, opts?: Bm25Options<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withBm25({
          ...Serialize.bm25({ query, ...opts }),
          groupBy: Serialize.isGroupBy<GroupByBm25Options<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }

  public hybrid(query: string, opts?: BaseHybridOptions<T>): Promise<WeaviateReturn<T>>;
  public hybrid(query: string, opts: GroupByHybridOptions<T>): Promise<GroupByReturn<T>>;
  public hybrid(query: string, opts?: HybridOptions<T>): QueryReturn<T> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) =>
        search.withHybrid({
          ...Serialize.hybrid({ query, ...opts }),
          groupBy: Serialize.isGroupBy<GroupByHybridOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }

  public nearImage(image: string | Blob, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }

  public nearMedia(
    media: string | Blob,
    type: NearMediaType,
    opts?: BaseNearOptions<T>
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
      return reply.then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
    });
  }

  public nearObject(id: string, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }

  public nearText(query: string | string[], opts?: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }

  public nearVector(vector: number[], opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }
}

export default QueryManager.use;
