export class DbVersionProvider {
  constructor(version) {
    this.version = version;
  }

  getVersionPromise() {
    return Promise.resolve(this.version);
  }
}
