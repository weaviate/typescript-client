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
  includeVector?: boolean;
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

export interface QueryArgs {
  limit?: number;
  autoLimit?: number;
  filters?: Filters<FilterValueType>;
  returnMetadata?: MetadataQuery;
  returnProperties?: Property[];
}

export interface Bm25Args extends QueryArgs {
  query: string;
  queryProperties?: string[];
}

export interface HybridArgs extends QueryArgs {
  query: string;
  alpha?: number;
  vector?: number[];
  queryProperties?: string[];
  fusionType?: 'Ranked' | 'RelativeScore';
}

export interface NearMediaArgs extends QueryArgs {
  certainty?: number;
  distance?: number;
}

export interface NearAudioArgs extends NearMediaArgs {
  nearAudio: string;
}

export interface NearImageArgs extends NearMediaArgs {
  nearImage: string;
}

export interface NearObjectArgs extends NearMediaArgs {
  nearObject: string;
}

export interface MoveArgs {
  force: number;
  objects?: string[];
  concepts?: string[];
}

export interface NearTextArgs extends NearMediaArgs {
  query: string | string[];
  moveTo?: MoveArgs;
  moveAway?: MoveArgs;
}

export interface NearVectorArgs extends NearMediaArgs {
  nearVector: number[];
}

export interface NearVideoArgs extends NearMediaArgs {
  nearVideo: string;
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
        .buildGetOne(args.id, name, args.includeVector ? ['vector'] : [], consistencyLevel, undefined, tenant)
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
    hybrid: (args: HybridArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withHybrid(Serialize.hybrid(args)).then(Deserialize.replyQuery<T>);
      }),
    nearAudio: (args: NearAudioArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearAudio(Serialize.nearAudio(args)).then(Deserialize.replyQuery<T>);
      }),
    nearImage: (args: NearImageArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearImage(Serialize.nearImage(args)).then(Deserialize.replyQuery<T>);
      }),
    nearObject: (args: NearObjectArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearObject(Serialize.nearObject(args)).then(Deserialize.replyQuery<T>);
      }),
    nearText: (args: NearTextArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearText(Serialize.nearText(args)).then(Deserialize.replyQuery<T>);
      }),
    nearVector: (args: NearVectorArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearVector(Serialize.nearVector(args)).then(Deserialize.replyQuery<T>);
      }),
    nearVideo: (args: NearVideoArgs): Promise<QueryReturn<T>> =>
      connection.search(name).then((search) => {
        return search.withNearVideo(Serialize.nearVideo(args)).then(Deserialize.replyQuery<T>);
      }),
  };
};

export interface Query<T extends Record<string, any>> {
  fetchObjectById: (args: FetchObjectByIdArgs) => Promise<WeaviateObject<T>>;
  fetchObjects: (args?: FetchObjectsArgs) => Promise<QueryReturn<T>>;
  bm25: (args: Bm25Args) => Promise<QueryReturn<T>>;
  hybrid: (args: HybridArgs) => Promise<QueryReturn<T>>;
  nearAudio: (args: NearAudioArgs) => Promise<QueryReturn<T>>;
  nearImage: (args: NearImageArgs) => Promise<QueryReturn<T>>;
  nearObject: (args: NearObjectArgs) => Promise<QueryReturn<T>>;
  nearText: (args: NearTextArgs) => Promise<QueryReturn<T>>;
  nearVector: (args: NearVectorArgs) => Promise<QueryReturn<T>>;
  nearVideo: (args: NearVideoArgs) => Promise<QueryReturn<T>>;
}

export default query;
