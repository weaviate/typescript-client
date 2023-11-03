import { ConnectionParams, ConsistencyLevel } from '..';

import { createChannel, createClient } from 'nice-grpc';

import { WeaviateDefinition, WeaviateClient } from '../proto/v1/weaviate';
import { ConsistencyLevel as ConsistencyLevelGrpc } from '../proto/v1/base';
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
  NearTextSearch_Move,
  NearVector,
  NearVideoSearch,
  ObjectPropertiesRequest,
  PropertiesRequest,
  SearchReply,
  SortBy,
} from '../proto/v1/search_get';

interface SearchGetArgs {
  limit?: number;
  offset?: number;
  after?: string;
  filters?: Filters;
  sort?: SortBy[];
  returnMetadata?: MetadataRequest;
  returnProperties?: PropertiesRequest;
  generative?: GenerativeSearch;
}

export interface Search {
  get: (args: SearchGetArgs) => Promise<SearchReply>;
}

export interface GrpcClient {
  search: (name: string, headers?: HeadersInit) => Search;
}

export default (config: ConnectionParams): GrpcClient | undefined => {
  if (!config.grpcAddress) {
    return undefined;
  }
  const client: WeaviateClient = createClient(WeaviateDefinition, createChannel(config.grpcAddress));
  return {
    search: (name: string, headers?: HeadersInit) => SearchClient.use(client, name),
  };
};

class SearchClient implements Search {
  private connection: WeaviateClient;
  private name: string;
  private consistencyLevel?: ConsistencyLevelGrpc;
  private tenant?: string;

  private metadata?: MetadataRequest;
  private properties?: PropertiesRequest;

  private limit?: number;
  private offset?: number;
  private autocut?: number;
  private after?: string;

  private bm25?: BM25;
  private hybrid?: Hybrid;

  private nearAudio?: NearAudioSearch;
  private nearImage?: NearImageSearch;
  private nearObject?: NearObject;
  private nearText?: NearTextSearch;
  private nearVector?: NearVector;
  private nearVideo?: NearVideoSearch;

  private filters?: Filters;
  private generative?: GenerativeSearch;
  private groupBy?: GroupBy;
  private sortBy?: SortBy[];

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

  static use(
    connection: WeaviateClient,
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Search {
    return new SearchClient(connection, name, consistencyLevel, tenant);
  }

  public get(args: SearchGetArgs) {
    this.limit = args.limit;
    this.offset = args.offset;
    this.after = args.after;
    this.filters = args.filters;
    this.metadata = args.returnMetadata;
    this.properties = args.returnProperties;
    this.sortBy = args.sort;
    return this.call();
  }

  private call() {
    return this.connection.search({
      collection: this.name,
      consistencyLevel: this.consistencyLevel,
      tenant: this.tenant,
      limit: this.limit,
      offset: this.offset,
      after: this.after,
      filters: this.filters,
      metadata: this.metadata,
      properties: this.properties,
      bm25Search: this.bm25,
      hybridSearch: this.hybrid,
      nearAudio: this.nearAudio,
      nearImage: this.nearImage,
      nearObject: this.nearObject,
      nearText: this.nearText,
      nearVector: this.nearVector,
      nearVideo: this.nearVideo,
      sortBy: this.sortBy,
      generative: this.generative,
      groupBy: this.groupBy,
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
