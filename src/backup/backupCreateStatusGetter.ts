import Connection from '../connection/index.js';
import { WeaviateInvalidInputError } from '../errors.js';
import { BackupCreateStatusResponse } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';
import { Backend } from './index.js';
import { validateBackend, validateBackupId } from './validation.js';

export default class BackupCreateStatusGetter extends CommandBase {
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

  do = (): Promise<BackupCreateStatusResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new WeaviateInvalidInputError('invalid usage: ' + this.errors.join(', ')));
    }
    return this.client.get(this._path()) as Promise<BackupCreateStatusResponse>;
  };

  private _path = (): string => {
    return `/backups/${this.backend}/${this.backupId}`;
  };
}
