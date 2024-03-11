import { ConnectionGRPC } from './connection';
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
import {
  connectToLocal,
  connectToWCS,
  ConnectToLocalOptions,
  ConnectToWCSOptions,
} from './connection/helpers';
import { ProxiesParams } from './connection/http';
import MetaGetter from './misc/metaGetter';
import collections, { Collections } from './collections';
import configure from './collections/configure';
import { Meta } from './openapi/types';

import { setGlobalDispatcher, ProxyAgent } from 'undici';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

export type ProtocolParams = {
  secure: boolean;
  host: string;
  port: number;
};

export type ClientParams = {
  rest: ProtocolParams;
  grpc: ProtocolParams;
  auth?: AuthCredentials;
  headers?: HeadersInit;
  proxies?: ProxiesParams;
};
export interface WeaviateNextClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  getMeta: () => Promise<Meta>;
  oidcAuth?: OidcAuthenticator;
}

const app = {
  connectToLocal: function (options?: ConnectToLocalOptions): Promise<WeaviateNextClient> {
    return connectToLocal(this.client, options);
  },
  connectToWCS: function (clusterURL: string, options?: ConnectToWCSOptions): Promise<WeaviateNextClient> {
    return connectToWCS(clusterURL, this.client, options);
  },
  client: async function (params: ClientParams): Promise<WeaviateNextClient> {
    // check if the URL is set
    if (!params.rest.host) throw new Error('Missing `host` parameter');

    // check if headers are set
    if (!params.headers) params.headers = {};

    const scheme = params.rest.secure ? 'https' : 'http';
    const agent = params.rest.secure
      ? new HttpsAgent({ keepAlive: true })
      : new HttpAgent({ keepAlive: true });

    const proxyUrl = params.proxies?.http || params.proxies?.https;
    // https://stackoverflow.com/a/76503362/14998213
    // https://github.com/nodejs/node/issues/42814
    // https://github.com/nodejs/node/issues/43187
    // Cleaner solution not available until Node 20 is minimum version
    if (proxyUrl) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      setGlobalDispatcher(new ProxyAgent({ uri: new URL(proxyUrl).toString() }));
    }

    const conn = await ConnectionGRPC.use({
      host: params.rest.host.startsWith('http')
        ? params.rest.host
        : `${scheme}://${params.rest.host}:${params.rest.port}`,
      scheme: scheme,
      headers: params.headers,
      grpcAddress: `${params.grpc.host}:${params.grpc.port}`,
      grpcSecure: params.grpc.secure,
      apiKey: params.auth instanceof ApiKey ? params.auth : undefined,
      authClientSecret: params.auth instanceof ApiKey ? undefined : params.auth,
      http1Agent: agent,
      grpcProxyUrl: params.proxies?.grpc,
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

function initDbVersionProvider(conn: ConnectionGRPC) {
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
