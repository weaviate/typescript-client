import {
  Backend,
  BackupCreateStatusGetter,
  BackupCreator,
  BackupRestoreStatusGetter,
  BackupRestorer,
} from '../../backup/index.js';
import { validateBackend, validateBackupId } from '../../backup/validation.js';
import Connection from '../../connection/index.js';
import {
  WeaviateBackupCanceled,
  WeaviateBackupCancellationError,
  WeaviateBackupFailed,
  WeaviateInvalidInputError,
  WeaviateUnexpectedResponseError,
  WeaviateUnexpectedStatusCodeError,
} from '../../errors.js';
import {
  BackupCreateResponse,
  BackupCreateStatusResponse,
  BackupRestoreResponse,
} from '../../openapi/types.js';
import {
  BackupArgs,
  BackupCancelArgs,
  BackupConfigCreate,
  BackupConfigRestore,
  BackupReturn,
  BackupStatusArgs,
  BackupStatusReturn,
} from './types.js';

export const backup = (connection: Connection): Backup => {
  const parseStatus = (res: BackupCreateStatusResponse | BackupRestoreResponse): BackupStatusReturn => {
    if (res.id === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup ID is undefined in response');
    }
    if (res.path === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup path is undefined in response');
    }
    if (res.status === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup status is undefined in response');
    }
    return {
      id: res.id,
      error: res.error,
      path: res.path,
      status: res.status,
    };
  };
  const parseResponse = (res: BackupCreateResponse | BackupRestoreResponse): BackupReturn => {
    if (res.id === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup ID is undefined in response');
    }
    if (res.backend === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup backend is undefined in response');
    }
    if (res.path === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup path is undefined in response');
    }
    if (res.status === undefined) {
      throw new WeaviateUnexpectedResponseError('Backup status is undefined in response');
    }
    return {
      id: res.id,
      backend: res.backend as Backend,
      collections: res.classes ? res.classes : [],
      error: res.error,
      path: res.path,
      status: res.status,
    };
  };
  const getCreateStatus = (args: BackupStatusArgs): Promise<BackupStatusReturn> => {
    return new BackupCreateStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do()
      .then(parseStatus);
  };
  const getRestoreStatus = (args: BackupStatusArgs): Promise<BackupStatusReturn> => {
    return new BackupRestoreStatusGetter(connection)
      .withBackupId(args.backupId)
      .withBackend(args.backend)
      .do()
      .then(parseStatus);
  };
  return {
    cancel: async (args: BackupCancelArgs): Promise<boolean> => {
      let errors: string[] = [];
      errors = errors.concat(validateBackupId(args.backupId)).concat(validateBackend(args.backend));
      if (errors.length > 0) {
        throw new WeaviateInvalidInputError(errors.join(', '));
      }

      try {
        await connection.delete(`/backups/${args.backend}/${args.backupId}`, undefined, false);
      } catch (err) {
        if (err instanceof WeaviateUnexpectedStatusCodeError) {
          if (err.code === 404) {
            return false;
          }
          throw new WeaviateBackupCancellationError(err.message);
        }
      }

      return true;
    },
    create: async (args: BackupArgs<BackupConfigCreate>): Promise<BackupReturn> => {
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
        throw new WeaviateBackupFailed(`Backup creation failed: ${err}`, 'creation');
      }
      if (res.status === 'FAILED') {
        throw new WeaviateBackupFailed(`Backup creation failed: ${res.error}`, 'creation');
      }
      let status: BackupStatusReturn | undefined;
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const ret = await getCreateStatus(args); // eslint-disable-line no-await-in-loop
          if (ret.status === 'SUCCESS') {
            wait = false;
            status = ret;
          }
          if (ret.status === 'FAILED') {
            throw new WeaviateBackupFailed(ret.error ? ret.error : '<unknown>', 'creation');
          }
          if (ret.status === 'CANCELED') {
            throw new WeaviateBackupCanceled('creation');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return status ? { ...parseResponse(res), ...status } : parseResponse(res);
    },
    getCreateStatus: getCreateStatus,
    getRestoreStatus: getRestoreStatus,
    restore: async (args: BackupArgs<BackupConfigRestore>): Promise<BackupReturn> => {
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
        throw new WeaviateBackupFailed(`Backup restoration failed: ${err}`, 'restoration');
      }
      if (res.status === 'FAILED') {
        throw new WeaviateBackupFailed(`Backup restoration failed: ${res.error}`, 'restoration');
      }
      let status: BackupStatusReturn | undefined;
      if (args.waitForCompletion) {
        let wait = true;
        while (wait) {
          const ret = await getRestoreStatus(args); // eslint-disable-line no-await-in-loop
          if (ret.status === 'SUCCESS') {
            wait = false;
            status = ret;
          }
          if (ret.status === 'FAILED') {
            throw new WeaviateBackupFailed(ret.error ? ret.error : '<unknown>', 'restoration');
          }
          if (ret.status === 'CANCELED') {
            throw new WeaviateBackupCanceled('restoration');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return status
        ? {
            ...parseResponse(res),
            ...status,
          }
        : parseResponse(res);
    },
    list: (backend: Backend): Promise<BackupReturn[]> => {
      return connection.get<BackupReturn[]>(`/backups/${backend}`);
    },
  };
};

export interface Backup {
  /**
   * Cancel a backup.
   *
   * @param {BackupCancelArgs} args The arguments for the request.
   * @returns {Promise<boolean>} Whether the backup was canceled.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateBackupCancellationError} If the backup cancellation fails.
   */
  cancel(args: BackupCancelArgs): Promise<boolean>;
  /**
   * Create a backup of the database.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupReturn>} The response from Weaviate.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateBackupFailed} If the backup creation fails.
   * @throws {WeaviateBackupCanceled} If the backup creation is canceled.
   */
  create(args: BackupArgs<BackupConfigCreate>): Promise<BackupReturn>;
  /**
   * Get the status of a backup creation.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatusReturn>} The status of the backup creation.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   */
  getCreateStatus(args: BackupStatusArgs): Promise<BackupStatusReturn>;
  /**
   * Get the status of a backup restore.
   *
   * @param {BackupStatusArgs} args The arguments for the request.
   * @returns {Promise<BackupStatusReturn>} The status of the backup restore.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   */
  getRestoreStatus(args: BackupStatusArgs): Promise<BackupStatusReturn>;
  /**
   * Restore a backup of the database.
   *
   * @param {BackupArgs} args The arguments for the request.
   * @returns {Promise<BackupReturn>} The response from Weaviate.
   * @throws {WeaviateInvalidInputError} If the input is invalid.
   * @throws {WeaviateBackupFailed} If the backup restoration fails.
   * @throws {WeaviateBackupCanceled} If the backup restoration is canceled.
   */
  restore(args: BackupArgs<BackupConfigRestore>): Promise<BackupReturn>;

  /** List existing backups (completed and in-progress) created in a given backend.
   *
   * @param {Backend} backend Backend whence to list backups.
   * @returns {Promise<BackupReturn[]>} The response from Weaviate.
   * */
  list(backend: Backend): Promise<BackupReturn[]>;
}
