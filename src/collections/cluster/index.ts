import { NodesStatusGetter } from '../../cluster';
import Connection from '../../connection';
import { BatchStats, NodeStats, NodeShardStatus } from '../../openapi/types';

type Output = 'minimal' | 'verbose';

export type NodeArgs<O extends Output> = {
  collection?: string;
  output?: O;
};

export type Node<O extends Output> = {
  name: string;
  status: 'HEALTHY' | 'UNHEALTHY' | 'UNAVAILABLE';
  version: string;
  gitHash: string;
  stats: O extends 'minimal' ? undefined : Required<NodeStats>;
  batchStats: Required<BatchStats>;
  shards: O extends 'minimal' ? null : Required<NodeShardStatus>[];
};

const cluster = (connection: Connection) => {
  return {
    nodes: <O extends Output = 'minimal'>(args?: NodeArgs<O>): Promise<Node<O>[]> => {
      let builder = new NodesStatusGetter(connection).withOutput(args?.output ? args.output : 'minimal');
      if (args?.collection) {
        builder = builder.withClassName(args.collection);
      }
      return builder.do().then((res) => res.nodes) as Promise<Node<O>[]>;
    },
  };
};

export default cluster;

export interface Cluster {
  nodes: <O extends Output = 'minimal'>(args?: NodeArgs<O>) => Promise<Node<O>[]>;
}
