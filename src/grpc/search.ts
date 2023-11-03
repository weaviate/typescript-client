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

export interface SearchBm25Args {
  bm25: BM25;
  limit?: number;
  autocut?: number;
  filters?: Filters;
  returnMetadata?: MetadataRequest;
  returnProperties?: PropertiesRequest;
  generative?: GenerativeSearch;
}

export interface SearchHybridArgs {
  hybrid: Hybrid;
  limit?: number;
  autocut?: number;
  filters?: Filters;
  returnMetadata?: MetadataRequest;
  returnProperties?: PropertiesRequest;
  generative?: GenerativeSearch;
}

export interface Search {
  withFetch: (args: SearchFetchArgs) => Promise<SearchReply>;
  withBm25: (args: SearchBm25Args) => Promise<SearchReply>;
  withHybrid: (args: SearchHybridArgs) => Promise<SearchReply>;
}

export default class SearchClient implements Search {
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
    return new SearchClient(connection, name, consistencyLevel, tenant);
  }

  public withFetch = (args: SearchFetchArgs) => this.call(SearchRequest.fromPartial(args));
  public withBm25 = (args: SearchBm25Args) => this.call(SearchRequest.fromPartial(args));
  public withHybrid = (args: SearchHybridArgs) => this.call(SearchRequest.fromPartial(args));

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
