import { GraphQLClient as Client, Variables } from 'graphql-request';
import ConnectionREST, { ConnectionParams } from './http.js';

export default class ConnectionGQL extends ConnectionREST {
  private gql: GraphQLClient;

  constructor(params: ConnectionParams) {
    super(params);
    this.gql = gqlClient(params);
  }

  query = <V extends Variables, T = any>(query: any, variables?: V) => {
    if (this.authEnabled) {
      return this.login().then((token) => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.gql.query<V, T>(query, variables, headers);
      });
    }
    return this.gql.query<V, T>(query, variables);
  };

  close = () => this.http.close();
}

export * from './auth.js';

export type TQuery = any;
export interface GraphQLClient {
  query: <V extends Variables, T>(
    query: TQuery,
    variables?: V,
    headers?: HeadersInit
  ) => Promise<{ data: T }>;
}

export const gqlClient = (config: ConnectionParams): GraphQLClient => {
  const version = '/v1/graphql';
  const baseUri = `${config.host}${version}`;
  const defaultHeaders = config.headers;
  return {
    // for backward compatibility with replaced graphql-client lib,
    // results are wrapped into { data: data }
    query: <V extends Variables, T>(query: TQuery, variables?: V, headers?: HeadersInit) => {
      return new Client(baseUri, {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      })
        .request<T>(query, variables, headers)
        .then((data) => ({ data }));
    },
  };
};
