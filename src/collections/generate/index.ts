import Connection from '../../connection/grpc.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { WeaviateInvalidInputError } from '../../errors.js';
import { toBase64FromMedia } from '../../index.js';
import { GenerativeSearch } from '../../proto/v1/generative.js';
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
  GenerativeConfigRuntime,
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

  private async parseReply<RV, C extends GenerativeConfigRuntime | undefined>(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.generate<T, RV, C>(reply);
  }

  private async parseGroupByReply<RV, C extends GenerativeConfigRuntime | undefined>(
    opts: SearchOptions<any, any> | GroupByOptions<any> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.generateGroupBy<T, RV>(reply)
      : deserialize.generate<T, RV, C>(reply);
  }

  public fetchObjects<C extends GenerativeConfigRuntime | undefined = undefined>(
    generate: GenerateOptions<T, C>,
    opts?: FetchObjectsOptions<T, V>
  ): Promise<GenerativeReturn<T, V, C>> {
    return Promise.all([
      this.check.fetchObjects(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...Serialize.search.fetchObjects(opts),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withFetch(args))
      .then((reply) => this.parseReply(reply));
  }

  public bm25<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseBm25Options<T, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public bm25<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByBm25Options<T, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public bm25<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(query: string, generate: GenerateOptions<T, C>, opts?: Bm25Options<T, I>): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.bm25(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...Serialize.search.bm25(query, opts),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withBm25(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseHybridOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public hybrid<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByHybridOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public hybrid<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(query: string, generate: GenerateOptions<T, C>, opts?: HybridOptions<T, V, I>): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.hybridSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search, supportsVectors }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...(await Serialize.search.hybrid(
            {
              query,
              supportsVectors,
            },
            opts
          )),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withHybrid(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public nearImage<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public nearImage<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.nearSearch(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...Serialize.search.nearImage(
            {
              image: await toBase64FromMedia(image),
            },
            opts
          ),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withNearImage(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    id: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public nearObject<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    id: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public nearObject<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(id: string, generate: GenerateOptions<T, C>, opts?: NearOptions<T, V, I>): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.nearSearch(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...Serialize.search.nearObject(
            {
              id,
            },
            opts
          ),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withNearObject(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: BaseNearTextOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public nearText<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts: GroupByNearTextOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public nearText<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.nearSearch(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...Serialize.search.nearText(
            {
              query,
            },
            opts
          ),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withNearText(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public nearVector<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public nearVector<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.nearVector(vector, opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search, supportsVectors }, supportsSingleGrouped]) => ({
        search,
        args: {
          ...(await Serialize.search.nearVector(
            {
              vector,
              supportsVectors,
            },
            opts
          )),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        },
      }))
      .then(({ search, args }) => search.withNearVector(args))
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T, V, I>
  ): Promise<GenerativeReturn<T, RV, C>>;
  public nearMedia<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T, V, I>
  ): Promise<GenerativeGroupByReturn<T, RV, C>>;
  public nearMedia<
    I extends IncludeVector<V>,
    RV extends ReturnVectors<V, I>,
    C extends GenerativeConfigRuntime | undefined = undefined
  >(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T, V, I>
  ): GenerateReturn<T, RV, C> {
    return Promise.all([
      this.check.nearSearch(),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(([{ search }, supportsSingleGrouped]) => {
        let send: (media: string, generative: GenerativeSearch) => Promise<SearchReply>;
        switch (type) {
          case 'audio':
            send = (media, generative) =>
              search.withNearAudio({
                ...Serialize.search.nearAudio({ audio: media }, opts),
                generative,
              });
            break;
          case 'depth':
            send = (media, generative) =>
              search.withNearDepth({
                ...Serialize.search.nearDepth({ depth: media }, opts),
                generative,
              });
            break;
          case 'image':
            send = (media, generative) =>
              search.withNearImage({
                ...Serialize.search.nearImage({ image: media }, opts),
                generative,
              });
            break;
          case 'imu':
            send = (media, generative) =>
              search.withNearIMU({
                ...Serialize.search.nearIMU({ imu: media }, opts),
                generative,
              });
            break;
          case 'thermal':
            send = (media, generative) =>
              search.withNearThermal({
                ...Serialize.search.nearThermal({ thermal: media }, opts),
                generative,
              });
            break;
          case 'video':
            send = (media, generative) =>
              search.withNearVideo({
                ...Serialize.search.nearVideo({ video: media }),
                generative,
              });
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return Promise.all([
          toBase64FromMedia(media),
          Serialize.generative({ supportsSingleGrouped }, generate),
        ]).then(([media, generative]) => send(media, generative));
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}

export default GenerateManager.use;

export { generativeParameters } from './config.js';
export { Generate } from './types.js';
