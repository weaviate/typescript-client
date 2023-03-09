import fetch from 'isomorphic-fetch'

export const httpClient = (config) => {
  const baseUri = `${config.scheme}://${config.host}/v1`
  const url = makeUrl(baseUri);

  return {
    post: (path, payload, expectReturnContent = true, bearerToken = "") => {
      var request = {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken)
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    put: (path, payload, expectReturnContent = true,  bearerToken = "") => {
      var request = {
        method: "PUT",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    patch: (path, payload, bearerToken = "") => {
      var request = {
        method: "PATCH",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(false));
    },
    delete: (path, payload, expectReturnContent = false, bearerToken = "") => {
      var request = {
        method: "DELETE",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    head: (path, payload, bearerToken = "") => {
      var request = {
        method: "HEAD",
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(handleHeadResponse(false, true));
    },
    get: (path, expectReturnContent = true, bearerToken = "") => {
      var request = {
        method: "GET",
        headers: {
          ...config.headers,
        },
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request).then(makeCheckStatus(expectReturnContent));
    },
    getRaw: (path, bearerToken = "") => {
      // getRaw does not handle the status leaving this to the caller
      var request = {
        method: "GET",
        headers: {
          ...config.headers,
        },
      };
      addAuthHeaderIfNeeded(request, bearerToken);
      return fetch(url(path), request);
    },
    externalGet: (externalUrl) => {
      return fetch(externalUrl, {
        method: "GET",
        headers: {
          ...config.headers,
        },
      }).then(makeCheckStatus(true));
    },
    externalPost: (externalUrl, body, contentType) => {
      if (contentType == undefined || contentType == "") {
        contentType = "application/json";
      }
      var request = {
        method: "POST",
        headers: {
          ...config.headers,
          "content-type": contentType
        }
      };
      if (body != null) {
        request.body = body;
      }
      return fetch(externalUrl, request).then(makeCheckStatus(true));
    }
  };
};

const makeUrl = (basePath) => (path) => basePath + path;

const makeCheckStatus = (expectResponseBody) => (res) => {
  if (res.status >= 400) {
    return res.text().then(errText => {
      var err;
      try {
        // in case of invalid json response (like empty string)
        err = JSON.stringify(JSON.parse(errText))
      } catch(e) {
        err = errText
      }
      return Promise.reject(
        `usage error (${res.status}): ${err}`
      );
    });
  }

  if (expectResponseBody) {
    return res.json();
  }
};

const handleHeadResponse = (expectResponseBody) => (res) => {
  if (res.status == 204 || res.status == 404) {
    return res.status == 204
  }
  return makeCheckStatus(expectResponseBody)
}

function addAuthHeaderIfNeeded(request, bearerToken) {
  if (bearerToken != "") {
    request.headers.Authorization = `Bearer ${bearerToken}`;
  }
}

export default httpClient;