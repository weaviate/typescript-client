import Connection from '../connection';
import { ConsistencyLevel } from '../data';
import { DbVersionSupport } from '../utils/dbVersion';

import aggregate, { Aggregate } from './aggregate';
import config, { Config } from './config';
import data, { Data } from './data';
import filter, { Filter } from './filters';
import generate, { Generate } from './generate';
import { Iterator } from './iterator';
import query, { Query } from './query';
import sort, { Sort } from './sort';
import tenants, { Tenants } from './tenants';
import { MetadataQuery, Properties, QueryProperty, QueryReference } from './types';

export interface Collection<T extends Properties> {
  aggregate: Aggregate<T>;
  config: Config<T>;
  data: Data<T>;
  filter: Filter<T>;
  generate: Generate<T>;
  query: Query<T>;
  sort: Sort<T>;
  tenants: Tenants;
  iterator: (opts?: IteratorOptions<T>) => Iterator<T>;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T>;
  withTenant: (tenant: string) => Collection<T>;
}

export interface IteratorOptions<T extends Properties> {
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
}

const collection = <T extends Properties>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  const queryCollection = query<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  return {
    aggregate: aggregate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    config: config<T>(connection, name),
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    filter: filter<T>(),
    generate: generate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
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
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
