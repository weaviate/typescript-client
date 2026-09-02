import express, { Response } from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BackupStatus } from '../../../src/collections/backup/types.js';
import { WeaviateBackupCanceled } from '../../../src/errors.js';
import weaviate, { WeaviateClient } from '../../../src/index.js';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../../src/proto/google/health/v1/health.js';
import {
  BackupCreateResponse,
  BackupCreateStatusResponse,
  BackupRestoreResponse,
} from '../../../src/v2/index.js';

const BACKUP_ID = 'test-backup-123';
const BACKEND = 'filesystem';

class CancelMock {
  private grpc: GrpcServer;
  private http: HttpServer;
  static status: BackupStatus;

  constructor(grpc: GrpcServer, http: HttpServer) {
    this.grpc = grpc;
    this.http = http;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const httpApp = express();
    // Meta endpoint required for client instantiation
    httpApp.get('/v1/meta', (req, res) => res.send({ version }));

    // Backup cancellation endpoint
    httpApp.delete(`/v1/backups/${BACKEND}/${BACKUP_ID}`, (req, res) => {
      CancelMock.status = 'CANCELED';
      res.send();
    });
    // Restore cancellation endpoint
    httpApp.delete(`/v1/backups/${BACKEND}/${BACKUP_ID}/restore`, (req, res) => {
      CancelMock.status = 'CANCELED';
      res.send();
    });

    // Backup creation endpoint
    httpApp.post(`/v1/backups/${BACKEND}`, (req, res: Response<BackupCreateResponse, any>) => {
      CancelMock.status = 'STARTED';
      res.send({
        id: BACKUP_ID,
        backend: BACKEND,
        path: 'path/to/backup',
        status: CancelMock.status,
      });
    });
    // Backup creation status endpoint
    httpApp.get(
      `/v1/backups/${BACKEND}/${BACKUP_ID}`,
      (req, res: Response<BackupCreateStatusResponse, any>) =>
        res.send({
          id: BACKUP_ID,
          backend: BACKEND,
          path: 'path/to/backup',
          status: CancelMock.status,
        })
    );

    // Backup restoration endpoint
    httpApp.post(
      `/v1/backups/${BACKEND}/${BACKUP_ID}/restore`,
      (req, res: Response<BackupRestoreResponse, any>) => {
        CancelMock.status = 'STARTED';
        res.send({
          id: BACKUP_ID,
          backend: BACKEND,
          path: 'path/to/backup',
          status: CancelMock.status,
        });
      }
    );
    // Backup restoration status endpoint
    httpApp.get(
      `/v1/backups/${BACKEND}/${BACKUP_ID}/restore`,
      (req, res: Response<BackupRestoreResponse, any>) =>
        res.send({
          id: BACKUP_ID,
          backend: BACKEND,
          path: 'path/to/backup',
          status: CancelMock.status,
        })
    );

    // gRPC health check required for client instantiation
    const healthMockImpl: HealthServiceImplementation = {
      check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
        Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
      watch: vi.fn(),
    };

    const grpc = createServer();
    grpc.add(HealthDefinition, healthMockImpl);

    httpApp.on('error', (error) => console.error('HTTP Server Error:', error));

    await grpc.listen(`localhost:${grpcPort}`);
    const http = await httpApp.listen(httpPort);
    return new CancelMock(grpc, http);
  };

  public close = () => Promise.all([this.http.close(), this.grpc.shutdown()]);
}

describe('Mock testing of backup cancellation', () => {
  let client: WeaviateClient;
  let mock: CancelMock;

  beforeAll(async () => {
    mock = await CancelMock.use('1.27.0', 8912, 8913);
    client = await weaviate.connectToLocal({ port: 8912, grpcPort: 8913 });
  });

  it('should throw while waiting for creation if backup is cancelled in the meantime', async () => {
    const promise = client.backup
      .create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        waitForCompletion: true,
      })
      .catch((err) => expect(err).toBeInstanceOf(WeaviateBackupCanceled));
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for backup creation to start before cancelling
    const deleted = await client.backup.cancel({ backupId: BACKUP_ID, backend: BACKEND });
    expect(deleted).toBe(true);
    return promise;
  });

  it('should return true if creation cancellation was successful', async () => {
    const success = await client.backup.cancel({
      backupId: BACKUP_ID,
      backend: BACKEND,
      operation: 'create',
    });
    expect(success).toBe(true);
  });

  it('should return false if creation backup does not exist', async () => {
    const success = await client.backup.cancel({ backupId: `${BACKUP_ID}-unknown`, backend: BACKEND });
    expect(success).toBe(false);
  });

  it('should start a restore process without waiting', async () => {
    const response = await client.backup.restore({
      backupId: BACKUP_ID,
      backend: BACKEND,
      waitForCompletion: false,
    });
    expect(response).toEqual({
      id: BACKUP_ID,
      backend: BACKEND,
      path: 'path/to/backup',
      status: 'STARTED',
      collections: [],
    });
  });

  it('should return true if restore cancellation was successful', async () => {
    const success = await client.backup.cancel({
      backupId: BACKUP_ID,
      backend: BACKEND,
      operation: 'restore',
    });
    expect(success).toBe(true);
  });

  it('should return false if restore backup does not exist', async () => {
    const success = await client.backup.cancel({
      backupId: `${BACKUP_ID}-unknown`,
      backend: BACKEND,
      operation: 'restore',
    });
    expect(success).toBe(false);
  });

  afterAll(() => mock.close());
});

