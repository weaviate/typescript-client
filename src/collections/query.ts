import Connection from '../connection';

import { WeaviateObject as WeaviateObjectRest } from '../openapi/types';
import { ObjectsPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { Filters, FilterValueType } from './filters';
import Deserialize from './deserialize';
import Serialize from './serialize';

import { MetadataQuery, WeaviateObject, Property, QueryReturn, SortBy } from './types';

export interface FetchObjectsArgs {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters<FilterValueType>;
  sort?: SortBy[];
  returnMetadata?: MetadataQuery;
  returnProperties?: Property[];
}

export interface FetchObjectByIdArgs {
  id: string;
  additional?: string[];
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
        return search
          .get({
            limit: args?.limit,
            offset: args?.offset,
            after: args?.after,
            filters: args?.filters ? Serialize.filters(args.filters) : undefined,
            sort: args?.sort ? Serialize.sortBy(args.sort) : undefined,
            returnProperties: args?.returnProperties
              ? Serialize.properties(args.returnProperties)
              : undefined,
            returnMetadata: args?.returnMetadata ? Serialize.metadata(args.returnMetadata) : undefined,
          })
          .then((res) =>
            res.results.map((result) => {
              return {
                properties: result.properties ? Deserialize.properties<T>(result.properties) : ({} as T),
                metadata: result.metadata ? Deserialize.metadata(result.metadata) : {},
              };
            })
          )
          .then((objs) => {
            return { objects: objs };
          });
      }),
  };
};

export interface Query<T extends Record<string, any>> {
  fetchObjectById: (args: FetchObjectByIdArgs) => Promise<WeaviateObject<T>>;
  fetchObjects: (args?: FetchObjectsArgs) => Promise<QueryReturn<T>>;
}

export default query;
