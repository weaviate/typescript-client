import ConnectionGQL from './gql.js';
import ConnectionGRPC from './grpc.js';
import ConnectionREST from './http.js';

export default ConnectionGQL;
export { ConnectionGQL, ConnectionGRPC, ConnectionREST };

export type { Transports, TransportsMaker, TransportsParams } from './grpc.js';
export type {
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
  ConnectToWeaviateCloudOptions,
} from './helpers.js';
export type { InternalConnectionParams } from './http.js';
