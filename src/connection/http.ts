import OpenidConfigurationGetter from '../misc/openidConfigurationGetter.js';

import { WeaviateInvalidInputError } from '../errors.js';
import { OidcAuthenticator } from './auth.js';
import { HttpClient, InternalConnectionParams, httpClient } from './transports/http.js';

export interface ConnectionDetails {
  host: string;
  bearerToken?: string;
  headers?: HeadersInit;
}

export default class ConnectionREST {
  private apiKey?: string;
  private headers?: HeadersInit;
  protected authEnabled: boolean;
  public readonly host: string;
  public readonly http: HttpClient;
  public oidcAuth?: OidcAuthenticator;

  constructor(params: InternalConnectionParams) {
    params = this.sanitizeParams(params);
    this.host = params.host;
    this.headers = params.headers;
    this.http = httpClient(params);
    this.authEnabled = this.parseAuthParams(params);
  }

  private parseAuthParams(params: InternalConnectionParams): boolean {
    if (params.authClientSecret && params.apiKey) {
      throw new WeaviateInvalidInputError(
        'must provide one of authClientSecret (OIDC) or apiKey, cannot provide both'
      );
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

  private sanitizeParams(params: InternalConnectionParams) {
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
        throw new WeaviateInvalidInputError(
          `The host contains a different protocol than specified in the scheme (scheme: ${params.scheme} != host: ${extractedSchemeMatch[1]})`
        );
      } else if (!extractedSchemeMatch) {
        // If no scheme in the host, simply prefix with the provided scheme
        params.host = `${params.scheme}://${params.host}`;
      }
      // If there's no scheme in params, ensure the host starts with a recognized protocol
    } else if (!extractedSchemeMatch) {
      throw new WeaviateInvalidInputError(
        'The host must start with a recognized protocol (e.g., http or https) if no scheme is provided.'
      );
    }

    return params;
  }

  postReturn = <B, T>(path: string, payload: B): Promise<T> => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.post<B, T>(path, payload, true, token) as T);
    }
    return this.http.post<B, T>(path, payload, true, '') as Promise<T>;
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

  get = <T>(path: string, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then((token) => this.http.get<T>(path, expectReturnContent, token));
    }
    return this.http.get<T>(path, expectReturnContent);
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

  getDetails = async (): Promise<ConnectionDetails> => ({
    host: new URL(this.host).host, // removes default port
    bearerToken: this.authEnabled ? await this.login().then((token) => `Bearer ${token}`) : undefined,
    headers: this.headers,
  });
}

export * from './auth.js';
