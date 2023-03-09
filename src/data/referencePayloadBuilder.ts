import { isValidStringProperty } from '../validation/string';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';

export default class ReferencePayloadBuilder extends CommandBase {
  private className?: string;
  private id?: string;

  constructor(client: Connection) {
    super(client);
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName(className: string) {
    this.className = className;
    return this;
  }

  validateIsSet = (
    prop: string | undefined | null,
    name: string,
    setter: string
  ) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(this.id, 'id', '.withId(id)');
  };

  payload = () => {
    this.validate();
    if (this.errors.length > 0) {
      throw new Error(this.errors.join(', '));
    }

    let beacon = `weaviate://localhost`;
    if (isValidStringProperty(this.className)) {
      beacon = `${beacon}/${this.className}`;
    }
    return {
      beacon: `${beacon}/${this.id}`,
    };
  };

  do(): Promise<any> {
    return Promise.reject(new Error('Should never be called'));
  }
}
