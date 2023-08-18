import { isValidStringProperty } from '../validation/string';
import Connection from '../connection';
import { ObjectsPath } from './path';
import { CommandBase } from '../validation/commandBase';
import { Properties, WeaviateObject } from '../openapi/types';
import { ConsistencyLevel } from './replication';

export type CreateObjectPayload<P extends Properties = Properties> = {
  tenant?: string;
  vector?: number[];
  properties?: P;
  class?: string;
  id?: string;
};

export default class Creator<TClassProperties extends Properties> extends CommandBase {
  private className?: string;
  private consistencyLevel?: ConsistencyLevel;
  private id?: string;
  private objectsPath: ObjectsPath;
  private properties?: TClassProperties;
  private vector?: number[];
  private tenant?: string;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
  }

  withVector = (vector: number[]) => {
    this.vector = vector;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withProperties = (properties: TClassProperties) => {
    this.properties = properties;
    return this;
  };

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  payload = (): CreateObjectPayload<TClassProperties> => ({
    tenant: this.tenant,
    vector: this.vector,
    properties: this.properties,
    class: this.className,
    id: this.id,
  });

  validate = () => {
    this.validateClassName();
  };

  do = (): Promise<WeaviateObject<TClassProperties>> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.objectsPath
      .buildCreate(this.consistencyLevel)
      .then((path: string) => this.client.postReturn(path, this.payload()));
  };
}
