import { validateBackupId, validateBackend } from './validation.js';
import Connection from '../connection/index.js';
import { CommandBase } from '../validation/commandBase.js';
import { BackupRestoreStatusResponse } from '../openapi/types.js';
import { Backend } from './index.js';

export default class BackupRestoreStatusGetter extends CommandBase {
  private backend?: Backend;
  private backupId?: string;

  constructor(client: Connection) {
    super(client);
  }

  withBackend(backend: Backend) {
    this.backend = backend;
    return this;
  }

  withBackupId(backupId: string) {
    this.backupId = backupId;
    return this;
  }

  validate = (): void => {
    this.addErrors([...validateBackend(this.backend), ...validateBackupId(this.backupId)]);
  };

  do = (): Promise<BackupRestoreStatusResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.client.get(this._path());
  };

  private _path = (): string => {
    return `/backups/${this.backend}/${this.backupId}/restore`;
  };
}
