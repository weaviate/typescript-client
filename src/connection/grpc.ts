import { isAbortError } from 'abort-controller-x';

import ConnectionGQL from './gql.js';
import { InternalConnectionParams } from './http.js';

import { ConsistencyLevel } from '../data/index.js';

import {
  ChannelCredentials,
  ChannelOptions,
  ClientError,
  createChannel,
  createClientFactory,
  Metadata,
  Status,
} from 'nice-grpc';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';

import { HealthCheckResponse_ServingStatus, HealthDefinition } from '../proto/google/health/v1/health.js';
import { WeaviateDefinition } from '../proto/v1/weaviate.js';

import Batcher, { Batch } from '../grpc/batcher.js';
import Searcher, { Search } from '../grpc/searcher.js';
import TenantsManager, { Tenants } from '../grpc/tenantsManager.js';
import { DbVersionSupport, initDbVersionProvider } from '../utils/dbVersion.js';

import { WeaviateGRPCUnavailableError, WeaviateUnsupportedFeatureError } from '../errors.js';
import Aggregator, { Aggregate } from '../grpc/aggregator.js';
import { Meta } from '../openapi/types.js';

export interface GrpcConnectionParams extends InternalConnectionParams {
  grpcAddress: string;
  grpcSecure: boolean;
}

// WEAVIATE_CLIENT_VERSION is injected at build time by tsup's define option
// In test environment, it's set via global scope
declare const WEAVIATE_CLIENT_VERSION: string;

const clientFactory = createClientFactory().use(retryMiddleware);

const MAX_GRPC_MESSAGE_LENGTH = 104858000; // 10mb, needs to be synchronized with GRPC server

// Must extend from ConnectionGQL so that it can be passed to all the builder methods,
// which are tightly coupled to ConnectionGQL
export default class ConnectionGRPC extends ConnectionGQL {
  private grpc: GrpcClient;

  private constructor(params: GrpcConnectionParams & { grpcMaxMessageLength: number }) {
    super(params);
    this.grpc = grpcClient(params);
  }

  static use = (params: GrpcConnectionParams) => {
    const rest = new ConnectionGQL(params);
    const dbVersionProvider = initDbVersionProvider(rest);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);
    if (params.skipInitChecks) {
      return {
        connection: new ConnectionGRPC({
          ...params,
          grpcMaxMessageLength: MAX_GRPC_MESSAGE_LENGTH,
        }),
        dbVersionProvider,
        dbVersionSupport,
      };
    }
    return Promise.all([
      ConnectionGRPC.connect(
        params,
        (rest.get('/meta', true) as Promise<Meta>).then(
          (res: Meta) => res.grpcMaxMessageSize || MAX_GRPC_MESSAGE_LENGTH
        )
      ),
      dbVersionSupport.supportsCompatibleGrpcService().then((check) => {
        if (!check.supports) {
          throw new WeaviateUnsupportedFeatureError(
            `Checking for gRPC compatibility failed with message: ${check.message}`
          );
        }
      }),
    ]).then(([connection]) => {
      return { connection, dbVersionProvider, dbVersionSupport };
    });
  };

  private static async connect(
    params: GrpcConnectionParams,
    grpcMaxLengthPromise: Promise<number>
  ): Promise<ConnectionGRPC> {
    const connection = await grpcMaxLengthPromise.then(
      (grpcMaxMessageLength) =>
        new ConnectionGRPC({
          ...params,
          grpcMaxMessageLength,
        })
    );
    const isHealthy = await connection.grpc.health();
    if (!isHealthy) {
      await connection.close();
      throw new WeaviateGRPCUnavailableError(params.grpcAddress);
    }
    return connection;
  }

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

export const grpcClient = (config: GrpcConnectionParams & { grpcMaxMessageLength: number }): GrpcClient => {
  const channelOptions: ChannelOptions = {
    'grpc.max_send_message_length': config.grpcMaxMessageLength,
    'grpc.max_receive_message_length': config.grpcMaxMessageLength,
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
    aggregate: (
      collection: string,
      consistencyLevel?: ConsistencyLevel,
      tenant?: string,
      bearerToken?: string
    ) =>
      Aggregator.use(
        client,
        collection,
        getMetadataWithEmbeddingServiceAuth(config, bearerToken),
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
    close: () => channel.close(),
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
  new Metadata({
    ...(bearerToken
      ? {
          ...config.headers,
          authorization: bearerToken,
          'X-Weaviate-Cluster-Url': config.host,
        }
      : config.headers),
    'X-Weaviate-Client': `weaviate-client-typescript/${WEAVIATE_CLIENT_VERSION}`,
  });
