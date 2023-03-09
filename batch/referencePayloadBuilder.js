import { isValidStringProperty } from "../validation/string";

export default class ReferencesBatcher {
  constructor(client) {
    this.client = client;
    this.errors = [];
  }

  withFromId = (id) => {
    this.fromId = id;
    return this;
  };

  withToId = (id) => {
    this.toId = id;
    return this;
  };

  withFromClassName = (className) => {
    this.fromClassName = className;
    return this;
  };

  withFromRefProp = (refProp) => {
    this.fromRefProp = refProp;
    return this;
  };

  withToClassName(className) {
    this.toClassName = className;
    return this;
  }

  validateIsSet = (prop, name, setter) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.errors = [
        ...this.errors,
        `${name} must be set - set with ${setter}`,
      ];
    }
  };

  validate = () => {
    this.validateIsSet(this.fromId, "fromId", ".withFromId(id)");
    this.validateIsSet(this.toId, "toId", ".withToId(id)");
    this.validateIsSet(
      this.fromClassName,
      "fromClassName",
      ".withFromClassName(className)"
    );
    this.validateIsSet(
      this.fromRefProp,
      "fromRefProp",
      ".withFromRefProp(refProp)"
    );
  };

  payload = () => {
    this.validate();
    if (this.errors.length > 0) {
      throw new Error(this.errors.join(", "));
    }

    var beaconTo = `weaviate://localhost`;
    if (isValidStringProperty(this.toClassName)) {
      beaconTo = `${beaconTo}/${this.toClassName}`;
    }

    return {
      from:
        `weaviate://localhost/${this.fromClassName}` +
        `/${this.fromId}/${this.fromRefProp}`,
      to: `${beaconTo}/${this.toId}`,
    };
  };
}
