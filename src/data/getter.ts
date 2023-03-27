import Connection from '../connection';
import { ObjectsPath } from './path';
import { CommandBase } from '../validation/commandBase';
import { WeaviateObjectList } from '../types';

export default class Getter extends CommandBase {
  private additional: string[];
  private after!: string;
  private className?: string;
  private limit?: number;
  private objectsPath: ObjectsPath;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
    this.additional = [];
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

  extendAdditional = (prop: string) => {
    this.additional = [...this.additional, prop];
    return this;
  };

  withAdditional = (additionalFlag: any) =>
    this.extendAdditional(additionalFlag);

  withVector = () => this.extendAdditional('vector');

  validate() {
    // nothing to validate
  }

  do = (): Promise<WeaviateObjectList> => {
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }

    return this.objectsPath
      .buildGet(this.className, this.limit, this.additional, this.after)
      .then((path: string) => {
        return this.client.get(path);
      });
  };
}
