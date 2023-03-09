import Connection from './connection/index';
import graphql, { IWeaviateClientGraphQL } from './graphql/index';
import schema, { IWeaviateClientSchema } from './schema/index';
import data, { IWeaviateClientData } from './data/index';
import classifications, {
  IWeaviateClientClassifications,
} from './classifications/index';
import batch, { IWeaviateClientBatch } from './batch/index';
import misc, { IWeaviateClientMisc } from './misc/index';
import c11y, { IWeaviateClientC11y } from './c11y/index';
import { DbVersionProvider, DbVersionSupport } from './utils/dbVersion';
import backup, { IWeaviateClientBackup } from './backup/index';
import backupConsts from './backup/consts';
import batchConsts from './batch/consts';
import filtersConsts, { Operator } from './filters/consts';
import cluster, { IWeaviateClientCluster } from './cluster/index';
import clusterConsts from './cluster/consts';
import replicationConsts from './data/replication/consts';
import {
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from './connection/auth';
import MetaGetter from './misc/metaGetter';

export interface IConnectionParams {
  authClientSecret?:
    | AuthClientCredentials
    | AuthAccessTokenCredentials
    | AuthUserPasswordCredentials;
  host: string;
  scheme: string;
  headers?: HeadersInit;
}

export interface IWeaviateClient {
  graphql: IWeaviateClientGraphQL;
  schema: IWeaviateClientSchema;
  data: IWeaviateClientData;
  classifications: IWeaviateClientClassifications;
  batch: IWeaviateClientBatch;
  misc: IWeaviateClientMisc;
  c11y: IWeaviateClientC11y;
  backup: IWeaviateClientBackup;
  cluster: IWeaviateClientCluster;
}
const app = {
  client: function (params: IConnectionParams): IWeaviateClient {
    // check if the URL is set
    if (!params.host) throw new Error('Missing `host` parameter');

    // check if the scheme is set
    if (!params.scheme) throw new Error('Missing `scheme` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const conn = new Connection(params);
    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);
    const test = [1, 2, 3];
    return {
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
  },

  // constants
  backup: backupConsts,
  batch: batchConsts,
  filters: filtersConsts,
  cluster: clusterConsts,
  replication: replicationConsts,
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
export { AuthUserPasswordCredentials, AuthAccessTokenCredentials, Operator };
