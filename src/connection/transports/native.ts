import { ChannelCredentials, ChannelOptions, createChannel, createClientFactory } from 'nice-grpc';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';

import { HealthDefinition } from '../../proto/google/health/v1/health.js';
import { WeaviateDefinition } from '../../proto/v1/weaviate.js';
import { GrpcClients, GrpcTransport } from './types.js';

const clientFactory = createClientFactory().use(retryMiddleware);

export const nativeGrpcTransport: GrpcTransport = {
  supportsStreaming: true,
  create: (config): GrpcClients => {
    const channelOptions: ChannelOptions = {
      'grpc.max_send_message_length': config.grpcMaxMessageLength,
      'grpc.max_receive_message_length': config.grpcMaxMessageLength,
    };
    if (config.grpcProxyUrl) {
      // grpc.http_proxy is not used by grpc.js under-the-hood
      // only uses the env var and whether http_proxy is enabled
      process.env.grpc_proxy = config.grpcProxyUrl;
      channelOptions['grpc.enabled_http_proxy'] = true;
    }
    const channel = createChannel(
      config.grpcAddress,
      config.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
      channelOptions
    );
    const client = clientFactory.create(WeaviateDefinition, channel);
    const health = clientFactory.create(HealthDefinition, channel);
    return {
      client,
      health,
      close: () => channel.close(),
    };
  },
};
