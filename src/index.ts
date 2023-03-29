import Connection from './connection/index';
import graphql, { GraphQL } from './graphql/index';
import schema, { Schema } from './schema/index';
import data, { Data } from './data/index';
import classifications, { Classifications } from './classifications/index';
import batch, { Batch } from './batch/index';
import misc, { Misc } from './misc/index';
import c11y, { C11y } from './c11y/index';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion';
import backup, { Backup } from './backup/index';
import filtersConsts from './filters/consts';
import cluster, { Cluster } from './cluster/index';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from './connection/auth';
import MetaGetter from './misc/metaGetter';
import { EmbeddedDB, EmbeddedOptions } from './embedded';

export interface ConnectionParams {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  apiKey?: ApiKey;
  host: string;
  scheme: string;
  headers?: HeadersInit;
  embedded?: EmbeddedOptions;
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
  embedded?: EmbeddedDB;
}

const app = {
  client: function (params: ConnectionParams): WeaviateClient {
    // check if the URL is set
    if (!params.host) throw new Error('Missing `host` parameter');

    // check if the scheme is set
    if (!params.scheme) throw new Error('Missing `scheme` parameter');

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

    if (params.embedded) {
      ifc.embedded = new EmbeddedDB(params.embedded);
    }

    return ifc;
  },

  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  EmbeddedOptions,
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

module.exports = app;
export default app;
