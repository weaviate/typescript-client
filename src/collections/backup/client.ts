import {
  Backend,
  BackupCompressionLevel,
  BackupCreateStatusGetter,
  BackupCreator,
  BackupRestoreStatusGetter,
  BackupRestorer,
  BackupStatus,
} from '../../backup/index.js';
import Connection from '../../connection/index.js';
import { WeaviateBackupFailed, WeaviateDeserializationError } from '../../errors.js';
import {
  BackupCreateResponse,
  BackupCreateStatusResponse,
  BackupRestoreResponse,
  BackupRestoreStatusResponse,
} from '../../openapi/types.js';

/** Configuration options available when creating a backup */
export type BackupConfigCreate = {
  /** The size of the chunks to use for the backup. */
  chunkSize?: number;
  /** The standard of compression to use for the backup. */
  compressionLevel?: BackupCompressionLevel;
  /** The percentage of CPU to use for the backup creation job. */
  cpuPercentage?: number;
};

/** Configuration options available when restoring a backup */
export type BackupConfigRestore = {
  /** The percentage of CPU to use for the backuop restoration job. */
  cpuPercentage?: number;
};

/** The arguments required to create and restore backups. */
export type BackupArgs<C extends BackupConfigCreate | BackupConfigRestore> = {
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
  /** The configuration options for the backup. */
  config?: C;
};

/** The arguments required to get the status of a backup. */
export type BackupStatusArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
};

export const backup = (connection: Connection) => {
  const getCreateStatus = (args: BackupStatusArgs): Promise<BackupCreateStatusResponse> => {
    return new BackupCreateStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do();
  };
  const getRestoreStatus = (args: BackupStatusArgs): Promise<BackupRestoreStatusResponse> => {
    return new BackupRestoreStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do();
  };
  return {
    create: async (args: BackupArgs<BackupConfigCreate>): Promise<BackupCreateResponse> => {
      let builder = new BackupCreator(connection, new BackupCreateStatusGetter(connection))
        .withBackupId(args.backupId)
        .withBackend(args.backend);
      if (args.includeCollections) {
        builder = builder.withIncludeClassNames(...args.includeCollections);
      }
      if (args.excludeCollections) {
        builder = builder.withExcludeClassNames(...args.excludeCollections);
      }
      if (args.config) {
        builder = builder.withConfig({
          ChunkSize: args.config.chunkSize,
          CompressionLevel: args.config.compressionLevel,
          CPUPercentage: args.config.cpuPercentage,
        });
      }
      let res: BackupCreateResponse;
      try {
        res = await builder.do();
      } catch (err) {
        throw new Error(`Backup creation failed: ${err}`);
      }
      if (res.status === 'FAILED') {
        throw new Error(`Backup creation failed: ${res.error}`);
      }
      let status: BackupCreateStatusResponse | undefined;
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const res = await getCreateStatus(args); // eslint-disable-line no-await-in-loop
          if (res.status === 'SUCCESS') {
            wait = false;
            status = res;
          }
          if (res.status === 'FAILED') {
            throw new WeaviateBackupFailed(res.error ? res.error : '<unknown>', 'creation');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return status ? { ...status, classes: res.classes } : res;
    },
    getCreateStatus: getCreateStatus,
    getRestoreStatus: getRestoreStatus,
    restore: async (args: BackupArgs<BackupConfigRestore>): Promise<BackupRestoreResponse> => {
      let builder = new BackupRestorer(connection, new BackupRestoreStatusGetter(connection))
        .withBackupId(args.backupId)
        .withBackend(args.backend);
      if (args.includeCollections) {
        builder = builder.withIncludeClassNames(...args.includeCollections);
      }
      if (args.excludeCollections) {
        builder = builder.withExcludeClassNames(...args.excludeCollections);
      }
      if (args.config) {
        builder = builder.withConfig({
          CPUPercentage: args.config.cpuPercentage,
        });
      }
      let res: BackupRestoreResponse;
      try {
        res = await builder.do();
      } catch (err) {
        throw new Error(`Backup restoration failed: ${err}`);
      }
      if (res.status === 'FAILED') {
        throw new Error(`Backup restoration failed: ${res.error}`);
      }
      let status: BackupRestoreStatusResponse | undefined;
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const res = await getRestoreStatus(args); // eslint-disable-line no-await-in-loop
          if (res.status === 'SUCCESS') {
            wait = false;
            status = res;
          }
          if (res.status === 'FAILED') {
            throw new WeaviateBackupFailed(res.error ? res.error : '<unknown>', 'restoration');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return status
        ? {
            ...status,
            classes: res.classes,
          }
        : res;
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
  create(args: BackupArgs<BackupConfigCreate>): Promise<BackupCreateResponse>;
  /**
   * Get the status of a backup creation.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupCreateStatusResponse>} The status of the backup creation.
   */
  getCreateStatus(args: BackupStatusArgs): Promise<BackupCreateStatusResponse>;
  /**
   * Get the status of a backup restore.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupRestoreStatusResponse>} The status of the backup restore.
   */
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupRestoreStatusResponse>;
  /**
   * Restore a backup of the database.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupRestoreResponse>} The response from Weaviate.
   */
  restore(args: BackupArgs<BackupConfigRestore>): Promise<BackupRestoreResponse>;
}
