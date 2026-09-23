import { createChannel, createClientFactory } from 'nice-grpc-web';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { Transports, TransportsParams } from '@weaviate/core';
import { HealthDefinition, WeaviateDefinition } from '@weaviate/core/proto';

const clientFactory = createClientFactory().use(retryMiddleware);

export const transportsMaker = (params: TransportsParams): Transports => {
  const channel = createChannel(params.grpcAddress);
  return {
    weaviate: clientFactory.create(WeaviateDefinition, channel),
    health: clientFactory.create(HealthDefinition, channel),
    close: () => {},
  };
};
