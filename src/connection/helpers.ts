import { ClientParams, WeaviateNextClient } from '..';
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

export function connectToWCS(
  clusterURL: string,
  clientMaker: (params: ClientParams) => WeaviateNextClient,
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

  let apiKey: ApiKey | undefined;
  let authClientSecret:
    | AuthClientCredentials
    | AuthAccessTokenCredentials
    | AuthUserPasswordCredentials
    | undefined;
  if (options?.authCredentials instanceof ApiKey) {
    apiKey = options.authCredentials;
  } else {
    authClientSecret = options?.authCredentials;
  }

  const client = clientMaker({
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
    auth: apiKey || authClientSecret,
    headers: options?.headers,
  });
  return Promise.resolve(client);
}
