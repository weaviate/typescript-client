import BackupCreator from "./backupCreator";
import BackupCreateStatusGetter from "./backupCreateStatusGetter";
import BackupRestorer from "./backupRestorer";
import BackupRestoreStatusGetter from "./backupRestoreStatusGetter";
// import BackupGetter from "./backupGetter";

const backup = client => {
  return {
    creator: () => new BackupCreator(client, new BackupCreateStatusGetter(client)),
    createStatusGetter: () => new BackupCreateStatusGetter(client),
    restorer: () => new BackupRestorer(client, new BackupRestoreStatusGetter(client)),
    restoreStatusGetter: () => new BackupRestoreStatusGetter(client),
    // getter: () => new BackupGetter(client),
  };
};

export default backup;
