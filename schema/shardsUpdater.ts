import { isValidStringProperty } from "../validation/string";
import { getShards } from "./shardsGetter";
import { updateShard } from "./shardUpdater";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class ShardsUpdater extends CommandBase {
  private className?: string;
  private shards: any[];
  private status?: string;

  constructor(client: Connection) {
    super(client)
    this.shards = [];
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError("className must be set - set with .withClassName(className)")
    }
  };

  withStatus = (status: string) => {
    this.status = status
    return this;
  }

  validateStatus = () => {
    if (!isValidStringProperty(this.status)) {
      this.addError("status must be set - set with .withStatus(status)")
    }
  };

  validate = () => {
    this.validateClassName();
    this.validateStatus();
  };

  updateShards = async () => {
    let payload: any = [];
    for (let i = 0; i < this.shards.length; i++) {
      await updateShard(this.client, this.className, this.shards[i].name, this.status)
        .then((res: any) => {
          payload.push({name: this.shards[i].name, status: res.status})
        })
        .catch((err: any) => this.addError(err.toString()));
    }

    if (this.errors.length > 0) {
      return Promise.reject(
        new Error(`failed to update shards: ${this.errors.join(", ")}`)
      );
    }

    return Promise.resolve(payload);
  }

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error(`invalid usage: ${this.errors.join(", ")}`)
      );
    }

    return getShards(this.client, this.className)
      .then((shards: any) => this.shards = shards)
      .then(() => {
        return this.updateShards()
      })
      .then((payload: any) => {return payload})
      .catch((err: any) => {
        return Promise.reject(err);
      });
  };
}
