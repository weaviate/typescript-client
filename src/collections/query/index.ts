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

class QueryManager<T> implements Query<T> {
  private check: Check<T>;

  private constructor(check: Check<T>) {
    this.check = check;
  }

  public static use<T>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): QueryManager<T> {
    return new QueryManager<T>(new Check<T>(connection, name, dbVersionSupport, consistencyLevel, tenant));
  }

  private async parseReply(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.query<T>(reply);
  }

  private async parseGroupByReply(
    opts: SearchOptions<T> | GroupByOptions<T> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.queryGroupBy<T>(reply)
      : deserialize.query<T>(reply);
  }

  public fetchObjectById(id: string, opts?: FetchObjectByIdOptions<T>): Promise<WeaviateObject<T> | null> {
    return this.check
      .fetchObjectById(opts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjectById({ id, ...opts })))
      .then((reply) => this.parseReply(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }

  public fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>> {
    return this.check
      .fetchObjects(opts)
      .then(({ search }) => search.withFetch(Serialize.search.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }

  public bm25(query: string, opts?: BaseBm25Options<T>): Promise<WeaviateReturn<T>>;
  public bm25(query: string, opts: GroupByBm25Options<T>): Promise<GroupByReturn<T>>;
  public bm25(query: string, opts?: Bm25Options<T>): QueryReturn<T> {
    return this.check
      .bm25(opts)
      .then(({ search }) => search.withBm25(Serialize.search.bm25(query, opts)))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid(query: string, opts?: BaseHybridOptions<T>): Promise<WeaviateReturn<T>>;
  public hybrid(query: string, opts: GroupByHybridOptions<T>): Promise<GroupByReturn<T>>;
  public hybrid(query: string, opts?: HybridOptions<T>): QueryReturn<T> {
    return this.check
      .hybridSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets, supportsVectorsForTargets }) =>
        search.withHybrid(
          Serialize.search.hybrid(
            { query, supportsTargets, supportsWeightsForTargets, supportsVectorsForTargets },
            opts
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage(image: string | Buffer, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearImage(image: string | Buffer, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearImage(image: string | Buffer, opts?: NearOptions<T>): QueryReturn<T> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        return toBase64FromMedia(image).then((image) =>
          search.withNearImage(
            Serialize.search.nearImage(
              {
                image,
                supportsTargets,
                supportsWeightsForTargets,
              },
              opts
            )
          )
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

  public nearObject(id: string, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearObject(id: string, opts?: NearOptions<T>): QueryReturn<T> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearObject(
          Serialize.search.nearObject(
            {
              id,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText(query: string | string[], opts?: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  public nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  public nearText(query: string | string[], opts?: NearTextOptions<T>): QueryReturn<T> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearText(
          Serialize.search.nearText(
            {
              query,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector(vector: NearVectorInputType, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  public nearVector(vector: NearVectorInputType, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  public nearVector(vector: NearVectorInputType, opts?: NearOptions<T>): QueryReturn<T> {
    return this.check
      .nearVector(vector, opts)
      .then(({ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets }) =>
        search.withNearVector(
          Serialize.search.nearVector(
            {
              vector,
              supportsTargets,
              supportsVectorsForTargets,
              supportsWeightsForTargets,
            },
            opts
          )
        )
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
