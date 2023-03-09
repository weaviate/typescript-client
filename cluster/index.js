import NodesStatusGetter from "./nodesStatusGetter";

const cluster = (client) => {
  return {
    nodesStatusGetter: () => new NodesStatusGetter(client),
  };
};

export default cluster;
