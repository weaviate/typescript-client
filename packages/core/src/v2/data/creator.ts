import Connection from '../../connection/index.js';
import { Properties, WeaviateObject } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { isValidStringProperty } from '../../validation/string.js';
import { ObjectsPath } from './path.js';
import { ConsistencyLevel } from './replication.js';

export default class Creator extends CommandBase {
  private className?: string;
  private consistencyLevel?: ConsistencyLevel;
  private id?: string;
  private objectsPath: ObjectsPath;
  private properties?: Properties;
  private vector?: number[];
  private vectors?: Record<string, number[]>;
  private tenant?: string;

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

  withClassName = (className: string) => {
    this.className = className;
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

  // as Record<string, any> required below because server uses swagger object as interface{} in Go to perform type switching
  // actual types are []number and [][]number but unions don't work in go-swagger
  payload = (): WeaviateObject => ({
    tenant: this.tenant,
    vector: this.vector,
    properties: this.properties,
    class: this.className,
    id: this.id,
    vectors: this.vectors as Record<string, any>,
  });

  validate = () => {
    this.validateClassName();
  };

  do = (): Promise<WeaviateObject> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return this.objectsPath
      .buildCreate(this.consistencyLevel)
      .then((path: string) => this.client.postReturn(path, this.payload()));
  };
}
