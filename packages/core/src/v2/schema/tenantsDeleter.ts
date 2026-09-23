import Connection from '../../connection/index.js';
import { CommandBase } from '../../validation/commandBase.js';

export default class TenantsDeleter extends CommandBase {
  private className: string;
  private tenants: Array<string>;

  constructor(client: Connection, className: string, tenants: Array<string>) {
    super(client);
    this.className = className;
    this.tenants = tenants;
  }

  validate = () => {
    // nothing to validate
  };

  do = (): Promise<void> => {
    return this.client.delete(`/schema/${this.className}/tenants`, this.tenants, false);
  };
}
