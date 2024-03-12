import ConnectionGQL from './gql';
import { ConnectionParams } from './http';

import { ConsistencyLevel } from '../data';

import { ChannelCredentials, ChannelOptions, createChannel, createClientFactory, Metadata } from 'nice-grpc';
import { deadlineMiddleware } from 'nice-grpc-client-middleware-deadline';

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

const clientFactory = createClientFactory().use(deadlineMiddleware);

const MAX_GRPC_MESSAGE_LENGTH = 104858000; // 10mb, needs to be synchronized with GRPC server

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
  const channelOptions: ChannelOptions = {
    'grpc.max_send_message_length': MAX_GRPC_MESSAGE_LENGTH,
    'grpc.max_receive_message_length': MAX_GRPC_MESSAGE_LENGTH,
  };
  if (config.grpcProxyUrl) {
    // grpc.http_proxy is not used by grpc.js under-the-hood
    // only uses the env var and whether http_proxy is enabled
    process.env.grpc_proxy = config.grpcProxyUrl;
    channelOptions['grpc.enabled_http_proxy'] = true;
  }
  const channel = createChannel(
    config.grpcAddress,
    config.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
    channelOptions
  );
  const client = clientFactory.create(WeaviateDefinition, channel);
  const health = clientFactory.create(HealthDefinition, channel);
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
