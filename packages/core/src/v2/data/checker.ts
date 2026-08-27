import Connection from '../../connection/index.js';
import { CommandBase } from '../../validation/commandBase.js';
import { ObjectsPath } from './path.js';
import { ConsistencyLevel } from './replication.js';

export default class Checker extends CommandBase {
  private className!: string;
  private consistencyLevel?: ConsistencyLevel;
  private id!: string;
  private tenant?: string;
  private objectsPath: ObjectsPath;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  withConsistencyLevel = (consistencyLevel: ConsistencyLevel) => {
    this.consistencyLevel = consistencyLevel;
    return this;
  };

  buildPath = () => {
    return this.objectsPath.buildCheck(this.id, this.className, this.consistencyLevel, this.tenant);
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validateId = () => {
    this.validateIsSet(this.id, 'id', '.withId(id)');
  };

  validate = () => {
    this.validateId();
  };

  do = (): Promise<boolean> => {
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    this.validate();

    return this.buildPath().then((path: string) => this.client.head(path, undefined));
  };
}
