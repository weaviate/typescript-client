import Connection from '../../connection/index.js';
import { CommandBase } from '../../validation/commandBase.js';
import { isValidStringProperty } from '../../validation/string.js';

export default class ShardUpdater extends CommandBase {
  private className!: string;
  private shardName!: string;
  private status!: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  withShardName = (shardName: string) => {
    this.shardName = shardName;
    return this;
  };

  validateShardName = () => {
    if (!isValidStringProperty(this.shardName)) {
      this.addError('shardName must be set - set with .withShardName(shardName)');
    }
  };

  withStatus = (status: string) => {
    this.status = status;
    return this;
  };

  validateStatus = () => {
    if (!isValidStringProperty(this.status)) {
      this.addError('status must be set - set with .withStatus(status)');
    }
  };

  validate = () => {
    this.validateClassName();
    this.validateShardName();
    this.validateStatus();
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error(`invalid usage: ${this.errors.join(', ')}`));
    }

    return updateShard(this.client, this.className, this.shardName, this.status);
  };
}

export function updateShard(client: Connection, className: string, shardName: string, status: string) {
  const path = `/schema/${className}/shards/${shardName}`;
  return client.put(path, { status: status }, true);
}
