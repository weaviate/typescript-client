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
} from '../types/index.js';
import { Generate } from './types.js';

class GenerateManager<T> implements Generate<T> {
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
  ): GenerateManager<T> {
    return new GenerateManager<T>(new Check<T>(connection, name, dbVersionSupport, consistencyLevel, tenant));
  }

  private async parseReply<C extends GenerativeConfigRuntime | undefined>(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return deserialize.generate<T, C>(reply);
  }

  private async parseGroupByReply<C extends GenerativeConfigRuntime | undefined>(
    opts: SearchOptions<T> | GroupByOptions<T> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.check.dbVersionSupport);
    return Serialize.search.isGroupBy(opts)
      ? deserialize.generateGroupBy<T>(reply)
      : deserialize.generate<T, C>(reply);
  }

  public fetchObjects<C extends GenerativeConfigRuntime | undefined = undefined>(
    generate: GenerateOptions<T, C>,
    opts?: FetchObjectsOptions<T>
  ): Promise<GenerativeReturn<T, C>> {
    return Promise.all([
      this.check.fetchObjects(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) =>
        search.withFetch({
          ...Serialize.search.fetchObjects(opts),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        })
      )
      .then((reply) => this.parseReply(reply));
  }

  public bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseBm25Options<T>
  ): Promise<GenerativeReturn<T, C>>;
  public bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByBm25Options<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public bm25<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: Bm25Options<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.bm25(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search }, supportsSingleGrouped]) =>
        search.withBm25({
          ...Serialize.search.bm25(query, opts),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseHybridOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByHybridOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public hybrid<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string,
    generate: GenerateOptions<T, C>,
    opts?: HybridOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.hybridSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(
        async ([
          { search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
          supportsSingleGrouped,
        ]) =>
          search.withHybrid({
            ...Serialize.search.hybrid(
              {
                query,
                supportsTargets,
                supportsVectorsForTargets,
                supportsWeightsForTargets,
              },
              opts
            ),
            generative: await Serialize.generative({ supportsSingleGrouped }, generate),
          })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage<C extends GenerativeConfigRuntime | undefined = undefined>(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public nearImage<C extends GenerativeConfigRuntime | undefined = undefined>(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public nearImage<C extends GenerativeConfigRuntime | undefined = undefined>(
    image: string | Buffer,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.nearSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) =>
        Promise.all([
          toBase64FromMedia(image),
          Serialize.generative({ supportsSingleGrouped }, generate),
        ]).then(([image, generative]) =>
          search.withNearImage({
            ...Serialize.search.nearImage(
              {
                image,
                supportsTargets,
                supportsWeightsForTargets,
              },
              opts
            ),
            generative,
          })
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public nearObject<C extends GenerativeConfigRuntime | undefined = undefined>(
    id: string,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.nearSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) =>
        search.withNearObject({
          ...Serialize.search.nearObject(
            {
              id,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: BaseNearTextOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts: GroupByNearTextOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public nearText<C extends GenerativeConfigRuntime | undefined = undefined>(
    query: string | string[],
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.nearSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(async ([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) =>
        search.withNearText({
          ...Serialize.search.nearText(
            {
              query,
              supportsTargets,
              supportsWeightsForTargets,
            },
            opts
          ),
          generative: await Serialize.generative({ supportsSingleGrouped }, generate),
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public nearVector<C extends GenerativeConfigRuntime | undefined = undefined>(
    vector: number[],
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.nearVector(vector, opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(
        async ([
          { search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
          supportsSingleGrouped,
        ]) =>
          search.withNearVector({
            ...Serialize.search.nearVector(
              {
                vector,
                supportsTargets,
                supportsVectorsForTargets,
                supportsWeightsForTargets,
              },
              opts
            ),
            generative: await Serialize.generative({ supportsSingleGrouped }, generate),
          })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T, C>>;
  public nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T, C>>;
  public nearMedia<C extends GenerativeConfigRuntime | undefined = undefined>(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T, C>,
    opts?: NearOptions<T>
  ): GenerateReturn<T, C> {
    return Promise.all([
      this.check.nearSearch(opts),
      this.check.supportForSingleGroupedGenerative(),
      this.check.supportForGenerativeConfigRuntime(generate.config),
    ])
      .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) => {
        const args = {
          supportsTargets,
          supportsWeightsForTargets,
        };
        let send: (media: string, generative: GenerativeSearch) => Promise<SearchReply>;
        switch (type) {
          case 'audio':
            send = (media, generative) =>
              search.withNearAudio({
                ...Serialize.search.nearAudio({ audio: media, ...args }, opts),
                generative,
              });
            break;
          case 'depth':
            send = (media, generative) =>
              search.withNearDepth({
                ...Serialize.search.nearDepth({ depth: media, ...args }, opts),
                generative,
              });
            break;
          case 'image':
            send = (media, generative) =>
              search.withNearImage({
                ...Serialize.search.nearImage({ image: media, ...args }, opts),
                generative,
              });
            break;
          case 'imu':
            send = (media, generative) =>
              search.withNearIMU({
                ...Serialize.search.nearIMU({ imu: media, ...args }, opts),
                generative,
              });
            break;
          case 'thermal':
            send = (media, generative) =>
              search.withNearThermal({
                ...Serialize.search.nearThermal({ thermal: media, ...args }, opts),
                generative,
              });
            break;
          case 'video':
            send = (media, generative) =>
              search.withNearVideo({
                ...Serialize.search.nearVideo({ video: media, ...args }),
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

export { generativeConfigRuntime } from './config.js';
export { Generate } from './types.js';
