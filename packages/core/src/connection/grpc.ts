import ConnectionGQL from './gql.js';
import { InternalConnectionParams } from './http.js';

import { ConsistencyLevel } from '../replication.js';

import { DbVersionSupport, initDbVersionProvider } from '../utils/dbVersion.js';

import { isAbortError } from 'abort-controller-x';
import { Metadata, Status } from 'nice-grpc-common';
import { WeaviateGRPCUnavailableError, WeaviateUnsupportedFeatureError } from '../errors.js';
import Aggregator, { Aggregate } from '../grpc/aggregator.js';
import Batcher, { Batch } from '../grpc/batcher.js';
import Searcher, { Search } from '../grpc/searcher.js';
import TenantsManager, { Tenants } from '../grpc/tenantsManager.js';
import { Meta } from '../openapi/types.js';
import { HealthCheckResponse_ServingStatus, HealthClient } from '../proto/google/health/v1/health.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

export interface GrpcConnectionParams extends InternalConnectionParams {
  grpcAddress: string;
  grpcSecure: boolean;
}

const MAX_GRPC_MESSAGE_LENGTH = 104858000; // 10mb, needs to be synchronized with GRPC server

// Must extend from ConnectionGQL so that it can be passed to all the builder methods,
// which are tightly coupled to ConnectionGQL
export default class ConnectionGRPC extends ConnectionGQL {
  private grpc: GrpcClient;

  private constructor(transports: Transports, params: GrpcConnectionParams) {
    super(params);
    this.grpc = grpcClient(transports, params);
  }

  static use = async (transportsMaker: TransportsMaker, params: GrpcConnectionParams) => {
    const rest = new ConnectionGQL(params);
    const dbVersionProvider = initDbVersionProvider(rest);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);
    let grpcMaxMessageLength = MAX_GRPC_MESSAGE_LENGTH;
    if (!params.skipInitChecks) {
      grpcMaxMessageLength = await Promise.all([
        (rest.get('/meta', true) as Promise<Meta>).then(
          (res: Meta) => res.grpcMaxMessageSize || MAX_GRPC_MESSAGE_LENGTH
        ),
        dbVersionSupport.supportsCompatibleGrpcService().then((check) => {
          if (!check.supports) {
            throw new WeaviateUnsupportedFeatureError(
              `Checking for gRPC compatibility failed with message: ${check.message}`
            );
          }
        }),
      ]).then(([grpcMaxMessageLength]) => grpcMaxMessageLength);
    }
    const connection = new ConnectionGRPC(
      transportsMaker({
        grpcAddress: params.grpcAddress,
        grpcSecure: params.grpcSecure,
        grpcMaxMessageLength,
      }),
      params
    );
    if (!params.skipInitChecks) {
      const isHealthy = await connection.grpc.health();
      if (!isHealthy) {
        await connection.close();
        throw new WeaviateGRPCUnavailableError(params.grpcAddress);
      }
    }
    return { connection, dbVersionProvider, dbVersionSupport };
  };

  batch = (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.grpc.batch(collection, consistencyLevel, tenant, `Bearer ${token}`)
      );
    }
    return new Promise<Batch>((resolve) => resolve(this.grpc.batch(collection, consistencyLevel, tenant)));
  };

  aggregate = (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.grpc.aggregate(collection, consistencyLevel, tenant, `Bearer ${token}`)
      );
    }
    return new Promise<Aggregate>((resolve) =>
      resolve(this.grpc.aggregate(collection, consistencyLevel, tenant))
    );
  };

  search = (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.grpc.search(collection, consistencyLevel, tenant, `Bearer ${token}`)
      );
    }
    return new Promise<Search>((resolve) => resolve(this.grpc.search(collection, consistencyLevel, tenant)));
  };

  tenants = (collection: string) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.grpc.tenants(collection, `Bearer ${token}`));
    }
    return new Promise<Tenants>((resolve) => resolve(this.grpc.tenants(collection)));
  };

  close = () => {
    this.grpc.close();
    this.http.close();
  };
}

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

export type Transports = {
  weaviate: WeaviateClient<any>;
  health: HealthClient<any>;
};

export type TransportsParams = {
  grpcAddress: string;
  grpcSecure: boolean;
  grpcMaxMessageLength: number;
};

export type TransportsMaker = (params: TransportsParams) => Transports;

const grpcClient = (transports: Transports, config: GrpcConnectionParams) => {
  return {
    aggregate: (
      collection: string,
      consistencyLevel?: ConsistencyLevel,
      tenant?: string,
      bearerToken?: string
    ) =>
      Aggregator.use(
        transports.weaviate,
        collection,
        new Metadata(bearerToken ? { ...config.headers, authorization: bearerToken } : config.headers),
        config.timeout?.query || 30,
        consistencyLevel,
        tenant
      ),
    batch: (collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string, bearerToken?: string) =>
      Batcher.use(
        transports.weaviate,
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
      return transports.health
        .check(
          { service: '/grpc.health.v1.Health/Check' },
          {
            signal: controller.signal,
            retry: true,
            retryMaxAttempts: 1,
            retryableStatuses: [Status.UNAVAILABLE],
            onRetryableError(error: any, attempt: number, delayMs: number) {
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
        transports.weaviate,
        collection,
        getMetadataWithEmbeddingServiceAuth(config, bearerToken),
        config.timeout?.query || 30,
        consistencyLevel,
        tenant
      ),
    tenants: (collection: string, bearerToken?: string) =>
      TenantsManager.use(
        transports.weaviate,
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
