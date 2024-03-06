import ConnectionGQL from './gql';
import ConnectionGRPC from './grpc';
import ConnectionREST from './http';

export type { ConnectionParams } from './http';
export { ConnectionGQL, ConnectionGRPC, ConnectionREST };
export { connectToLocal, connectToWCS } from './helpers';

export default ConnectionGQL;
