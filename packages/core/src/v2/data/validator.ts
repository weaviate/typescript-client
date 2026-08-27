import Connection from '../../connection/index.js';
import { Properties } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { isValidStringProperty } from '../../validation/string.js';

export default class Validator extends CommandBase {
  private className?: string;
  private id?: string;
  private properties?: Properties;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withProperties = (properties: Properties) => {
    this.properties = properties;
    return this;
  };

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  payload = () => ({
    properties: this.properties,
    class: this.className,
    id: this.id,
  });

  validate = () => {
    this.validateClassName();
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/objects/validate`;
    return this.client.postEmpty(path, this.payload()).then(() => true);
  };
}
