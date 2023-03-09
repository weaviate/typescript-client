import Connection from '../connection';
import { ObjectsPath } from './path';
import { CommandBase } from '../validation/commandBase';

export default class Getter extends CommandBase {
  private additionals: any[];
  private after?: string;
  private className?: string;
  private limit?: number;
  private objectsPath: ObjectsPath;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
    this.additionals = [];
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withAfter = (id: string) => {
    this.after = id;
    return this;
  };

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  extendAdditionals = (prop: any) => {
    this.additionals = [...this.additionals, prop];
    return this;
  };

  withAdditional = (additionalFlag: any) =>
    this.extendAdditionals(additionalFlag);

  withVector = () => this.extendAdditionals('vector');

  validate() {
    // nothing to validate
  }

  do = () => {
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }

    return this.objectsPath
      .buildGet(this.className, this.limit, this.additionals!, this.after!)
      .then((path: string) => {
        return this.client.get(path);
      });
  };
}
