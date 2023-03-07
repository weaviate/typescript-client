import {isValidStringProperty} from "../validation/string";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class ShardsGetter extends CommandBase {
  private className?: string;

  constructor(client: Connection) {
    super(client)
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

  validate = () => {
    this.validateClassName();
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error(`invalid usage: ${this.errors.join(", ")}`)
      );
    }

    return getShards(this.client, this.className)
  };
}

export function getShards(client: Connection, className: any) {
  const path = `/schema/${className}/shards`;
  return client.get(path)
}
