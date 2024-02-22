import GrpcConnection from './connection/grpc';
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
import { connectToWCS } from './connection/helpers';
import MetaGetter from './misc/metaGetter';
import collections, { Collections } from './collections';
import configure from './collections/configure';
import { Meta } from './openapi/types';

import * as protobufjs from 'protobufjs';

export interface ProtocolParams {
  secure: boolean;
  host: string;
  port: number;
}

export interface ClientParams {
  rest: ProtocolParams;
  grpc: ProtocolParams;
  auth?: AuthCredentials;
  headers?: HeadersInit;
}
export interface WeaviateNextClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  getMeta: () => Promise<Meta>;
  oidcAuth?: OidcAuthenticator;
}

export interface ConnectToWCSOptions {
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
}

const app = {
  connectToWCS: function (clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateNextClient> {
    return connectToWCS(clusterURL, this.client, options);
  },
  client: function (params: ClientParams): WeaviateNextClient {
    protobufjs.configure();
    // check if the URL is set
    if (!params.rest.host) throw new Error('Missing `host` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const scheme = params.rest.secure ? 'https' : 'http';
    const conn = new GrpcConnection({
      host: params.rest.host.startsWith('http')
        ? params.rest.host
        : `${scheme}://${params.rest.host}:${params.rest.port}`,
      scheme: scheme,
      headers: params.headers,
      grpcAddress: `${params.grpc.host}:${params.grpc.port}`,
      grpcSecure: params.grpc.secure,
      apiKey: params.auth instanceof ApiKey ? params.auth : undefined,
      authClientSecret: params.auth instanceof ApiKey ? undefined : params.auth,
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

function initDbVersionProvider(conn: GrpcConnection) {
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
