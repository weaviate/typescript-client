import {
  Backend,
  BackupCreateStatusGetter,
  BackupCreator,
  BackupRestoreStatusGetter,
  BackupRestorer,
  BackupStatus,
} from '../../backup/index.js';
import Connection from '../../connection/index.js';
import { BackupCreateResponse, BackupRestoreStatusResponse } from '../../openapi/types.js';

/** The arguments required to create and restore backups. */
export interface BackupArgs {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The collections to include in the backup. */
  includeCollections?: string[];
  /** The collections to exclude from the backup. */
  excludeCollections?: string[];
  /** Whether to wait for the backup to complete. */
  waitForCompletion?: boolean;
}

/** The arguments required to get the status of a backup. */
export interface BackupStatusArgs {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
}

/** The response from a backup creation request. */
export type BackupReturn = {
  collections: string[];
  status: BackupStatus;
  path: string;
};

export const backup = (connection: Connection) => {
  const getCreateStatus = (args: BackupStatusArgs): Promise<BackupStatus> => {
    return new BackupCreateStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do()
      .then((res) => {
        if (!res.status) throw new Error('No status returned by Weaviate');
        return res.status;
      });
  };
  const getRestoreStatus = (args: BackupStatusArgs): Promise<BackupStatus> => {
    return new BackupRestoreStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do()
      .then((res) => {
        if (!res.status) throw new Error('No status returned by Weaviate');
        return res.status;
      });
  };
  return {
    create: async (args: BackupArgs): Promise<BackupCreateResponse> => {
      let builder = new BackupCreator(connection, new BackupCreateStatusGetter(connection))
        .withBackupId(args.backupId)
        .withBackend(args.backend);
      if (args.includeCollections) {
        builder = builder.withIncludeClassNames(...args.includeCollections);
      }
      if (args.excludeCollections) {
        builder = builder.withExcludeClassNames(...args.excludeCollections);
      }
      const res = builder.do();
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const status = await getCreateStatus(args); // eslint-disable-line no-await-in-loop
          if (status === 'SUCCESS') {
            wait = false;
          }
          if (status === 'FAILED') {
            throw new Error('Backup creation failed');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return res.then(() =>
        new BackupCreateStatusGetter(connection).withBackupId(args.backupId).withBackend(args.backend).do()
      );
    },
    getCreateStatus: getCreateStatus,
    getRestoreStatus: getRestoreStatus,
    restore: async (args: BackupArgs): Promise<BackupRestoreStatusResponse> => {
      let builder = new BackupRestorer(connection, new BackupRestoreStatusGetter(connection))
        .withBackupId(args.backupId)
        .withBackend(args.backend);
      if (args.includeCollections) {
        builder = builder.withIncludeClassNames(...args.includeCollections);
      }
      if (args.excludeCollections) {
        builder = builder.withExcludeClassNames(...args.excludeCollections);
      }
      const res = builder.do();
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const status = await getRestoreStatus(args); // eslint-disable-line no-await-in-loop
          if (status === 'SUCCESS') {
            wait = false;
          }
          if (status === 'FAILED') {
            throw new Error('Backup creation failed');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return res.then(() =>
        new BackupRestoreStatusGetter(connection).withBackupId(args.backupId).withBackend(args.backend).do()
      );
    },
  };
};

export interface Backup {
  /**
   * Create a backup of the database.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupCreateResponse>} The response from Weaviate.
   */
  create(args: BackupArgs): Promise<BackupCreateResponse>;
  /**
   * Get the status of a backup creation.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatus>} The status of the backup creation.
   */
  getCreateStatus(args: BackupStatusArgs): Promise<BackupStatus>;
  /**
   * Get the status of a backup restore.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatus>} The status of the backup restore.
   */
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupStatus>;
  /**
   * Restore a backup of the database.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupRestoreStatusResponse>} The response from Weaviate.
   */
  restore(args: BackupArgs): Promise<BackupRestoreStatusResponse>;
}
