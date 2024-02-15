import { isValidStringProperty } from '../validation/string';
import { ObjectsPath } from './path';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Properties, WeaviateObject } from '../openapi/types';
import { ConsistencyLevel } from './replication';

export default class Updater extends CommandBase {
  private className!: string;
  private consistencyLevel?: ConsistencyLevel;
  private id!: string;
  private objectsPath: ObjectsPath;
  private properties?: Properties;
  private tenant?: string;
  private vector?: number[];
  private vectors?: Record<string, number[]>;

  constructor(client: Connection, objectsPath: ObjectsPath) {
    super(client);
    this.objectsPath = objectsPath;
  }

  withVector = (vector: number[]) => {
    this.vector = vector;
    return this;
  };

  withVectors = (vectors: Record<string, number[]>) => {
    this.vectors = vectors;
    return this;
  };

  withProperties = (properties: Properties) => {
    this.properties = properties;
    return this;
  };

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

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - use withClassName(className)');
    }
  };

  validateId = () => {
    if (this.id == undefined || this.id == null || this.id.length == 0) {
      this.addError('id must be set - initialize with updater(id)');
    }
  };

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload = (): WeaviateObject => ({
    tenant: this.tenant,
    properties: this.properties,
    class: this.className,
    id: this.id,
    vector: this.vector,
    vectors: this.vectors,
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
      .buildUpdate(this.id, this.className, this.consistencyLevel)
      .then((path: string) => this.client.put(path, this.payload()));
  };
}
