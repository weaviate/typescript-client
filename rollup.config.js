import babel from "@rollup/plugin-babel";

export default {
  input: "index.js",
  output: {
    file: "lib.js",
    format: "umd",
    name: "weaviate-client",
    exports: "named",
    globals: {
      "isomorphic-fetch": "fetch",
      "graphql-request": "request",
    }
  },
  external: [/@babel\/runtime/, "isomorphic-fetch", "graphql-request"],
  plugins: [babel({ babelHelpers: "runtime" })],
};
