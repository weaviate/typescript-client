import { ConnectionGRPC } from './connection/index.js';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion.js';
import { backup, Backup } from './collections/backup/client.js';
import cluster, { Cluster } from './collections/cluster/index.js';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  AuthCredentials,
  OidcAuthenticator,
} from './connection/auth.js';
import {
  connectToLocal,
  connectToWCS,
  ConnectToLocalOptions,
  ConnectToWCSOptions,
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
  /**
   * Whether or not to skip checks that the client makes to Weaviate when connecting and performing operations.
   *
   * For example, if true, the client will not check if Weaviate is live or ready before performing operations.
   * It will also not check whether collections exist before performing operations on them nor validate any input parameters.
   */
  skipChecks?: boolean;
};

export interface WeaviateClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  oidcAuth?: OidcAuthenticator;

  close: () => Promise<void>;
  getMeta: () => Promise<Meta>;
  isLive: () => Promise<boolean>;
  isReady: () => Promise<boolean>;
  getOpenIDConfig?: () => Promise<any>;
}

const app = {
  /**
   * Connect to a personally-deployed Weaviate instance.
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
    // check if the URL is set
    if (!params.rest.host) throw new Error('Missing `host` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const scheme = params.rest.secure ? 'https' : 'http';
    const agent = params.rest.secure
      ? new HttpsAgent({ keepAlive: true })
      : new HttpAgent({ keepAlive: true });

    const conn = await ConnectionGRPC.use({
      host: params.rest.host.startsWith('http')
        ? `${params.rest.host}${params.rest.path || ''}`
        : `${scheme}://${params.rest.host}:${params.rest.port}${params.rest.path || ''}`,
      scheme: scheme,
      headers: params.headers,
      grpcAddress: `${params.grpc.host}:${params.grpc.port}`,
      grpcSecure: params.grpc.secure,
      grpcProxyUrl: params.proxies?.grpc,
      apiKey: params.auth instanceof ApiKey ? params.auth : undefined,
      authClientSecret: params.auth instanceof ApiKey ? undefined : params.auth,
      agent,
      skipChecks: params.skipChecks || false,
    });

    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

    const ifc: WeaviateClient = {
      backup: backup(conn),
      cluster: cluster(conn),
      collections: collections(conn, dbVersionSupport),
      close: () => Promise.resolve(conn.close()), // hedge against future changes to add I/O to .close()
      getMeta: () => new MetaGetter(conn).do(),
      getOpenIDConfig: () => new OpenidConfigurationGetter(conn.http).do(),
      isLive: () => new LiveChecker(conn, dbVersionProvider).do(),
      isReady: () => new ReadyChecker(conn, dbVersionProvider).do(),
    };
    if (conn.oidcAuth) ifc.oidcAuth = conn.oidcAuth;

    return ifc;
  },

  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  reconfigure,
};

function initDbVersionProvider(conn: ConnectionGRPC) {
  const metaGetter = new MetaGetter(conn);
  const versionGetter = () => {
    return metaGetter
      .do()
      .then((result: any) => result.version)
      .catch(() => Promise.resolve(''));
  };

  const dbVersionProvider = new DbVersionProvider(versionGetter);
  dbVersionProvider.refresh();

  return dbVersionProvider;
}

export default app;
export * from './collections/index.js';
export * from './connection/index.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
