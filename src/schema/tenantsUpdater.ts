import Connection from '../connection';
import { Tenant, TenantUpdate } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';

export default class TenantsUpdater extends CommandBase {
  private className: string;
  private tenants: Array<Tenant | TenantUpdate>;

  constructor(client: Connection, className: string, tenants: Array<Tenant | TenantUpdate>) {
    super(client);
    this.className = className;
    this.tenants = tenants;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<Array<Tenant>> => this.client.put(`/schema/${this.className}/tenants`, this.tenants);
}
