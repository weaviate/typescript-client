import Connection from '../../connection/index.js';
import { Meta } from '../../openapi/types.js';
import { CommandBase } from '../../validation/commandBase.js';

export default class MetaGetter extends CommandBase {
  constructor(client: Connection) {
    super(client);
  }

  validate() {
    // nothing to validate
  }

  do = (): Promise<Meta> => {
    return this.client.get('/meta', true);
  };
}
