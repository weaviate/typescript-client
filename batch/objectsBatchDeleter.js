import { isValidStringProperty } from "../validation/string";
import { buildObjectsPath } from "./path"

export default class ObjectsBatchDeleter {
  className;
  whereFilter;
  output;
  dryRun;

  constructor(client) {
    this.client = client;
    this.errors = [];
  }

  withClassName(className) {
    this.className = className;
    return this;
  }

  withWhere(whereFilter) {
    this.whereFilter = whereFilter;
    return this;
  }

  withOutput(output) {
    this.output = output;
    return this;
  }

  withDryRun(dryRun) {
    this.dryRun = dryRun;
    return this;
  }

  withConsistencyLevel = (cl) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload() {
    return {
      match: {
        class: this.className,
        where: this.whereFilter,
      },
      output: this.output,
      dryRun: this.dryRun,
    }
  }

  validateClassName() {
    if (!isValidStringProperty(this.className)) {
      this.errors = [
        ...this.errors,
        "string className must be set - set with .withClassName(className)",
      ];
    }
  }

  validateWhereFilter() {
    if (typeof this.whereFilter != "object") {
      this.errors = [
        ...this.errors,
        "object where must be set - set with .withWhere(whereFilter)"
      ]
    }
  }

  validate() {
    this.validateClassName();
    this.validateWhereFilter();
  };

  do() {
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
    return this.client.delete(path, this.payload(), true);
  };
}
