import { NodesStatusGetter } from '../../cluster/index.js';
const cluster = (connection) => {
  return {
    nodes: (opts) => {
      let builder = new NodesStatusGetter(connection).withOutput(
        (opts === null || opts === void 0 ? void 0 : opts.output) ? opts.output : 'minimal'
      );
      if (opts === null || opts === void 0 ? void 0 : opts.collection) {
        builder = builder.withClassName(opts.collection);
      }
      return builder.do().then((res) => res.nodes);
    },
  };
};
export default cluster;
