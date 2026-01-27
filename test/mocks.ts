import express, { Express } from 'express';
import { createServer, Server as GrpcServer } from 'nice-grpc';
import { vi } from 'vitest';
import {
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../src/proto/google/health/v1/health';
import { DeepPartial } from '../src/proto/v1/batch';
import { WeaviateDefinition, WeaviateServiceImplementation } from '../src/proto/v1/weaviate';

export const makeRestApp = (version: string, endpoints?: (app: Express) => void) => {
  const app = express();
  app.get('/v1/meta', (req, res) => res.send({ version }));
  if (endpoints) {
    endpoints(app);
  }
  return app;
};

export const makeGrpcApp = (methods?: DeepPartial<WeaviateServiceImplementation>) => {
  const weaviateMockImpl: WeaviateServiceImplementation = {
    aggregate: methods?.aggregate || vi.fn(),
    tenantsGet: methods?.tenantsGet || vi.fn(),
    search: methods?.search || vi.fn(),
    batchDelete: methods?.batchDelete || vi.fn(),
    batchObjects: methods?.batchObjects || vi.fn(),
    batchReferences: methods?.batchReferences || vi.fn(),
    batchStream: methods?.batchStream || vi.fn(),
  };
  const healthMockImpl: HealthServiceImplementation = {
    check: (request) =>
      Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
    watch: vi.fn(),
  };

  const grpcApp = createServer();
  grpcApp.add(WeaviateDefinition, weaviateMockImpl);
  grpcApp.add(HealthDefinition, healthMockImpl);

  return grpcApp;
};

export const listen = async (rest: Express, grpc: GrpcServer, httpPort: number, grpcAddress: string) => {
  const server = await rest.listen(httpPort);
  await grpc.listen(grpcAddress);
  return { rest: server, grpc, express, close: () => Promise.all([server.close(), grpc.shutdown()]) };
};
