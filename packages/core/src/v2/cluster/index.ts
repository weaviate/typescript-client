import Connection from '../../connection/index.js';
import NodesStatusGetter from './nodesStatusGetter.js';

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
export { default as NodesStatusGetter } from './nodesStatusGetter.js';
