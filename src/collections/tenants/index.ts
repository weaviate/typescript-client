import { ConnectionGRPC } from '../../connection/index.js';
import { TenantActivityStatus } from '../../proto/v1/tenants.js';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema/index.js';

export type Tenant = {
  name: string;
  activityStatus?: 'COLD' | 'HOT';
};

export type TenantsGetOptions = {
  tenants?: string;
};

class ActivityStatusMapper {
  static from(status: TenantActivityStatus): 'COLD' | 'HOT' {
    switch (status) {
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD:
        return 'COLD';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT:
        return 'HOT';
      default:
        throw new Error(`Unsupported tenant activity status: ${status}`);
    }
  }
}

const tenants = (connection: ConnectionGRPC, name: string): Tenants => {
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
    getByName: (name: string) =>
      connection
        .tenants(name)
        .then((builder) => builder.withGet({ names: [name] }))
        .then((reply) =>
          reply.tenants.length === 1
            ? {
                name: reply.tenants[0].name,
                activityStatus: ActivityStatusMapper.from(reply.tenants[0].activityStatus),
              }
            : null
        ),
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

/**
 * Represents all the CRUD methods available on a collection's multi-tenancy specification within Weaviate.

 * The collection must have been created with multi-tenancy enabled in order to use any of these methods. This class
 * should not be instantiated directly, but is available as a property of the `Collection` class under
 * the `collection.tenants` class attribute.
 */
export interface Tenants {
  /**
   * Create the specified tenants for a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {Tenant | Tenant[]} tenants The tenant or tenants to create.
   * @returns {Promise<Tenant[]>} The created tenant(s) as a list of Tenant.
   */
  create: (tenants: Tenant | Tenant[]) => Promise<Tenant[]>;
  /**
   * Return all tenants currently associated with a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @returns {Promise<Record<string, Tenant>>} A list of tenants as an object of Tenant types, where the key is the tenant name.
   */
  get: () => Promise<Record<string, Tenant>>;
  /**
   * Return the specified tenant from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {string} name The name of the tenant to retrieve.
   * @returns {Promise<Tenant | null>} The tenant as a Tenant type, or null if the tenant does not exist.
   */
  getByName: (name: string) => Promise<Tenant | null>;
  /**
   * Remove the specified tenants from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {Tenant | Tenant[]} tenants The tenant or tenants to remove.
   * @returns {Promise<void>} An empty promise.
   */
  remove: (tenants: Tenant | Tenant[]) => Promise<void>;
  /**
   * Update the specified tenants for a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {Tenant | Tenant[]} tenants The tenant or tenants to update.
   * @returns {Promise<Tenant[]>} The updated tenant(s) as a list of Tenant.
   */
  update: (tenants: Tenant | Tenant[]) => Promise<Tenant[]>;
}
