import Connection from '../../connection';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema';

export type Tenant = {
  name: string;
  activityStatus?: 'COLD' | 'HOT';
};

const tenants = (connection: Connection, name: string): Tenants => {
  return {
    create: (tenants: Tenant[]) => new TenantsCreator(connection, name, tenants).do() as Promise<Tenant[]>,
    get: () =>
      new TenantsGetter(connection, name).do().then((tenants) => {
        const result: Record<string, Tenant> = {};
        tenants.forEach((tenant) => {
          if (!tenant.name) return;
          result[tenant.name] = tenant as Tenant;
        });
        return result;
      }),
    remove: (tenants: Tenant[]) =>
      new TenantsDeleter(
        connection,
        name,
        tenants.map((t) => t.name)
      ).do(),
    update: (tenants: Tenant[]) => new TenantsUpdater(connection, name, tenants).do() as Promise<Tenant[]>,
  };
};

export default tenants;

export interface Tenants {
  create: (tenants: Tenant[]) => Promise<Tenant[]>;
  get: () => Promise<Record<string, Tenant>>;
  remove: (tenants: Tenant[]) => Promise<void>;
  update: (tenants: Tenant[]) => Promise<Tenant[]>;
}
