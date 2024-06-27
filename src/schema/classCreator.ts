import Connection from '../connection/index.js';
import { WeaviateClass } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';

export default class ClassCreator extends CommandBase {
  private class!: WeaviateClass;

  constructor(client: Connection) {
    super(client);
  }

  withClass = (classObj: object) => {
    this.class = classObj;
    return this;
  };

  validateClass = () => {
    if (this.class == undefined || this.class == null) {
      this.addError('class object must be set - set with .withClass(class)');
    }
  };

  validate() {
    this.validateClass();
  }

  do = (): Promise<WeaviateClass> => {
    this.validateClass();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema`;
    return this.client.postReturn(path, this.class);
  };
}
