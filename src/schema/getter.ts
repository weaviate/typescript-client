import Connection from '../connection';
import { WeaviateSchema } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';

export default class SchemaGetter extends CommandBase {
  constructor(client: Connection) {
    super(client);
  }

  validate() {
    // nothing to validate
  }

  do = (): Promise<WeaviateSchema> => {
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema`;
    return this.client.get(path);
  };
}
