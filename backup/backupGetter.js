import { validateBackend } from "./validation";

export default class BackupGetter {

  backend;
  errors;

  constructor(client) {
    this.client = client;
  }

  withBackend(backend) {
    this.backend = backend;
    return this;
  }

  validate() {
    this.errors = validateBackend(this.backend);
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
