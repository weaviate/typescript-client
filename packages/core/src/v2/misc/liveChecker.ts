import Connection from '../../connection/index.js';
import { DbVersionProvider } from '../../utils/dbVersion.js';
import { CommandBase } from '../../validation/commandBase.js';

export default class LiveChecker extends CommandBase {
  private dbVersionProvider: DbVersionProvider;

  constructor(client: Connection, dbVersionProvider: DbVersionProvider) {
    super(client);
    this.dbVersionProvider = dbVersionProvider;
  }

  validate() {
    // nothing to validate
  }

  do = () => {
    return this.client
      .get('/.well-known/live', false)
      .then(() => {
        setTimeout(() => this.dbVersionProvider.refresh());
        return Promise.resolve(true);
      })
      .catch(() => Promise.resolve(false));
  };
}
