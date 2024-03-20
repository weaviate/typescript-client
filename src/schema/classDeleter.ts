import { isValidStringProperty } from '../validation/string.js';
import Connection from '../connection/index.js';
import { CommandBase } from '../validation/commandBase.js';

export default class ClassDeleter extends CommandBase {
  private className?: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  validate = () => {
    this.validateClassName();
  };

  do = (): Promise<void> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema/${this.className}`;
    return this.client.delete(path, undefined, false);
  };
}
