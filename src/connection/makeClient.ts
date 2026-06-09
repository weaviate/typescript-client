import type { Agent } from 'http';

import alias from '../alias/index.js';
import { backup } from '../collections/backup/client.js';
import cluster from '../collections/cluster/index.js';
import batch from '../collections/data/batch.js';
import collections from '../collections/index.js';
import groups from '../groups/index.js';
import type { ClientParams, WeaviateClient } from '../index.js';
import { LiveChecker, OpenidConfigurationGetter, ReadyChecker } from '../misc/index.js';
import MetaGetter from '../misc/metaGetter.js';
import roles from '../roles/index.js';
import tokenize from '../tokenize/index.js';
import users from '../users/index.js';
import { isApiKey, mapApiKey } from './auth.js';
import { ConnectionGRPC } from './index.js';
import { GrpcTransport } from './transports/types.js';

const cleanHost = (host: string, protocol: 'rest' | 'grpc') => {
  if (host.includes('http')) {
    console.warn(
      `The ${protocol}.host parameter should not include the protocol. Please remove the http:// or https:// from the ${protocol}.host parameter.\
      To specify a secure connection, set the secure parameter to true. The protocol will be inferred from the secure parameter instead.`
    );
    return host.replace('http://', '').replace('https://', '');
  }
  return host;
};

/**
 * Assemble a `WeaviateClient` from connection parameters. Shared by the Node
 * and browser entry points, which differ only in the gRPC `transport` and how
 * (if at all) an HTTP `Agent` is constructed.
 *
 * @param params The user-supplied client parameters.
 * @param transport The gRPC transport to use (native or grpc-web).
 * @param makeAgent Builds the optional HTTP(S) agent. Returns `undefined` in
 *   environments (e.g. the browser) where Node's `http`/`https` agents are
 *   unavailable.
 */
export async function makeClient(
  params: ClientParams,
  transport: GrpcTransport,
  makeAgent: (secure: boolean) => Agent | undefined
): Promise<WeaviateClient> {
  let { host: httpHost } = params.connectionParams.http;
  let { host: grpcHost } = params.connectionParams.grpc;
  const { port: httpPort, secure: httpSecure, path: httpPath } = params.connectionParams.http;
  const { port: grpcPort, secure: grpcSecure, path: grpcPath } = params.connectionParams.grpc;
  httpHost = cleanHost(httpHost, 'rest');
  grpcHost = cleanHost(grpcHost, 'grpc');

  // check if headers are set
  if (!params.headers) params.headers = {};

  const scheme = httpSecure ? 'https' : 'http';
  const agent = makeAgent(httpSecure);

  const { connection, dbVersionProvider, dbVersionSupport } = await ConnectionGRPC.use({
    host: `${scheme}://${httpHost}:${httpPort}${httpPath || ''}`,
    scheme: scheme,
    headers: params.headers,
    grpcAddress: `${grpcHost}:${grpcPort}${grpcPath || ''}`,
    grpcSecure: grpcSecure,
    grpcProxyUrl: params.proxies?.grpc,
    apiKey: isApiKey(params.auth) ? mapApiKey(params.auth) : undefined,
    authClientSecret: isApiKey(params.auth) ? undefined : params.auth,
    agent,
    timeout: params.timeout,
    skipInitChecks: params.skipInitChecks,
    transport,
  });

  const ifc: WeaviateClient = {
    alias: alias(connection),
    backup: backup(connection),
    batch: batch(connection, dbVersionSupport),
    cluster: cluster(connection),
    collections: collections(connection, dbVersionSupport),
    groups: groups(connection),
    roles: roles(connection),
    tokenize: tokenize(connection, dbVersionSupport),
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
}
