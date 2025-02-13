import Connection from '../../connection/grpc.js';

import { toBase64FromMedia } from '../../utils/base64.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { SearchReply } from '../../proto/v1/search_get.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { GroupByOptions, GroupByReturn, WeaviateObject, WeaviateReturn } from '../types/index.js';

import { WeaviateInvalidInputError } from '../../errors.js';
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

  private async parseReply(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.query<T, V>(reply);
  }

  private async parseGroupByReply(
    opts: SearchOptions<T, V> | GroupByOptions<T> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.queryGroupBy<T, V>(reply)
      : deserialize.query<T, V>(reply);
  }

  public fetchObjectById(
    id: string,
    opts?: FetchObjectByIdOptions<T, V>
  ): Promise<WeaviateObject<T, V> | null> {
    return this.check
      .fetchObjectById(opts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjectById({ id, ...opts })))
      .then((reply) => this.parseReply(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }

  public fetchObjects(opts?: FetchObjectsOptions<T, V>): Promise<WeaviateReturn<T, V>> {
    return this.check
      .fetchObjects(opts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }

  public bm25(query: string, opts?: BaseBm25Options<T, V>): Promise<WeaviateReturn<T, V>>;
  public bm25(query: string, opts: GroupByBm25Options<T, V>): Promise<GroupByReturn<T, V>>;
  public bm25(query: string, opts?: Bm25Options<T, V>): QueryReturn<T, V> {
    return this.check
      .bm25(opts)
      .then(({ search }) => search.withBm25(Serialize.search.bm25(query, opts)))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid(query: string, opts?: BaseHybridOptions<T, V>): Promise<WeaviateReturn<T, V>>;
  public hybrid(query: string, opts: GroupByHybridOptions<T, V>): Promise<GroupByReturn<T, V>>;
  public hybrid(query: string, opts?: HybridOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .hybridSearch(opts)
      .then(
        async ({
          search,
          supportsTargets,
          supportsWeightsForTargets,
          supportsVectorsForTargets,
          supportsVectors,
        }) => ({
          search,
          args: await Serialize.search.hybrid(
            {
              query,
              supportsTargets,
              supportsWeightsForTargets,
              supportsVectorsForTargets,
              supportsVectors,
            },
            opts
          ),
        })
      )
      .then(({ search, args }) => search.withHybrid(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage(image: string | Buffer, opts?: BaseNearOptions<T, V>): Promise<WeaviateReturn<T, V>>;
  public nearImage(image: string | Buffer, opts: GroupByNearOptions<T, V>): Promise<GroupByReturn<T, V>>;
  public nearImage(image: string | Buffer, opts?: NearOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        return toBase64FromMedia(image).then((image) => ({
          search,
          args: Serialize.search.nearImage(
            {
              image,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
        }));
      })
      .then(({ search, args }) => search.withNearImage(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts?: BaseNearOptions<T, V>
  ): Promise<WeaviateReturn<T, V>>;
  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts: GroupByNearOptions<T, V>
  ): Promise<GroupByReturn<T, V>>;
  public nearMedia(media: string | Buffer, type: NearMediaType, opts?: NearOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        const args = {
          supportsTargets,
          supportsWeightsForTargets,
        };
        let send: (media: string) => Promise<SearchReply>;
        switch (type) {
          case 'audio':
            send = (media) =>
              search.withNearAudio(Serialize.search.nearAudio({ audio: media, ...args }, opts));
            break;
          case 'depth':
            send = (media) =>
              search.withNearDepth(Serialize.search.nearDepth({ depth: media, ...args }, opts));
            break;
          case 'image':
            send = (media) =>
              search.withNearImage(Serialize.search.nearImage({ image: media, ...args }, opts));
            break;
          case 'imu':
            send = (media) => search.withNearIMU(Serialize.search.nearIMU({ imu: media, ...args }, opts));
            break;
          case 'thermal':
            send = (media) =>
              search.withNearThermal(Serialize.search.nearThermal({ thermal: media, ...args }, opts));
            break;
          case 'video':
            send = (media) => search.withNearVideo(Serialize.search.nearVideo({ video: media, ...args }));
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return toBase64FromMedia(media).then(send);
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject(id: string, opts?: BaseNearOptions<T, V>): Promise<WeaviateReturn<T, V>>;
  public nearObject(id: string, opts: GroupByNearOptions<T, V>): Promise<GroupByReturn<T, V>>;
  public nearObject(id: string, opts?: NearOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
        search,
        args: Serialize.search.nearObject(
          {
            id,
            supportsTargets,
            supportsWeightsForTargets,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withNearObject(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText(query: string | string[], opts?: BaseNearTextOptions<T, V>): Promise<WeaviateReturn<T, V>>;
  public nearText(query: string | string[], opts: GroupByNearTextOptions<T, V>): Promise<GroupByReturn<T, V>>;
  public nearText(query: string | string[], opts?: NearTextOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
        search,
        args: Serialize.search.nearText(
          {
            query,
            supportsTargets,
            supportsWeightsForTargets,
          },
          opts
        ),
      }))
      .then(({ search, args }) => search.withNearText(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector(vector: NearVectorInputType, opts?: BaseNearOptions<T, V>): Promise<WeaviateReturn<T, V>>;
  public nearVector(
    vector: NearVectorInputType,
    opts: GroupByNearOptions<T, V>
  ): Promise<GroupByReturn<T, V>>;
  public nearVector(vector: NearVectorInputType, opts?: NearOptions<T, V>): QueryReturn<T, V> {
    return this.check
      .nearVector(vector, opts)
      .then(
        async ({
          search,
          supportsTargets,
          supportsVectorsForTargets,
          supportsWeightsForTargets,
          supportsVectors,
        }) => ({
          search,
          args: await Serialize.search.nearVector(
            {
              vector,
              supportsTargets,
              supportsVectorsForTargets,
              supportsWeightsForTargets,
              supportsVectors,
            },
            opts
          ),
        })
      )
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
