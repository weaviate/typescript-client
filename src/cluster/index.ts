import NodesStatusGetter from './nodesStatusGetter';
import Connection from '../connection';

export interface Cluster {
  nodesStatusGetter: () => NodesStatusGetter;
}

const cluster = (client: Connection): Cluster => {
  return {
    nodesStatusGetter: () => new NodesStatusGetter(client),
  };
};

export default cluster;
