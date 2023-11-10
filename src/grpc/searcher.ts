import { ConsistencyLevel } from '..';

import { WeaviateClient } from '../proto/v1/weaviate';
import {
  BM25,
  Filters,
  GenerativeSearch,
  GroupBy,
  Hybrid,
  MetadataRequest,
  NearAudioSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearVector,
  NearVideoSearch,
  PropertiesRequest,
  SearchReply,
  SearchRequest,
  SortBy,
} from '../proto/v1/search_get';
import { Metadata } from 'nice-grpc';

import Base from './base';

export interface SearchFetchArgs {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters;
  sort?: SortBy[];
  metadata?: MetadataRequest;
  properties?: PropertiesRequest;
  generative?: GenerativeSearch;
  groupBy?: GroupBy;
}

interface BaseSearchArgs {
  limit?: number;
  autocut?: number;
  filters?: Filters;
  metadata?: MetadataRequest;
  properties?: PropertiesRequest;
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

export default class Searcher extends Base implements Search {
  public static use(
    connection: WeaviateClient,
    name: string,
    metadata: Metadata,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Search {
    return new Searcher(connection, name, metadata, consistencyLevel, tenant);
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
    return this.connection.search(
      {
        ...message,
        collection: this.name,
        consistencyLevel: this.consistencyLevel,
        tenant: this.tenant,
      },
      {
        metadata: this.metadata,
      }
    );
  }
}
