export default class ReadyChecker {
  constructor(client, dbVersionProvider) {
    this.client = client;
    this.dbVersionProvider = dbVersionProvider;
  }

  do = () => {
    return this.client
      .get("/.well-known/ready", false)
      .then(() => {
        setTimeout(() => this.dbVersionProvider.refresh());
        return Promise.resolve(true);
      })
      .catch(() => Promise.resolve(false));
  };
}
