import {
  Backend,
  BackupCreateStatusGetter,
  BackupCreator,
  BackupRestoreStatusGetter,
  BackupRestorer,
  BackupStatus,
} from '../../backup';
import Connection from '../../connection';
import { BackupCreateResponse, BackupRestoreStatusResponse } from '../../openapi/types';

export interface BackupArgs {
  backupId: string;
  backend: Backend;
  includeCollections?: string[];
  excludeCollections?: string[];
  waitForCompletion?: boolean;
}

export type BackupReturn = {
  collections: string[];
  status: BackupStatus;
  path: string;
};

const backup = (connection: Connection) => {
  const getCreateStatus = (backupId: string): Promise<BackupStatus> => {
    return new BackupCreateStatusGetter(connection)
      .withBackupId(backupId)
      .do()
      .then((res) => {
        if (!res.status) throw new Error('No status returned by Weaviate');
        return res.status;
      });
  };
  const getRestoreStatus = (backupId: string): Promise<BackupStatus> => {
    return new BackupRestoreStatusGetter(connection)
      .withBackupId(backupId)
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
          const status = await getCreateStatus(args.backupId); // eslint-disable-line no-await-in-loop
          if (status === 'SUCCESS') {
            wait = false;
          }
          if (status === 'FAILED') {
            throw new Error('Backup creation failed');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return res.then(() => new BackupCreateStatusGetter(connection).withBackupId(args.backupId).do());
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
          const status = await getRestoreStatus(args.backupId); // eslint-disable-line no-await-in-loop
          if (status === 'SUCCESS') {
            wait = false;
          }
          if (status === 'FAILED') {
            throw new Error('Backup creation failed');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
        }
      }
      return res.then(() => new BackupRestoreStatusGetter(connection).withBackupId(args.backupId).do());
    },
  };
};

export interface Backup {
  create(args: BackupArgs): Promise<BackupCreateResponse>;
  getCreateStatus(backupId: string): Promise<BackupStatus>;
  getRestoreStatus(backupId: string): Promise<BackupStatus>;
  restore(args: BackupArgs): Promise<BackupRestoreStatusResponse>;
}
