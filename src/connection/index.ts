import { OidcAuthenticator } from './auth';
import OpenidConfigurationGetter from '../misc/openidConfigurationGetter';

import httpClient, { HttpClient } from './httpClient';
import gqlClient, { GraphQLClient } from './gqlClient';
import { ConnectionParams, ConsistencyLevel } from '..';
import { Variables } from 'graphql-request';

import { Metadata } from 'nice-grpc';
import grpcClient, { GrpcClient } from './grpcClient';
import { Search } from '../grpc/searcher';
import { Batch } from '../grpc/batcher';

export default class Connection {
  private apiKey?: string;
  private authEnabled: boolean;
  private gql: GraphQLClient;
  public readonly host: string;
  public readonly http: HttpClient;
  private grpc?: GrpcClient;
  public oidcAuth?: OidcAuthenticator;

  constructor(params: ConnectionParams) {
    params = this.sanitizeParams(params);
    this.host = params.host;
    this.http = httpClient(params);
    this.gql = gqlClient(params);
    this.grpc = grpcClient(params);
    this.authEnabled = this.parseAuthParams(params);
  }

  private parseAuthParams(params: ConnectionParams): boolean {
    if (params.authClientSecret && params.apiKey) {
      throw new Error('must provide one of authClientSecret (OIDC) or apiKey, cannot provide both');
    }
    if (params.authClientSecret) {
      this.oidcAuth = new OidcAuthenticator(this.http, params.authClientSecret);
      return true;
    }
    if (params.apiKey) {
      this.apiKey = params.apiKey?.apiKey;
      return true;
    }
    return false;
  }

  private sanitizeParams(params: ConnectionParams) {
    // Remove trailing slashes from the host
    while (params.host.endsWith('/')) {
      params.host = params.host.slice(0, -1);
    }

    const protocolPattern = /^(https?|ftp|file)(?::\/\/)/;
    const extractedSchemeMatch = params.host.match(protocolPattern);

    // Check for the existence of scheme in params
    if (params.scheme) {
      // If the host contains a scheme different than provided scheme, replace it and throw a warning
      if (extractedSchemeMatch && extractedSchemeMatch[1] !== `${params.scheme}`) {
        throw new Error(
          `The host contains a different protocol than specified in the scheme (scheme: ${params.scheme} != host: ${extractedSchemeMatch[1]})`
        );
      } else if (!extractedSchemeMatch) {
        // If no scheme in the host, simply prefix with the provided scheme
        params.host = `${params.scheme}://${params.host}`;
      }
      // If there's no scheme in params, ensure the host starts with a recognized protocol
    } else if (!extractedSchemeMatch) {
      throw new Error(
        'The host must start with a recognized protocol (e.g., http or https) if no scheme is provided.'
      );
    }

    return params;
  }

  postReturn = <B, T>(path: string, payload: B): Promise<T> => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.http.post<B, T>(path, payload, true, token).then((res) => res as T)
      );
    }
    return this.http.post<B, T>(path, payload, true, '').then((res) => res as T);
  };

  postEmpty = <B>(path: string, payload: B): Promise<void> => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.post<B, void>(path, payload, false, token));
    }
    return this.http.post<B, void>(path, payload, false, '');
  };

  put = (path: string, payload: any, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.put(path, payload, expectReturnContent, token));
    }
    return this.http.put(path, payload, expectReturnContent);
  };

  patch = (path: string, payload: any) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.patch(path, payload, token));
    }
    return this.http.patch(path, payload);
  };

  delete = (path: string, payload: any, expectReturnContent = false) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.delete(path, payload, expectReturnContent, token));
    }
    return this.http.delete(path, payload, expectReturnContent);
  };

  head = (path: string, payload: any) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.head(path, payload, token));
    }
    return this.http.head(path, payload);
  };

  get = (path: string, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.get(path, expectReturnContent, token));
    }
    return this.http.get(path, expectReturnContent);
  };

  query = <V extends Variables, T = any>(query: any, variables?: V) => {
    if (this.authEnabled) {
      return this.login().then((token) => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.gql.query<V, T>(query, variables, headers);
      });
    }
    return this.gql.query<V, T>(query, variables);
  };

  search = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    const grpc = this.grpc;
    if (!grpc) {
      throw new Error(
        'gRPC client not initialized, did you forget to set the gRPC address in ConnectionParams?'
      );
    }
    if (this.authEnabled) {
      return this.login().then((token) => {
        return grpc.search(name, consistencyLevel, tenant, `Bearer ${token}`);
      });
    }
    return new Promise<Search>((resolve) => resolve(grpc.search(name, consistencyLevel, tenant)));
  };

  batch = (name: string, consistencyLevel?: ConsistencyLevel, tenant?: string) => {
    const grpc = this.grpc;
    if (!grpc) {
      throw new Error(
        'gRPC client not initialized, did you forget to set the gRPC address in ConnectionParams?'
      );
    }
    if (this.authEnabled) {
      return this.login().then((token) => {
        return grpc.batch(name, consistencyLevel, tenant, `Bearer ${token}`);
      });
    }
    return new Promise<Batch>((resolve) => resolve(grpc.batch(name, consistencyLevel)));
  };

  login = async () => {
    if (this.apiKey) {
      return this.apiKey;
    }

    if (!this.oidcAuth) {
      return '';
    }

    const localConfig = await new OpenidConfigurationGetter(this.http).do();

    if (localConfig === undefined) {
      console.warn('client is configured for authentication, but server is not');
      return '';
    }

    if (Date.now() >= this.oidcAuth.getExpiresAt()) {
      await this.oidcAuth.refresh(localConfig);
    }
    return this.oidcAuth.getAccessToken();
  };
}

export * from './auth';
