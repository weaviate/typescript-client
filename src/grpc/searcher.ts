import { ConsistencyLevel } from '..';

import { WeaviateClient } from '../proto/v1/weaviate';
import { ConsistencyLevel as ConsistencyLevelGrpc } from '../proto/v1/base';
import {
  BM25,
  Filters,
  GenerativeSearch,
  GroupBy,
  Hybrid,
  Hybrid_FusionType,
  MetadataRequest,
  NearAudioSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearTextSearch_Move,
  NearVector,
  NearVideoSearch,
  ObjectPropertiesRequest,
  PropertiesRequest,
  SearchReply,
  SearchRequest,
  SortBy,
} from '../proto/v1/search_get';

export interface SearchFetchArgs {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters;
  sort?: SortBy[];
  returnMetadata?: MetadataRequest;
  returnProperties?: PropertiesRequest;
  generative?: GenerativeSearch;
}

interface BaseSearchArgs {
  limit?: number;
  autocut?: number;
  filters?: Filters;
  returnMetadata?: MetadataRequest;
  returnProperties?: PropertiesRequest;
  generative?: GenerativeSearch;
  groupBy?: GroupBy;
}

export interface SearchBm25Args extends BaseSearchArgs {
  bm25: BM25;
}

export interface SearchHybridArgs extends BaseSearchArgs {
  hybrid: Hybrid;
}

export interface SearchNearAudioArgs extends BaseSearchArgs {
  nearAudio: NearAudioSearch;
}

export interface SearchNearImageArgs extends BaseSearchArgs {
  nearImage: NearImageSearch;
}

export interface SearchNearObjectArgs extends BaseSearchArgs {
  nearObject: NearObject;
}

export interface SearchNearTextArgs extends BaseSearchArgs {
  nearText: NearTextSearch;
}

export interface SearchNearVectorArgs extends BaseSearchArgs {
  nearVector: NearVector;
}

export interface SearchNearVideoArgs extends BaseSearchArgs {
  nearVideo: NearVideoSearch;
}

export interface Search {
  withFetch: (args: SearchFetchArgs) => Promise<SearchReply>;
  withBm25: (args: SearchBm25Args) => Promise<SearchReply>;
  withHybrid: (args: SearchHybridArgs) => Promise<SearchReply>;
  withNearAudio: (args: SearchNearAudioArgs) => Promise<SearchReply>;
  withNearImage: (args: SearchNearImageArgs) => Promise<SearchReply>;
  withNearObject: (args: SearchNearObjectArgs) => Promise<SearchReply>;
  withNearText: (args: SearchNearTextArgs) => Promise<SearchReply>;
  withNearVector: (args: SearchNearVectorArgs) => Promise<SearchReply>;
  withNearVideo: (args: SearchNearVideoArgs) => Promise<SearchReply>;
}

export default class Searcher implements Search {
  private connection: WeaviateClient;
  private name: string;
  private consistencyLevel?: ConsistencyLevelGrpc;
  private tenant?: string;

  private constructor(
    connection: WeaviateClient,
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.consistencyLevel = this.mapConsistencyLevel(consistencyLevel);
    this.tenant = tenant;
  }

  public static use(
    connection: WeaviateClient,
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Search {
    return new Searcher(connection, name, consistencyLevel, tenant);
  }

  public withFetch = (args: SearchFetchArgs) => this.call(SearchRequest.fromPartial(args));
  public withBm25 = (args: SearchBm25Args) => this.call(SearchRequest.fromPartial(args));
  public withHybrid = (args: SearchHybridArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearAudio = (args: SearchNearAudioArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearImage = (args: SearchNearImageArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearObject = (args: SearchNearObjectArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearText = (args: SearchNearTextArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearVector = (args: SearchNearVectorArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearVideo = (args: SearchNearVideoArgs) => this.call(SearchRequest.fromPartial(args));

  private call(message: SearchRequest) {
    return this.connection.search({
      ...message,
      collection: this.name,
      consistencyLevel: this.consistencyLevel,
      tenant: this.tenant,
    });
  }

  private mapConsistencyLevel(consistencyLevel?: ConsistencyLevel): ConsistencyLevelGrpc {
    switch (consistencyLevel) {
      case 'ALL':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_ALL;
      case 'QUORUM':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_QUORUM;
      case 'ONE':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_ONE;
      default:
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_UNSPECIFIED;
    }
  }
}
