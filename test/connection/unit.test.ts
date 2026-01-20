import express from 'express';
import { Server as HttpServer } from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
} from '../../src/connection/auth.js';
import Connection from '../../src/connection/index.js';
import { testServer } from '../../test/server.js';

import { createServer, Server as GrpcServer } from 'nice-grpc';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../src/proto/google/health/v1/health';
import { TenantsGetReply } from '../../src/proto/v1/tenants';
import { WeaviateDefinition, WeaviateServiceImplementation } from '../../src/proto/v1/weaviate';

import { WeaviateRequestTimeoutError } from '../../src/errors.js';
import weaviate, { Collection, WeaviateClient } from '../../src/index.js';
import { AggregateReply } from '../../src/proto/v1/aggregate.js';
import { BatchObjectsReply } from '../../src/proto/v1/batch.js';
import { BatchDeleteReply } from '../../src/proto/v1/batch_delete.js';
import { SearchReply } from '../../src/proto/v1/search_get.js';

describe('mock server auth tests', () => {
  const server = testServer();
  describe('OIDC auth flows', () => {
    it('should login with client_credentials grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthClientCredentials({
          clientSecret: 'supersecret',
          scopes: ['some_scope'],
          silentRefresh: false,
        }),
      });

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        client_id: 'client123',
        client_secret: 'supersecret',
        grant_type: 'client_credentials',
        scope: 'some_scope',
      });
    });

    it('should login with password grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthUserPasswordCredentials({
          username: 'user123',
          password: 'secure_password',
          scopes: ['custom_scope'],
        }),
      });

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
          conn.oidcAuth?.stopTokenRefresh();
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        username: 'user123',
        password: 'secure_password',
        grant_type: 'password',
        client_id: 'client123',
        scope: 'custom_scope offline_access',
      });
    });

    it('should login with refresh_token grant', async () => {
      const conn = new Connection({
        scheme: 'http',
        host: 'localhost:' + server.port,
        authClientSecret: new AuthAccessTokenCredentials({
          accessToken: 'old-access-token',
          expiresIn: 1,
          refreshToken: 'old-refresh-token',
        }),
      });

      // force the use of refreshToken
      (conn as any).oidcAuth?.resetExpiresAt();

      await conn
        .login()
        .then((token) => {
          expect(token).toEqual('access_token_000');
          expect((conn as any).oidcAuth?.refreshToken).toEqual('refresh_token_000');
          expect((conn as any).oidcAuth?.expiresAt).toBeGreaterThan(Date.now());
          conn.oidcAuth?.stopTokenRefresh();
        })
        .catch((e) => {
          throw new Error('it should not have failed: ' + e);
        });

      const request = server.lastRequest();

      expect(request.body).toEqual({
        client_id: 'client123',
        grant_type: 'refresh_token',
        refresh_token: 'old-refresh-token',
      });
    });
  });

  it('should login with API key', async () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });

    await conn.login().then((key) => expect(key).toEqual(apiKey));
  });

  it('should construct the correct url when host contains scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'http://localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should construct the correct url when scheme specified and host does not contain scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      scheme: 'http',
      host: 'localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should construct the correct url when no scheme is specified but host contains scheme', () => {
    const apiKey = 'abcd123';

    const conn = new Connection({
      host: 'http://localhost:' + server.port,
      apiKey: new ApiKey(apiKey),
    });
    const expectedPath = 'http://localhost:' + server.port;

    expect(conn.host).toEqual(expectedPath);
  });

  it('should throw error when host contains different scheme than specified', () => {
    const apiKey = 'abcd123';

    const createConnection = () => {
      return new Connection({
        scheme: 'https',
        host: 'http://localhost:' + server.port,
        apiKey: new ApiKey(apiKey),
      });
    };

    expect(createConnection).toThrow(
      'The host contains a different protocol than specified in the scheme (scheme: https != host: http)'
    );
  });

  it('should throw error when scheme not specified and included in host', () => {
    const apiKey = 'abcd123';

    const createConnection = () => {
      return new Connection({
        host: 'localhost:' + server.port,
        apiKey: new ApiKey(apiKey),
      });
    };

    expect(createConnection).toThrow(
      'The host must start with a recognized protocol (e.g., http or https) if no scheme is provided.'
    );
  });

  it('shuts down the server', () => {
    return server.close();
  });
});

