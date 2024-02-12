import Connection from '../connection';
import { ConsistencyLevel } from '../data';
import { DbVersionSupport } from '../utils/dbVersion';

import aggregate, { Aggregate } from './aggregate';
import config, { Config } from './config';
import data, { Data } from './data';
import filter, { Filter } from './filters';
import generate, { Generate } from './generate';
import query, { Query } from './query';
import sort, { Sort } from './sort';
import tenants, { Tenants } from './tenants';
import { Properties } from './types';

export interface Collection<T extends Properties> {
  aggregate: Aggregate<T>;
  config: Config<T>;
  data: Data<T>;
  filter: Filter<T>;
  generate: Generate<T>;
  query: Query<T>;
  sort: Sort<T>;
  tenants: Tenants;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T>;
  withTenant: (tenant: string) => Collection<T>;
}

const collection = <T extends Properties>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  return {
    aggregate: aggregate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    config: config<T>(connection, name),
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    filter: filter<T>(),
    generate: generate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    query: query<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    sort: sort<T>(),
    tenants: tenants(connection, name),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
