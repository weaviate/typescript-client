import { validateBackend } from './validation';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { BackupCreateResponse } from '../openapi/types';
import { Backend } from '.';

export default class BackupGetter extends CommandBase {
  private backend?: Backend;

  constructor(client: Connection) {
    super(client);
  }

  withBackend(backend: Backend) {
    this.backend = backend;
    return this;
  }

  validate = (): void => {
    this.addErrors(validateBackend(this.backend));
  };

  do = (): Promise<BackupCreateResponse[]> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.client.get(this._path());
  };

  private _path = (): string => {
    return `/backups/${this.backend}`;
  };
}
