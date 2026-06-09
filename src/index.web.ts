/**
 * Browser / gRPC-Web entry point for the Weaviate TypeScript client.
 *
 * This module wires ONLY the gRPC-Web (`nice-grpc-web`) transport and MUST stay
 * free of Node-only imports (`http`, `https`, `@grpc/grpc-js`, `nice-grpc`,
 * etc.). In particular it must never import `./connection/transports/native.js`
 * or the `resolveGrpcTransport` resolver from `./connection/transports/index.js`,
 * both of which transitively load Node's `http2` stack and would break browser
 * bundles. Agents are never constructed here — `makeClient` is given a no-op
 * agent factory.
 */
import { configGuards } from './collections/config/index.js';
import { configure, reconfigure } from './collections/configure/index.js';
import filter from './collections/filters/index.js';
import { queryFactory } from './collections/index.js';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
} from './connection/auth.js';
import { Headers, TimeoutParams } from './connection/http.js';
import { makeClient } from './connection/makeClient.js';
import { webGrpcTransport } from './connection/transports/web.js';
import { permissions } from './roles/index.js';

import type { ClientParams, WeaviateClient } from './index.js';

/** The gRPC-Web path that vanguard serves the gRPC-Web proxy under by default. */
const DEFAULT_GRPC_WEB_PATH = '/grpc-web';

function client(params: ClientParams): Promise<WeaviateClient> {
  return makeClient(params, webGrpcTransport, () => undefined);
}

/** Options for {@link connectToWeaviateCloud} in the browser/gRPC-Web entry. */
export interface ConnectToWeaviateCloudOptions {
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Headers;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
  /** Override the gRPC-Web path served on the main host (default `/grpc-web`). */
  grpcWebPath?: string;
}

/**
 * Connect to your own Weaviate Cloud (WCD) instance over gRPC-Web.
 *
 * Unlike the native helper, gRPC-Web is served on the MAIN host under a path
 * (default `/grpc-web`), not on the `grpc-<host>` variant.
 *
 * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
 * @param {ConnectToWeaviateCloudOptions} [options] Additional options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a connected client.
 */
export function connectToWeaviateCloud(
  clusterURL: string,
  options?: ConnectToWeaviateCloudOptions
): Promise<WeaviateClient> {
  if (!clusterURL) {
    throw new Error('Missing `clusterURL` parameter');
  }
  if (!clusterURL.startsWith('http')) {
    clusterURL = `https://${clusterURL}`;
  }
  const url = new URL(clusterURL);
  const { authCredentials: auth, headers, timeout, skipInitChecks, grpcWebPath } = options || {};
  return client({
    connectionParams: {
      http: { secure: true, host: url.hostname, port: 443 },
      grpc: { secure: true, host: url.hostname, port: 443, path: grpcWebPath ?? DEFAULT_GRPC_WEB_PATH },
    },
    auth,
    headers,
    timeout,
    skipInitChecks,
  });
}

/** Options for {@link connectToCustom} in the browser/gRPC-Web entry. */
export interface ConnectToCustomOptions {
  /** The hostname of the HTTP/1.1 server */
  httpHost?: string;
  /** The port of the HTTP/1.1 server */
  httpPort?: number;
  /** Whether to use a secure connection to the HTTP/1.1 server */
  httpSecure?: boolean;
  /** An additional path of the HTTP/1.1 server, e.g. `http://proxy.net/weaviate` */
  httpPath?: string;
  /** The hostname of the gRPC-Web server */
  grpcHost?: string;
  /** The port of the gRPC-Web server */
  grpcPort?: number;
  /** Whether to use a secure connection to the gRPC-Web server */
  grpcSecure?: boolean;
  /** The path the gRPC-Web proxy is served under (default `/grpc-web`). */
  grpcPath?: string;
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Headers;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
}

/**
 * Connect to a custom Weaviate deployment over gRPC-Web.
 *
 * @param {ConnectToCustomOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a connected client.
 */
export function connectToCustom(options?: ConnectToCustomOptions): Promise<WeaviateClient> {
  const {
    httpHost,
    httpPort,
    httpSecure,
    httpPath,
    grpcHost,
    grpcPort,
    grpcSecure,
    grpcPath,
    authCredentials: auth,
    headers,
    timeout,
    skipInitChecks,
  } = options || {};
  return client({
    connectionParams: {
      http: {
        secure: httpSecure || false,
        host: httpHost || 'localhost',
        port: httpPort || 8080,
        path: httpPath || '',
      },
      grpc: {
        secure: grpcSecure || false,
        host: grpcHost || 'localhost',
        port: grpcPort ?? httpPort ?? 8080,
        path: grpcPath ?? DEFAULT_GRPC_WEB_PATH,
      },
    },
    auth,
    headers,
    timeout,
    skipInitChecks,
  });
}

/** Options for {@link connectToLocal} in the browser/gRPC-Web entry. */
export interface ConnectToLocalOptions {
  /** The host where Weaviate is served. Assumes HTTP and gRPC-Web are served on the same host. */
  host?: string;
  /** The port of the HTTP/1.1 server */
  port?: number;
  /** The port of the gRPC-Web server (defaults to the HTTP port, not 50051). */
  grpcPort?: number;
  /** The path the gRPC-Web proxy is served under (default `/grpc-web`). */
  grpcWebPath?: string;
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Headers;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
}

/**
 * Connect to a locally-deployed Weaviate instance over gRPC-Web.
 *
 * Note: for local vanguard the gRPC-Web port is the HTTP port, not 50051.
 *
 * @param {ConnectToLocalOptions} [options] Options for the connection.
 * @returns {Promise<WeaviateClient>} A Promise that resolves to a connected client.
 */
export function connectToLocal(options?: ConnectToLocalOptions): Promise<WeaviateClient> {
  const {
    host,
    port,
    grpcPort,
    grpcWebPath,
    authCredentials: auth,
    headers,
    timeout,
    skipInitChecks,
  } = options || {};
  return client({
    connectionParams: {
      http: { secure: false, host: host || 'localhost', port: port || 8080 },
      grpc: {
        secure: false,
        host: host || 'localhost',
        port: grpcPort || port || 8080,
        path: grpcWebPath || DEFAULT_GRPC_WEB_PATH,
      },
    },
    auth,
    headers,
    timeout,
    skipInitChecks,
  });
}

export default {
  connectToCustom,
  connectToLocal,
  connectToWeaviateCloud,
  client,
  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  configGuards,
  filter: filter<any>(),
  reconfigure,
  permissions,
  query: queryFactory,
};

export * from './collections/index.js';
export * from './errors.js';
export type { ClientParams, ConnectionParams, ProtocolParams, WeaviateClient } from './index.js';
export * from './roles/types.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
export {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
};
