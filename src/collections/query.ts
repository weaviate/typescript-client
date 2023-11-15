import Connection from '../connection';

import { WeaviateObject as WeaviateObjectRest } from '../openapi/types';
import { ObjectsPath } from '../data/path';
import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { Filters, FilterValueType } from './filters';
import Deserialize from './deserialize';
import Serialize from './serialize';

import { MetadataQuery, WeaviateObject, Property, Properties, QueryReturn, SortBy } from './types';

export interface FetchObjectByIdArgs {
  id: string;
  includeVector?: boolean;
}

export interface QueryFetchObjectsArgs<T extends Properties> {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters<FilterValueType>;
  sort?: SortBy[];
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: Property<T>[];
}

export interface QueryArgs<T extends Properties> {
  limit?: number;
  autoLimit?: number;
  filters?: Filters<FilterValueType>;
  includeVector?: boolean;
  returnMetadata?: MetadataQuery;
  returnProperties?: Property<T>[];
}

export interface QueryBm25Args<T extends Properties> extends QueryArgs<T> {
  query: string;
  queryProperties?: (keyof T)[];
}

export interface QueryHybridArgs<T extends Properties> extends QueryArgs<T> {
  query: string;
  alpha?: number;
  vector?: number[];
  queryProperties?: (keyof T)[];
  fusionType?: 'Ranked' | 'RelativeScore';
}

export interface QueryNearMediaArgs<T extends Properties> extends QueryArgs<T> {
  certainty?: number;
  distance?: number;
}

export interface QueryNearAudioArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  nearAudio: string;
}

export interface QueryNearImageArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  nearImage: string;
}

export interface QueryNearObjectArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  nearObject: string;
}

export interface MoveArgs {
  force: number;
  objects?: string[];
  concepts?: string[];
}

export interface QueryNearTextArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  query: string | string[];
  moveTo?: MoveArgs;
  moveAway?: MoveArgs;
}

export interface QueryNearVectorArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  nearVector: number[];
}

export interface QueryNearVideoArgs<T extends Properties> extends QueryNearMediaArgs<T> {
  nearVideo: string;
}

class QueryManager<T extends Properties> implements Query<T> {
  connection: Connection;
  name: string;
  dbVersionSupport: DbVersionSupport;
  consistencyLevel?: ConsistencyLevel;
  tenant?: string;

