import Connection from '.';

import { ConnectionParams, ConsistencyLevel } from '..';

import { ChannelCredentials, createChannel, createClient, Metadata } from 'nice-grpc';

import { WeaviateDefinition, WeaviateClient } from '../proto/v1/weaviate';

import Batcher, { Batch } from '../grpc/batcher';
import Searcher, { Search } from '../grpc/searcher';

export default class GrpcConnection extends Connection {
  private grpc?: GrpcClient;

  constructor(params: ConnectionParams) {
    super(params);
    this.grpc = grpcClient(params);
  }

  search = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    const grpc = this.grpc;
    if (!grpc) {
      throw new Error(
        'gRPC client not initialized, did you forget to set the gRPC address in ConnectionParams?'
      );
    }
    return new Promise<Search>((resolve) => resolve(grpc.search(name, consistencyLevel, tenant)));
  };

  batch = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    const grpc = this.grpc;
    if (!grpc) {
      throw new Error(
        'gRPC client not initialized, did you forget to set the gRPC address in ConnectionParams?'
      );
    }
    return new Promise<Batch>((resolve) => resolve(grpc.batch(name, consistencyLevel, tenant)));
  };
}

export interface GrpcClient {
  batch: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) => Batch;
  search: (
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Search;
}

export const grpcClient = (config: ConnectionParams): GrpcClient | undefined => {
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
    batch: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) =>
      Batcher.use(
        client,
        name,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        consistencyLevel,
        tenant
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
