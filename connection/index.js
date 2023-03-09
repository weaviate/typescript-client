import { Authenticator } from './auth.js';
import OpenidConfigurationGetter from "../misc/openidConfigurationGetter.js";

import httpClient from './httpClient';
import gqlClient from './gqlClient';

export default class Connection {
  constructor(params) {
    this.http = httpClient(params);
    this.gql = gqlClient(params)

    this.authEnabled = (params.authClientSecret !== undefined)
    if (this.authEnabled) {
      this.auth = new Authenticator(this.http, params.authClientSecret);
    }
  }

  post = (path, payload, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.post(path, payload, expectReturnContent, token))
    }
    return this.http.post(path, payload, expectReturnContent);
  };

  put = (path, payload, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.put(path, payload, expectReturnContent, token))
    }
    return this.http.put(path, payload, expectReturnContent);
  };

  patch = (path, payload) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.patch(path, payload, token))
    }
    return this.http.patch(path, payload);
  };

  delete = (path, payload, expectReturnContent = false) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.delete(path, payload, expectReturnContent, token))
    }
    return this.http.delete(path, payload, expectReturnContent)
  };
  
  head = (path, payload) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.head(path, payload, token))
    }
    return this.http.head(path, payload);
  };

  get = (path, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.get(path, expectReturnContent, token))
    }
    return this.http.get(path, expectReturnContent);
  };

  getRaw = (path) => {
    if (this.authEnabled) {
      return this.login().then(
        token => this.http.getRaw(path, token));
    }
    return this.http.getRaw(path);
  };

  query = (query) => {
    if (this.authEnabled) {
      return this.login().then(
        token => {
          var headers = {Authorization: `Bearer ${token}`};
          return this.gql.query(query, headers);
        });
    }
    return this.gql.query(query);
  };

  login = async () => {
    var localConfig = await new OpenidConfigurationGetter(this.http).do()
      .then(resp => resp);

    if (localConfig === undefined) {
      console.warn("client is configured for authentication, but server is not");
      return "";
    }

    if (Date.now() >= this.auth.expiresAt) {
      await this.auth.refresh(localConfig);
    }
    return this.auth.accessToken;
  };
}
