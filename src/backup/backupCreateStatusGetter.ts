import Connection from '../connection';
import { validateBackupId, validateBackend } from './validation';
import { CommandBase } from '../validation/commandBase';

export default class BackupCreateStatusGetter extends CommandBase {
  private backend?: string;
  private backupId?: string;

  constructor(client: Connection) {
    super(client);
  }

  withBackend(backend: string) {
    this.backend = backend;
    return this;
  }

  withBackupId(backupId: string) {
    this.backupId = backupId;
    return this;
  }

  validate() {
    this.addErrors([
      ...validateBackend(this.backend),
      ...validateBackupId(this.backupId),
    ]);
  }

  do() {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }
    return this.client.get(this._path());
  }

  _path() {
    return `/backups/${this.backend}/${this.backupId}`;
  }
}
