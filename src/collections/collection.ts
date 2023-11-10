import Connection from '../connection';
import { ConsistencyLevel } from '../data';
import { DbVersionSupport } from '../utils/dbVersion';

import data, { Data } from './data';
import generate, { Generate } from './generate';
import groupBy, { GroupBy } from './groupby';
import query, { Query } from './query';
import { Properties } from './types';

export interface Collection<T extends Properties> {
  data: Data<T>;
  generate: Generate<T>;
  groupBy: GroupBy<T>;
  query: Query<T>;
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
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    generate: generate<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    groupBy: groupBy<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    query: query<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
