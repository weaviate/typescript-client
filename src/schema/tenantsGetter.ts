import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Tenant } from '../openapi/types';

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
