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
};

export type ConnectToLocalOptions = Omit<ConnectToLocalOptionsCore, 'grpcPort'>;
export type ConnectToCustomOptions = Omit<ConnectToCustomOptionsCore, 'grpcHost' | 'grpcPort' | 'grpcSecure'>;

/**
 * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
 *
 * @param {ConnectToCustomOptions} options Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
 */
export function connectToCustom(options: ConnectToCustomOptions): Promise<WeaviateClient> {
  return helpers.connectToCustom(weaviate, context, {
    ...options,
    grpcHost: options.httpHost,
    grpcPort: options.httpPort,
    grpcSecure: options.httpSecure,
  });
}

/**
 * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
 *
 * @param {ConnectToLocalOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
 */
export function connectToLocal(options?: ConnectToLocalOptions): Promise<WeaviateClient> {
  return helpers.connectToLocal(weaviate, context, { ...options, grpcPort: options?.port });
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
  return helpers.connectToWeaviateCloud(clusterURL, weaviate, context, true, options);
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
