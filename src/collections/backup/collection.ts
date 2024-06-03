import { Backend } from '../../backup/index.js';
import Connection from '../../connection/index.js';
import {
  BackupCreateResponse,
  BackupCreateStatusResponse,
  BackupRestoreResponse,
  BackupRestoreStatusResponse,
} from '../../openapi/types.js';
import { BackupStatusArgs, backup } from './client.js';

/** The arguments required to create and restore backups. */
export type BackupCollectionArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The collections to include in the backup. */
  waitForCompletion?: boolean;
};

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
  /**
   * Create a backup of this collection.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupCreateResponse>} The response from Weaviate.
   */
  create(args: BackupCollectionArgs): Promise<BackupCreateResponse>;
  /**
   * Get the status of a backup.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupCreateStatusResponse>} The status of the backup.
   */
  getCreateStatus(args: BackupStatusArgs): Promise<BackupCreateStatusResponse>;
  /**
   * Get the status of a restore.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupRestoreStatusResponse>} The status of the restore.
   */
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupRestoreStatusResponse>;
  /**
   * Restore a backup of this collection.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupRestoreResponse>} The response from Weaviate.
   */
  restore(args: BackupCollectionArgs): Promise<BackupRestoreResponse>;
}
