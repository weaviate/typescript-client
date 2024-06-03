import Connection from '../connection/index.js';
import { Property } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';
import { isValidStringProperty } from '../validation/string.js';

export default class PropertyCreator extends CommandBase {
  private className!: string;
  private property!: Property;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withProperty = (property: Property) => {
    this.property = property;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  validateProperty = () => {
    if (this.property == undefined || this.property == null) {
      this.addError('property must be set - set with .withProperty(property)');
    }
  };

  validate = () => {
    this.validateClassName();
    this.validateProperty();
  };

  do = (): Promise<Property> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema/${this.className}/properties`;
    return this.client.postReturn(path, this.property);
  };
}
