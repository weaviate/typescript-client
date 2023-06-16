import { isValidStringProperty } from '../validation/string';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { WeaviateSchema } from '../openapi/types';

export default class ClassExists extends CommandBase {
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

  do = (): Promise<boolean> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema`;
    return this.client
      .get(path)
      .then((res: WeaviateSchema) => res.classes?.some((c) => c.class === this.className));
  };
}
