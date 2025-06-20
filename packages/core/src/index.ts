import { Backup, backup } from './backup/client.js';
import cluster, { Cluster } from './cluster/index.js';
import collections, { ICollections } from './collections.js';
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
import { ConnectionDetails, ProxiesParams, TimeoutParams } from './connection/http.js';
import { ConnectionGRPC } from './connection/index.js';
import filter from './filters/index.js';
import { Meta } from './openapi/types.js';
import roles, { Roles, permissions } from './roles/index.js';
import { DbVersion } from './utils/dbVersion.js';
import { Backend, BackupCompressionLevel, BackupStatus } from './v2/backup/index.js';
import MetaGetter from './v2/misc/metaGetter.js';

import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { LiveChecker, OpenidConfigurationGetter, ReadyChecker } from './v2/misc/index.js';

import weaviateV2 from './v2/index.js';

import { TransportsMaker } from './connection/grpc.js';
import { ConsistencyLevel } from './replication.js';
import users, { Users } from './users/index.js';
import { ToBase64FromMedia } from './utils/base64.js';

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
  headers?: Record<string, string>;
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

export interface IWeaviateClient<TMedia = any> {
  backup: Backup;
  cluster: Cluster;
  collections: ICollections<TMedia>;
  oidcAuth?: OidcAuthenticator;
  roles: Roles;
  users: Users;

  close: () => Promise<void>;
  getMeta: () => Promise<Meta>;
  getConnectionDetails: () => Promise<ConnectionDetails>;
  getOpenIDConfig?: () => Promise<any>;
  getWeaviateVersion: () => Promise<DbVersion>;
  isLive: () => Promise<boolean>;
  isReady: () => Promise<boolean>;
}

export const cleanHost = (host: string, protocol: 'rest' | 'grpc') => {
  if (host.includes('http')) {
    console.warn(
      `The ${protocol}.host parameter should not include the protocol. Please remove the http:// or https:// from the ${protocol}.host parameter.\
      To specify a secure connection, set the secure parameter to true. The protocol will be inferred from the secure parameter instead.`
    );
    return host.replace('http://', '').replace('https://', '');
  }
  return host;
};

export type Context<TMedia> = {
  transportsMaker: TransportsMaker;
  toBase64FromMedia: ToBase64FromMedia<TMedia>;
};

const client = async <TMedia>(
  context: Context<TMedia>,
  params: ClientParams
): Promise<IWeaviateClient<TMedia>> => {
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

  const { connection, dbVersionProvider, dbVersionSupport } = await ConnectionGRPC.use(
    context.transportsMaker,
    {
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
    }
  );

  const ifc: IWeaviateClient<TMedia> = {
    backup: backup(connection),
    cluster: cluster(connection),
    collections: collections(connection, dbVersionSupport, context.toBase64FromMedia),
    roles: roles(connection),
    users: users(connection),
    close: () => Promise.resolve(connection.close()), // hedge against future changes to add I/O to .close()
    getMeta: () => new MetaGetter(connection).do(),
    getConnectionDetails: connection.getDetails,
    getOpenIDConfig: () => new OpenidConfigurationGetter(connection.http).do(),
    getWeaviateVersion: () => dbVersionSupport.getVersion(),
    isLive: () => new LiveChecker(connection, dbVersionProvider).do(),
    isReady: () => new ReadyChecker(connection, dbVersionProvider).do(),
  };
  if (connection.oidcAuth) ifc.oidcAuth = connection.oidcAuth;

  return ifc;
};

export default client;
export * from './collections.js';
export * from './connection/index.js';
export * from './errors.js';
export * from './roles/types.js';
// export * from './utils/base64.js';
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
  filter,
  helpers,
  permissions,
  weaviateV2,
};
