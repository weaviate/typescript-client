import ConnectionGQL from './gql.js';
import ConnectionGRPC from './grpc.js';
import ConnectionREST from './http.js';
export default ConnectionGQL;
export type {
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
  ConnectToWeaviateCloudOptions,
} from './helpers.js';
export type { InternalConnectionParams } from './http.js';
export { ConnectionGQL, ConnectionGRPC, ConnectionREST };
