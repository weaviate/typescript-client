// Browser stand-in for the native `nice-grpc` package.
//
// The native gRPC transport (connection/transports/native.ts) is dragged into the
// browser import graph via the isomorphic root entry (src/index.ts -> the grpc
// transport resolver), and its top-level `createClientFactory().use(...)` statement
// is a side effect esbuild cannot tree-shake away. The native transport is never
// exercised in the browser — the gRPC-Web transport (nice-grpc-web) is. This stub
// satisfies native.ts's module-init and API surface so the bundle links and loads
// without dragging in `@grpc/grpc-js` or Node's `http2` stack. Any attempt to
// actually use the native transport in the browser throws a clear error.

const NOT_AVAILABLE = 'Native gRPC transport is not available in the browser; use the gRPC-Web transport.';

export type ChannelOptions = Record<string, unknown>;

export interface ChannelCredentialsStatic {
  createSsl(): unknown;
  createInsecure(): unknown;
}

export const ChannelCredentials: ChannelCredentialsStatic = {
  createSsl: () => undefined,
  createInsecure: () => undefined,
};

export function createChannel(): unknown {
  throw new Error(NOT_AVAILABLE);
}

interface ClientFactory {
  use(middleware: unknown): ClientFactory;
  create(definition: unknown, channel: unknown): unknown;
}

export function createClientFactory(): ClientFactory {
  const factory: ClientFactory = {
    use: () => factory,
    create: () => {
      throw new Error(NOT_AVAILABLE);
    },
  };
  return factory;
}
