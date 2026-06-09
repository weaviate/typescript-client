// Browser stand-in for Node built-in modules (fs/http/https) that are imported
// by isomorphic code paths but not exercised in the browser. Only the file-path
// media helpers in utils/base64 would touch these, which browser code does not use.
export default {};

// The isomorphic native entry (`src/index.ts`) imports `{ Agent }` from
// `http`/`https` via named bindings. Provide a stand-in constructor so the
// browser bundle links cleanly; it is tree-shaken away / never instantiated on
// the gRPC-Web code path.
export class Agent {}
