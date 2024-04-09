import { Agent } from 'http';
import OpenidConfigurationGetter from '../misc/openidConfigurationGetter.js';

import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  OidcAuthenticator,
} from './auth.js';

/**
 * You can only specify the gRPC proxy URL at this point in time. This is because ProxiesParams should be used to define tunnelling proxies
 * and Weaviate does not support tunnelling proxies over HTTP/1.1 at this time.
 *
 * To use a forwarding proxy you should instead specify its URL as if it were the Weaviate instance itself.
 */
export type ProxiesParams = {
  // http?: string;
  // https?: string;
  grpc?: string;
};

export type ConnectionParams = {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  apiKey?: ApiKey;
  host: string;
  scheme?: string;
  headers?: HeadersInit;
  // http1Agent?: Agent;
  grpcProxyUrl?: string;
  agent?: Agent;
};

export default class ConnectionREST {
  private apiKey?: string;
  protected authEnabled: boolean;
  public readonly host: string;
  public readonly http: HttpClient;
  public oidcAuth?: OidcAuthenticator;

  constructor(params: ConnectionParams) {
    params = this.sanitizeParams(params);
    this.host = params.host;
    this.http = httpClient(params);
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

export * from './auth.js';

export interface HttpClient {
  close: () => void;
  patch: (path: string, payload: any, bearerToken?: string) => any;
  head: (path: string, payload: any, bearerToken?: string) => any;
  post: <B, T>(
    path: string,
    payload: B,
    expectReturnContent: boolean,
    bearerToken: string
  ) => Promise<T | undefined>;
  get: (path: string, expectReturnContent?: boolean, bearerToken?: string) => any;
  externalPost: (externalUrl: string, body: any, contentType: any) => any;
  getRaw: (path: string, bearerToken?: string) => any;
  delete: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  put: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  externalGet: (externalUrl: string) => Promise<any>;
}

export const httpClient = (config: ConnectionParams): HttpClient => {
  const version = '/v1';
  const baseUri = `${config.host}${version}`;
  const url = makeUrl(baseUri);

  return {
    close: () => config.agent?.destroy(),
    post: <B, T>(
      path: string,
      payload: B,
      expectReturnContent: boolean,
      bearerToken: string
    ): Promise<T | undefined> => {
      const request = {
        method: 'POST',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(checkStatus<T>(expectReturnContent));
    },
    put: <B, T>(
      path: string,
      payload: B,
      expectReturnContent = true,
      bearerToken = ''
    ): Promise<T | undefined> => {
      const request = {
        method: 'PUT',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(checkStatus<T>(expectReturnContent));
    },
    patch: <B, T>(path: string, payload: B, bearerToken = ''): Promise<T | undefined> => {
      const request = {
        method: 'PATCH',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(checkStatus<T>(false));
    },
    delete: <B>(path: string, payload: B | null = null, expectReturnContent = false, bearerToken = '') => {
      const request = {
        method: 'DELETE',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(checkStatus<undefined>(expectReturnContent));
    },
    head: <B>(path: string, payload: B | null = null, bearerToken = '') => {
      const request = {
        method: 'HEAD',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(handleHeadResponse<undefined>(false));
    },
    get: <T>(path: string, expectReturnContent = true, bearerToken = ''): Promise<T | undefined> => {
      const request = {
        method: 'GET',
        headers: {
          ...config.headers,
        },
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(checkStatus<T>(expectReturnContent));
    },
    getRaw: (path: string, bearerToken = '') => {
      // getRaw does not handle the status leaving this to the caller
      const request = {
        method: 'GET',
        headers: {
          ...config.headers,
        },
        agent: config.agent,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request);
    },
    externalGet: (externalUrl: string) => {
      return fetch(externalUrl, {
        method: 'GET',
        headers: {
          ...config.headers,
        },
      }).then(checkStatus<any>(true));
    },
    externalPost: (externalUrl: string, body: any, contentType: any) => {
      if (contentType == undefined || contentType == '') {
        contentType = 'application/json';
      }
      const request = {
        body: undefined,
        method: 'POST',
        headers: {
          ...config.headers,
          'content-type': contentType,
        },
      };
      if (body != null) {
        request.body = body;
      }
      return fetch(externalUrl, request).then(checkStatus<any>(true));
    },
  };
};

const makeUrl = (basePath: string) => (path: string) => basePath + path;

const checkStatus =
  <T>(expectResponseBody: boolean) =>
  (res: Response) => {
    if (res.status >= 400) {
      return res.text().then((errText: string) => {
        let err: string;
        try {
          // in case of invalid json response (like empty string)
          err = JSON.stringify(JSON.parse(errText));
        } catch (e) {
          err = errText;
        }
        return Promise.reject(new Error(`usage error (${res.status}): ${err}`));
      });
    }
    if (expectResponseBody) {
      return res.json() as Promise<T>;
    }
    return Promise.resolve(undefined);
  };

const handleHeadResponse =
  <T>(expectResponseBody: boolean) =>
  (res: Response) => {
    if (res.status == 204 || res.status == 404) {
      return Promise.resolve(res.status == 204);
    }
    return checkStatus<T>(expectResponseBody)(res);
  };

function addAuthHeaderIfNeeded(request: any, bearerToken: string) {
  if (bearerToken !== '') {
    request.headers.Authorization = `Bearer ${bearerToken}`;
  }
}
