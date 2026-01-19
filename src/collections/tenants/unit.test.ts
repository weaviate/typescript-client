import express from 'express';
import { Server as HttpServer } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createServer, Server as GrpcServer } from 'nice-grpc';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../proto/google/health/v1/health';
import { TenantActivityStatus, TenantsGetReply, TenantsGetRequest } from '../../proto/v1/tenants';
import { WeaviateDefinition, WeaviateServiceImplementation } from '../../proto/v1/weaviate';

import weaviate, { Tenant } from '../../index';

const TENANTS_COLLECTION_NAME = 'TestCollectionTenants';

const makeRestApp = (version: string) => {
  const httpApp = express();
  httpApp.get(`/v1/schema/${TENANTS_COLLECTION_NAME}/tenants`, (req, res) =>
    res.send([
      { name: 'hot', activityStatus: 'HOT' },
      { name: 'cold', activityStatus: 'COLD' },
      { name: 'frozen', activityStatus: 'FROZEN' },
      { name: 'freezing', activityStatus: 'FREEZING' },
      { name: 'unfreezing', activityStatus: 'UNFREEZING' },
    ])
  );
  httpApp.get('/v1/meta', (req, res) => res.send({ version }));
  return httpApp;
};

const makeGrpcApp = () => {
  const weaviateMockImpl: WeaviateServiceImplementation = {
    aggregate: vi.fn(),
    tenantsGet: (request: TenantsGetRequest): Promise<TenantsGetReply> =>
      Promise.resolve({
        took: 0.1,
        tenants: [
          { name: 'hot', activityStatus: TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT },
          { name: 'cold', activityStatus: TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD },
          { name: 'frozen', activityStatus: TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN },
          { name: 'freezing', activityStatus: TenantActivityStatus.TENANT_ACTIVITY_STATUS_FREEZING },
          { name: 'unfreezing', activityStatus: TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNFREEZING },
        ],
      }),
    search: vi.fn(),
    batchDelete: vi.fn(),
    batchObjects: vi.fn(),
    batchReferences: vi.fn(),
    batchSend: vi.fn(),
    batchStream: vi.fn(),
  };
  const healthMockImpl: HealthServiceImplementation = {
    check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
      Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
    watch: vi.fn(),
  };

  const grpcApp = createServer();
  grpcApp.add(WeaviateDefinition, weaviateMockImpl);
  grpcApp.add(HealthDefinition, healthMockImpl);

  return grpcApp;
};

const makeMockServers = async (weaviateVersion: string, httpPort: number, grpcAddress: string) => {
  const rest = makeRestApp(weaviateVersion);
  const grpc = makeGrpcApp();
  const server = await rest.listen(httpPort);
  await grpc.listen(grpcAddress);
  return { rest: server, grpc };
};

describe('Mock testing of tenants.get() method with a REST server', () => {
  let servers: {
    rest: HttpServer;
    grpc: GrpcServer;
  };

  beforeAll(async () => {
    servers = await makeMockServers('1.27.0', 8954, 'localhost:8955');
  });

  it('should get mocked tenants', async () => {
    const client = await weaviate.connectToLocal({ port: 8954, grpcPort: 8955 });
    const collection = client.collections.use(TENANTS_COLLECTION_NAME);
    const tenants = await collection.tenants.get();
    expect(tenants).toEqual<Record<string, Tenant>>({
      hot: { name: 'hot', activityStatus: 'ACTIVE' },
      cold: { name: 'cold', activityStatus: 'INACTIVE' },
      frozen: { name: 'frozen', activityStatus: 'OFFLOADED' },
      freezing: { name: 'freezing', activityStatus: 'OFFLOADING' },
      unfreezing: { name: 'unfreezing', activityStatus: 'ONLOADING' },
    });
  });

  afterAll(() => Promise.all([servers.rest.close(), servers.grpc.shutdown()]));
});

describe('Mock testing of tenants.get() method with a gRPC server', () => {
  let servers: {
    rest: HttpServer;
    grpc: GrpcServer;
  };

  beforeAll(async () => {
    servers = await makeMockServers('1.27.0', 8956, 'localhost:8957');
  });

  it('should get the mocked tenants', async () => {
    const client = await weaviate.connectToLocal({ port: 8956, grpcPort: 8957 });
    const collection = client.collections.use(TENANTS_COLLECTION_NAME);
    const tenants = await collection.tenants.get();
    expect(tenants).toEqual<Record<string, Tenant>>({
      hot: { name: 'hot', activityStatus: 'ACTIVE' },
      cold: { name: 'cold', activityStatus: 'INACTIVE' },
      frozen: { name: 'frozen', activityStatus: 'OFFLOADED' },
      freezing: { name: 'freezing', activityStatus: 'OFFLOADING' },
      unfreezing: { name: 'unfreezing', activityStatus: 'ONLOADING' },
    });
  });

  afterAll(() => Promise.all([servers.rest.close(), servers.grpc.shutdown()]));
});
