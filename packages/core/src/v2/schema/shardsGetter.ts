import Connection from '../../connection/index.js';
import { ShardStatusList } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';
import { isValidStringProperty } from '../../validation/string.js';

export default class ShardsGetter extends CommandBase {
  private className?: string;
  private tenant?: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withTenant = (tenant: string) => {
    this.tenant = tenant;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  validate = () => {
    this.validateClassName();
  };

  do = (): Promise<ShardStatusList> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error(`invalid usage: ${this.errors.join(', ')}`));
    }

    return getShards(this.client, this.className, this.tenant);
  };
}

export function getShards(client: Connection, className: any, tenant?: string) {
  const path = `/schema/${className}/shards${tenant ? `?tenant=${tenant}` : ''}`;
  return client.get<ShardStatusList>(path);
}
