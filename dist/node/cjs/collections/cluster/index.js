'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const index_js_1 = require('../../cluster/index.js');
const cluster = (connection) => {
  return {
    nodes: (opts) => {
      let builder = new index_js_1.NodesStatusGetter(connection).withOutput(
        (opts === null || opts === void 0 ? void 0 : opts.output) ? opts.output : 'minimal'
      );
      if (opts === null || opts === void 0 ? void 0 : opts.collection) {
        builder = builder.withClassName(opts.collection);
      }
      return builder.do().then((res) => res.nodes);
    },
  };
};
exports.default = cluster;
