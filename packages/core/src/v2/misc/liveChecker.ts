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
        // Best-effort background refresh. It must not fail the check, and an unhandled rejection here
        // would terminate Node >= 15 (e.g. /meta answers 401 while the open live/ready endpoint is up).
        // The version is fetched again on demand the next time it is needed.
        setTimeout(() => {
          this.dbVersionProvider.refresh().catch(() => {});
        });
        return Promise.resolve(true);
      })
      .catch(() => Promise.resolve(false));
  };
}
