import { ClientParams, WeaviateNextClient } from '../index.node';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
} from './auth';

export interface ConnectToWCSOptions {
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
}

export interface ConnectToLocalOptions {
  httpHost?: string;
  httpPort?: number;
  httpSecure?: boolean;
  grpcHost?: string;
  grpcPort?: number;
  grpcSecure?: boolean;
  authCredentials?: AuthCredentials;
  headers?: Record<string, string>;
}

export function connectToWCS(
  clusterURL: string,
  clientMaker: (params: ClientParams) => Promise<WeaviateNextClient>,
  options?: ConnectToWCSOptions
): Promise<WeaviateNextClient> {
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
  clientMaker: (params: ClientParams) => Promise<WeaviateNextClient>,
  options?: ConnectToLocalOptions
): Promise<WeaviateNextClient> {
  return clientMaker({
    rest: {
      secure: options?.httpSecure || false,
      host: options?.httpHost || 'localhost',
      port: options?.httpPort || 8080,
    },
    grpc: {
      secure: options?.grpcSecure || false,
      host: options?.grpcHost || 'localhost',
      port: options?.grpcPort || 50051,
    },
    auth: options?.authCredentials,
    headers: options?.headers,
  });
}
