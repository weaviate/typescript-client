import { ConsistencyLevel } from '..';

import { WeaviateClient } from '../proto/v1/weaviate';
import { Filters } from '../proto/v1/base';
import {
  BM25,
  GenerativeSearch,
  GroupBy,
  Hybrid,
  MetadataRequest,
  NearAudioSearch,
  NearDepthSearch,
  NearImageSearch,
  NearIMUSearch,
  NearObject,
  NearTextSearch,
  NearThermalSearch,
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
  sortBy?: SortBy[];
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

export interface SearchNearDepthArgs extends BaseSearchArgs {
  nearDepth: NearDepthSearch;
}

export interface SearchNearImageArgs extends BaseSearchArgs {
  nearImage: NearImageSearch;
}

export interface SearchNearIMUArgs extends BaseSearchArgs {
  nearIMU: NearIMUSearch;
}

export interface SearchNearObjectArgs extends BaseSearchArgs {
  nearObject: NearObject;
}

export interface SearchNearTextArgs extends BaseSearchArgs {
  nearText: NearTextSearch;
}

export interface SearchNearThermalArgs extends BaseSearchArgs {
  nearThermal: NearThermalSearch;
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
  withNearDepth: (args: SearchNearDepthArgs) => Promise<SearchReply>;
  withNearImage: (args: SearchNearImageArgs) => Promise<SearchReply>;
  withNearIMU: (args: SearchNearIMUArgs) => Promise<SearchReply>;
  withNearObject: (args: SearchNearObjectArgs) => Promise<SearchReply>;
  withNearText: (args: SearchNearTextArgs) => Promise<SearchReply>;
  withNearThermal: (args: SearchNearThermalArgs) => Promise<SearchReply>;
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
  public withNearDepth = (args: SearchNearDepthArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearImage = (args: SearchNearImageArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearIMU = (args: SearchNearIMUArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearObject = (args: SearchNearObjectArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearText = (args: SearchNearTextArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearThermal = (args: SearchNearThermalArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearVector = (args: SearchNearVectorArgs) => this.call(SearchRequest.fromPartial(args));
  public withNearVideo = (args: SearchNearVideoArgs) => this.call(SearchRequest.fromPartial(args));

  private call(message: SearchRequest) {
    return this.connection.search(
      {
        ...message,
        collection: this.name,
        consistencyLevel: this.consistencyLevel,
        tenant: this.tenant,
        uses123Api: true,
      },
      {
        metadata: this.metadata,
      }
    );
  }
}
