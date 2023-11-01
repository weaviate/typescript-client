import Connection from '../connection';

import { WeaviateObject } from '../openapi/types';
import { ObjectsPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

export type InsertObject<T> = {
  id?: string;
  properties?: T;
  vector?: number[];
};

export interface Data<T extends Record<string, any>> {
  insert: (object: InsertObject<T>) => Promise<string>;
}

const data = <T extends Record<string, any>>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
) => {
  const path = new ObjectsPath(dbVersionSupport);

  return {
    insert: (object: InsertObject<T>) =>
      path
        .buildCreate(consistencyLevel)
        .then((path) =>
          connection.postReturn<WeaviateObject<T>, WeaviateObject<T>>(path, { class: name, ...object })
        )
        .then((obj) => obj.id),
  };
};

export default data;
