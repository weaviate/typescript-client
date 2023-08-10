import { GraphQLClient as Client, Variables } from 'graphql-request';
import { ConnectionParams } from '..';

export type TQuery = any;
export interface GraphQLClient {
  query: <V extends Variables, T>(
    query: TQuery,
    variables?: V,
    headers?: HeadersInit
  ) => Promise<{ data: T }>;
}

export const gqlClient = (config: ConnectionParams): GraphQLClient => {
  const scheme = config.scheme;
  const host = config.host;
  const defaultHeaders = config.headers;
  return {
    // for backward compatibility with replaced graphql-client lib,
    // results are wrapped into { data: data }
    query: <V extends Variables, T>(query: TQuery, variables?: V, headers?: HeadersInit) => {
      return new Client(`${scheme}://${host}/v1/graphql`, {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        fetch,
      })
        .request<T>(query, variables, headers)
        .then((data) => ({ data }));
    },
  };
};

export default gqlClient;
