import NodesStatusGetter from './nodesStatusGetter';
import Connection from '../connection';

export interface IWeaviateClientCluster {
  nodesStatusGetter: () => NodesStatusGetter;
}

const cluster = (client: Connection): IWeaviateClientCluster => {
  return {
    nodesStatusGetter: () => new NodesStatusGetter(client),
  };
};

export default cluster;
