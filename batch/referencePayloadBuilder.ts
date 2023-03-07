import {isValidStringProperty} from "../validation/string";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class ReferencesBatcher extends CommandBase {
  private fromClassName?: string;
  private fromId?: string;
  private fromRefProp?: string;
  private toClassName?: string;
  private toId?: string;

  constructor(client: Connection) {
    super(client)
  }

  withFromId = (id: string) => {
    this.fromId = id;
    return this;
  };

  withToId = (id: string) => {
    this.toId = id;
    return this;
  };

  withFromClassName = (className: string) => {
    this.fromClassName = className;
    return this;
  };

  withFromRefProp = (refProp: string) => {
    this.fromRefProp = refProp;
    return this;
  };

  withToClassName(className: string) {
    this.toClassName = className;
    return this;
  }

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`)
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

  do(): Promise<any> {
    return Promise.reject('Should never be called');
  }
}
