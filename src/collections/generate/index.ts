import Connection from '../../connection/grpc';

import { DbVersionSupport } from '../../utils/dbVersion';
import { ConsistencyLevel } from '../../data';

import Deserialize from '../deserialize';
import Serialize from '../serialize';
import {
  FetchObjectsOptions,
  Bm25Options,
  HybridOptions,
  BaseNearTextOptions,
  BaseNearOptions,
  NearMediaType,
  NearOptions,
  NearTextOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
} from '../query';
import { GenerativeReturn, GenerativeGroupByReturn } from '../types';
import { SearchReply } from '../../proto/v1/search_get';

export type GenerateOptions<T> = {
  singlePrompt?: string;
  groupedTask?: string;
  groupedProperties?: (keyof T)[];
};

class GenerateManager<T> implements Generate<T> {
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
  ): GenerateManager<T> {
    return new GenerateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjects(
    generate: GenerateOptions<T>,
    opts?: FetchObjectsOptions<T>
  ): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withFetch({
          ...Serialize.fetchObjects(opts),
          generative: Serialize.generative(generate),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts?: Bm25Options<T>
  ): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withBm25({
          ...Serialize.bm25({ query, ...opts }),
          generative: Serialize.generative(generate),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts?: HybridOptions<T>
  ): Promise<GenerativeReturn<T>> {
    return this.connection.search(this.name).then((search) =>
      search
        .withHybrid({
          ...Serialize.hybrid({ query, ...opts }),
          generative: Serialize.generative(generate),
        })
        .then(Deserialize.generate<T>)
    );
  }

  public nearImage(image: string, generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  public nearImage(
    image: string,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearImage(
    image: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearImage(image: string, generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearImage({
          ...Serialize.nearImage({ image, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
        .then((reply) =>
          Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Deserialize.generateGroupBy<T>(reply)
            : Deserialize.generate<T>(reply)
        )
    );
  }

  public nearObject(id: string, generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  public nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearObject(id: string, generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T> {
    return this.connection.search(this.name).then((search) =>
      search
        .withNearObject({
          ...Serialize.nearObject({ id, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
        .then((reply) =>
          Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Deserialize.generateGroupBy<T>(reply)
            : Deserialize.generate<T>(reply)
        )
    );
  }

  public nearText(query: string | string[], generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  public nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: BaseNearTextOptions<T>
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
    return this.connection.search(this.name).then((search) =>
      search
        .withNearText({
          ...Serialize.nearText({ query, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
        .then((reply) =>
          Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Deserialize.generateGroupBy<T>(reply)
            : Deserialize.generate<T>(reply)
        )
    );
  }

  public nearVector(vector: number[], generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  public nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
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
    return this.connection.search(this.name).then((search) =>
      search
        .withNearVector({
          ...Serialize.nearVector({ vector, ...(opts ? opts : {}) }),
          generative: Serialize.generative(generate),
          groupBy: Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Serialize.groupBy(opts.groupBy)
            : undefined,
        })
        .then((reply) =>
          Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
            ? Deserialize.generateGroupBy<T>(reply)
            : Deserialize.generate<T>(reply)
        )
    );
  }

  public nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  public nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  public nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T> {
    return this.connection.search(this.name).then((search) => {
      let reply: Promise<SearchReply>;
      const generative = Serialize.generative(generate);
      const groupBy = Serialize.isGroupBy<GroupByNearOptions<T>>(opts)
        ? Serialize.groupBy(opts.groupBy)
        : undefined;
      switch (type) {
        case 'audio':
          reply = search.withNearAudio({
            ...Serialize.nearAudio({ audio: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        case 'depth':
          reply = search.withNearDepth({
            ...Serialize.nearDepth({ depth: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        case 'image':
          reply = search.withNearImage({
            ...Serialize.nearImage({ image: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        case 'imu':
          reply = search.withNearIMU({
            ...Serialize.nearIMU({ imu: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        case 'thermal':
          reply = search.withNearThermal({
            ...Serialize.nearThermal({ thermal: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        case 'video':
          reply = search.withNearVideo({
            ...Serialize.nearVideo({ video: media, ...(opts ? opts : {}) }),
            generative,
            groupBy,
          });
          break;
        default:
          throw new Error(`Invalid media type: ${type}`);
      }
      return reply.then((reply) =>
        groupBy ? Deserialize.generateGroupBy<T>(reply) : Deserialize.generate<T>(reply)
      );
    });
  }
}

export interface Generate<T> {
  fetchObjects: (generate: GenerateOptions<T>, opts?: FetchObjectsOptions<T>) => Promise<GenerativeReturn<T>>;
  bm25: (query: string, generate: GenerateOptions<T>, opts?: Bm25Options<T>) => Promise<GenerativeReturn<T>>;
  hybrid: (
    query: string,
    generate: GenerateOptions<T>,
    opts?: HybridOptions<T>
  ) => Promise<GenerativeReturn<T>>;

  nearImage(image: string, generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  nearImage(
    image: string,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearImage(
    image: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearImage(image: string, generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T>;

  nearMedia(media: string, type: NearMediaType, generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearMedia(
    media: string,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: NearOptions<T>
  ): GenerateReturn<T>;

  nearObject(id: string, generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearObject(id: string, generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T>;

  nearText(query: string | string[], generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: BaseNearTextOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: GroupByNearTextOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: NearTextOptions<T>
  ): GenerateReturn<T>;

  nearVector(vector: number[], generate: GenerateOptions<T>): Promise<GenerativeReturn<T>>;
  nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearVector(vector: number[], generate: GenerateOptions<T>, opts?: NearOptions<T>): GenerateReturn<T>;
}

export type GenerateReturn<T> = Promise<GenerativeReturn<T>> | Promise<GenerativeGroupByReturn<T>>;

export default GenerateManager.use;
