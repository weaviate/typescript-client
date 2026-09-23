import { ChannelCredentials, ChannelOptions, createChannel, createClientFactory } from 'nice-grpc';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { HealthDefinition, WeaviateDefinition } from '@weaviate/core/proto';
import { Transports, TransportsParams } from '@weaviate/core';

const clientFactory = createClientFactory().use(retryMiddleware);

export const transportsMaker = (params: TransportsParams): Transports => {
  const channelOptions: ChannelOptions = {
    'grpc.max_send_message_length': params.grpcMaxMessageLength,
    'grpc.max_receive_message_length': params.grpcMaxMessageLength,
  };
  if (params.grpcProxyUrl) {
    // grpc.http_proxy is not used by grpc.js under-the-hood
    // only uses the env var and whether http_proxy is enabled
    process.env.grpc_proxy = params.grpcProxyUrl;
    channelOptions['grpc.enabled_http_proxy'] = true;
  }
  const channel = createChannel(
    params.grpcAddress,
    params.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
    channelOptions
  );
  return {
    weaviate: clientFactory.create(WeaviateDefinition, channel),
    health: clientFactory.create(HealthDefinition, channel),
    close: () => channel.close(),
  };
};
