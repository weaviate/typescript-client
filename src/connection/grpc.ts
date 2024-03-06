import ConnectionGQL, { ConnectionParams } from '.';

import { ConsistencyLevel } from '../data';

import { ChannelCredentials, createChannel, createClient, Metadata } from 'nice-grpc';

import { WeaviateDefinition, WeaviateClient } from '../proto/v1/weaviate';
import {
  HealthDefinition,
  HealthClient,
  HealthCheckResponse_ServingStatus,
} from '../proto/google/health/v1/health';

import Batcher, { Batch } from '../grpc/batcher';
import Searcher, { Search } from '../grpc/searcher';

export interface GrpcConnectionParams extends ConnectionParams {
  grpcAddress: string;
  grpcSecure: boolean;
}

// Must extend from ConnectionGQL so that it can be passed to all the builder methods,
// which are tightly coupled to ConnectionGQL
export default class ConnectionGRPC extends ConnectionGQL {
  private grpc: GrpcClient;

  private constructor(params: GrpcConnectionParams) {
    super(params);
    this.grpc = grpcClient(params);
  }

  static use = async (params: GrpcConnectionParams) => {
    const connection = new ConnectionGRPC(params);
    await connection.connect();
    return connection;
  };

  private async connect() {
    const isHealthy = await this.grpc.health();
    if (!isHealthy) {
      throw new Error('gRPC server is not healthy');
    }
  }

  search = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.grpc.search(name, consistencyLevel, tenant, `Bearer ${token}`)
      );
    }
    return new Promise<Search>((resolve) => resolve(this.grpc.search(name, consistencyLevel, tenant)));
  };

  batch = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.grpc.batch(name, consistencyLevel, tenant, `Bearer ${token}`));
    }
    return new Promise<Batch>((resolve) => resolve(this.grpc.batch(name, consistencyLevel, tenant)));
  };
}

export interface GrpcClient {
  batch: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) => Batch;
  health: () => Promise<boolean>;
  search: (
    name: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Search;
}

export const grpcClient = (config: GrpcConnectionParams): GrpcClient => {
  const channel = createChannel(
    config.grpcAddress,
    config.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure()
  );
  const client: WeaviateClient = createClient(WeaviateDefinition, channel);
  const health: HealthClient = createClient(HealthDefinition, channel);
  return {
    batch: (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) =>
      Batcher.use(
        client,
        name,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        consistencyLevel,
        tenant
      ),
    health: () =>
      health
        .check({ service: '/grpc.health.v1.Health/Check' })
        .then((res) => res.status === HealthCheckResponse_ServingStatus.SERVING),
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
