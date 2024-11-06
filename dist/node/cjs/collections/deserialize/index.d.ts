import { Tenant as TenantREST } from '../../openapi/types.js';
import { BatchObject as BatchObjectGRPC, BatchObjectsReply } from '../../proto/v1/batch.js';
import { BatchDeleteReply } from '../../proto/v1/batch_delete.js';
import { SearchReply } from '../../proto/v1/search_get.js';
import { TenantsGetReply } from '../../proto/v1/tenants.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { Tenant } from '../tenants/index.js';
import {
  BatchObject,
  BatchObjectsReturn,
  DeleteManyReturn,
  GenerativeGroupByReturn,
  GenerativeReturn,
  GroupByReturn,
  WeaviateReturn,
} from '../types/index.js';
export declare class Deserialize {
  private supports125ListValue;
  private constructor();
  static use(support: DbVersionSupport): Promise<Deserialize>;
  query<T>(reply: SearchReply): WeaviateReturn<T>;
  generate<T>(reply: SearchReply): GenerativeReturn<T>;
  groupBy<T>(reply: SearchReply): GroupByReturn<T>;
  generateGroupBy<T>(reply: SearchReply): GenerativeGroupByReturn<T>;
  private properties;
  private references;
  private parsePropertyValue;
  private parseListValue;
  private objectProperties;
  private static metadata;
  private static uuid;
  private static vectorFromBytes;
  private static intsFromBytes;
  private static numbersFromBytes;
  private static vectors;
  static batchObjects<T>(
    reply: BatchObjectsReply,
    originalObjs: BatchObject<T>[],
    mappedObjs: BatchObjectGRPC[],
    elapsed: number
  ): BatchObjectsReturn<T>;
  static deleteMany<V extends boolean>(reply: BatchDeleteReply, verbose?: V): DeleteManyReturn<V>;
  private static activityStatusGRPC;
  static activityStatusREST(status: TenantREST['activityStatus']): Tenant['activityStatus'];
  static tenantsGet(reply: TenantsGetReply): Record<string, Tenant>;
}
