import { WeaviateStartUpError } from '../errors.js';
import { ClientParams, Context, IWeaviateClient } from '../index.js';
import { AuthCredentials } from './auth.js';
import { ProxiesParams, TimeoutParams } from './http.js';

/** The options available to the `weaviate.connectToWeaviateCloud` method. */
export type ConnectToWeaviateCloudOptions = {
  /** The authentication credentials to use when connecting to Weaviate, e.g. API key */
  authCredentials?: AuthCredentials;
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};

/** @deprecated Use `ConnectToWeaviateCloudOptions` instead. */
export type ConnectToWCDOptions = ConnectToWeaviateCloudOptions;

/** @deprecated Use `ConnectToWeaviateCloudOptions` instead. */
export type ConnectToWCSOptions = ConnectToWeaviateCloudOptions;

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

export function connectToWeaviateCloud<C extends Context<TMedia>, TMedia>(
  clusterURL: string,
  clientMaker: (context: C, params: ClientParams) => Promise<IWeaviateClient<TMedia>>,
  context: C,
  options?: ConnectToWeaviateCloudOptions
): Promise<IWeaviateClient<TMedia>> {
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

  const { authCredentials: auth, headers, ...rest } = options || {};

  return clientMaker(context, {
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
    auth,
    headers: options?.headers,
    ...rest,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}

export function connectToLocal<C extends Context<TMedia>, TMedia>(
  clientMaker: (context: C, params: ClientParams) => Promise<IWeaviateClient<TMedia>>,
  context: C,
  options?: ConnectToLocalOptions
): Promise<IWeaviateClient<TMedia>> {
  const { host, port, grpcPort, authCredentials: auth, ...rest } = options || {};
  return clientMaker(context, {
    connectionParams: {
      http: {
        secure: false,
        host: host || 'localhost',
        port: port || 8080,
      },
      grpc: {
        secure: false,
        host: host || 'localhost',
        port: grpcPort || 50051,
      },
    },
    auth,
    ...rest,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}

export function connectToCustom<C extends Context<TMedia>, TMedia>(
  clientMaker: (context: C, params: ClientParams) => Promise<IWeaviateClient<TMedia>>,
  context: C,
  options?: ConnectToCustomOptions
): Promise<IWeaviateClient<TMedia>> {
  const {
    httpHost,
    httpPath,
    httpPort,
    httpSecure,
    grpcHost,
    grpcPort,
    grpcSecure,
    authCredentials: auth,
    ...rest
  } = options || {};

  return clientMaker(context, {
    connectionParams: {
      http: {
        secure: httpSecure || false,
        host: httpHost || 'localhost',
        path: httpPath || '',
        port: httpPort || 8080,
      },
      grpc: {
        secure: grpcSecure || false,
        host: grpcHost || 'localhost',
        port: grpcPort || 50051,
      },
    },
    auth,
    ...rest,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}
