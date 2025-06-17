import { isAbortError } from 'abort-controller-x';
import { Agent } from 'http';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateRequestTimeoutError,
  WeaviateUnauthenticatedError,
  WeaviateUnexpectedStatusCodeError,
} from '../../errors.js';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from '../auth.js';

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

export type TimeoutParams = {
  /** Define the configured timeout when querying data from Weaviate */
  query?: number;
  /** Define the configured timeout when mutating data to Weaviate */
  insert?: number;
  /** Define the configured timeout when initially connecting to Weaviate */
  init?: number;
};

export type InternalConnectionParams = {
  authClientSecret?: AuthClientCredentials | AuthAccessTokenCredentials | AuthUserPasswordCredentials;
  apiKey?: ApiKey;
  host: string;
  scheme?: string;
  headers?: HeadersInit;
  // http1Agent?: Agent;
  grpcProxyUrl?: string;
  agent?: Agent;
  timeout?: TimeoutParams;
  skipInitChecks?: boolean;
};

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
  get: <T>(path: string, expectReturnContent?: boolean, bearerToken?: string) => Promise<T>;
  externalPost: (externalUrl: string, body: any, contentType: any) => any;
  getRaw: (path: string, bearerToken?: string) => any;
  delete: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  put: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  externalGet: (externalUrl: string) => Promise<any>;
}

const fetchWithTimeout = (
  input: RequestInfo | URL,
  timeout: number,
  init?: RequestInit | undefined
): Promise<Response> => {
  const controller = new AbortController();
  // Set a timeout to abort the request
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
  return fetch(input, { ...init, signal: controller.signal })
    .catch((error) => {
      if (isAbortError(error)) {
        throw new WeaviateRequestTimeoutError(`Request timed out after ${timeout}ms`);
      }
      throw error; // For other errors, rethrow them
    })
    .finally(() => clearTimeout(timeoutId));
};

export const httpClient = (config: InternalConnectionParams): HttpClient => {
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
          ...getAuthHeaders(config, bearerToken),
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.insert || 90, request).then(
        checkStatus<T>(expectReturnContent)
      );
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
          ...getAuthHeaders(config, bearerToken),
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.insert || 90, request).then(
        checkStatus<T>(expectReturnContent)
      );
    },
    patch: <B, T>(path: string, payload: B, bearerToken = ''): Promise<T | undefined> => {
      const request = {
        method: 'PATCH',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
          ...getAuthHeaders(config, bearerToken),
        },
        body: JSON.stringify(payload),
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.insert || 90, request).then(checkStatus<T>(false));
    },
    delete: <B>(path: string, payload: B | null = null, expectReturnContent = false, bearerToken = '') => {
      const request = {
        method: 'DELETE',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
          ...getAuthHeaders(config, bearerToken),
        },
        body: payload ? JSON.stringify(payload) : undefined,
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.insert || 90, request).then(
        checkStatus<undefined>(expectReturnContent)
      );
    },
    head: <B>(path: string, payload: B | null = null, bearerToken = '') => {
      const request = {
        method: 'HEAD',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
          ...getAuthHeaders(config, bearerToken),
        },
        body: payload ? JSON.stringify(payload) : undefined,
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.query || 30, request).then(
        handleHeadResponse<undefined>(false)
      );
    },
    get: <T>(path: string, expectReturnContent = true, bearerToken = ''): Promise<T> => {
      const request = {
        method: 'GET',
        headers: {
          ...config.headers,
          ...getAuthHeaders(config, bearerToken),
        },
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.query || 30, request).then(
        checkStatus<any>(expectReturnContent)
      );
    },
    getRaw: (path: string, bearerToken = '') => {
      // getRaw does not handle the status leaving this to the caller
      const request = {
        method: 'GET',
        headers: {
          ...config.headers,
          ...getAuthHeaders(config, bearerToken),
        },
        agent: config.agent,
      };
      return fetchWithTimeout(url(path), config.timeout?.query || 30, request);
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
        if (res.status === 401) {
          return Promise.reject(new WeaviateUnauthenticatedError(err));
        } else if (res.status === 403) {
          return Promise.reject(new WeaviateInsufficientPermissionsError(403, err));
        } else {
          return Promise.reject(new WeaviateUnexpectedStatusCodeError(res.status, err));
        }
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
    if (res.status == 200 || res.status == 204 || res.status == 404) {
      return Promise.resolve(res.status == 200 || res.status == 204);
    }
    return checkStatus<T>(expectResponseBody)(res);
  };

const getAuthHeaders = (config: InternalConnectionParams, bearerToken: string) =>
  bearerToken
    ? {
        Authorization: `Bearer ${bearerToken}`,
        'X-Weaviate-Cluster-Url': config.host,
        //  keeping for backwards compatibility for older clusters for now. On newer clusters, Embedding Service reuses Authorization header.
        'X-Weaviate-Api-Key': bearerToken,
      }
    : undefined;
