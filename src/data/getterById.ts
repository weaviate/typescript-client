import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class GetterById extends CommandBase{
  private additionals: any[];
  private className?: string;
  private consistencyLevel?: string;
  private id?: string;
  private nodeName: any;
  private objectsPath: any;

  constructor(client: Connection, objectsPath: any) {
    super(client)
    this.objectsPath = objectsPath;
    this.additionals = [];
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  extendAdditionals = (prop: any) => {
    this.additionals = [...this.additionals, prop];
    return this;
  };

  withAdditional = (additionalFlag: any) => this.extendAdditionals(additionalFlag);

  withVector = () => this.extendAdditionals("vector");

  withConsistencyLevel = (cl: any) => {
    this.consistencyLevel = cl;
    return this;
  };

  withNodeName = (nodeName: any) => {
    this.nodeName = nodeName;
    return this;
  };

  validateId = () => {
    if (this.id == undefined || this.id == null || this.id.length == 0) {
      this.addError("id must be set - initialize with getterById(id)")
    }
  };

  validate = () => {
    this.validateId();
  };

  buildPath = (): Promise<string> => {
    return this.objectsPath.buildGetOne(this.id!, this.className!,
      this.additionals, this.consistencyLevel, this.nodeName)
  }

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    return this.buildPath()
      .then(path => {
        return this.client.get(path)
      });
  };
}
