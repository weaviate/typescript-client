import Connection from '../connection/grpc';
import { ConsistencyLevel } from '../data';
import { DbVersionSupport } from '../utils/dbVersion';

import aggregate, { metrics, Aggregate, Metrics } from './aggregate';
import { backupCollection, BackupCollection } from './backup';
import config, { Config } from './config';
// import { namedVectorizer, NamedVectorizer } from './configure';
import data, { Data } from './data';
import filter, { Filter } from './filters';
import generate, { Generate } from './generate';
import { Iterator } from './iterator';
import query, { Query } from './query';
import sort, { Sort } from './sort';
import tenants, { Tenants } from './tenants';
import { MetadataQuery, Properties, QueryProperty, QueryReference, Vectors } from './types';

export interface Collection<T extends Properties, V extends Vectors = undefined> {
  aggregate: Aggregate<T>;
  backup: BackupCollection;
  config: Config<T>;
  data: Data<T>;
  filter: Filter<T>;
  generate: Generate<T>;
  metrics: Metrics<T>;
  // namedVectorizer: NamedVectorizer<T>;
  query: Query<T, V>;
  sort: Sort<T>;
  tenants: Tenants;
  iterator: (opts?: IteratorOptions<T>) => Iterator<T>;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T, V>;
  withTenant: (tenant: string) => Collection<T, V>;
}

export interface IteratorOptions<T extends Properties> {
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

const collection = <T extends Properties, V extends Vectors>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  const queryCollection = query<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  return {
    aggregate: aggregate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    backup: backupCollection(connection, name),
    config: config<T>(connection, name),
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    filter: filter<T>(),
    generate: generate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    metrics: metrics<T>(),
    // namedVectorizer: namedVectorizer<T>(),
    query: queryCollection,
    sort: sort<T>(),
    tenants: tenants(connection, name),
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
      collection<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T, V>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
