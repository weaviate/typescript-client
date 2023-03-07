import Where from "./where";
import NearText from "./nearText";
import NearVector from "./nearVector";
import NearObject from "./nearObject";
import {isValidPositiveIntProperty} from "../validation/number";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class Aggregator extends CommandBase {
  private className?: string;
  private fields?: string;
  private groupBy?: string[];
  private includesNearMediaFilter: boolean;
  private limit?: number;
  private nearObjectString?: string;
  private nearTextString?: string;
  private nearVectorString?: string;
  private objectLimit?: number;
  private whereString?: string;

  constructor(client: Connection) {
    super(client)
    this.includesNearMediaFilter = false
  }

  withFields = (fields: string) => {
    this.fields = fields;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withWhere = (whereObj: any) => {
    try {
      this.whereString = new Where(whereObj).toString();
    } catch (e: any) {
      this.addError(e as string);
    }
    return this;
  };

  withNearText = (nearTextObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error("cannot use multiple near<Media> filters in a single query")
    }

    try {
      this.nearTextString = new NearText(nearTextObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString())
    }

    return this;
  };

  withNearObject = (nearObjectObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error("cannot use multiple near<Media> filters in a single query")
    }

    try {
      this.nearObjectString = new NearObject(nearObjectObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString())
    }

    return this;
  };

  withNearVector = (nearVectorObj: any) => {
    if (this.includesNearMediaFilter) {
      throw new Error("cannot use multiple near<Media> filters in a single query")
    }

    try {
      this.nearVectorString = new NearVector(nearVectorObj).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString())
    }

    return this;
  };

  withObjectLimit = (objectLimit: number) => {
    if (!isValidPositiveIntProperty(objectLimit)) {
      throw new Error("objectLimit must be a non-negative integer")
    }

    this.objectLimit = objectLimit;
    return this;
  };

  withLimit = (limit: number) => {
    this.limit = limit;
    return this;
  };

  withGroupBy = (groupBy: string[]) => {
    this.groupBy = groupBy;
    return this;
  };

  validateGroup = () => {
    if (!this.groupBy) {
      // nothing to check if this optional parameter is not set
      return;
    }

    if (!Array.isArray(this.groupBy)) {
      throw new Error("groupBy must be an array");
    }
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`)
    }
  };

  validate = () => {
    this.validateGroup();
    this.validateIsSet(
      this.className,
      "className",
      ".withClassName(className)"
    );
    this.validateIsSet(this.fields, "fields", ".withFields(fields)");
  };

  do = () => {
    let params = "";

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    if (
      this.whereString ||
      this.nearTextString ||
      this.nearObjectString ||
      this.nearVectorString ||
      this.limit ||
      this.groupBy
    ) {
      let args: any[] = [];

      if (this.whereString) {
        args = [...args, `where:${this.whereString}`];
      }

      if (this.nearTextString) {
        args = [...args, `nearText:${this.nearTextString}`];
      }

      if (this.nearObjectString) {
        args = [...args, `nearObject:${this.nearObjectString}`];
      }

      if (this.nearVectorString) {
        args = [...args, `nearVector:${this.nearVectorString}`];
      }

      if (this.groupBy) {
        args = [...args, `groupBy:${JSON.stringify(this.groupBy)}`];
      }

      if (this.limit) {
        args = [...args, `limit:${this.limit}`];
      }

      if (this.objectLimit) {
        args = [...args, `objectLimit:${this.objectLimit}`];
      }

      params = `(${args.join(",")})`;
    }

    return this.client.query(
      `{Aggregate{${this.className}${params}{${this.fields}}}}`
    );
  };
}
