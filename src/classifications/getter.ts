import Connection from '../connection/index.js';
import { CommandBase } from '../validation/commandBase.js';
import { Classification } from '../openapi/types.js';

export default class ClassificationsGetter extends CommandBase {
  private id?: string;

  constructor(client: Connection) {
    super(client);
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string): void => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validateId = (): void => {
    this.validateIsSet(this.id, 'id', '.withId(id)');
  };

  validate = (): void => {
    this.validateId();
  };

  do = (): Promise<Classification> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    const path = `/classifications/${this.id}`;
    return this.client.get(path);
  };
}
