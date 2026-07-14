import Connection from '../../connection/index.js';
import { CommandBase } from '../../validation/commandBase.js';

export default class TenantsExists extends CommandBase {
  private className: string;
  private tenant: string;

  constructor(client: Connection, className: string, tenant: string) {
    super(client);
    this.className = className;
    this.tenant = tenant;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<boolean> => {
    return this.client.head(`/schema/${this.className}/tenants/${this.tenant}`, undefined);
  };
}
