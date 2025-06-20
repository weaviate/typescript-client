import Connection from '../../connection/index.js';
import { WeaviateInvalidInputError } from '../../errors.js';
import { BackupCreateResponse } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { Backend } from './index.js';
import { validateBackend } from './validation.js';

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
      return Promise.reject(new WeaviateInvalidInputError('invalid usage: ' + this.errors.join(', ')));
    }

    return this.client.get(this._path());
  };

  private _path = (): string => {
    return `/backups/${this.backend}`;
  };
}
