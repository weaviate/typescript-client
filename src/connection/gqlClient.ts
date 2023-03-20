import { GraphQLClient as Client } from 'graphql-request';
import { ConnectionParams } from '../index';

export type TQuery = any;
export interface GraphQLClient {
  query: (query: TQuery, headers?: HeadersInit) => Promise<{ data: any }>;
}

export const gqlClient = (config: ConnectionParams): GraphQLClient => {
  const scheme = config.scheme;
  const host = config.host;
  const defaultHeaders = config.headers;
  return {
    // for backward compatibility with replaced graphql-client lib,
    // results are wrapped into { data: data }
    query: (query: TQuery, headers?: HeadersInit) => {
      return new Client(`${scheme}://${host}/v1/graphql`, {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      })
        .request(query)
        .then((data) => ({ data }));
    },
  };
};

export default gqlClient;
