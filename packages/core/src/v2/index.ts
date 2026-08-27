import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  OidcAuthenticator,
} from '../connection/auth.js';
import { ConnectionGQL, InternalConnectionParams as ConnectionParams } from '../connection/index.js';
import { DbVersionProvider, DbVersionSupport } from '../utils/dbVersion.js';
import backup, { Backup } from './backup/index.js';
import batch, { Batch } from './batch/index.js';
import c11y, { C11y } from './c11y/index.js';
import classifications, { Classifications } from './classifications/index.js';
import cluster, { Cluster } from './cluster/index.js';
import data, { Data } from './data/index.js';
import graphql, { GraphQL } from './graphql/index.js';
import misc, { Misc } from './misc/index.js';
import MetaGetter from './misc/metaGetter.js';
import schema, { Schema } from './schema/index.js';

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
export * from '../connection/index.js';
export * from '../openapi/types.js';
export * from '../utils/base64.js';
export * from '../utils/uuid.js';
export * from './backup/index.js';
export * from './batch/index.js';
export * from './c11y/index.js';
export * from './classifications/index.js';
export * from './cluster/index.js';
export * from './data/index.js';
export * from './graphql/index.js';
export * from './misc/index.js';
export * from './schema/index.js';
