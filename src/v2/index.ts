import { ConnectionGQL, ConnectionParams } from '../connection';
import graphql, { GraphQL } from '../graphql';
import schema, { Schema } from '../schema';
import data, { Data } from '../data';
import classifications, { Classifications } from '../classifications';
import batch, { Batch } from '../batch';
import misc, { Misc } from '../misc';
import c11y, { C11y } from '../c11y';
import { DbVersionProvider, DbVersionSupport } from '../utils/dbVersion';
import backup, { Backup } from '../backup';
import cluster, { Cluster } from '../cluster';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  OidcAuthenticator,
} from '../connection/auth';
import MetaGetter from '../misc/metaGetter';

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

    const conn = new ConnectionGQL(params);
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

function initDbVersionProvider(conn: ConnectionGQL) {
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
export * from '../openapi/types';
export * from '../graphql';
export * from '../schema';
export * from '../data';
export * from '../classifications';
export * from '../batch';
export * from '../misc';
export * from '../c11y';
export * from '../backup';
export * from '../cluster';
export * from '../connection';
export * from '../utils/uuid';
export * from '../utils/base64';
