import { isAbortError } from 'abort-controller-x';

import { InternalConnectionParams } from '../http.js';

import { ConsistencyLevel } from '../../../data/index.js';

import { ClientError, createChannel, createClientFactory, Metadata, Status } from 'nice-grpc-web';

import {
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
} from '../../../proto/google/health/v1/health.js';
import { WeaviateDefinition } from '../../../proto/v1/weaviate.js';

import Aggregator, { Aggregate } from '../../../grpc/aggregator.js';
import Batcher, { Batch } from '../../../grpc/batcher.js';
import Searcher, { Search } from '../../../grpc/searcher.js';
import TenantsManager, { Tenants } from '../../../grpc/tenantsManager.js';

import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { WeaviateGRPCUnavailableError } from '../../../errors.js';

export interface GrpcConnectionParams extends InternalConnectionParams {
  grpcAddress: string;
  grpcSecure: boolean;
}

const clientFactory = createClientFactory().use(retryMiddleware);

export interface GrpcClient {
  aggregate: (
    collection: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Aggregate;
  batch: (
    collection: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Batch;
  close: () => void;
  health: () => Promise<boolean>;
  search: (
    collection: string,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    bearerToken?: string
  ) => Search;
  tenants: (collection: string, bearerToken?: string) => Tenants;
}

export const grpcClient = (config: GrpcConnectionParams & { grpcMaxMessageLength: number }): GrpcClient => {
  const channel = createChannel(config.grpcAddress);
  const client = clientFactory.create(WeaviateDefinition, channel);
  const health = clientFactory.create(HealthDefinition, channel);
  return {
    aggregate: (
      collection: string,
      consistencyLevel?: ConsistencyLevel,
      tenant?: string,
      bearerToken?: string
    ) =>
      Aggregator.use(
        client,
        collection,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        config.timeout?.query || 30,
        consistencyLevel,
        tenant
      ),
    batch: (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) =>
      Batcher.use(
        client,
        collection,
        getMetadataWithEmbeddingServiceAuth(config, bearerToken),
        config.timeout?.insert || 90,
        consistencyLevel,
        tenant
      ),
    close: () => {},
    health: () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), (config.timeout?.init || 2) * 1000);
      return health
        .check(
          { service: '/grpc.health.v1.Health/Check' },
          {
            signal: controller.signal,
            retry: true,
            retryMaxAttempts: 1,
            retryableStatuses: [Status.UNAVAILABLE],
            onRetryableError(error: ClientError, attempt: number, delayMs: number) {
              console.warn(error, `Healthcheck ${attempt} failed. Retrying in ${delayMs}ms.`);
            },
          }
        )
        .then((res) => res.status === HealthCheckResponse_ServingStatus.SERVING)
        .catch((err) => {
          if (isAbortError(err)) {
            throw new WeaviateGRPCUnavailableError(config.grpcAddress);
          }
          throw err;
        })
        .finally(() => clearTimeout(timeoutId));
    },
    search: (
      collection: string,
      consistencyLevel?: ConsistencyLevel,
      tenant?: string,
      bearerToken?: string
    ) =>
      Searcher.use(
        client,
        collection,
        getMetadataWithEmbeddingServiceAuth(config, bearerToken),
        config.timeout?.query || 30,
        consistencyLevel,
        tenant
      ),
    tenants: (collection: string, bearerToken?: string) =>
      TenantsManager.use(
        client,
        collection,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        config.timeout?.query || 30
      ),
  };
};

const getMetadataWithEmbeddingServiceAuth = (config: GrpcConnectionParams, bearerToken?: string) =>
  new Metadata(
    bearerToken
      ? {
          ...config.headers,
          authorization: bearerToken,
          'X-Weaviate-Cluster-Url': config.host,
          //  keeping for backwards compatibility for older clusters for now. On newer clusters, Embedding Service reuses Authorization header.
          'X-Weaviate-Api-Key': bearerToken,
        }
      : config.headers
  );
