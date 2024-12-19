import { ConsistencyLevel } from '../data/index.js';

import { Metadata, ServerError, Status } from 'nice-grpc';
import { Filters } from '../proto/v1/base.js';
import {
  BM25,
  GroupBy,
  Hybrid,
  MetadataRequest,
  NearAudioSearch,
  NearDepthSearch,
  NearIMUSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearThermalSearch,
  NearVector,
  NearVideoSearch,
  PropertiesRequest,
  Rerank,
  SearchReply,
  SearchRequest,
  SortBy,
} from '../proto/v1/search_get.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

import { RetryOptions } from 'nice-grpc-client-middleware-retry';
import { WeaviateInsufficientPermissionsError, WeaviateQueryError } from '../errors.js';
import { GenerativeSearch } from '../proto/v1/generative.js';
import Base from './base.js';
import { retryOptions } from './retry.js';

export type SearchFetchArgs = {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters;
  sortBy?: SortBy[];
  metadata?: MetadataRequest;
  properties?: PropertiesRequest;
  generative?: GenerativeSearch;
  groupBy?: GroupBy;
};

export type BaseSearchArgs = {
  limit?: number;
  offset?: number;
  autocut?: number;
  filters?: Filters;
  rerank?: Rerank;
  metadata?: MetadataRequest;
  properties?: PropertiesRequest;
  generative?: GenerativeSearch;
  groupBy?: GroupBy;
};

export type SearchBm25Args = BaseSearchArgs & {
  bm25Search: BM25;
};

export type SearchHybridArgs = BaseSearchArgs & {
  hybridSearch: Hybrid;
};

export type SearchNearAudioArgs = BaseSearchArgs & {
  nearAudio: NearAudioSearch;
};

export type SearchNearDepthArgs = BaseSearchArgs & {
  nearDepth: NearDepthSearch;
};

export type SearchNearImageArgs = BaseSearchArgs & {
  nearImage: NearImageSearch;
};

export type SearchNearIMUArgs = BaseSearchArgs & {
  nearIMU: NearIMUSearch;
};

export type SearchNearObjectArgs = BaseSearchArgs & {
  nearObject: NearObject;
};

export type SearchNearTextArgs = BaseSearchArgs & {
  nearText: NearTextSearch;
};

export type SearchNearThermalArgs = BaseSearchArgs & {
  nearThermal: NearThermalSearch;
};

export type SearchNearVectorArgs = BaseSearchArgs & {
  nearVector: NearVector;
};

export type SearchNearVideoArgs = BaseSearchArgs & {
  nearVideo: NearVideoSearch;
};

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
    connection: WeaviateClient<RetryOptions>,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Search {
    return new Searcher(connection, collection, metadata, timeout, consistencyLevel, tenant);
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

  private call = (message: SearchRequest) =>
    this.sendWithTimeout((signal: AbortSignal) =>
      this.connection
        .search(
          {
            ...message,
            collection: this.collection,
            consistencyLevel: this.consistencyLevel,
            tenant: this.tenant,
            uses123Api: true,
            uses125Api: true,
          },
          {
            metadata: this.metadata,
            signal,
            ...retryOptions,
          }
        )
        .catch((err) => {
          if (err instanceof ServerError && err.code === Status.PERMISSION_DENIED) {
            throw new WeaviateInsufficientPermissionsError(7, err.message);
          }
          throw new WeaviateQueryError(err.message, 'gRPC');
        })
    );
}
