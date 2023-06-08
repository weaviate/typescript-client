import { isValidStringProperty } from '../validation/string';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Tenant } from '../openapi/types';

export default class TenantsCreator extends CommandBase {
  private className?: string;
  private tenants?: Array<Tenant>;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withTenants = (tenants: Array<Tenant>) => {
    this.tenants = tenants;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  validateTenants = () => {
    if (!this.tenants || this.tenants.length == 0) {
      this.addError('tenants must be set - set with .withTenants(tenants)');
    }
  };

  validate = () => {
    this.validateClassName();
    this.validateTenants();
  };

  do = (): Promise<Array<Tenant>> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const path = `/schema/${this.className}/tenants`;
    return this.client.post(path, this.tenants);
  };
}
