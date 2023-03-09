import { GraphQLClient } from 'graphql-request'

export const gqlClient = (config) => {
    const scheme = config.scheme
    const host = config.host
    const defaultHeaders = config.headers
    return {
      // for backward compatibility with replaced graphql-client lib,
      // results are wrapped into { data: data }
      query: (query, headers = {}) => {
        return new GraphQLClient(`${scheme}://${host}/v1/graphql`, {
          headers: {
            ...defaultHeaders,
            ...headers,
          }
        })
        .request(query)
        .then(data => ({ data }));
    }
  }
}

export default gqlClient;
