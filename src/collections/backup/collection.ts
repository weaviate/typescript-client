import { Backend } from '../../backup/index.js';
import Connection from '../../connection/index.js';
import { backup } from './client.js';
import { BackupReturn, BackupStatusArgs, BackupStatusReturn } from './types.js';

/** The arguments required to create and restore backups. */
export type BackupCollectionArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The collections to include in the backup. */
  waitForCompletion?: boolean;
};

/** The arguments required to create a backup of a single collection. */
export type BackupCollectionCreateArgs = BackupCollectionArgs & {
  /**
   * The ID of an existing backup to use as the base for a file-based incremental backup.
   * If set, only files that have changed since the base backup are included in the new backup.
   *
   * Requires Weaviate `1.34.18`/`1.35.13`/`1.36.3` or higher.
   */
  baseBackupId?: string;
};

export const backupCollection = (connection: Connection, name: string) => {
  const handler = backup(connection);
  return {
    create: (args: BackupCollectionCreateArgs) =>
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
   * Pass `baseBackupId` to create an incremental backup on top of an existing one;
   * only files that changed since the base backup are written.
   *
   * @param {BackupCollectionCreateArgs} args The arguments for the request.
   * @returns {Promise<BackupReturn>} The response from Weaviate.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateBackupFailed} If the backup creation fails.
   * @throws {WeaviateBackupCanceled} If the backup creation is canceled.
   */
  create(args: BackupCollectionCreateArgs): Promise<BackupReturn>;
  /**
   * Get the status of a backup.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatusReturn>} The status of the backup.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   */
  getCreateStatus(args: BackupStatusArgs): Promise<BackupStatusReturn>;
  /**
   * Get the status of a restore.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatusReturn>} The status of the restore.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   */
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupStatusReturn>;
  /**
   * Restore a backup of this collection.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupReturn>} The response from Weaviate.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateBackupFailed} If the backup restoration fails.
   * @throws {WeaviateBackupCanceled} If the backup restoration is canceled.
   */
  restore(args: BackupCollectionArgs): Promise<BackupReturn>;
}
