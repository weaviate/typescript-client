import Connection from '../../connection/index.js';
import { BatchStats, NodeShardStatus, NodeStats } from '../../openapi/types.js';
export type Output = 'minimal' | 'verbose' | undefined;
export type NodesOptions<O extends Output> = {
  /** The name of the collection to get the status of. */
  collection?: string;
  /** Set the desired output verbosity level. Can be `minimal | verbose | undefined` with `undefined` defaulting to `minimal`. */
  output: O;
};
export type Node<O extends Output> = {
  name: string;
  status: 'HEALTHY' | 'UNHEALTHY' | 'UNAVAILABLE';
  version: string;
  gitHash: string;
  stats: O extends 'minimal' | undefined ? undefined : Required<NodeStats>;
  batchStats: Required<BatchStats>;
  shards: O extends 'minimal' | undefined ? null : Required<NodeShardStatus>[];
};
declare const cluster: (connection: Connection) => {
  nodes: <O extends Output = undefined>(opts?: NodesOptions<O> | undefined) => Promise<Node<O>[]>;
};
export default cluster;
export interface Cluster {
  /**
   * Get the status of all nodes in the cluster.
   *
   * @param {NodesOptions<O>} [opts] The options for the request.
   * @returns {Promise<Node<O>[]>} The status of all nodes in the cluster.
   */
  nodes: <O extends Output = undefined>(opts?: NodesOptions<O>) => Promise<Node<O>[]>;
}
