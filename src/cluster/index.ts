import NodesStatusGetter from './nodesStatusGetter';
import Connection from '../connection';

export type NodeStatus = 'HEALTHY' | 'UNHEALTHY' | 'UNAVAILABLE';

export interface Cluster {
  nodesStatusGetter: () => NodesStatusGetter;
}

const cluster = (client: Connection): Cluster => {
  return {
    nodesStatusGetter: () => new NodesStatusGetter(client),
  };
};

export default cluster;
export { default as NodesStatusGetter } from './nodesStatusGetter';
