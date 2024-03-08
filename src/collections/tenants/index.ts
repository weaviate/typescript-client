import Connection from '../../connection';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema';

export type Tenant = {
  name: string;
  activityStatus?: 'COLD' | 'HOT';
};

const tenants = (connection: Connection, name: string): Tenants => {
  const parseTenants = (tenants: Tenant | Tenant[]) => (Array.isArray(tenants) ? tenants : [tenants]);
  return {
    create: (tenants: Tenant | Tenant[]) =>
      new TenantsCreator(connection, name, parseTenants(tenants)).do() as Promise<Tenant[]>,
    get: () =>
      new TenantsGetter(connection, name).do().then((tenants) => {
        const result: Record<string, Tenant> = {};
        tenants.forEach((tenant) => {
          if (!tenant.name) return;
          result[tenant.name] = tenant as Tenant;
        });
        return result;
      }),
    remove: (tenants: Tenant | Tenant[]) =>
      new TenantsDeleter(
        connection,
        name,
        parseTenants(tenants).map((t) => t.name)
      ).do(),
    update: (tenants: Tenant | Tenant[]) =>
      new TenantsUpdater(connection, name, parseTenants(tenants)).do() as Promise<Tenant[]>,
  };
};

export default tenants;

export interface Tenants {
  create: (tenants: Tenant | Tenant[]) => Promise<Tenant[]>;
  get: () => Promise<Record<string, Tenant>>;
  remove: (tenants: Tenant | Tenant[]) => Promise<void>;
  update: (tenants: Tenant | Tenant[]) => Promise<Tenant[]>;
}
