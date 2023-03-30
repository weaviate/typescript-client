import { buildObjectsPath } from './path';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { BatchRequest, WeaviateObject, WeaviateObjectsGet } from '../openapi/types';
import { ConsistencyLevel } from '../data/replication';

export default class ObjectsBatcher extends CommandBase {
  private consistencyLevel?: ConsistencyLevel;
  public objects: WeaviateObject[];

  constructor(client: Connection) {
    super(client);
    this.objects = [];
  }

  /**
   * can be called as:
   *  - withObjects(...[obj1, obj2, obj3])
   *  - withObjects(obj1, obj2, obj3)
   *  - withObjects(obj1)
   * @param  {...WeaviateObject[]} objects
   */
  withObjects(...objects: WeaviateObject[]) {
    let objs = objects;
    if (objects.length && Array.isArray(objects[0])) {
      objs = objects[0];
    }
    this.objects = [...this.objects, ...objs];
    return this;
  }

  withObject(object: WeaviateObject) {
    return this.withObjects(object);
  }

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload = (): BatchRequest => ({
    objects: this.objects,
  });

  validateObjectCount = (): void => {
    if (this.objects.length == 0) {
      this.addError('need at least one object to send a request, add one with .withObject(obj)');
    }
  };

  validate = (): void => {
    this.validateObjectCount();
  };

  do = (): Promise<WeaviateObjectsGet[]> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const params = new URLSearchParams();
    if (this.consistencyLevel) {
      params.set('consistency_level', this.consistencyLevel);
    }
    const path = buildObjectsPath(params);
    return this.client.post(path, this.payload());
  };
}
