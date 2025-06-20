import { Transports, TransportsParams } from '@weaviate/core';

import { createChannel, createClientFactory } from 'nice-grpc-web';

import { HealthDefinition, WeaviateDefinition } from '@weaviate/core/proto';

const clientFactory = createClientFactory();

export const transportsMaker = (params: TransportsParams): Transports => {
  const channel = createChannel(params.grpcAddress);
  return {
    weaviate: clientFactory.create(WeaviateDefinition, channel),
    health: clientFactory.create(HealthDefinition, channel),
  };
};
