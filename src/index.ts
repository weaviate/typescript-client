import Connection from './connection';
import graphql, { GraphQL } from './graphql';
import schema, { Schema } from './schema';
import data, { Data } from './data';
import classifications, { Classifications } from './classifications';
import batch, { Batch } from './batch';
import misc, { Misc } from './misc';
import c11y, { C11y } from './c11y';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion';
import backup, { Backup } from './backup';
import cluster, { Cluster } from './cluster';
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
import Configure from './collections/configure';
import { Meta } from './openapi/types';

export interface ProtocolParams {
  secure: boolean;
  host: string;
  port: number;
}

export interface ConnectionParams {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  apiKey?: ApiKey;
  host: string;
  scheme?: string;
  headers?: HeadersInit;
  grpcAddress?: string;
  grpcSecure?: boolean;
}

export interface ClientParams {
  http: ProtocolParams;
  grpc: ProtocolParams;
  auth?: AuthCredentials;
  headers?: HeadersInit;
}

export interface WeaviateClient {
  graphql: GraphQL;
  schema: Schema;
  data: Data;
  classifications: Classifications;
  batch: Batch;
  misc: Misc;
  c11y: C11y;
  backup: Backup;
  cluster: Cluster;
  oidcAuth?: OidcAuthenticator;
}

export interface WeaviateNextClient {
  collections: Collections;
  getMeta: () => Promise<Meta>;
  oidcAuth?: OidcAuthenticator;
}

const app = {
  client: function (params: ConnectionParams): WeaviateClient {
    // check if the URL is set
    if (!params.host) throw new Error('Missing `host` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const conn = new Connection(params);
    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

    const ifc: WeaviateClient = {
      graphql: graphql(conn),
      schema: schema(conn),
      data: data(conn, dbVersionSupport),
      classifications: classifications(conn),
      batch: batch(conn, dbVersionSupport),
      misc: misc(conn, dbVersionProvider),
      c11y: c11y(conn),
      backup: backup(conn),
      cluster: cluster(conn),
    };

    if (conn.oidcAuth) ifc.oidcAuth = conn.oidcAuth;

    return ifc;
  },
  connectToWCS: function (clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateNextClient> {
    return connectToWCS(clusterURL, options);
  },
  next: function (params: ClientParams): WeaviateNextClient {
    // check if the URL is set
    if (!params.http.host) throw new Error('Missing `host` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const conn = new Connection({
      host: params.http.host,
      scheme: params.http.secure ? 'https' : 'http',
      headers: params.headers,
      grpcAddress: `${params.grpc.host}:${params.grpc.port}`,
      grpcSecure: params.grpc.secure,
      apiKey: params.auth instanceof ApiKey ? params.auth : undefined,
      authClientSecret: params.auth instanceof ApiKey ? undefined : params.auth,
    });

    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);

    const ifc: WeaviateNextClient = {
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
  Configure,
};

export interface ConnectToWCSOptions {
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
}

function initDbVersionProvider(conn: Connection) {
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
export * from './graphql';
export * from './schema';
export * from './data';
export * from './classifications';
export * from './collections';
export * from './batch';
export * from './misc';
export * from './c11y';
export * from './backup';
export * from './cluster';
export * from './connection';
export * from './utils/uuid';
export * from './utils/base64';
