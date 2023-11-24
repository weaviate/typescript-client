import Connection from '../connection';
import { ConsistencyLevel } from '../data';
import { DbVersionSupport } from '../utils/dbVersion';

import aggregate, { Aggregate } from './aggregate';
import data, { Data } from './data';
import generate, { Generate } from './generate';
import groupBy, { GroupBy } from './groupby';
import query, { Query } from './query';
import tenants, { Tenants } from './tenants';
import { Properties } from './types';

export interface Collection<T extends Properties> {
  aggregate: Aggregate<T>;
  data: Data<T>;
  generate: Generate<T>;
  groupBy: GroupBy<T>;
  query: Query<T>;
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
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    generate: generate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    groupBy: groupBy<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    query: query<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    tenants: tenants(connection, name),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