const BASE_BACKUP_ID = 'test-base-backup-456';

class IncrementalMock {
  private grpc: GrpcServer;
  private http: HttpServer;
  /** Body of the most recent backup creation request. */
  static createRequest: Record<string, any>;

  constructor(grpc: GrpcServer, http: HttpServer) {
    this.grpc = grpc;
    this.http = http;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const httpApp = express();
    httpApp.use(express.json());
    httpApp.get('/v1/meta', (req, res) => res.send({ version }));

    httpApp.post(`/v1/backups/${BACKEND}`, (req, res: Response<BackupCreateResponse, any>) => {
      IncrementalMock.createRequest = req.body;
      res.send({
        id: BACKUP_ID,
        backend: BACKEND,
        path: 'path/to/backup',
        status: 'STARTED',
      });
    });

    // Weaviate only returns incremental_base_backup_id to root users.
    httpApp.get(`/v1/backups/${BACKEND}/${BACKUP_ID}`, (req, res) =>
      res.send({
        id: BACKUP_ID,
        backend: BACKEND,
        path: 'path/to/backup',
        status: 'SUCCESS',
        incremental_base_backup_id: BASE_BACKUP_ID,
      })
    );

    httpApp.get(`/v1/backups/${BACKEND}`, (req, res) =>
      res.send([
        {
          id: BASE_BACKUP_ID,
          backend: BACKEND,
          path: 'path/to/base',
          status: 'SUCCESS',
        },
        {
          id: BACKUP_ID,
          backend: BACKEND,
          path: 'path/to/backup',
          status: 'SUCCESS',
          incremental_base_backup_id: BASE_BACKUP_ID,
        },
      ])
    );

    const healthMockImpl: HealthServiceImplementation = {
      check: (request: HealthCheckRequest): Promise<HealthCheckResponse> =>
        Promise.resolve(HealthCheckResponse.create({ status: HealthCheckResponse_ServingStatus.SERVING })),
      watch: vi.fn(),
    };

    const grpc = createServer();
    grpc.add(HealthDefinition, healthMockImpl);

    httpApp.on('error', (error) => console.error('HTTP Server Error:', error));

    await grpc.listen(`localhost:${grpcPort}`);
    const http = await httpApp.listen(httpPort);
    return new IncrementalMock(grpc, http);
  };

  public close = () => Promise.all([this.http.close(), this.grpc.shutdown()]);
}

describe('Mock testing of incremental backups', () => {
  let client: WeaviateClient;
  let mock: IncrementalMock;

  beforeAll(async () => {
    mock = await IncrementalMock.use('1.36.3', 8914, 8915);
    client = await weaviate.connectToLocal({ port: 8914, grpcPort: 8915 });
  });

  it('should send the base backup ID when creating an incremental backup', async () => {
    await client.backup.create({
      backupId: BACKUP_ID,
      backend: BACKEND,
      baseBackupId: BASE_BACKUP_ID,
    });
    expect(IncrementalMock.createRequest.incremental_base_backup_id).toBe(BASE_BACKUP_ID);
  });

  it('should not send a base backup ID for a full backup', async () => {
    await client.backup.create({
      backupId: BACKUP_ID,
      backend: BACKEND,
    });
    expect(IncrementalMock.createRequest.incremental_base_backup_id).toBeUndefined();
  });

  it('should return the base backup ID from the creation status', async () => {
    const status = await client.backup.getCreateStatus({ backupId: BACKUP_ID, backend: BACKEND });
    expect(status.baseBackupId).toBe(BASE_BACKUP_ID);
  });

  it('should return the base backup ID when listing backups', async () => {
    const backups = await client.backup.list(BACKEND);
    expect(backups.find((b) => b.id === BASE_BACKUP_ID)?.baseBackupId).toBeUndefined();
    expect(backups.find((b) => b.id === BACKUP_ID)?.baseBackupId).toBe(BASE_BACKUP_ID);
    expect(backups.every((b) => !('incremental_base_backup_id' in b))).toBe(true);
  });

  afterAll(() => mock.close());
});
