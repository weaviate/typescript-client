import fetch from 'isomorphic-fetch';
import { ConnectionParams } from '..';

export interface HttpClient {
  patch: (path: string, payload: any, bearerToken?: string) => any;
  head: (path: string, payload: any, bearerToken?: string) => any;
  post: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  get: (path: string, expectReturnContent?: boolean, bearerToken?: string) => any;
  externalPost: (externalUrl: string, body: any, contentType: any) => any;
  getRaw: (path: string, bearerToken?: string) => any;
  delete: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  put: (path: string, payload: any, expectReturnContent?: boolean, bearerToken?: string) => any;
  externalGet: (externalUrl: string) => Promise<any>;
}

export const httpClient = (config: ConnectionParams): HttpClient => {
  const baseUri = `${config.scheme}://${config.host}/v1`;
  const url = makeUrl(baseUri);

  return {
    post: (path: string, payload: any, expectReturnContent = true, bearerToken = '') => {
      const request = {
        method: 'POST',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    put: (path: string, payload: any, expectReturnContent = true, bearerToken = '') => {
      const request = {
        method: 'PUT',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    patch: (path: string, payload: any, bearerToken = '') => {
      const request = {
        method: 'PATCH',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(false));
    },
    delete: (path: string, payload: any, expectReturnContent = false, bearerToken = '') => {
      const request = {
        method: 'DELETE',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    head: (path: string, payload: any, bearerToken = '') => {
      const request = {
        method: 'HEAD',
        headers: {
          ...config.headers,
          'content-type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(handleHeadResponse(false));
    },
    get: (path: string, expectReturnContent = true, bearerToken = '') => {
      const request = {
        method: 'GET',
        headers: {
          ...config.headers,
        },
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
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
      }).then(makeCheckStatus(true));
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
      return fetch(externalUrl, request).then(makeCheckStatus(true));
    },
  };
};

const makeUrl = (basePath: string) => (path: string) => basePath + path;

const makeCheckStatus = (expectResponseBody: any) => (res: any) => {
  if (res.status >= 400) {
    return res.text().then((errText: any) => {
      let err;
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
    return res.json();
  }
};

const handleHeadResponse = (expectResponseBody: any) => (res: any) => {
  if (res.status == 204 || res.status == 404) {
    return res.status == 204;
  }
  return makeCheckStatus(expectResponseBody);
};

function addAuthHeaderIfNeeded(request: any, bearerToken: string) {
  if (bearerToken !== '') {
    request.headers.Authorization = `Bearer ${bearerToken}`;
  }
}

export default httpClient;
