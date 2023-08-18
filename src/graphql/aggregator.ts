import Where from './where';
import NearText, { NearTextArgs } from './nearText';
import NearVector, { NearVectorArgs } from './nearVector';
import NearObject, { NearObjectArgs } from './nearObject';
import { isValidPositiveIntProperty } from '../validation/number';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { WhereFilter } from '../openapi/types';

export default class Aggregator<
  TClassName extends string,
  TClassProperties extends Record<string, any>
> extends CommandBase {
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
  private tenant?: string;

  constructor(client: Connection) {
    super(client);
    this.includesNearMediaFilter = false;
  }

  withFields = (fields: string) => {
    this.fields = fields;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withWhere = (where: WhereFilter) => {
    try {
      this.whereString = new Where(where).toString();
    } catch (e: any) {
      this.addError(e as string);
    }
    return this;
  };

  withNearText = (args: NearTextArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }

    try {
      this.nearTextString = new NearText(args).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withNearObject = (args: NearObjectArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }

    try {
      this.nearObjectString = new NearObject(args).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withNearVector = (args: NearVectorArgs) => {
    if (this.includesNearMediaFilter) {
      throw new Error('cannot use multiple near<Media> filters in a single query');
    }

    try {
      this.nearVectorString = new NearVector(args).toString();
      this.includesNearMediaFilter = true;
    } catch (e: any) {
      this.addError(e.toString());
    }

    return this;
  };

  withObjectLimit = (objectLimit: number) => {
    if (!isValidPositiveIntProperty(objectLimit)) {
      throw new Error('objectLimit must be a non-negative integer');
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

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  validateGroup = () => {
    if (!this.groupBy) {
      // nothing to check if this optional parameter is not set
      return;
    }

    if (!Array.isArray(this.groupBy)) {
      throw new Error('groupBy must be an array');
    }
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateGroup();
    this.validateIsSet(this.className, 'className', '.withClassName(className)');
    this.validateIsSet(this.fields, 'fields', '.withFields(fields)');
  };

  do = () => {
    let params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    if (
      this.whereString ||
      this.nearTextString ||
      this.nearObjectString ||
      this.nearVectorString ||
      this.limit ||
      this.groupBy ||
      this.tenant
    ) {
      let args: string[] = [];

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

      if (this.tenant) {
        args = [...args, `tenant:"${this.tenant}"`];
      }

      params = `(${args.join(',')})`;
    }

    return this.client.query<any, AggregateReturn<TClassName, TClassProperties>>(
      `{Aggregate{${this.className}${params}{${this.fields}}}}`
    );
  };
}

export type AggregateReturn<ClassName extends string, T> = {
  Aggregate: {
    [key in ClassName]: T[];
  };
};
