import Connection from '../connection';
import { Tenant } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';

export default class TenantsGetter extends CommandBase {
  private className: string;

  constructor(client: Connection, className: string) {
    super(client);
    this.className = className;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<Array<Tenant>> => this.client.get(`/schema/${this.className}/tenants`);
}
