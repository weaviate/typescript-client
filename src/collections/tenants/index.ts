import Connection from '../../connection/index.js';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema/index.js';

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
