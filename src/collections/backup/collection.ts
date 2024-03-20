import { Backend, BackupStatus } from '../../backup/index.js';
import Connection from '../../connection/index.js';
import { BackupCreateResponse, BackupRestoreStatusResponse } from '../../openapi/types.js';
import { BackupStatusArgs, backup } from './client.js';

export interface BackupCollectionArgs {
  backupId: string;
  backend: Backend;
  waitForCompletion?: boolean;
}

export const backupCollection = (connection: Connection, name: string) => {
  const handler = backup(connection);
  return {
    create: (args: BackupCollectionArgs) =>
      handler.create({
        ...args,
        includeCollections: [name],
      }),
    getCreateStatus: handler.getCreateStatus,
    getRestoreStatus: handler.getRestoreStatus,
    restore: (args: BackupCollectionArgs) =>
      handler.restore({
        ...args,
        includeCollections: [name],
      }),
  };
};

export interface BackupCollection {
  create(args: BackupCollectionArgs): Promise<BackupCreateResponse>;
  getCreateStatus(args: BackupStatusArgs): Promise<BackupStatus>;
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupStatus>;
  restore(args: BackupCollectionArgs): Promise<BackupRestoreStatusResponse>;
}
