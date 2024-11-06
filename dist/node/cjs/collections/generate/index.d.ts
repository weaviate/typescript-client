/// <reference types="node" resolution-mode="require"/>
import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  FetchObjectsOptions,
  GroupByBm25Options,
  GroupByHybridOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
  NearMediaType,
} from '../query/types.js';
import { GenerateOptions, GenerativeGroupByReturn, GenerativeReturn } from '../types/index.js';
import { Generate } from './types.js';
declare class GenerateManager<T> implements Generate<T> {
  private check;
  private constructor();
  static use<T>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): GenerateManager<T>;
  private parseReply;
  private parseGroupByReply;
  fetchObjects(generate: GenerateOptions<T>, opts?: FetchObjectsOptions<T>): Promise<GenerativeReturn<T>>;
  bm25(query: string, generate: GenerateOptions<T>, opts?: BaseBm25Options<T>): Promise<GenerativeReturn<T>>;
  bm25(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByBm25Options<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts?: BaseHybridOptions<T>
  ): Promise<GenerativeReturn<T>>;
  hybrid(
    query: string,
    generate: GenerateOptions<T>,
    opts: GroupByHybridOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearImage(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearImage(
    image: string | Buffer,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearObject(
    id: string,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts?: BaseNearTextOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearText(
    query: string | string[],
    generate: GenerateOptions<T>,
    opts: GroupByNearTextOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearVector(
    vector: number[],
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts?: BaseNearOptions<T>
  ): Promise<GenerativeReturn<T>>;
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    generate: GenerateOptions<T>,
    opts: GroupByNearOptions<T>
  ): Promise<GenerativeGroupByReturn<T>>;
}
declare const _default: typeof GenerateManager.use;
export default _default;
export { Generate } from './types.js';
