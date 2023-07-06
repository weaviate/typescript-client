import { isValidStringProperty } from '../validation/string';
import { buildObjectsPath } from './path';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { BatchDelete, BatchDeleteResponse, WhereFilter } from '../openapi/types';
import { ConsistencyLevel } from '../data/replication';
import { DeleteOutput } from '.';

export default class ObjectsBatchDeleter extends CommandBase {
  private className?: string;
  private consistencyLevel?: ConsistencyLevel;
  private dryRun?: boolean;
  private output?: DeleteOutput;
  private whereFilter?: WhereFilter;
  private tenant?: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName(className: string) {
    this.className = className;
    return this;
  }

  withWhere(whereFilter: WhereFilter) {
    this.whereFilter = whereFilter;
    return this;
  }

  withOutput(output: DeleteOutput) {
    this.output = output;
    return this;
  }

  withDryRun(dryRun: boolean) {
    this.dryRun = dryRun;
    return this;
  }

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  withTenant(tenant: string) {
    this.tenant = tenant;
    return this;
  }

  payload = (): BatchDelete => {
    return {
      match: {
        class: this.className,
        where: this.whereFilter,
      },
      output: this.output,
      dryRun: this.dryRun,
    };
  };

  validateClassName = (): void => {
    if (!isValidStringProperty(this.className)) {
      this.addError('string className must be set - set with .withClassName(className)');
    }
  };

  validateWhereFilter = (): void => {
    if (typeof this.whereFilter != 'object') {
      this.addError('object where must be set - set with .withWhere(whereFilter)');
    }
  };

  validate = (): void => {
    this.validateClassName();
    this.validateWhereFilter();
  };

  do = (): Promise<BatchDeleteResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const params = new URLSearchParams();
    if (this.consistencyLevel) {
      params.set('consistency_level', this.consistencyLevel);
    }
    if (this.tenant) {
      params.set('tenant', this.tenant);
    }
    const path = buildObjectsPath(params);
    return this.client.delete(path, this.payload(), true);
  };
}
