import Connection from '../connection';
import { WeaviateObject } from '../types';
import { CommandBase } from '../validation/commandBase';
import { ObjectsPath } from './path';

export default class GetterById extends CommandBase {
  private additional: string[];
  private className!: string;
  private id!: string;
  private consistencyLevel?: string;
  private nodeName?: string;
  private objectsPath: ObjectsPath;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
    this.additional = [];
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  extendAdditional = (prop: string) => {
    this.additional = [...this.additional, prop];
    return this;
  };

  withAdditional = (additionalFlag: string) => this.extendAdditional(additionalFlag);

  withVector = () => this.extendAdditional('vector');

  withConsistencyLevel = (cl: string) => {
    this.consistencyLevel = cl;
    return this;
  };

  withNodeName = (nodeName: string) => {
    this.nodeName = nodeName;
    return this;
  };

  validateId = () => {
    if (this.id == undefined || this.id == null || this.id.length == 0) {
      this.addError('id must be set - initialize with getterById(id)');
    }
  };

  validate = () => {
    this.validateId();
  };

  buildPath = (): Promise<string> => {
    return this.objectsPath.buildGetOne(
      this.id,
      this.className,
      this.additional,
      this.consistencyLevel,
      this.nodeName
    );
  };

  do = (): Promise<WeaviateObject> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.buildPath().then((path) => {
      return this.client.get(path);
    });
  };
}
