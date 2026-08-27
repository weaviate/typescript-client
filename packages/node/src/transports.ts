import { ChannelCredentials, ChannelOptions, createChannel, createClientFactory } from 'nice-grpc';

import { HealthDefinition, WeaviateDefinition } from '@weaviate/core/proto';

import { Transports, TransportsParams } from '@weaviate/core';

const clientFactory = createClientFactory();

export const transportsMaker = (params: TransportsParams): Transports => {
  const channel = createChannel(
    params.grpcAddress,
    params.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
    {
      'grpc.max_receive_message_length': params.grpcMaxMessageLength,
    } as ChannelOptions
  );
  return {
    weaviate: clientFactory.create(WeaviateDefinition, channel),
    health: clientFactory.create(HealthDefinition, channel),
  };
};
