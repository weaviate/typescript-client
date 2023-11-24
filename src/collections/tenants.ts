import Connection from '../connection';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../schema';

export type Tenant = {
  name: string;
  activityStatus: 'COLD' | 'HOT';
};

export interface CreateTenantsArgs {
  tenants: Tenant[];
}

export interface RemoveTenantsArgs {
  names: string[];
}

export interface UpdateTenantsArgs {
  tenants: Tenant[];
}

const tenants = (connection: Connection, name: string): Tenants => {
  return {
    create: (args: CreateTenantsArgs) =>
      new TenantsCreator(connection, name, args.tenants).do() as Promise<Tenant[]>,
    get: () =>
      new TenantsGetter(connection, name).do().then((tenants) => {
        const result: Record<string, Tenant> = {};
        tenants.forEach((tenant) => {
          if (!tenant.name) return;
          result[tenant.name] = tenant as Tenant;
        });
        return result;
      }),
    remove: (args: RemoveTenantsArgs) => new TenantsDeleter(connection, name, args.names).do(),
    update: (args: UpdateTenantsArgs) =>
      new TenantsUpdater(connection, name, args.tenants).do() as Promise<Tenant[]>,
  };
};

export default tenants;

export interface Tenants {
  create: (args: CreateTenantsArgs) => Promise<Tenant[]>;
  get: () => Promise<Record<string, Tenant>>;
  remove: (args: RemoveTenantsArgs) => Promise<void>;
  update: (args: UpdateTenantsArgs) => Promise<Tenant[]>;
}
