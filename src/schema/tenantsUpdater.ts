import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Tenant } from '../openapi/types';

export default class TenantsUpdater extends CommandBase {
  private className: string;
  private tenants: Array<Tenant>;

  constructor(client: Connection, className: string, tenants: Array<Tenant>) {
    super(client);
    this.className = className;
    this.tenants = tenants;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<Array<Tenant>> => {
    return this.client.put(`/schema/${this.className}/tenants`, this.tenants);
  };
}
