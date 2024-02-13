import { ConnectionParams, ConsistencyLevel } from '..';

import { ChannelCredentials, createChannel, createClient, Metadata } from 'nice-grpc';

import { WeaviateDefinition, WeaviateClient } from '../proto/v1/weaviate';

import Batcher, { Batch } from '../grpc/batcher';
import Searcher, { Search } from '../grpc/searcher';

export interface GrpcClient {
  batch: (consistencyLevel?: ConsistencyLevel, bearerToken?: string) => Batch;
  search: (
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Search;
}

export default (config: ConnectionParams): GrpcClient | undefined => {
  if (!config.grpcAddress) {
    return undefined;
  }
  const client: WeaviateClient = createClient(
    WeaviateDefinition,
    createChannel(
      config.grpcAddress,
      config.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure()
    )
  );
  return {
    batch: (consistencyLevel?: ConsistencyLevel, bearerToken?: string) =>
      Batcher.use(
        client,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        consistencyLevel
      ),
    search: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) =>
      Searcher.use(
        client,
        name,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        consistencyLevel,
        tenant
      ),
  };
};
