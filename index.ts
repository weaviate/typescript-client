import {AuthAccessTokenCredentials, AuthClientCredentials, AuthUserPasswordCredentials} from "./connection/auth";
import Connection from "./connection/index"
import {DbVersionProvider, DbVersionSupport} from "./utils/dbVersion";
import MetaGetter from "./misc/metaGetter";
// Domain constructors
import newGraphql, {IWeaviateClientGraphQL} from "./graphql/index";
import newSchema, {IWeaviateClientSchema} from "./schema/index";
import newData, {IWeaviateClientData} from "./data/index";
import newClassifications, {IWeaviateClientClassifications} from "./classifications/index";
import newBatch, {IWeaviateClientBatch} from "./batch/index";
import newMisc, {IWeaviateClientMisc} from "./misc/index";
import newC11y, {IWeaviateClientC11y} from "./c11y/index";
import newBackup, {IWeaviateClientBackup} from "./backup/index";
import newCluster, {IWeaviateClientCluster} from "./cluster/index";
// Constants
import {backup} from "./backup/consts";
import {batch} from "./batch/consts";
import {cluster} from "./cluster/consts";
import {filters} from "./filters/consts";
import {replication} from "./data/replication/consts";

export interface IConnectionParams {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  host: string
  scheme: string
  headers?: any
}

export interface IWeaviateClient {
  backup: IWeaviateClientBackup,
  batch: IWeaviateClientBatch,
  classifications: IWeaviateClientClassifications,
  cluster: IWeaviateClientCluster
  c11y: IWeaviateClientC11y,
  data: IWeaviateClientData,
  graphql: IWeaviateClientGraphQL,
  misc: IWeaviateClientMisc,
  schema: IWeaviateClientSchema,
}

export const weaviate = {
  client: function client(params: IConnectionParams): IWeaviateClient {
    // check if the URL is set
    if (!params.host) throw new Error("Missing `host` parameter");
  
    // check if the scheme is set
    if (!params.scheme) throw new Error("Missing `scheme` parameter");
  
    // check if headers are set
    if (!params.headers) params.headers = {};
  
    const conn = new Connection(params);
    const dbVersionProvider = initDbVersionProvider(conn);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);
  
    return {
      backup: newBackup(conn),
      batch: newBatch(conn, dbVersionSupport),
      classifications: newClassifications(conn),
      cluster: newCluster(conn),
      c11y: newC11y(conn),
      data: newData(conn, dbVersionSupport),
      graphql: newGraphql(conn),
      misc: newMisc(conn, dbVersionProvider),
      schema: newSchema(conn),
    };
  },

  AuthUserPasswordCredentials, 
  AuthAccessTokenCredentials, 
  // constants
  backup,
  batch,
  cluster,
  filters,
  replication
}

function initDbVersionProvider(conn: Connection) {
  const metaGetter = new MetaGetter(conn);
  const versionGetter = () => {
    return metaGetter.do()
      .then((result: any) => result.version)
      .catch(() => Promise.resolve(''));
  }

  const dbVersionProvider = new DbVersionProvider(versionGetter);
  dbVersionProvider.refresh();

  return dbVersionProvider;
}
