import { WeaviateInvalidInputError } from '../errors.js';
import { CommandBase } from '../validation/commandBase.js';
import { validateBackend } from './validation.js';
export default class BackupGetter extends CommandBase {
  constructor(client) {
    super(client);
    this.validate = () => {
      this.addErrors(validateBackend(this.backend));
    };
    this.do = () => {
      this.validate();
      if (this.errors.length > 0) {
        return Promise.reject(new WeaviateInvalidInputError('invalid usage: ' + this.errors.join(', ')));
      }
      return this.client.get(this._path());
    };
    this._path = () => {
      return `/backups/${this.backend}`;
    };
  }
  withBackend(backend) {
    this.backend = backend;
    return this;
  }
}