const COLLECTION_NAME = 'TestCollectionTimeouts';

const makeRestApp = (version: string) => {
  const httpApp = express();
  httpApp.get(`/v1/schema/${COLLECTION_NAME}`, (req, res) =>
    new Promise((r) => setTimeout(r, 2000)).then(() => res.send({ class: COLLECTION_NAME }))
  );
  httpApp.get('/v1/meta', (req, res) => res.send({ version }));
  return httpApp;
};

const makeGrpcApp = () => {
  const weaviateMockImpl: WeaviateServiceImplementation = {
    aggregate: (): Promise<AggregateReply> =>
      new Promise((r) => {
        setTimeout(r, 2000);
      }).then(() => {
        return {
          took: 5000,
        };
      }),
    tenantsGet: (): Promise<TenantsGetReply> =>
      new Promise((r) => {
        setTimeout(r, 2000);
      }).then(() => {
        return {
          took: 5000,
          tenants: [],
        };
      }),
    search: (): Promise<SearchReply> =>
      new Promise((r) => {
        setTimeout(r, 2000);
      }).then(() => {
        return {
          results: [],
          took: 5000,
          groupByResults: [],
        };
      }),
    batchDelete: (): Promise<BatchDeleteReply> =>
      new Promise((r) => {
        setTimeout(r, 2000);
      }).then(() => {
        return {
          took: 5000,
          status: 'SUCCESS',
          failed: 0,
          matches: 0,
          successful: 0,
          objects: [],
        };
      }),
    batchObjects: (): Promise<BatchObjectsReply> =>
      new Promise((r) => {
        setTimeout(r, 2000);
      }).then(() => {
        return {
          took: 5000,
          errors: [],
        };
      }),
    batchReferences: vi.fn(),
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
  return { rest: server, grpc, express };
};

describe('Mock testing of timeout behaviour', () => {
  let servers: {
    rest: HttpServer;
    grpc: GrpcServer;
  };
  let client: WeaviateClient;
  let collection: Collection;

  beforeAll(async () => {
    servers = await makeMockServers('1.29.0', 8954, 'localhost:8955');
    client = await weaviate.connectToLocal({ port: 8954, grpcPort: 8955, timeout: { query: 1, insert: 1 } });
    collection = client.collections.use(COLLECTION_NAME);
  });

  it('should timeout when calling REST GET v1/schema', () =>
    expect(collection.config.get()).rejects.toThrow(WeaviateRequestTimeoutError));

  it('should timeout when calling gRPC TenantsGet', () =>
    expect(collection.tenants.get()).rejects.toThrow(WeaviateRequestTimeoutError));

  it('should timeout when calling gRPC Search', () =>
    expect(collection.query.fetchObjects()).rejects.toThrow(WeaviateRequestTimeoutError));

  it('should timeout when calling gRPC BatchObjects', () =>
    expect(collection.data.insertMany([{ thing: 'what' }])).rejects.toThrow(WeaviateRequestTimeoutError));

  it('should timeout when calling gRPC BatchDelete', () =>
    expect(collection.data.deleteMany(collection.filter.byId().equal('123' as any))).rejects.toThrow(
      WeaviateRequestTimeoutError
    ));
  it('should timeout when calling gRPC Aggregate', () =>
    expect(collection.aggregate.overAll()).rejects.toThrow(WeaviateRequestTimeoutError));

  afterAll(() => Promise.all([servers.rest.close(), servers.grpc.shutdown()]));
});
