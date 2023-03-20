import { Authenticator } from './auth';
import OpenidConfigurationGetter from '../misc/openidConfigurationGetter';

import httpClient, { HttpClient } from './httpClient';
import gqlClient, { GraphQLClient } from './gqlClient';
import { ConnectionParams } from '../index';

export default class Connection {
  public readonly auth: any;
  private readonly authEnabled: boolean;
  private gql: GraphQLClient;
  public readonly http: HttpClient;

  constructor(params: ConnectionParams) {
    this.http = httpClient(params);
    this.gql = gqlClient(params);

    this.authEnabled = params.authClientSecret !== undefined;
    if (this.authEnabled) {
      this.auth = new Authenticator(this.http, params.authClientSecret);
    }
  }

  post = (path: string, payload: any, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.http.post(path, payload, expectReturnContent, token)
      );
    }
    return this.http.post(path, payload, expectReturnContent);
  };

  put = (path: string, payload: any, expectReturnContent = true) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.http.put(path, payload, expectReturnContent, token)
      );
    }
    return this.http.put(path, payload, expectReturnContent);
  };

  patch = (path: string, payload: any) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.http.patch(path, payload, token)
      );
    }
    return this.http.patch(path, payload);
  };

  delete = (path: string, payload: any, expectReturnContent = false) => {
    if (this.authEnabled) {
      return this.login().then((token) =>
        this.http.delete(path, payload, expectReturnContent, token)
      );
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
      return this.login().then((token) =>
        this.http.get(path, expectReturnContent, token)
      );
    }
    return this.http.get(path, expectReturnContent);
  };

  query = (query: any) => {
    if (this.authEnabled) {
      return this.login().then((token) => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.gql.query(query, headers);
      });
    }
    return this.gql.query(query);
  };

  login = async () => {
    const localConfig = await new OpenidConfigurationGetter(this.http).do();

    if (localConfig === undefined) {
      console.warn(
        'client is configured for authentication, but server is not'
      );
      return '';
    }

    if (Date.now() >= this.auth.expiresAt) {
      await this.auth.refresh(localConfig);
    }
    return this.auth.accessToken;
  };
}
