import Connection from '../connection/grpc.js';

import { ConsistencyLevel } from '../replication.js';
import { DbVersionSupport } from '../utils/dbVersion.js';

import { Deserialize } from '../deserialize/index.js';
import { SearchReply } from '../proto/v1/search_get.js';
import { Serialize } from '../serialize/index.js';
import {
  GroupByOptions,
  GroupByReturn,
  ReturnVectors,
  WeaviateObject,
  WeaviateReturn,
} from '../types/index.js';

import { WeaviateInvalidInputError } from '../errors.js';
import { IncludeVector } from '../types/internal.js';
import { ToBase64FromMedia } from '../utils/base64.js';
import { Check } from './check.js';
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

class QueryManager<T, V, M> implements Query<T, V, M> {
  private check: Check<T, V>;
  private toBase64FromMedia: ToBase64FromMedia<M>;

  private constructor(check: Check<T, V>, toBase64FromMedia: ToBase64FromMedia<M>) {
    this.check = check;
    this.toBase64FromMedia = toBase64FromMedia;
  }

  public static use<T, V, M>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    toBase64FromMedia: ToBase64FromMedia<M>,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): QueryManager<T, V, M> {
    return new QueryManager<T, V, M>(
      new Check<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant),
      toBase64FromMedia
    );
  }

  private async parseReply<RV>(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.query<T, RV>(reply);
  }

  private async parseGroupByReply<RV>(
    opts: SearchOptions<any, any> | GroupByOptions<any> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.queryGroupBy<T, RV>(reply)
      : deserialize.query<T, RV>(reply);
  }

  public fetchObjectById<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts?: FetchObjectByIdOptions<T, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateObject<T, RV> | null> {
    return this.check
      .fetchObjectById(callOpts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjectById({ id, ...opts })))
      .then((reply) => this.parseReply<RV>(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }

  public fetchObjects<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    opts?: FetchObjectsOptions<T, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>> {
    return this.check
      .fetchObjects(callOpts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }

  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: BaseBm25Options<T, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts: GroupByBm25Options<T, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: Bm25Options<T, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .bm25(callOpts)
      .then(({ search }) => search.withBm25(Serialize.search.bm25(query, opts)))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: BaseHybridOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts: GroupByHybridOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: HybridOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .hybridSearch(opts, callOpts)
      .then(async ({ search, supportsVectors }) => ({
        search,
        args: await Serialize.search.hybrid(
          {
            query,
            supportsVectors,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withHybrid(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: M,
    opts?: BaseNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: M,
    opts: GroupByNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: M,
    opts?: NearOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch(callOpts)
      .then(({ search }) => {
        return this.toBase64FromMedia(image).then((image) => ({
          search,
          args: Serialize.search.nearImage(
            {
              image,
            },
            opts
          ),
        }));
      })
      .then(({ search, args }) => search.withNearImage(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: M,
    type: NearMediaType,
    opts?: BaseNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: M,
    type: NearMediaType,
    opts: GroupByNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: M,
    type: NearMediaType,
    opts?: NearOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch(callOpts)
      .then(({ search }) => {
        let send: (media: string) => Promise<SearchReply>;
        switch (type) {
          case 'audio':
            send = (media) => search.withNearAudio(Serialize.search.nearAudio({ audio: media }, opts));
            break;
          case 'depth':
            send = (media) => search.withNearDepth(Serialize.search.nearDepth({ depth: media }, opts));
            break;
          case 'image':
            send = (media) => search.withNearImage(Serialize.search.nearImage({ image: media }, opts));
            break;
          case 'imu':
            send = (media) => search.withNearIMU(Serialize.search.nearIMU({ imu: media }, opts));
            break;
          case 'thermal':
            send = (media) => search.withNearThermal(Serialize.search.nearThermal({ thermal: media }, opts));
            break;
          case 'video':
            send = (media) => search.withNearVideo(Serialize.search.nearVideo({ video: media }));
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return this.toBase64FromMedia(media).then(send);
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts?: BaseNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts: GroupByNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts?: NearOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch(callOpts)
      .then(({ search }) => ({
        search,
        args: Serialize.search.nearObject(
          {
            id,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withNearObject(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    opts?: BaseNearTextOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    opts: GroupByNearTextOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    opts?: NearTextOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch(callOpts)
      .then(({ search }) => ({
        search,
        args: Serialize.search.nearText(
          {
            query,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withNearText(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: NearVectorInputType,
    opts?: BaseNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<WeaviateReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: NearVectorInputType,
    opts: GroupByNearOptions<T, V, I>,
    callOpts?: CallOptions
  ): Promise<GroupByReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: NearVectorInputType,
    opts?: NearOptions<T, V, I>,
    callOpts?: CallOptions
  ): QueryReturn<T, RV> {
    return this.check
      .nearVector(vector, opts, callOpts)
      .then(async ({ search, supportsVectors }) => ({
        search,
        args: await Serialize.search.nearVector(
          {
            vector,
            supportsVectors,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withNearVector(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}

export type CallOptions = {
  abortSignal?: AbortSignal;
};

export default QueryManager.use;
export { queryFactory } from './factories.js';
export {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  Bm25OperatorOptions,
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
  MultiVectorType,
  NearMediaType,
  NearOptions,
  NearTextOptions,
  Query,
  QueryReturn,
  SearchOptions,
  SingleVectorType,
} from './types.js';

export { Bm25Operator } from './utils.js';
