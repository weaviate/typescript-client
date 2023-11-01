import Connection from '../connection';

import { WeaviateObject } from '../openapi/types';
import { ObjectsPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

export interface Query<T extends Record<string, any>> {
  fetchById: (id: string) => Promise<WeaviateObject<T>>;
}

const query = <T extends Record<string, any>>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  const path = new ObjectsPath(dbVersionSupport);

  return {
    fetchById: (id: string, additional?: string[]) =>
      path
        .buildGetOne(id, name, additional ? additional : [], consistencyLevel, undefined, tenant)
        .then((path) => connection.get(path)),
  };
};

export default query;
