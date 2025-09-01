import Connection from '../../connection/grpc.js';

import { toBase64FromMedia } from '../../utils/base64.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { SearchReply } from '../../proto/v1/search_get.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import {
  GroupByOptions,
  GroupByReturn,
  ReturnVectors,
  WeaviateObject,
  WeaviateReturn,
} from '../types/index.js';

import { WeaviateInvalidInputError } from '../../errors.js';
import { IncludeVector } from '../types/internal.js';
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

class QueryManager<T, V> implements Query<T, V> {
  private check: Check<T, V>;

  private constructor(check: Check<T, V>) {
    this.check = check;
  }

  public static use<T, V>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): QueryManager<T, V> {
    return new QueryManager<T, V>(
      new Check<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant)
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
    opts?: FetchObjectByIdOptions<T, I>
  ): Promise<WeaviateObject<T, RV> | null> {
    return this.check
      .fetchObjectById()
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjectById({ id, ...opts })))
      .then((reply) => this.parseReply<RV>(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }

  public fetchObjects<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    opts?: FetchObjectsOptions<T, I>
  ): Promise<WeaviateReturn<T, RV>> {
    return this.check
      .fetchObjects()
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }

  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: BaseBm25Options<T, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts: GroupByBm25Options<T, I>
  ): Promise<GroupByReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: Bm25Options<T, I>
  ): QueryReturn<T, RV> {
    return this.check
      .bm25()
      .then(({ search }) => search.withBm25(Serialize.search.bm25(query, opts)))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: BaseHybridOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts: GroupByHybridOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    opts?: HybridOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .hybridSearch(opts)
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
    image: string | Buffer,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: string | Buffer,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: string | Buffer,
    opts?: NearOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch()
      .then(({ search }) => {
        return toBase64FromMedia(image).then((image) => ({
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
    media: string | Buffer,
    type: NearMediaType,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: string | Buffer,
    type: NearMediaType,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: string | Buffer,
    type: NearMediaType,
    opts?: NearOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch()
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
        return toBase64FromMedia(media).then(send);
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    opts?: NearOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch()
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
    opts?: BaseNearTextOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    opts: GroupByNearTextOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    opts?: NearTextOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .nearSearch()
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
    opts?: BaseNearOptions<T, V, I>
  ): Promise<WeaviateReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: NearVectorInputType,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GroupByReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: NearVectorInputType,
    opts?: NearOptions<T, V, I>
  ): QueryReturn<T, RV> {
    return this.check
      .nearVector(vector, opts)
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
  NearMediaType,
  NearOptions,
  NearTextOptions,
  Query,
  QueryReturn,
  SearchOptions,
} from './types.js';

export { Bm25Operator } from './utils.js';
