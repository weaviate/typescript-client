import express, { Response } from 'express';
import { Server as HttpServer } from 'http';
import { Server as GrpcServer, createServer } from 'nice-grpc';
import { WeaviateBackupCanceled } from '../../errors';
import weaviate, { WeaviateClient } from '../../index.js';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthDefinition,
  HealthServiceImplementation,
} from '../../proto/google/health/v1/health';
import { BackupCreateResponse, BackupCreateStatusResponse, BackupRestoreResponse } from '../../v2';
import { BackupStatus } from './types';

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
      watch: jest.fn(),
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
    mock = await CancelMock.use('1.27.0', 8958, 8959);
    client = await weaviate.connectToLocal({ port: 8958, grpcPort: 8959 });
  });

  it('should throw while waiting for creation if backup is cancelled in the meantime', async () => {
    const promise = client.backup.create({
      backupId: BACKUP_ID,
      backend: BACKEND,
      waitForCompletion: true,
    });
    await client.backup.cancel({ backupId: BACKUP_ID, backend: BACKEND });
    try {
      await promise;
    } catch (err) {
      expect(err).toBeInstanceOf(WeaviateBackupCanceled);
    }
  });

  it('should return true if creation cancellation was successful', async () => {
    const success = await client.backup.cancel({ backupId: BACKUP_ID, backend: BACKEND });
    expect(success).toBe(true);
  });

  it('should return false if creation backup does not exist', async () => {
    const success = await client.backup.cancel({ backupId: `${BACKUP_ID}4`, backend: BACKEND });
    expect(success).toBe(false);
  });

  afterAll(() => mock.close());
});
