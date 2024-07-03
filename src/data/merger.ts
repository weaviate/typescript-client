import Connection from '../connection';
import { Properties, WeaviateObject } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';
import { isValidStringProperty } from '../validation/string';
import { ObjectsPath } from './path';
import { ConsistencyLevel } from './replication';

export default class Merger extends CommandBase {
  private className!: string;
  private consistencyLevel?: ConsistencyLevel;
  private id!: string;
  private objectsPath: ObjectsPath;
  private properties?: Properties;
  private tenant?: string;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
  }

  withProperties = (properties: Properties) => {
    this.properties = properties;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
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
      this.addError('className must be set - set with withClassName(className)');
    }
  };

  validateId = () => {
    if (this.id == undefined || this.id == null || this.id.length == 0) {
      this.addError('id must be set - set with withId(id)');
    }
  };

  payload = (): WeaviateObject => ({
    tenant: this.tenant,
    properties: this.properties,
    class: this.className,
    id: this.id,
  });

  validate = () => {
    this.validateClassName();
    this.validateId();
  };

  do = () => {
    this.validate();

    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.objectsPath
      .buildMerge(this.id, this.className, this.consistencyLevel)
      .then((path: string) => this.client.patch(path, this.payload()));
  };
}
