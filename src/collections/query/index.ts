import Connection from '../../connection/grpc.js';

import { toBase64FromBlob } from '../../utils/base64.js';

import { ObjectsPath } from '../../data/path.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { ConsistencyLevel } from '../../data/index.js';

import { FilterValue } from '../filters/index.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { Sorting } from '../sort/index.js';
import {
  QueryMetadata,
  WeaviateObject,
  QueryProperty,
  QueryReference,
  WeaviateReturn,
  GroupByReturn,
  GroupByOptions,
  RerankOptions,
} from '../types/index.js';
import { PrimitiveKeys } from '../types/internal.js';
import { SearchReply } from '../../proto/v1/search_get.js';

/** Options available in the `query.fetchObjectById` method */
export type FetchObjectByIdOptions<T> = {
  /**
   * Whether to include the vector of the object in the response.
   * If using named vectors, pass an array of strings to include only specific vectors.
   */
  includeVector?: boolean | string[];
  /**
   * Which properties of the object to return. Can be primitive, in which case specify their names, or nested, in which case
   * use the QueryNested<T> type. If not specified, all properties are returned.
   */
  returnProperties?: QueryProperty<T>[];
  /**
   * Which references of the object to return. If not specified, no references are returned.
   */
  returnReferences?: QueryReference<T>[];
};

export type FetchObjectsOptions<T> = {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: FilterValue;
  sort?: Sorting<T>;
  includeVector?: boolean | string[];
  returnMetadata?: QueryMetadata;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

export type QueryOptions<T> = {
  limit?: number;
  offset?: number;
  autoLimit?: number;
  filters?: FilterValue;
  rerank?: RerankOptions<T>;
  includeVector?: boolean | string[];
  returnMetadata?: QueryMetadata;
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
        .then((reply) => Deserialize.generate<T>(reply))
        .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null))
    );
  }

  public fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then((reply) => Deserialize.generate<T>(reply));
  }

  public bm25(query: string, opts?: Bm25Options<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withBm25(Serialize.bm25({ query, ...opts })))
      .then((reply) => Deserialize.generate<T>(reply));
  }

  public hybrid(query: string, opts?: HybridOptions<T>): Promise<WeaviateReturn<T>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withHybrid(Serialize.hybrid({ query, ...opts })))
      .then((reply) => Deserialize.generate<T>(reply));
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
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
      return reply.then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
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
      .then((reply) =>
        Serialize.isGroupBy(opts) ? Deserialize.groupBy<T>(reply) : Deserialize.query<T>(reply)
      );
  }
}

export interface Query<T> {
  /**
   * Retrieve an object from the server by its UUID.
   *
   * @param {string} id - The UUID of the object to retrieve.
   * @param {FetchObjectByIdOptions} [opts] - The available options for fetching the object.
   * @returns {Promise<WeaviateObject<T> | null>} - The object with the given UUID, or null if it does not exist.
   */
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

  /**
   * @overload
   * @param {number[]} vector - The vector to search for.
   * @returns {Promise<WeaviateReturn<T>>} - The objects found by the search.
   */
  nearVector(vector: number[]): Promise<WeaviateReturn<T>>;
  /**
   * @overload
   * @param {number[]} vector - The vector to search for.
   * @param {BaseNearOptions<T>} opts - The available options for the search excluding the `groupBy` param.
   * @returns {Promise<WeaviateReturn<T>>} - The objects found by the search.
   */
  nearVector(vector: number[], opts: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  /**
   * @overload
   * @param {number[]} vector - The vector to search for.
   * @param {GroupByNearOptions<T>} opts - The available options for the search including the `groupBy` param.
   * @returns {Promise<GroupByReturn<T>>} - The grouped objects found by the search.
   */
  nearVector(vector: number[], opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  /**
   * Search for objects by vector in this collection using and vector-based similarity search.
   *
   * See the [docs](https://weaviate.io/developers/weaviate/search/similarity) for a more detailed explanation.
   *
   * @param {number[]} vector - The vector to search for.
   * @param {BaseNearOptions<T> | GroupByNearOptions<T> | undefined} [opts] - The available options for the search.
   * @returns {Promise<WeaviateReturn<T> | GroupByReturn<T>>} - The objects found by the search.
   */
  nearVector(vector: number[], opts?: NearOptions<T>): QueryReturn<T>;
}

export type NearOptions<T> = BaseNearOptions<T> | GroupByNearOptions<T> | undefined;

export type NearTextOptions<T> = BaseNearTextOptions<T> | GroupByNearTextOptions<T> | undefined;

export type QueryReturn<T> = Promise<WeaviateReturn<T>> | Promise<GroupByReturn<T>>;

export default QueryManager.use;
