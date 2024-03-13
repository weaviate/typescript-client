import { ClientParams, WeaviateClient } from '..';
import { AuthCredentials } from './auth';
import { ProxiesParams } from './http';

export interface ConnectToWCSOptions {
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
}

export interface ConnectToLocalOptions {
  httpHost?: string;
  httpPath?: string;
  httpPort?: number;
  httpSecure?: boolean;
  grpcHost?: string;
  grpcPort?: number;
  grpcSecure?: boolean;
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
  proxies?: ProxiesParams;
}

export function connectToWCS(
  clusterURL: string,
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToWCSOptions
): Promise<WeaviateClient> {
  // check if the URL is set
  if (!clusterURL) throw new Error('Missing `clusterURL` parameter');

  if (!clusterURL.startsWith('http')) {
    clusterURL = `https://${clusterURL}`;
  }
  if (!URL.canParse(clusterURL)) {
    throw new Error(`Invalid clusterURL: ${clusterURL}`);
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
    rest: {
      secure: true,
      host: url.hostname,
      port: 443,
    },
    grpc: {
      secure: true,
      host: grpcHost,
      port: 443,
    },
    auth: options?.authCredentials,
    headers: options?.headers,
  });
}

export function connectToLocal(
  clientMaker: (params: ClientParams) => Promise<WeaviateClient>,
  options?: ConnectToLocalOptions
): Promise<WeaviateClient> {
  return clientMaker({
    rest: {
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
    auth: options?.authCredentials,
    headers: options?.headers,
    proxies: options?.proxies,
  });
}
