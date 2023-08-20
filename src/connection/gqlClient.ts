import { GraphQLClient as Client, Variables } from 'graphql-request';
import { ConnectionParams } from '..';

export type TQuery = any;
export interface GraphQLClient {
  query: (query: TQuery, variables?: Variables, headers?: HeadersInit) => Promise<{ data: any }>;
}

export const gqlClient = (config: ConnectionParams): GraphQLClient => {
  const defaultHeaders = config.headers;
  const version = '/v1/graphql';
  const baseUri = config.host.startsWith(`${config.scheme}://`)
    ? `${config.host}${version}`
    : `${config.scheme}://${config.host}${version}`;

  return {
    // for backward compatibility with replaced graphql-client lib,
    // results are wrapped into { data: data }
    query: (query: TQuery, variables?: Variables, headers?: HeadersInit) => {
      return new Client(baseUri, {
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        fetch,
      })
        .request(query, variables, headers)
        .then((data) => ({ data }));
    },
  };
};

export default gqlClient;
