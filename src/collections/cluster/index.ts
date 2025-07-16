import { IConnection } from '../../connection/index.js';
import {
  BatchStats,
  NodeShardStatus,
  NodeStats,
  NodesStatusResponse,
  WeaviateReplicateRequest,
  WeaviateReplicateResponse,
  WeaviateReplicationResponse,
  WeaviateReplicationType,
  WeaviateShardingState,
} from '../../openapi/types.js';
import { DeepRequired } from '../../utils/types.js';

export type Output = 'minimal' | 'verbose' | undefined;

export type NodesOptions<O extends Output> = {
  /** The name of the collection to get the status of. */
  collection?: string;
  /** Set the desired output verbosity level. Can be `minimal | verbose | undefined` with `undefined` defaulting to `minimal`. */
  output: O;
};

export type QueryShardingStateOptions = {
  /** The name of the shard to query. If not provided, all shards will be queried. */
  shard?: string;
};

export type ReplicateArgs = {
  /** The name of the collection in which to replicate a shard. */
  collection: string;
  /** The name of the shard to replicate. */
  shard: string;
  /** The name of the node from which to replicate the shard. */
  sourceNode: string;
  /** The name of the node to which to replicate the shard. */
  targetNode: string;
  /** The type of replication to perform. */
  replicationType: WeaviateReplicationType;
};

export type ShardingState = DeepRequired<WeaviateShardingState>;

export type ReplicationOperation = DeepRequired<WeaviateReplicationResponse>;

export type QueryReplicationOpsOptions = {
  /** The name of the collection to query. */
  collection?: string;
  /** The name of the shard to query. */
  shard?: string;
  /** The target node of the op to query. */
  targetNode?: string;
  /** Whether to include the status history in the response. */
  includeHistory?: boolean;
};

export type GetReplicationOpOptions = {
  /** Whether to include the status history in the response. Defaults to false. */
  includeHistory?: boolean;
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

const cluster = (connection: IConnection) => {
  return {
    nodes: <O extends Output = undefined>(opts?: NodesOptions<O>) => {
      const params = new URLSearchParams();
      let path = '/nodes';
      if (opts?.collection) {
        path = path.concat(`/${opts.collection}`);
      }
      params.append('output', opts?.output ? opts.output : 'minimal');
      return connection
        .get<NodesStatusResponse>(`${path}?${params.toString()}`)
        .then((res) => res.nodes as Node<O>[]);
    },
    queryShardingState: (collection: string, opts?: QueryShardingStateOptions) => {
      const params = new URLSearchParams();
      params.append('collection', collection);
      if (opts?.shard) {
        params.append('shard', opts.shard);
      }
      return connection
        .get<ShardingState | undefined>(`/replication/sharding-state?${params.toString()}`)
        .then((res) => res as ShardingState);
    },
    replicate: (args: ReplicateArgs): Promise<string> =>
      connection
        .postReturn<WeaviateReplicateRequest, WeaviateReplicateResponse>(
          `/replication/replicate`,
          (({ replicationType, ...rest }) => ({ type: replicationType, ...rest }))(args)
        )
        .then((res) => res.id),
    replications: {
      cancel: (id: string) => connection.postEmpty(`/replication/replicate/${id}/cancel`, {}),
      delete: (id: string) => connection.delete(`/replication/replicate/${id}`, {}, false),
      deleteAll: () => connection.delete(`/replication/replicate`, {}, false),
      get: (id: string, opts?: GetReplicationOpOptions): Promise<ReplicationOperation | null> =>
        connection
          .get<ReplicationOperation | undefined>(
            `/replication/replicate/${id}?includeHistory=${
              opts?.includeHistory ? opts?.includeHistory : 'false'
            }`
          )
          .then((res) => (res ? (res as ReplicationOperation) : null)),
      query: (opts?: QueryReplicationOpsOptions): Promise<ReplicationOperation[]> => {
        const { collection, shard, targetNode, includeHistory } = opts || {};
        const params = new URLSearchParams();
        if (collection) {
          params.append('collection', collection);
        }
        if (shard) {
          params.append('shard', shard);
        }
        if (targetNode) {
          params.append('targetNode', targetNode);
        }
        if (includeHistory) {
          params.append('includeHistory', includeHistory.toString());
        }
        return connection.get<ReplicationOperation[]>(`/replication/replicate?${params.toString()}`);
      },
    },
  };
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
  /**
   * Query the sharding state of a specific collection.
   *
   * @param {string} collection The name of the collection to query.
   * @param {QueryShardingStateOptions} [opts] The options for the request.
   * @returns {Promise<ShardingState>} The sharding state of the collection.
   */
  queryShardingState: (collection: string, opts?: QueryShardingStateOptions) => Promise<ShardingState>;
  /**
   * Replicate a shard from one node to another.
   *
   * @param {ReplicateArgs} args The arguments for the replication request.
   * @returns {Promise<string>} The ID of the replication request.
   */
  replicate: (args: ReplicateArgs) => Promise<string>;
  /**
   * Access replication operations.
   */
  replications: Replications;
}

export interface Replications {
  /**
   * Cancel a replication operation.
   *
   * @param {string} id The ID of the replication operation to cancel.
   * @returns {Promise<void>} A promise that resolves when the operation is cancelled.
   */
  cancel: (id: string) => Promise<void>;
  /**
   * Delete a replication operation.
   *
   * @param {string} id The ID of the replication operation to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is deleted.
   */
  delete: (id: string) => Promise<void>;
  /**
   * Delete all replication operations.
   *
   * @returns {Promise<void>} A promise that resolves when all operations are deleted.
   */
  deleteAll: () => Promise<void>;
  /**
   * Get a specific replication operation by ID.
   *
   * @param {string} id The ID of the replication operation to get.
   * @param {boolean} [opts.includeHistory=false] Whether to include the status history in the response.
   * @returns {Promise<ReplicationOperation | null>} The replication operation or null if not found.
   */
  get: (id: string, opts?: { includeHistory?: boolean }) => Promise<ReplicationOperation | null>;
  /**
   * Query all replication operations with optional filters.
   *
   * @param {QueryReplicationOpsOptions} [opts] Optional parameters for filtering the query.
   * @returns {Promise<ReplicationOperation[]>} A list of replication operations matching the query.
   */
  query: (opts?: QueryReplicationOpsOptions) => Promise<ReplicationOperation[]>;
}
