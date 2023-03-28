import { isValidStringProperty } from '../validation/string';
import { getShards } from './shardsGetter';
import { updateShard } from './shardUpdater';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { ShardStatus, ShardStatusList } from '../openapi/types';

export default class ShardsUpdater extends CommandBase {
  private className!: string;
  private shards: ShardStatusList;
  private status!: string;

  constructor(client: Connection) {
    super(client);
    this.shards = [];
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
    this.validateStatus();
  };

  updateShards = async () => {
    const payload: any = await Promise.all(
      Array.from({ length: this.shards.length }, (_, i) =>
        updateShard(this.client, this.className, this.shards[i].name || '', this.status)
          .then((res: any) => {
            return { name: this.shards[i].name, status: res.status };
          })
          .catch((err: any) => this.addError(err.toString()))
      )
    );

    if (this.errors.length > 0) {
      return Promise.reject(new Error(`failed to update shards: ${this.errors.join(', ')}`));
    }

    return Promise.resolve(payload);
  };

  do = (): Promise<ShardStatusList> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error(`invalid usage: ${this.errors.join(', ')}`));
    }

    return getShards(this.client, this.className)
      .then((shards: ShardStatusList) => (this.shards = shards))
      .then(() => {
        return this.updateShards();
      })
      .then((payload: ShardStatusList) => {
        return payload;
      })
      .catch((err: any) => {
        return Promise.reject(err);
      });
  };
}
