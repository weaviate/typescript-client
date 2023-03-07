import {DbVersionProvider} from "../utils/dbVersion";
import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class ReadyChecker extends CommandBase {
  private dbVersionProvider: DbVersionProvider;

  constructor(client: Connection, dbVersionProvider: DbVersionProvider) {
    super(client)
    this.dbVersionProvider = dbVersionProvider;
  }

  validate() {
    // nothing to validate
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
