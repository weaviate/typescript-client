import { ConnectionParams, ConsistencyLevel } from '..';

import { createChannel, createClient } from 'nice-grpc';

import { WeaviateDefinition, WeaviateClient } from '../proto/v1/weaviate';

import SearchClient, { Search } from '../grpc/search';

export interface GrpcClient {
  search: (
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    headers?: HeadersInit
  ) => Search;
}

export default (config: ConnectionParams): GrpcClient | undefined => {
  if (!config.grpcAddress) {
    return undefined;
  }
  const client: WeaviateClient = createClient(WeaviateDefinition, createChannel(config.grpcAddress));
  return {
    search: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, headers?: HeadersInit) =>
      SearchClient.use(client, name, consistencyLevel, tenant),
  };
};
