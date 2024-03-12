import { ConnectionGRPC } from './connection';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion';
import { backup, Backup } from './collections/backup';
import cluster, { Cluster } from './collections/cluster';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  AuthCredentials,
  OidcAuthenticator,
} from './connection/auth';
import {
  connectToLocal,
  connectToWCS,
  ConnectToLocalOptions,
  ConnectToWCSOptions,
} from './connection/helpers';
import { ProxiesParams } from './connection/http';
import MetaGetter from './misc/metaGetter';
import collections, { Collections } from './collections';
import configure from './collections/configure';
import { Meta } from './openapi/types';

import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

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

export interface WeaviateNextClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  getMeta: () => Promise<Meta>;
  oidcAuth?: OidcAuthenticator;
}

const app = {
  connectToLocal: function (options?: ConnectToLocalOptions): Promise<WeaviateNextClient> {
    return connectToLocal(this.client, options);
  },
  connectToWCS: function (clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateNextClient> {
    return connectToWCS(clusterURL, this.client, options);
  },
  client: async function (params: ClientParams): Promise<WeaviateNextClient> {
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
    });

    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

    const ifc: WeaviateNextClient = {
      backup: backup(conn),
      cluster: cluster(conn),
      collections: collections(conn, dbVersionSupport),
      getMeta: () => new MetaGetter(conn).do(),
    };
    if (conn.oidcAuth) ifc.oidcAuth = conn.oidcAuth;

    return ifc;
  },

  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
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
export * from './openapi/types';
export * from './backup';
export * from './cluster';
export * from './collections';
export * from './connection';
export * from './utils/base64';
export * from './utils/uuid';
