import Connection from '../connection';
import BackupCreateStatusGetter from './backupCreateStatusGetter';
import BackupCreator from './backupCreator';
import BackupRestoreStatusGetter from './backupRestoreStatusGetter';
import BackupRestorer from './backupRestorer';

export type Backend = 'filesystem' | 's3' | 'gcs' | 'azure';
export type BackupStatus = 'STARTED' | 'TRANSFERRING' | 'TRANSFERRED' | 'SUCCESS' | 'FAILED';

export interface Backup {
  creator: () => BackupCreator;
  createStatusGetter: () => BackupCreateStatusGetter;
  restorer: () => BackupRestorer;
  restoreStatusGetter: () => BackupRestoreStatusGetter;
}

const backup = (client: Connection): Backup => {
  return {
    creator: () => new BackupCreator(client, new BackupCreateStatusGetter(client)),
    createStatusGetter: () => new BackupCreateStatusGetter(client),
    restorer: () => new BackupRestorer(client, new BackupRestoreStatusGetter(client)),
    restoreStatusGetter: () => new BackupRestoreStatusGetter(client),
  };
};

export default backup;
export { default as BackupCreateStatusGetter } from './backupCreateStatusGetter';
export { default as BackupCreator } from './backupCreator';
export { default as BackupRestoreStatusGetter } from './backupRestoreStatusGetter';
export { default as BackupRestorer } from './backupRestorer';
