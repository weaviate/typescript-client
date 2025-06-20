import weaviate, {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  ClientParams,
  configGuards,
  configure,
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
  ConnectToWeaviateCloudOptions,
  Context,
  filter,
  helpers,
  permissions,
  reconfigure,
  IWeaviateClient,
  ICollections,
  ICollection,
} from '@weaviate/core';
import { toBase64FromMedia } from './base64.js';
import { transportsMaker } from './transports.js';

const context: Context<string | Buffer> = {
  transportsMaker,
  toBase64FromMedia,
};

/**
 * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
 *
 * @param {ConnectToCustomOptions} options Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
 */
export function connectToCustom(options: ConnectToCustomOptions): Promise<WeaviateClient> {
  return helpers.connectToCustom(weaviate, context, options);
}

/**
 * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
 *
 * @param {ConnectToLocalOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
 */
export function connectToLocal(options?: ConnectToLocalOptions): Promise<WeaviateClient> {
  return helpers.connectToLocal(weaviate, context, options);
}

/**
 * Connect to your own Weaviate Cloud (WCD) instance.
 *
 * @deprecated Use `connectToWeaviateCloud` instead.
 *
 * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
 * @param {ConnectToWCDOptions} [options] Additional options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
 */
export function connectToWCD(clusterURL: string, options?: ConnectToWCDOptions): Promise<WeaviateClient> {
  console.warn(
    'The `connectToWCD` method is deprecated. Please use `connectToWeaviateCloud` instead. This method will be removed in a future release.'
  );
  return helpers.connectToWeaviateCloud(clusterURL, weaviate, context, options);
}

/**
 * Connect to your own Weaviate Cloud Service (WCS) instance.
 *
 * @deprecated Use `connectToWeaviateCloud` instead.
 *
 * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
 * @param {ConnectToWCSOptions} [options] Additional options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCS instance.
 */
export function connectToWCS(clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateClient> {
  console.warn(
    'The `connectToWCS` method is deprecated. Please use `connectToWeaviateCloud` instead. This method will be removed in a future release.'
  );
  return helpers.connectToWeaviateCloud(clusterURL, weaviate, context, options);
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
  return helpers.connectToWeaviateCloud(clusterURL, weaviate, context, options);
}

const app = {
  connectToCustom,
  connectToLocal,
  connectToWCD,
  connectToWCS,
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

export interface WeaviateClient extends IWeaviateClient<string | Buffer> {}
export interface Collections extends ICollections<string | Buffer> {}
export interface Collection<T = undefined, N = string> extends ICollection<T, N, string | Buffer> {}

export default app;

export * from '@weaviate/core';
export * from './base64.js';
