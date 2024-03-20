import Connection from '../connection/index.js';
import { CommandBase } from '../validation/commandBase.js';

export default class MetaGetter extends CommandBase {
  constructor(client: Connection) {
    super(client);
  }

  validate() {
    // nothing to validate
  }

  do = () => {
    return this.client.get('/meta', true);
  };
}
