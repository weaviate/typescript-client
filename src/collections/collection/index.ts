import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import aggregate, { metrics, Aggregate, Metrics } from '../aggregate/index.js';
import { backupCollection, BackupCollection } from '../backup/collection.js';
import config, { Config } from '../config/index.js';
import data, { Data } from '../data/index.js';
import filter, { Filter } from '../filters/index.js';
import generate, { Generate } from '../generate/index.js';
import { Iterator } from '../iterator/index.js';
import query, { Query } from '../query/index.js';
import sort, { Sort } from '../sort/index.js';
import tenants, { Tenant, Tenants } from '../tenants/index.js';
import { QueryMetadata, QueryProperty, QueryReference } from '../types/index.js';

export interface Collection<T = undefined, N = string> {
  aggregate: Aggregate<T>;
  backup: BackupCollection;
  config: Config<T>;
  data: Data<T>;
  filter: Filter<T extends undefined ? any : T>;
  generate: Generate<T>;
  metrics: Metrics<T>;
  name: N;
  query: Query<T>;
  sort: Sort<T>;
  tenants: Tenants;
  iterator: (opts?: IteratorOptions<T>) => Iterator<T>;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T, N>;
  withTenant: (tenant: string | Tenant) => Collection<T, N>;
}

export interface IteratorOptions<T> {
  includeVector?: boolean | string[];
  returnMetadata?: QueryMetadata;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

const collection = <T, N>(
  connection: Connection,
  name: N,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: Tenant
) => {
  const queryCollection = query<T>(
    connection,
    name as string,
    dbVersionSupport,
    consistencyLevel,
    tenant?.name
  );
  return {
    aggregate: aggregate<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant?.name),
    backup: backupCollection(connection, name as string),
    config: config<T>(connection, name as string, tenant?.name),
    data: data<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant?.name),
    filter: filter<T extends undefined ? any : T>(),
    generate: generate<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant?.name),
    metrics: metrics<T>(),
    name: name,
    query: queryCollection,
    sort: sort<T>(),
    tenants: tenants(connection, name as string),
    iterator: (opts?: IteratorOptions<T>) =>
      new Iterator<T>((limit: number, after?: string) =>
        queryCollection
          .fetchObjects({
            limit,
            after,
            includeVector: opts?.includeVector,
            returnMetadata: opts?.returnMetadata,
            returnProperties: opts?.returnProperties,
            returnReferences: opts?.returnReferences,
          })
          .then((res) => res.objects)
      ),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T, N>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string | Tenant) =>
      collection<T, N>(
        connection,
        name,
        dbVersionSupport,
        consistencyLevel,
        typeof tenant === 'string' ? { name: tenant } : tenant
      ),
  };
};

export default collection;
