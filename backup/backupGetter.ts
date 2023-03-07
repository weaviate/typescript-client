import { validateBackend } from "./validation";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class BackupGetter extends CommandBase {

  private backend?: string;

  constructor(client: Connection) {
    super(client)
  }

  withBackend(backend: string) {
    this.backend = backend;
    return this;
  }

  validate() {
    this.addErrors(validateBackend(this.backend))
  }

  do() {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    return this.client.get(this._path());
  }

  _path() {
    return `/backups/${this.backend}`;
  }
}
