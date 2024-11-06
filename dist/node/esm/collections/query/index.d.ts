/// <reference types="node" resolution-mode="require"/>
import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { GroupByReturn, WeaviateObject, WeaviateReturn } from '../types/index.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  BaseNearTextOptions,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  GroupByBm25Options,
  GroupByHybridOptions,
  GroupByNearOptions,
  GroupByNearTextOptions,
  NearMediaType,
  NearVectorInputType,
  Query,
} from './types.js';
declare class QueryManager<T> implements Query<T> {
  private check;
  private constructor();
  static use<T>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): QueryManager<T>;
  private parseReply;
  private parseGroupByReply;
  fetchObjectById(id: string, opts?: FetchObjectByIdOptions<T>): Promise<WeaviateObject<T> | null>;
  fetchObjects(opts?: FetchObjectsOptions<T>): Promise<WeaviateReturn<T>>;
  bm25(query: string, opts?: BaseBm25Options<T>): Promise<WeaviateReturn<T>>;
  bm25(query: string, opts: GroupByBm25Options<T>): Promise<GroupByReturn<T>>;
  hybrid(query: string, opts?: BaseHybridOptions<T>): Promise<WeaviateReturn<T>>;
  hybrid(query: string, opts: GroupByHybridOptions<T>): Promise<GroupByReturn<T>>;
  nearImage(image: string | Buffer, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearImage(image: string | Buffer, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts?: BaseNearOptions<T>
  ): Promise<WeaviateReturn<T>>;
  nearMedia(
    media: string | Buffer,
    type: NearMediaType,
    opts: GroupByNearOptions<T>
  ): Promise<GroupByReturn<T>>;
  nearObject(id: string, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearObject(id: string, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
  nearText(query: string | string[], opts?: BaseNearTextOptions<T>): Promise<WeaviateReturn<T>>;
  nearText(query: string | string[], opts: GroupByNearTextOptions<T>): Promise<GroupByReturn<T>>;
  nearVector(vector: NearVectorInputType, opts?: BaseNearOptions<T>): Promise<WeaviateReturn<T>>;
  nearVector(vector: NearVectorInputType, opts: GroupByNearOptions<T>): Promise<GroupByReturn<T>>;
}
declare const _default: typeof QueryManager.use;
export default _default;
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
