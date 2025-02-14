import Connection from '../../connection/grpc.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { WeaviateInvalidInputError } from '../../errors.js';
import { toBase64FromMedia } from '../../index.js';
import { SearchReply } from '../../proto/v1/search_get.js';
import { Deserialize } from '../deserialize/index.js';
import { Check } from '../query/check.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  Bm25Options,
  FetchObjectsOptions,
  GroupByBm25Options,
  GroupByHybridOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
  HybridOptions,
  NearMediaType,
  NearOptions,
  SearchOptions,
} from '../query/types.js';
import { Serialize } from '../serialize/index.js';
import {
  GenerateOptions,
  GenerateReturn,
  GenerativeGroupByReturn,
  GenerativeReturn,
  GroupByOptions,
  ReturnVectors,
} from '../types/index.js';
import { IncludeVector } from '../types/internal.js';
import { Generate } from './types.js';

class GenerateManager<T, V> implements Generate<T, V> {
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
  ): GenerateManager<T, V> {
    return new GenerateManager<T, V>(
      new Check<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant)
    );
  }

  private async parseReply<RV>(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.generate<T, RV>(reply);
  }

  private async parseGroupByReply<RV>(
    opts: SearchOptions<any, any> | GroupByOptions<any> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.generateGroupBy<T, RV>(reply)
      : deserialize.generate<T, RV>(reply);
  }

  public fetchObjects(
    generate: GenerateOptions<T>,
    opts?: FetchObjectsOptions<T, V>
  ): Promise<GenerativeReturn<T, V>> {
    return this.check
      .fetchObjects(opts)
      .then(({ search }) => ({
        search,
        args: {
          ...Serialize.search.fetchObjects(opts),
          generative: Serialize.generative(generate),
        },
      }))
      .then(({ search, args }) => search.withFetch(args))
      .then((reply) => this.parseReply(reply));
  }

  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseBm25Options<T, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByBm25Options<T, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public bm25<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts?: Bm25Options<T, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .bm25(opts)
      .then(({ search }) => ({
        search,
        args: {
          ...Serialize.search.bm25(query, opts),
          generative: Serialize.generative(generate),
        },
      }))
      .then(({ search, args }) => search.withBm25(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseHybridOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByHybridOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public hybrid<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string,
    generate: GenerateOptions<T>,
    opts?: HybridOptions<T, V, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .hybridSearch(opts)
      .then(
        async ({
          search,
          supportsTargets,
          supportsVectorsForTargets,
          supportsWeightsForTargets,
          supportsVectors,
        }) => ({
          search,
          args: {
            ...(await Serialize.search.hybrid(
              {
                query,
                supportsTargets,
                supportsVectorsForTargets,
                supportsWeightsForTargets,
                supportsVectors,
              },
              opts
            )),
            generative: Serialize.generative(generate),
          },
        })
      )
      .then(({ search, args }) => search.withHybrid(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public nearImage<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .nearSearch(opts)
      .then(async ({ search, supportsTargets, supportsWeightsForTargets }) => ({
        search,
        args: {
          ...Serialize.search.nearImage(
            {
              image: await toBase64FromMedia(image),
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
          generative: Serialize.generative(generate),
        },
      }))
      .then(({ search, args }) => search.withNearImage(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public nearObject<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    id: string,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
        search,
        args: {
          ...Serialize.search.nearObject(
            {
              id,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
          generative: Serialize.generative(generate),
        },
      }))
      .then(({ search, args }) => search.withNearObject(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: BaseNearTextOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: GroupByNearTextOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public nearText<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
        search,
        args: {
          ...Serialize.search.nearText(
            {
              query,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
          generative: Serialize.generative(generate),
        },
      }))
      .then(({ search, args }) => search.withNearText(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: number[],
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public nearVector<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    vector: number[],
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV> {
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
          args: {
            ...(await Serialize.search.nearVector(
              {
                vector,
                supportsTargets,
                supportsVectorsForTargets,
                supportsWeightsForTargets,
                supportsVectors,
              },
              opts
            )),
            generative: Serialize.generative(generate),
          },
        })
      )
      .then(({ search, args }) => search.withNearVector(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV>>;
  public nearMedia<I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV> {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        const args = {
          supportsTargets,
          supportsWeightsForTargets,
        };
        const generative = Serialize.generative(generate);
        let send: (media: string) => Promise<SearchReply>;
        switch (type) {
          case 'audio':
            send = (media) =>
              search.withNearAudio({
                ...Serialize.search.nearAudio({ audio: media, ...args }, opts),
                generative,
              });
            break;
          case 'depth':
            send = (media) =>
              search.withNearDepth({
                ...Serialize.search.nearDepth({ depth: media, ...args }, opts),
                generative,
              });
            break;
          case 'image':
            send = (media) =>
              search.withNearImage({
                ...Serialize.search.nearImage({ image: media, ...args }, opts),
                generative,
              });
            break;
          case 'imu':
            send = (media) =>
              search.withNearIMU({ ...Serialize.search.nearIMU({ imu: media, ...args }, opts), generative });
            break;
          case 'thermal':
            send = (media) =>
              search.withNearThermal({
                ...Serialize.search.nearThermal({ thermal: media, ...args }, opts),
                generative,
              });
            break;
          case 'video':
            send = (media) =>
              search.withNearVideo({ ...Serialize.search.nearVideo({ video: media, ...args }), generative });
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return toBase64FromMedia(media).then(send);
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}

export default GenerateManager.use;

export { Generate } from './types.js';
