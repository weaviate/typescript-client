import Connection from '../connection';

import { WeaviateObject as WeaviateObjectRest } from '../openapi/types';
import { ObjectsPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { Filters, FilterValueType } from './filters';
import Deserialize from './deserialize';
import Serialize from './serialize';

import { MetadataQuery, WeaviateObject, Property, QueryReturn, SortBy } from './types';

export interface FetchObjectByIdArgs {
  id: string;
  additional?: string[];
}

export interface FetchObjectsArgs {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters<FilterValueType>;
  sort?: SortBy[];
  returnMetadata?: MetadataQuery;
  returnProperties?: Property[];
}

export interface Bm25Args {
  query: string;
  queryProperties?: string[];
  limit?: number;
  autoLimit?: number;
  filters?: Filters<FilterValueType>;
  returnMetadata?: MetadataQuery;
  returnProperties?: Property[];
}

const query = <T extends Record<string, any>>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): Query<T> => {
  const path = new ObjectsPath(dbVersionSupport);
  return {
    fetchObjectById: (args: FetchObjectByIdArgs): Promise<WeaviateObject<T>> =>
      path
        .buildGetOne(
          args.id,
          name,
          args.additional ? args.additional : [],
          consistencyLevel,
          undefined,
          tenant
        )
        .then((path) => connection.get(path))
        .then((res: Required<WeaviateObjectRest<T>>) => {
          return {
            properties: res.properties,
            metadata: {
              uuid: res.id,
              vector: res.vector,
              creationTimeUnix: res.creationTimeUnix,
              lastUpdateTimeUnix: res.lastUpdateTimeUnix,
            },
          };
        }),
    fetchObjects: (args?: FetchObjectsArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withFetch(Serialize.fetchObjects(args)).then(Deserialize.replyQuery<T>);
      }),
    bm25: (args: Bm25Args): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withBm25(Serialize.bm25(args)).then(Deserialize.replyQuery<T>);
      }),
  };
};

export interface Query<T extends Record<string, any>> {
  fetchObjectById: (args: FetchObjectByIdArgs) => Promise<WeaviateObject<T>>;
  fetchObjects: (args?: FetchObjectsArgs) => Promise<QueryReturn<T>>;
  bm25: (args: Bm25Args) => Promise<QueryReturn<T>>;
}

export default query;
