import Connection from '../connection';
import { ConsistencyLevel } from '../data';
import { Tenant } from '../openapi/types';
import { DbVersionSupport } from '../utils/dbVersion';

import data, { Data } from './data';
import query, { Query } from './query';

export interface Collection<T extends Record<string, any>> {
  data: Data<T>;
  query: Query<T>;
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T>;
  withTenant: (tenant: string) => Collection<T>;
}

const collection = <T extends Record<string, any>>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  return {
    data: data<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    query: query<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
    withTenant: (tenant: string) =>
      collection<T>(connection, name, dbVersionSupport, consistencyLevel, tenant),
  };
};

export default collection;
