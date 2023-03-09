import { buildObjectsPath } from "./path"

export default class ObjectsBatcher {
  constructor(client) {
    this.client = client;
    this.objects = [];
    this.errors = [];
  }

  /**
   * can be called as:
   *  - withObjects([obj1, obj2, obj3])
   *  - withObjects(obj1, obj2, obj3)
   *  - withObjects(obj1)
   * @param  {...any} objects
   */
  withObjects(...objects) {
    let objs = objects;
    if (objects.length && Array.isArray(objects[0])) {
      objs = objects[0];
    }
    this.objects = [...this.objects, ...objs];
    return this;
  }

  withObject(object) {
    return this.withObjects(object);
  };

  withConsistencyLevel = (cl) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload = () => ({
    objects: this.objects,
  });

  validateObjectCount = () => {
    if (this.objects.length == 0) {
      this.errors = [
        ...this.errors,
        "need at least one object to send a request, " +
          "add one with .withObject(obj)",
      ];
    }
  };

  validate = () => {
    this.validateObjectCount();
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }
    let params = new URLSearchParams()
    if (this.consistencyLevel) {
      params.set("consistency_level", this.consistencyLevel)
    }
    const path = buildObjectsPath(params);
    return this.client.post(path, this.payload());
  };
}
