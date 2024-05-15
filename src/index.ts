import { ConnectionGRPC } from './connection/index.js';
import { DbVersion, DbVersionProvider, DbVersionSupport } from './utils/dbVersion.js';
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
  connectToWCS,
  ConnectToLocalOptions,
  ConnectToWCSOptions,
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

export type ConnectionParams = {
  /**
   * The connection parameters for the REST and GraphQL APIs (http/1.1).
   */
  http: ProtocolParams;
  /**
   * The connection paramaters for the gRPC API (http/2).
   */
  grpc: ProtocolParams;
};

export type ClientParams = {
  /**
   * The connection parameters for Weaviate's public APIs.
   */
  connectionParams: ConnectionParams;
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
   * Connect to your own Weaviate Cloud Service (WCS) instance.
   *
   * @param {string} clusterURL The URL of your WCS instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCSOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCS instance.
   */
  connectToWCS: function (clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateClient> {
    return connectToWCS(clusterURL, this.client, options);
  },
  client: async function (params: ClientParams): Promise<WeaviateClient> {
    let { host: httpHost } = params.connectionParams.http;
    let { host: grpcHost } = params.connectionParams.grpc;
    const { port: httpPort, secure: httpSecure, path: httpPath } = params.connectionParams.http;
    const { port: grpcPort, secure: grpcSecure } = params.connectionParams.grpc;
    httpHost = cleanHost(httpHost, 'rest');
    grpcHost = cleanHost(grpcHost, 'grpc');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const scheme = httpSecure ? 'https' : 'http';
    const agent = httpSecure ? new HttpsAgent({ keepAlive: true }) : new HttpAgent({ keepAlive: true });

    const { connection, dbVersionProvider, dbVersionSupport } = await ConnectionGRPC.use({
      host: `${scheme}://${httpHost}:${httpPort}${httpPath || ''}`,
      scheme: scheme,
      headers: params.headers,
      grpcAddress: `${grpcHost}:${grpcPort}`,
      grpcSecure: grpcSecure,
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
export * from './collections/index.js';
export * from './connection/index.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
