import { nativeGrpcTransport } from './native.js';
import { GrpcTransport } from './types.js';
import { webGrpcTransport } from './web.js';

export { nativeGrpcTransport } from './native.js';
export type { GrpcClients, GrpcTransport } from './types.js';
export { webGrpcTransport } from './web.js';

export type GrpcTransportName = 'native' | 'grpc-web';

export function resolveGrpcTransport(name?: GrpcTransportName): GrpcTransport {
  return name === 'grpc-web' ? webGrpcTransport : nativeGrpcTransport;
}
