import ConnectionGQL from './gql.js';
import ConnectionGRPC from './grpc.js';
import ConnectionREST from './http.js';

export default ConnectionGQL;

export type { ConnectionParams } from './http.js';
export { ConnectionGQL, ConnectionGRPC, ConnectionREST };
export type {
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWeaviateCloudOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
} from './helpers.js';
