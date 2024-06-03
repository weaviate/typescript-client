import Connection from '../connection/index.js';
import { Tenant } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';

export default class TenantsGetter extends CommandBase {
  private className: string;

  constructor(client: Connection, className: string) {
    super(client);
    this.className = className;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<Array<Tenant>> => {
    return this.client.get(`/schema/${this.className}/tenants`);
  };
}