  private constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }

  public static use<T extends Properties>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): QueryManager<T> {
    return new QueryManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public fetchObjectById(args: FetchObjectByIdArgs): Promise<WeaviateObject<T>> {
    const path = new ObjectsPath(this.dbVersionSupport);
    return path
      .buildGetOne(
        args.id,
        this.name,
        args.includeVector ? ['vector'] : [],
        this.consistencyLevel,
        undefined,
        this.tenant
      )
      .then((path) => this.connection.get(path))
      .then((res: Required<WeaviateObjectRest<T>>) => {
        return {
          properties: Deserialize.propertiesREST(res.properties),
          metadata: {
            creationTimeUnix: res.creationTimeUnix,
            lastUpdateTimeUnix: res.lastUpdateTimeUnix,
          },
          uuid: res.id,
          vector: res.vector,
        };
      });
  }

  public fetchObjects(args?: QueryFetchObjectsArgs<T>): Promise<QueryReturn<T>>;
  public fetchObjects<P extends Properties>(args?: QueryFetchObjectsArgs<P>): Promise<QueryReturn<P>>;
  public fetchObjects<P extends Properties>(args?: QueryFetchObjectsArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withFetch(Serialize.fetchObjects(args)).then(Deserialize.query<P>));
  }

  public bm25(args: QueryBm25Args<T>): Promise<QueryReturn<T>>;
  public bm25<P extends Properties>(args: QueryBm25Args<P>): Promise<QueryReturn<P>>;
  public bm25<P extends Properties>(args: QueryBm25Args<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withBm25(Serialize.bm25(args)).then(Deserialize.query<P>));
  }

  public hybrid(args: QueryHybridArgs<T>): Promise<QueryReturn<T>>;
  public hybrid<P extends Properties>(args: QueryHybridArgs<P>): Promise<QueryReturn<P>>;
  public hybrid<P extends Properties>(args: QueryHybridArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withHybrid(Serialize.hybrid(args)).then(Deserialize.query<P>));
  }

  public nearAudio(args: QueryNearAudioArgs<T>): Promise<QueryReturn<T>>;
  public nearAudio<P extends Properties>(args: QueryNearAudioArgs<P>): Promise<QueryReturn<P>>;
  public nearAudio<P extends Properties>(args: QueryNearAudioArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearAudio(Serialize.nearAudio(args)).then(Deserialize.query<P>));
  }

  public nearImage(args: QueryNearImageArgs<T>): Promise<QueryReturn<T>>;
  public nearImage<P extends Properties>(args: QueryNearImageArgs<P>): Promise<QueryReturn<P>>;
  public nearImage<P extends Properties>(args: QueryNearImageArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearImage(Serialize.nearImage(args)).then(Deserialize.query<P>));
  }

  public nearObject(args: QueryNearObjectArgs<T>): Promise<QueryReturn<T>>;
  public nearObject<P extends Properties>(args: QueryNearObjectArgs<P>): Promise<QueryReturn<P>>;
  public nearObject<P extends Properties>(args: QueryNearObjectArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearObject(Serialize.nearObject(args)).then(Deserialize.query<P>));
  }

  public nearText(args: QueryNearTextArgs<T>): Promise<QueryReturn<T>>;
  public nearText<P extends Properties>(args: QueryNearTextArgs<P>): Promise<QueryReturn<P>>;
  public nearText<P extends Properties>(args: QueryNearTextArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearText(Serialize.nearText(args)).then(Deserialize.query<P>));
  }

  public nearVector(args: QueryNearVectorArgs<T>): Promise<QueryReturn<T>>;
  public nearVector<P extends Properties>(args: QueryNearVectorArgs<P>): Promise<QueryReturn<P>>;
  public nearVector<P extends Properties>(args: QueryNearVectorArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearVector(Serialize.nearVector(args)).then(Deserialize.query<P>));
  }

  public nearVideo(args: QueryNearVideoArgs<T>): Promise<QueryReturn<T>>;
  public nearVideo<P extends Properties>(args: QueryNearVideoArgs<P>): Promise<QueryReturn<P>>;
  public nearVideo<P extends Properties>(args: QueryNearVideoArgs<P>): Promise<QueryReturn<P>> {
    return this.connection
      .search(this.name, this.consistencyLevel, this.tenant)
      .then((search) => search.withNearVideo(Serialize.nearVideo(args)).then(Deserialize.query<P>));
  }
}

export interface Query<T extends Properties> {
  fetchObjectById: (args: FetchObjectByIdArgs) => Promise<WeaviateObject<T>>;
  fetchObjects: (args?: QueryFetchObjectsArgs<T>) => Promise<QueryReturn<T>>;
  bm25: (args: QueryBm25Args<T>) => Promise<QueryReturn<T>>;
  hybrid: (args: QueryHybridArgs<T>) => Promise<QueryReturn<T>>;
  nearAudio: (args: QueryNearAudioArgs<T>) => Promise<QueryReturn<T>>;
  nearImage: (args: QueryNearImageArgs<T>) => Promise<QueryReturn<T>>;
  nearObject: (args: QueryNearObjectArgs<T>) => Promise<QueryReturn<T>>;
  nearText: (args: QueryNearTextArgs<T>) => Promise<QueryReturn<T>>;
  nearVector: (args: QueryNearVectorArgs<T>) => Promise<QueryReturn<T>>;
  nearVideo: (args: QueryNearVideoArgs<T>) => Promise<QueryReturn<T>>;
}

export default QueryManager.use;
