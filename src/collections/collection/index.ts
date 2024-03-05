import Connection from '../../connection/grpc';
import { ConsistencyLevel } from '../../data';
import { DbVersionSupport } from '../../utils/dbVersion';

import aggregate, { metrics, Aggregate, Metrics } from '../aggregate';
import { backupCollection, BackupCollection } from '../backup';
import config, { Config } from '../config';
import data, { Data } from '../data';
import filter, { Filter } from '../filters';
import generate, { Generate } from '../generate';
import { Iterator } from '../iterator';
import query, { Query } from '../query';
import sort, { Sort } from '../sort';
import tenants, { Tenants } from '../tenants';
import { MetadataQuery, Properties, QueryProperty, QueryReference } from '../types';

export interface Collection<T, N> {
  aggregate: Aggregate<T>;
  backup: BackupCollection;
  config: Config<T>;
  data: Data<T>;
  filter: Filter<T>;
  generate: Generate<T>;
  metrics: Metrics<T>;
  name: N;
  query: Query<T>;
  sort: Sort<T>;
  tenants: Tenants;
  iterator: (opts?: IteratorOptions<T>) => Iterator<T>;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T, N>;
  withTenant: (tenant: string) => Collection<T, N>;
}

export interface IteratorOptions<T> {
  includeVector?: boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

const collection = <T, N>(
  connection: Connection,
  name: N,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  const queryCollection = query<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant);
  return {
    aggregate: aggregate<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant),
    backup: backupCollection(connection, name as string),
    config: config<T>(connection, name as string, tenant),
    data: data<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant),
    filter: filter<T>(),
    generate: generate<T>(connection, name as string, dbVersionSupport, consistencyLevel, tenant),
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
    withTenant: (tenant: string) =>
      collection<T, N>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
