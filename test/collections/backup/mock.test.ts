import express, { Response } from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BackupStatus } from '../../../src/collections/backup/types.js';
import {
  WeaviateBackupCanceled,
  WeaviateInvalidInputError,
  WeaviateUnsupportedFeatureError,
} from '../../../src/errors.js';
import weaviate, { WeaviateClient, weaviateV2 } from '../../../src/index.js';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../../src/proto/google/health/v1/health.js';
import {
  BackupCreateRequest,
  BackupCreateResponse,
  BackupCreateStatusResponse,
  BackupListResponse,
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

const BASE_BACKUP_ID = 'test-backup-base';

/** Mocks the backup endpoints, recording the payload sent by the client on creation. */
class IncrementalMock {
  private grpc: GrpcServer;
  private http: HttpServer;
  static lastCreateRequest: BackupCreateRequest;

  constructor(grpc: GrpcServer, http: HttpServer) {
    this.grpc = grpc;
    this.http = http;
  }

  public static use = async (version: string, httpPort: number, grpcPort: number) => {
    const httpApp = express();
    httpApp.use(express.json());
    httpApp.get('/v1/meta', (req, res) => res.send({ version }));

    httpApp.post(`/v1/backups/${BACKEND}`, (req, res: Response<BackupCreateResponse, any>) => {
      IncrementalMock.lastCreateRequest = req.body;
      res.send({
        id: req.body.id,
        backend: BACKEND,
        classes: ['Article'],
        path: 'path/to/backup',
        status: 'STARTED',
      });
    });
    httpApp.get(`/v1/backups/${BACKEND}/:id`, (req, res: Response<BackupCreateStatusResponse, any>) =>
      res.send({
        id: req.params.id,
        backend: BACKEND,
        path: 'path/to/backup',
        status: 'SUCCESS',
        size: 1.5,
        incremental_base_backup_id: IncrementalMock.lastCreateRequest?.incremental_base_backup_id,
      })
    );
    httpApp.get(`/v1/backups/${BACKEND}`, (req, res: Response<BackupListResponse, any>) =>
      res.send([
        { id: BASE_BACKUP_ID, classes: ['Article'], status: 'SUCCESS', incremental_base_backup_id: '' },
        {
          id: BACKUP_ID,
          classes: ['Article'],
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
  describe('with a supported Weaviate version', () => {
    let client: WeaviateClient;
    let mock: IncrementalMock;

    beforeAll(async () => {
      mock = await IncrementalMock.use('1.37.0', 8914, 8915);
      client = await weaviate.connectToLocal({ port: 8914, grpcPort: 8915 });
    });

    it('should send the base backup ID when creating an incremental backup', async () => {
      const res = await client.backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: BASE_BACKUP_ID,
        waitForCompletion: true,
      });
      expect(IncrementalMock.lastCreateRequest.incremental_base_backup_id).toBe(BASE_BACKUP_ID);
      expect(res.status).toBe('SUCCESS');
      expect(res.incrementalBaseBackupId).toBe(BASE_BACKUP_ID);
    });

    it('should lowercase the base backup ID', async () => {
      await client.backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: 'Test-Backup-BASE',
        waitForCompletion: true,
      });
      expect(IncrementalMock.lastCreateRequest.incremental_base_backup_id).toBe(BASE_BACKUP_ID);
    });

    it('should not send the field for a regular backup', async () => {
      await client.backup.create({ backupId: BACKUP_ID, backend: BACKEND });
      expect(IncrementalMock.lastCreateRequest.incremental_base_backup_id).toBeUndefined();
    });

    it('should throw if the base backup is the backup being created', async () => {
      const promise = client.backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: BACKUP_ID,
      });
      await expect(promise).rejects.toThrow(WeaviateInvalidInputError);
    });

    it('should throw if the base backup only differs from the backup being created in case', async () => {
      // Weaviate lowercases backup IDs, so these name the same backup.
      const promise = client.backup.create({
        backupId: BACKUP_ID.toUpperCase(),
        backend: BACKEND,
        incrementalBaseBackupId: BACKUP_ID,
      });
      await expect(promise).rejects.toThrow(WeaviateInvalidInputError);
    });

    it('should send the base backup ID when creating a collection-scoped backup', async () => {
      await client.collections.use('Article').backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: BASE_BACKUP_ID,
        waitForCompletion: true,
      });
      expect(IncrementalMock.lastCreateRequest.incremental_base_backup_id).toBe(BASE_BACKUP_ID);
      expect(IncrementalMock.lastCreateRequest.include).toEqual(['Article']);
    });

    it('should surface the base backup ID when listing backups', async () => {
      const backups = await client.backup.list(BACKEND);
      expect(backups[0].incrementalBaseBackupId).toBeUndefined();
      expect(backups[1].incrementalBaseBackupId).toBe(BASE_BACKUP_ID);
    });

    it('should surface the base backup ID when getting the creation status', async () => {
      await client.backup.create({ backupId: BACKUP_ID, backend: BACKEND }); // resets the recorded payload
      const regular = await client.backup.getCreateStatus({ backupId: BACKUP_ID, backend: BACKEND });
      expect(regular.incrementalBaseBackupId).toBeUndefined();

      await client.backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: BASE_BACKUP_ID,
      });
      const incremental = await client.backup.getCreateStatus({ backupId: BACKUP_ID, backend: BACKEND });
      expect(incremental.incrementalBaseBackupId).toBe(BASE_BACKUP_ID);
    });

    it('should surface the backup size reported by Weaviate', async () => {
      const status = await client.backup.getCreateStatus({ backupId: BACKUP_ID, backend: BACKEND });
      expect(status.size).toBe(1.5);
    });

    afterAll(() => mock.close());
  });

  describe('with the v2 builder', () => {
    let mock: IncrementalMock;
    const clientV2 = weaviateV2.client({ scheme: 'http', host: 'localhost:8918' });

    beforeAll(async () => {
      mock = await IncrementalMock.use('1.37.0', 8918, 8919);
    });

    it('should lowercase the base backup ID', async () => {
      await clientV2.backup
        .creator()
        .withBackupId(BACKUP_ID)
        .withBackend(BACKEND)
        .withIncrementalBaseBackupId('Test-Backup-BASE')
        .do();
      expect(IncrementalMock.lastCreateRequest.incremental_base_backup_id).toBe(BASE_BACKUP_ID);
    });

    it('should throw if the base backup only differs from the backup being created in case', async () => {
      const promise = clientV2.backup
        .creator()
        .withBackupId(BACKUP_ID.toUpperCase())
        .withBackend(BACKEND)
        .withIncrementalBaseBackupId(BACKUP_ID)
        .do();
      await expect(promise).rejects.toThrow(WeaviateInvalidInputError);
    });

    afterAll(() => mock.close());
  });

  describe('with an unsupported Weaviate version', () => {
    let client: WeaviateClient;
    let mock: IncrementalMock;

    beforeAll(async () => {
      mock = await IncrementalMock.use('1.36.0', 8916, 8917);
      client = await weaviate.connectToLocal({ port: 8916, grpcPort: 8917 });
    });

    it('should throw when requesting an incremental backup', async () => {
      const promise = client.backup.create({
        backupId: BACKUP_ID,
        backend: BACKEND,
        incrementalBaseBackupId: BASE_BACKUP_ID,
      });
      await expect(promise).rejects.toThrow(WeaviateUnsupportedFeatureError);
    });

    it('should still allow regular backups', async () => {
      const res = await client.backup.create({ backupId: BACKUP_ID, backend: BACKEND });
      expect(res.status).toBe('STARTED');
    });

    it('should throw from the v2 builder too', async () => {
      const promise = weaviateV2
        .client({ scheme: 'http', host: 'localhost:8916' })
        .backup.creator()
        .withBackupId(BACKUP_ID)
        .withBackend(BACKEND)
        .withIncrementalBaseBackupId(BASE_BACKUP_ID)
        .do();
      await expect(promise).rejects.toThrow(WeaviateUnsupportedFeatureError);
    });

    afterAll(() => mock.close());
  });
});
