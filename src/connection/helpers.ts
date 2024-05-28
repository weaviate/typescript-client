import { WeaviateStartUpError } from '../errors.js';
import { ClientParams, WeaviateClient } from '../index.js';
import { AuthCredentials } from './auth.js';
import { ProxiesParams, TimeoutParams } from './http.js';

/** The options available to the `weaviate.connectToWCS` method. */
export type ConnectToWCDOptions = {
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};

/** @deprecated Use `ConnectToWCDOptions` instead. */
export type ConnectToWCSOptions = ConnectToWCDOptions;

export type ConnectToLocalOptions = {
  /** The host where Weaviate is served. Assumes that the HTTP/1.1 and HTTP/2 servers are served on the same host */
  host?: string;
  /** The port of the HTTP/1.1 server */
  port?: number;
  /** The port of the HTTP/2 server */
  grpcPort?: number;
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};

export type ConnectToCustomOptions = {
  /** The hostname of the HTTP/1.1 server */
  httpHost?: string;
  /** An additional path of the HTTP/1.1 server, e.g. `http://proxy.net/weaviate` */
  httpPath?: string;
  /** The port of the HTTP/1.1 server */
  httpPort?: number;
  /** Whether to use a secure connection to the HTTP/1.1 server */
  httpSecure?: boolean;
  /** The hostname of the HTTP/2 server */
  grpcHost?: string;
  /** The port of the HTTP/2 server */
  grpcPort?: number;
  /** Whether to use a secure connection to the HTTP/2 server */
  grpcSecure?: boolean;
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** The proxy configuration to use */
  proxies?: ProxiesParams;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};

export function connectToWCD(
  clusterURL: string,
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToWCDOptions
): Promise<WeaviateClient> {
  // check if the URL is set
  if (!clusterURL) throw new Error('Missing `clusterURL` parameter');

  if (!clusterURL.startsWith('http')) {
    clusterURL = `https://${clusterURL}`;
  }
  const url = new URL(clusterURL);

  let grpcHost: string;
  if (url.hostname.endsWith('.weaviate.network')) {
    const [ident, ...rest] = url.hostname.split('.');
    grpcHost = `${ident}.grpc.${rest.join('.')}`;
  } else {
    grpcHost = `grpc-${url.hostname}`;
  }

  return clientMaker({
    connectionParams: {
      http: {
        secure: true,
        host: url.hostname,
        port: 443,
      },
      grpc: {
        secure: true,
        host: grpcHost,
        port: 443,
      },
    },
    auth: options?.authCredentials,
    headers: options?.headers,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}

/** @deprecated Use `connectToWCD` instead. */
export function connectToWCS(
  clusterURL: string,
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToWCSOptions
): Promise<WeaviateClient> {
  console.warn('The `connectToWCS` method is deprecated, use `connectToWCD` instead.');
  return connectToWCD(clusterURL, clientMaker, options);
}

export function connectToLocal(
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToLocalOptions
): Promise<WeaviateClient> {
  return clientMaker({
    connectionParams: {
      http: {
        secure: false,
        host: options?.host || 'localhost',
        port: options?.port || 8080,
      },
      grpc: {
        secure: false,
        host: options?.host || 'localhost',
        port: options?.grpcPort || 50051,
      },
    },
    auth: options?.authCredentials,
    headers: options?.headers,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}

export function connectToCustom(
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToCustomOptions
): Promise<WeaviateClient> {
  return clientMaker({
    connectionParams: {
      http: {
        secure: options?.httpSecure || false,
        host: options?.httpHost || 'localhost',
        path: options?.httpPath || '',
        port: options?.httpPort || 8080,
      },
      grpc: {
        secure: options?.grpcSecure || false,
        host: options?.grpcHost || 'localhost',
        port: options?.grpcPort || 50051,
      },
    },
    auth: options?.authCredentials,
    headers: options?.headers,
    proxies: options?.proxies,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}
