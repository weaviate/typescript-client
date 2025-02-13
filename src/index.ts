import { Backend, BackupCompressionLevel, BackupStatus } from './backup/index.js';
import { Backup, backup } from './collections/backup/client.js';
import cluster, { Cluster } from './collections/cluster/index.js';
import { configGuards } from './collections/config/index.js';
import { configure, reconfigure } from './collections/configure/index.js';
import collections, { Collections, queryFactory } from './collections/index.js';
import {
  AccessTokenCredentialsInput,
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
  ClientCredentialsInput,
  OidcAuthenticator,
  UserPasswordCredentialsInput,
  isApiKey,
  mapApiKey,
} from './connection/auth.js';
import * as helpers from './connection/helpers.js';
import {
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
  ConnectToWeaviateCloudOptions,
} from './connection/helpers.js';
import { ProxiesParams, TimeoutParams } from './connection/http.js';
import { ConnectionGRPC } from './connection/index.js';
import MetaGetter from './misc/metaGetter.js';
import { Meta } from './openapi/types.js';
import roles, { Roles, permissions } from './roles/index.js';
import { DbVersion } from './utils/dbVersion.js';

import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { LiveChecker, OpenidConfigurationGetter, ReadyChecker } from './misc/index.js';

import weaviateV2 from './v2/index.js';

import { ConsistencyLevel } from './data/replication.js';
import users, { Users } from './users/index.js';

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
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};

export interface WeaviateClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  oidcAuth?: OidcAuthenticator;
  roles: Roles;
  users: Users;

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

/**
 * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
 *
 * @param {ConnectToCustomOptions} options Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
 */
export function connectToCustom(options: ConnectToCustomOptions): Promise<WeaviateClient> {
  return helpers.connectToCustom(client, options);
}

/**
 * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
 *
 * @param {ConnectToLocalOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
 */
export function connectToLocal(options?: ConnectToLocalOptions): Promise<WeaviateClient> {
  return helpers.connectToLocal(client, options);
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
  return helpers.connectToWeaviateCloud(clusterURL, client, options);
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
  return helpers.connectToWeaviateCloud(clusterURL, client, options);
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
  return helpers.connectToWeaviateCloud(clusterURL, client, options);
}

async function client(params: ClientParams): Promise<WeaviateClient> {
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
    timeout: params.timeout,
    skipInitChecks: params.skipInitChecks,
  });

  const ifc: WeaviateClient = {
    backup: backup(connection),
    cluster: cluster(connection),
    collections: collections(connection, dbVersionSupport),
    roles: roles(connection),
    users: users(connection),
    close: () => Promise.resolve(connection.close()), // hedge against future changes to add I/O to .close()
    getMeta: () => new MetaGetter(connection).do(),
    getOpenIDConfig: () => new OpenidConfigurationGetter(connection.http).do(),
    getWeaviateVersion: () => dbVersionSupport.getVersion(),
    isLive: () => new LiveChecker(connection, dbVersionProvider).do(),
    isReady: () => new ReadyChecker(connection, dbVersionProvider).do(),
  };
  if (connection.oidcAuth) ifc.oidcAuth = connection.oidcAuth;

  return ifc;
}

const app = {
  connectToCustom,
  connectToLocal,
  connectToWCD,
  connectToWCS,
  connectToWeaviateCloud,
  client,
  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  configGuards,
  reconfigure,
  permissions,
  query: queryFactory,
};

export default app;
export * from './collections/index.js';
export * from './connection/index.js';
export * from './roles/types.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
export {
  AccessTokenCredentialsInput,
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
  Backend,
  BackupCompressionLevel,
  BackupStatus,
  ClientCredentialsInput,
  ConsistencyLevel,
  ProxiesParams,
  TimeoutParams,
  UserPasswordCredentialsInput,
  weaviateV2,
};
