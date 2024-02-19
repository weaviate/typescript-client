import { ConnectionParams } from '.';

export interface HttpClient {
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

export default httpClient;
