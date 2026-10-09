import { ChannelCredentials, ChannelOptions, createChannel, createClientFactory } from 'nice-grpc';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { HealthDefinition, WeaviateDefinition } from '@weaviate/core/proto';
import { Transports, TransportsParams } from '@weaviate/core';

const clientFactory = createClientFactory().use(retryMiddleware);

export const transportsFactory = (params: TransportsParams): Transports => {
  const channelOptions: ChannelOptions = {
    'grpc.max_send_message_length': params.maxMessageLength,
    'grpc.max_receive_message_length': params.maxMessageLength,
  };
  if (params.proxyUrl) {
    // grpc.js does not use the value of grpc.http_proxy,
    // only checks if it is set and uses the env var instead.
    process.env.grpc_proxy = params.proxyUrl;
    channelOptions['grpc.enabled_http_proxy'] = true;
  }
  const channel = createChannel(
    params.address,
    params.secure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
    channelOptions
  );
  return {
    weaviate: clientFactory.create(WeaviateDefinition, channel),
    health: clientFactory.create(HealthDefinition, channel),
    close: () => channel.close(),
  };
};
