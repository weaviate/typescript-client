import backup, { Backup } from './backup';
import batch, { Batch } from './batch';
import c11y, { C11y } from './c11y';
import classifications, { Classifications } from './classifications';
import cluster, { Cluster } from './cluster';
import Connection from './connection';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  OidcAuthenticator,
} from './connection/auth';
import data, { Data } from './data';
import graphql, { GraphQL } from './graphql';
import misc, { Misc } from './misc';
import MetaGetter from './misc/metaGetter';
import schema, { Schema } from './schema';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion';

export interface ConnectionParams {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  apiKey?: ApiKey;
  host: string;
  scheme?: string;
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

  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
};

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
export * from './backup';
export * from './batch';
export * from './c11y';
export * from './classifications';
export * from './cluster';
export * from './connection';
export * from './data';
export * from './graphql';
export * from './misc';
export * from './openapi/types';
export * from './schema';
export * from './utils/base64';
export * from './utils/uuid';
