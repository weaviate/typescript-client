import Connection from '../../connection/grpc.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { WeaviateInvalidInputError, WeaviateUnsupportedFeatureError } from '../../errors.js';
import { toBase64FromMedia } from '../../index.js';
import { SearchReply } from '../../proto/v1/search_get.js';
import { Deserialize } from '../deserialize/index.js';
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
} from '../types/index.js';
import { Generate } from './types.js';

class GenerateManager<T> implements Generate<T> {
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
  ): GenerateManager<T> {
    return new GenerateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  private checkSupportForNamedVectors = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isNamedVectors(opts)) return;
    const check = await this.dbVersionSupport.supportsNamedVectors();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForBm25AndHybridGroupByQueries = async (query: 'Bm25' | 'Hybrid', opts?: any) => {
    if (!Serialize.isGroupBy(opts)) return;
    const check = await this.dbVersionSupport.supportsBm25AndHybridGroupByQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message(query));
  };

  private async parseReply(reply: SearchReply) {
    const deserialize = await Deserialize.use(this.dbVersionSupport);
    return deserialize.generate<T>(reply);
  }

  private async parseGroupByReply(
    opts: SearchOptions<T> | GroupByOptions<T> | undefined,
    reply: SearchReply
  ) {
    const deserialize = await Deserialize.use(this.dbVersionSupport);
    return Serialize.isGroupBy(opts) ? deserialize.generateGroupBy<T>(reply) : deserialize.generate<T>(reply);
  }

  public fetchObjects(
    generate: GenerateOptions<T>,
    opts?: FetchObjectsOptions<T>
  ): Promise<GenerativeReturn<T>> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withFetch({
          ...Serialize.fetchObjects(opts),
          generative: Serialize.generative(generate),
        })
      )
      .then((reply) => this.parseReply(reply));
  }

  public bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseBm25Options<T>
  ): Promise<GenerativeReturn<T>>;
  public bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByBm25Options<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public bm25(query: string, generate: GenerateOptions<T>, opts?: Bm25Options<T>): GenerateReturn<T> {
    return Promise.all([
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
    ])
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withBm25({
          ...Serialize.bm25({ query, ...opts }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByBm25Options<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseHybridOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByHybridOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public hybrid(query: string, generate: GenerateOptions<T>, opts?: HybridOptions<T>): GenerateReturn<T> {
    return Promise.all([
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
    ])
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withHybrid({
          ...Serialize.hybrid({ query, ...opts }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByHybridOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearImage(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearImage(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearImage(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        toBase64FromMedia(image).then((image) =>
          search.withNearImage({
            ...Serialize.nearImage({ image, ...(opts ? opts : {}) }),
            generative: Serialize.generative(generate),
            groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
              ? Serialize.groupBy(opts.groupBy)
              : undefined,
          })
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearObject(id: string, generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withNearObject({
          ...Serialize.nearObject({ id, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: BaseNearTextOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: GroupByNearTextOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withNearText({
          ...Serialize.nearText({ query, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) =>
        search.withNearVector({
          ...Serialize.nearVector({ vector, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }

  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T> {
    return this.checkSupportForNamedVectors(opts)
      .then(() => this.connection.search(this.name, this.consistencyLevel, this.tenant))
      .then((search) => {
        let reply: Promise<SearchReply>;
        const generative = Serialize.generative(generate);
        const groupBy = Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
          ? Serialize.groupBy(opts.groupBy)
          : undefined;
        switch (type) {
          case 'audio':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearAudio({
                ...Serialize.nearAudio({ audio: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          case 'depth':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearDepth({
                ...Serialize.nearDepth({ depth: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          case 'image':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearImage({
                ...Serialize.nearImage({ image: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          case 'imu':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearIMU({
                ...Serialize.nearIMU({ imu: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          case 'thermal':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearThermal({
                ...Serialize.nearThermal({ thermal: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          case 'video':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearVideo({
                ...Serialize.nearVideo({ video: media, ...(opts ? opts : {}) }),
                generative,
                groupBy,
              })
            );
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return reply;
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}

export default GenerateManager.use;

export { Generate } from './types.js';
