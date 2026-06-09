import { RetryOptions } from 'nice-grpc-client-middleware-retry';
import { HealthClient } from '../../proto/google/health/v1/health.js';
import { WeaviateClient } from '../../proto/v1/weaviate.js';
import type { GrpcConnectionParams } from '../grpc.js';

export interface GrpcClients {
  client: WeaviateClient<RetryOptions>;
  health: HealthClient<RetryOptions>;
  close: () => void;
}

export interface GrpcTransport {
  create(config: GrpcConnectionParams & { grpcMaxMessageLength: number }): GrpcClients;
}
