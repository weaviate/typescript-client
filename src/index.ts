import { ConnectionGRPC } from './connection/index.js';
import { DbVersion } from './utils/dbVersion.js';
import { backup, Backup } from './collections/backup/client.js';
import cluster, { Cluster } from './collections/cluster/index.js';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  AuthCredentials,
  OidcAuthenticator,
  isApiKey,
  mapApiKey,
} from './connection/auth.js';
import {
  connectToLocal,
  connectToWCD,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  connectToCustom,
  ConnectToCustomOptions,
} from './connection/helpers.js';
import { ProxiesParams } from './connection/http.js';
import MetaGetter from './misc/metaGetter.js';
import collections, { Collections } from './collections/index.js';
import { configure, reconfigure } from './collections/configure/index.js';
import { Meta } from './openapi/types.js';

import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { LiveChecker, OpenidConfigurationGetter, ReadyChecker } from './misc/index.js';

import weaviateV2 from './v2/index.js';

export type ProtocolParams = {
  /**
   * The host to connect to. E.g., `localhost` or `example.com`.
   */
  host: string;
  /**
   * The port to connect to. E.g., `8080` or `80`.
   */
  port: number;
  /**
   * Whether to use a secure connection (https).
   */
  secure: boolean;
  /**
   * An optional path in the case that you are using a forwarding proxy.
   *
   * E.g., http://localhost:8080/weaviate
   */
  path?: string;
};

export type ClientParams = {
  /**
   * The connection parameters for the REST and GraphQL APIs (http/1.1).
   */
  rest: ProtocolParams;
  /**
   * The connection paramaters for the gRPC API (http/2).
   */
  grpc: ProtocolParams;
  /**
   * The credentials used to authenticate with Weaviate.
   *
   * Can be any of `AuthUserPasswordCredentials`, `AuthAccessTokenCredentials`, `AuthClientCredentials`, and `ApiKey`.
   */
  auth?: AuthCredentials;
  /**
   * Additional headers that should be passed to Weaviate in the underlying requests. E.g., X-OpenAI-Api-Key
   */
  headers?: HeadersInit;
  /**
   * The connection parameters for any tunnelling proxies that should be used.
   *
   * Note, if your proxy is a forwarding proxy then supply its configuration as if it were the Weaviate server itself using `rest` and `grpc`.
   */
  proxies?: ProxiesParams;
};

export interface WeaviateClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  oidcAuth?: OidcAuthenticator;

  close: () => Promise<void>;
  getMeta: () => Promise<Meta>;
  getOpenIDConfig?: () => Promise<any>;
  getWeaviateVersion: () => Promise<DbVersion>;
  isLive: () => Promise<boolean>;
  isReady: () => Promise<boolean>;
}

const cleanHost = (host: string, protocol: 'rest' | 'grpc') => {
  if (host.includes('http')) {
    console.warn(
      `The ${protocol}.host parameter should not include the protocol. Please remove the http:// or https:// from the ${protocol}.host parameter.\
      To specify a secure connection, set the secure parameter to true. The protocol will be inferred from the secure parameter instead.`
    );
    return host.replace('http://', '').replace('https://', '');
  }
  return host;
};

const app = {
  /**
   * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
   *
   * @param {ConnectToCustomOptions} options Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
   */
  connectToCustom: function (options: ConnectToCustomOptions): Promise<WeaviateClient> {
    return connectToCustom(this.client, options);
  },
  /**
   * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
   *
   * @param {ConnectToLocalOptions} [options] Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
   */
  connectToLocal: function (options?: ConnectToLocalOptions): Promise<WeaviateClient> {
    return connectToLocal(this.client, options);
  },
  /**
   * Connect to your own Weaviate Cloud (WCD) instance.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCDOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
   */
  connectToWCD: function (clusterURL: string, options?: ConnectToWCDOptions): Promise<WeaviateClient> {
    return connectToWCD(clusterURL, this.client, options);
  },
  client: async function (params: ClientParams): Promise<WeaviateClient> {
    params.rest.host = cleanHost(params.rest.host, 'rest');
    params.grpc.host = cleanHost(params.grpc.host, 'grpc');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const scheme = params.rest.secure ? 'https' : 'http';
    const agent = params.rest.secure
      ? new HttpsAgent({ keepAlive: true })
      : new HttpAgent({ keepAlive: true });

    const { connection, dbVersionProvider, dbVersionSupport } = await ConnectionGRPC.use({
      host: `${scheme}://${params.rest.host}:${params.rest.port}${params.rest.path || ''}`,
      scheme: scheme,
      headers: params.headers,
      grpcAddress: `${params.grpc.host}:${params.grpc.port}`,
      grpcSecure: params.grpc.secure,
      grpcProxyUrl: params.proxies?.grpc,
      apiKey: isApiKey(params.auth) ? mapApiKey(params.auth) : undefined,
      authClientSecret: isApiKey(params.auth) ? undefined : params.auth,
      agent,
    });

    const ifc: WeaviateClient = {
      backup: backup(connection),
      cluster: cluster(connection),
      collections: collections(connection, dbVersionSupport),
      close: () => Promise.resolve(connection.close()), // hedge against future changes to add I/O to .close()
      getMeta: () => new MetaGetter(connection).do(),
      getOpenIDConfig: () => new OpenidConfigurationGetter(connection.http).do(),
      getWeaviateVersion: () => dbVersionSupport.getVersion(),
      isLive: () => new LiveChecker(connection, dbVersionProvider).do(),
      isReady: () => new ReadyChecker(connection, dbVersionProvider).do(),
    };
    if (connection.oidcAuth) ifc.oidcAuth = connection.oidcAuth;

    return ifc;
  },

  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  reconfigure,
};

export default app;
export { weaviateV2 };
export * from './collections/index.js';
export * from './connection/index.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
