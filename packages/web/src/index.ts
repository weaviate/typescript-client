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
  ICollection,
  ICollections,
  IWeaviateClient,
  permissions,
  reconfigure,
} from '@weaviate/core';
import { toBase64FromMedia } from './base64.js';
import { transportsMaker } from './transports.js';

const context: Context<string | Blob> = {
  transportsMaker,
  toBase64FromMedia,
  // No `agentMaker` on purpose: the browser uses fetch-based gRPC-Web (and fetch for REST), so no Node
  // `http`/`https` Agent is needed. Omitting it keeps those Node builtins out of the browser bundle.
};

export type ConnectToLocalOptions = Omit<ConnectToLocalOptionsCore, 'grpcPort'>;
export type ConnectToCustomOptions = Omit<ConnectToCustomOptionsCore, 'grpcHost' | 'grpcPort' | 'grpcSecure'>;

const webify = (
  context: Context<string | Blob>,
  params: ClientParams
): Promise<IWeaviateClient<string | Blob>> => {
  params.connectionParams.grpc = {
    host: params.connectionParams.http.host,
    port: params.connectionParams.http.port,
    secure: params.connectionParams.http.secure,
    path: '/grpc-web',
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
  client: (params: ClientParams) => weaviate(context, params),
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

export interface WeaviateClient extends IWeaviateClient<string | Blob> {}
export interface Collections extends ICollections<string | Blob> {}
export interface Collection<T, N> extends ICollection<T, N, string | Blob> {}

export default app;

export * from '@weaviate/core';
