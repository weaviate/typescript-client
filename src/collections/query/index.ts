import Connection from '../../connection/grpc.js';

import { toBase64FromMedia } from '../../utils/base64.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { SearchReply } from '../../proto/v1/search_get.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { GroupByOptions, GroupByReturn, WeaviateObject, WeaviateReturn } from '../types/index.js';

import { WeaviateInvalidInputError, WeaviateUnsupportedFeatureError } from '../../errors.js';
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
  NearVectorInputType,
  Query,
  QueryReturn,
  SearchOptions,
} from './types.js';

class QueryManager<T> implements Query<T> {
  private connection: Connection;
  private name: string;
  private dbVersionSupport: DbVersionSupport;
  private consistencyLevel?: ConsistencyLevel;
  private tenant?: string;

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

  private checkSupportForNamedVectors = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isNamedVectors(opts)) return;
    const check = await this.dbVersionSupport.supportsNamedVectors();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForBm25AndHybridGroupByQueries = async (
    query: 'Bm25' | 'Hybrid',
    opts?: SearchOptions<T> | GroupByOptions<T>
  ) => {
    if (!Serialize.isGroupBy(opts)) return;
    const check = await this.dbVersionSupport.supportsBm25AndHybridGroupByQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message(query));
  };

  private checkSupportForHybridNearTextAndNearVectorSubSearches = async (opts?: HybridOptions<T>) => {
    if (opts?.vector === undefined || Array.isArray(opts.vector)) return;
    const check = await this.dbVersionSupport.supportsHybridNearTextAndNearVectorSubsearchQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForMultiTargetVectorSearch = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isMultiTargetVector(opts)) return false;
    const check = await this.dbVersionSupport.supportsMultiTargetVectorSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private nearSearch = async (opts?: BaseNearOptions<T>) => {
    const [supportsTargets] = await Promise.all([
      this.checkSupportForMultiTargetVectorSearch(opts),
      this.checkSupportForNamedVectors(opts),
    ]);
    return {
      search: await this.connection.search(this.name, this.consistencyLevel, this.tenant),
      supportsTargets,
    };
  };

  private hybridSearch = async (opts?: BaseHybridOptions<T>) => {
    const [supportsTargets] = await Promise.all([
      this.checkSupportForMultiTargetVectorSearch(opts),
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Hybrid', opts),
      this.checkSupportForHybridNearTextAndNearVectorSubSearches(opts),
    ]);
    return {
      search: await this.connection.search(this.name, this.consistencyLevel, this.tenant),
      supportsTargets,
    };
  };

  private async parseReply(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.dbVersionSupport);
    return deserialize.query<T>(reply);
  }

  private async parseGroupByReply(
    opts: SearchOptions<T> | GroupByOptions<T> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.dbVersionSupport);
    return Serialize.isGroupBy(opts) ? deserialize.groupBy<T>(reply) : deserialize.query<T>(reply);
  }

  public fetchObjectById(id: string, opts?: FetchObjectByIdOptions<T>): Promise<WeaviateObject<T> | null> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) => search.withFetch(Serialize.fetchObjectById({ id, ...opts })))
      .then((reply) => this.parseReply(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }

  public fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) => search.withFetch(Serialize.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }

  public bm25(query: string, opts?: BaseBm25Options<T>): Promise<WeaviateReturn<T>>;
  public bm25(query: string, opts: GroupByBm25Options<T>): Promise<GroupByReturn<T>>;
  public bm25(query: string, opts?: Bm25Options<T>): QueryReturn<T> {
    return Promise.all([
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
    ])
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withBm25({
          ...Serialize.bm25({ query, ...opts }),
          groupBy: Serialize.isGroupBy<GroupByBm25Options<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid(query: string, opts?: BaseHybridOptions<T>): Promise<WeaviateReturn<T>>;
  public hybrid(query: string, opts: GroupByHybridOptions<T>): Promise<GroupByReturn<T>>;
  public hybrid(query: string, opts?: HybridOptions<T>): QueryReturn<T> {
    return this.hybridSearch(opts)
      .then(({ search, supportsTargets }) =>
        search.withHybrid({
          ...Serialize.hybrid({ query, supportsTargets, ...opts }),
          groupBy: Serialize.isGroupBy<GroupByHybridOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage(image: string | Buffer, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearImage(image: string | Buffer, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearImage(image: string | Buffer, opts?: NearOptions<T>): QueryReturn<T> {
    return this.nearSearch(opts)
      .then(({ search, supportsTargets }) => {
        return toBase64FromMedia(image).then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, supportsTargets, ...(opts ? opts : {}) }),
            groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
              ? Serialize.groupBy(opts.groupBy)
              : undefined,
          })
        );
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts?: BaseNearOptions<T>
  ): Promise<WeaviateReturn<T>>;
  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts: GroupByNearOptions<T>
  ): Promise<GroupByReturn<T>>;
  public nearMedia(media: string | Buffer, type: NearMediaType, opts?: NearOptions<T>): QueryReturn<T> {
    return this.nearSearch(opts)
      .then(({ search, supportsTargets }) => {
        const args = { supportsTargets, ...(opts ? opts : {}) };
        let reply: Promise<SearchReply>;
        switch (type) {
          case 'audio':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearAudio(Serialize.nearAudio({ audio: media, ...args }))
            );
            break;
          case 'depth':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearDepth(Serialize.nearDepth({ depth: media, ...args }))
            );
            break;
          case 'image':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearImage(Serialize.nearImage({ image: media, ...args }))
            );
            break;
          case 'imu':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearIMU(Serialize.nearIMU({ imu: media, ...args }))
            );
            break;
          case 'thermal':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearThermal(Serialize.nearThermal({ thermal: media, ...args }))
            );
            break;
          case 'video':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearVideo(Serialize.nearVideo({ video: media, ...args }))
            );
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return reply;
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject(id: string, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearObject(id: string, opts?: NearOptions<T>): QueryReturn<T> {
    return this.nearSearch(opts)
      .then(({ search, supportsTargets }) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, supportsTargets, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText(query: string | string[], opts?: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  public nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  public nearText(query: string | string[], opts?: NearTextOptions<T>): QueryReturn<T> {
    return this.nearSearch(opts)
      .then(({ search, supportsTargets }) =>
        search.withNearText({
          ...Serialize.nearText({ query, supportsTargets, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector(vector: NearVectorInputType, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearVector(vector: NearVectorInputType, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearVector(vector: NearVectorInputType, opts?: NearOptions<T>): QueryReturn<T> {
    return this.nearSearch(opts)
      .then(({ search, supportsTargets }) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, supportsTargets, ...(opts ? opts : {}) }),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}

export default QueryManager.use;

export {
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
  HybridNearTextSubSearch,
  HybridNearVectorSubSearch,
  HybridOptions,
  HybridSubSearchBase,
  MoveOptions,
  NearMediaType,
  NearOptions,
  NearTextOptions,
  Query,
  QueryReturn,
  SearchOptions,
} from './types.js';
