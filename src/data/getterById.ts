import Connection from '../connection/index.js';
import { WeaviateObject } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';
import { ObjectsPath } from './path.js';
import { ConsistencyLevel } from './replication.js';

export default class GetterById extends CommandBase {
  private additional: string[];
  private className!: string;
  private id!: string;
  private consistencyLevel?: ConsistencyLevel;
  private nodeName?: string;
  private tenant?: string;
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

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  extendAdditional = (prop: string) => {
    this.additional = [...this.additional, prop];
    return this;
  };

  withAdditional = (additionalFlag: string) => this.extendAdditional(additionalFlag);

  withVector = () => this.extendAdditional('vector');

  withConsistencyLevel = (cl: ConsistencyLevel) => {
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
      this.nodeName,
      this.tenant
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
