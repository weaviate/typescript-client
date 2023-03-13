import BackupCreator from './backupCreator';
import BackupCreateStatusGetter from './backupCreateStatusGetter';
import BackupRestorer from './backupRestorer';
import BackupRestoreStatusGetter from './backupRestoreStatusGetter';
import Connection from '../connection';

// import BackupGetter from "./backupGetter";

export interface IWeaviateClientBackup {
  creator: () => BackupCreator;
  createStatusGetter: () => BackupCreateStatusGetter;
  restorer: () => BackupRestorer;
  restoreStatusGetter: () => BackupRestoreStatusGetter;
  // getter: () => BackupGetter
}

const backup = (client: Connection): IWeaviateClientBackup => {
  return {
    creator: () =>
      new BackupCreator(client, new BackupCreateStatusGetter(client)),
    createStatusGetter: () => new BackupCreateStatusGetter(client),
    restorer: () =>
      new BackupRestorer(client, new BackupRestoreStatusGetter(client)),
    restoreStatusGetter: () => new BackupRestoreStatusGetter(client),
    // getter: () => new BackupGetter(client),
  };
};

export default backup;
