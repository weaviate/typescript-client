import { ConsistencyLevel } from '../data/index.js';
import { Batch } from '../grpc/batcher.js';
import { Search } from '../grpc/searcher.js';
import { Tenants } from '../grpc/tenantsManager.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import ConnectionGQL from './gql.js';
import { InternalConnectionParams } from './http.js';
export interface GrpcConnectionParams extends InternalConnectionParams {
  grpcAddress: string;
  grpcSecure: boolean;
}
export default class ConnectionGRPC extends ConnectionGQL {
  private grpc;
  private grpcAddress;
  private constructor();
  static use: (params: GrpcConnectionParams) => Promise<{
    connection: ConnectionGRPC;
    dbVersionProvider: import('../utils/dbVersion.js').DbVersionProvider;
    dbVersionSupport: DbVersionSupport;
  }>;
  private connect;
  search: (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => Promise<Search>;
  batch: (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => Promise<Batch>;
  tenants: (collection: string) => Promise<Tenants>;
  close: () => void;
}
export interface GrpcClient {
  close: () => void;
  batch: (
    collection: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Batch;
  health: () => Promise<boolean>;
  search: (
    collection: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Search;
  tenants: (collection: string, bearerToken?: string) => Tenants;
}
export declare const grpcClient: (config: GrpcConnectionParams) => GrpcClient;
