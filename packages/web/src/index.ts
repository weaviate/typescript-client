import weaviate, {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  ClientParams,
  configGuards,
  configure,
  ConnectToCustomOptions as ConnectToCustomOptionsCore,
  ConnectToLocalOptions as ConnectToLocalOptionsCore,
  ConnectToWeaviateCloudOptions,
  Context,
  filter,
  helpers,
  IAggregate,
  IAggregateGroupBy,
  ICollection,
  ICollections,
  IGenerate,
  IQuery,
  IWeaviateClient,
  permissions,
  reconfigure,
} from '@weaviate/core';
import { toBase64FromMedia } from './base64.js';
import { transportsMaker } from './transports.js';

export type Media = string | Blob;

const context: Context<Media> = {
  transportsMaker,
  toBase64FromMedia,
  // No `agentMaker` on purpose: the browser uses fetch-based gRPC-Web (and fetch for REST), so no Node
  // `http`/`https` Agent is needed. Omitting it keeps those Node builtins out of the browser bundle.
};

export type ConnectToLocalOptions = Omit<ConnectToLocalOptionsCore, 'grpcPort'>;
export type ConnectToCustomOptions = Omit<ConnectToCustomOptionsCore, 'grpcHost' | 'grpcPort' | 'grpcSecure'>;

const webify = (context: Context<Media>, params: ClientParams): Promise<IWeaviateClient<Media>> => {
  params.connectionParams.grpc = {
    host: params.connectionParams.http.host,
    port: params.connectionParams.http.port,
    secure: params.connectionParams.http.secure,
    path: '/v1/grpc-web',
  };
  return weaviate(context, params, true);
};

/**
 * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
 *
 * @param {ConnectToCustomOptions} options Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
 */
export function connectToCustom(options: ConnectToCustomOptions): Promise<WeaviateClient> {
  return helpers.connectToCustom(webify, context, options);
}

/**
 * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
 *
 * @param {ConnectToLocalOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
 */
export function connectToLocal(options?: ConnectToLocalOptions): Promise<WeaviateClient> {
  return helpers.connectToLocal(webify, context, options);
}

/**
 * Connect to your own Weaviate Cloud (WCD) instance.
 *
 * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
 * @param {ConnectToWeaviateCloudOptions} [options] Additional options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
 */
export function connectToWeaviateCloud(
  clusterURL: string,
  options?: ConnectToWeaviateCloudOptions
): Promise<WeaviateClient> {
  return helpers.connectToWeaviateCloud(clusterURL, webify, context, options);
}

const app = {
  connectToCustom,
  connectToLocal,
  connectToWeaviateCloud,
  client: (params: ClientParams) => webify(context, params),
  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  configGuards,
  filter: filter<any>(),
  reconfigure,
  permissions,
};

export interface WeaviateClient extends IWeaviateClient<Media> {}
export interface Collections extends ICollections<Media> {}
export interface Collection<T = undefined, N = string, V = undefined> extends ICollection<T, N, V, Media> {}
export interface Aggregate<T, V> extends IAggregate<T, V, Media> {}
export interface AggregateGroupBy<T, V> extends IAggregateGroupBy<T, V, Media> {}
export interface Query<T, V> extends IQuery<T, V, Media> {}
export interface Generate<T, V> extends IGenerate<T, V, Media> {}

export default app;

export * from '@weaviate/core';
