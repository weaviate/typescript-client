import { Backend } from '../../backup/index.js';
import Connection from '../../connection/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { backup } from './client.js';
import { BackupCreateArgs, BackupReturn, BackupStatusArgs, BackupStatusReturn } from './types.js';

/** The arguments required to create and restore backups. */
export type BackupCollectionArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The collections to include in the backup. */
  waitForCompletion?: boolean;
};

/** The arguments required to create a backup of a collection. */
export type BackupCollectionCreateArgs = BackupCollectionArgs &
  Pick<BackupCreateArgs, 'incrementalBaseBackupId'>;

export const backupCollection = (
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport
) => {
  const handler = backup(connection, dbVersionSupport);
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
   * Set `incrementalBaseBackupId` for a file-based incremental backup (Weaviate `v1.37.0` or higher).
   *
   * @param {BackupCollectionCreateArgs} args The arguments for the request.
   * @returns {Promise<BackupReturn>} The response from Weaviate.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateUnsupportedFeatureError} If `incrementalBaseBackupId` is used with Weaviate <1.37.0.
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
