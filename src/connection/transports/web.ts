import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { createChannel, createClientFactory, FetchTransport } from 'nice-grpc-web';

import { HealthDefinition } from '../../proto/google/health/v1/health.js';
import { WeaviateDefinition } from '../../proto/v1/weaviate.js';
import { GrpcClients, GrpcTransport } from './types.js';

const clientFactory = createClientFactory().use(retryMiddleware);

export const webGrpcTransport: GrpcTransport = {
  supportsStreaming: false,
  create: (config): GrpcClients => {
    // nice-grpc-web needs a fully-qualified URL with a scheme, unlike the
    // native transport which uses a bare `host:port` address.
    const address = `${config.grpcSecure ? 'https' : 'http'}://${config.grpcAddress}`;
    // eslint-disable-next-line new-cap -- FetchTransport is a factory function, not a constructor
    const channel = createChannel(address, FetchTransport());
    const client = clientFactory.create(WeaviateDefinition, channel);
    const health = clientFactory.create(HealthDefinition, channel);
    return {
      client,
      health,
      // Fetch-based gRPC-Web channels hold no persistent connection, so there
      // is nothing to tear down here.
      close: () => {},
    };
  },
};
