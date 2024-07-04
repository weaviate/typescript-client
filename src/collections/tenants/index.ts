import { ConnectionGRPC } from '../../connection/index.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { Tenant, TenantBase, TenantCreate, TenantUpdate } from './types.js';

const checkSupportForGRPCTenantsGetEndpoint = async (dbVersionSupport: DbVersionSupport) => {
  const check = await dbVersionSupport.supportsTenantsGetGRPCMethod();
  if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
};

const parseValueOrValueArray = <V>(value: V | V[]) => (Array.isArray(value) ? value : [value]);

const parseStringOrTenant = <T extends TenantBase>(tenant: string | T) =>
  typeof tenant === 'string' ? tenant : tenant.name;

const tenants = (
  connection: ConnectionGRPC,
  collection: string,
  dbVersionSupport: DbVersionSupport
): Tenants => {
  const getGRPC = (names?: string[]) =>
    checkSupportForGRPCTenantsGetEndpoint(dbVersionSupport)
      .then(() => connection.tenants(collection))
      .then((builder) => builder.withGet({ names }))
      .then(Deserialize.tenantsGet);
  const getREST = () =>
    new TenantsGetter(connection, collection).do().then((tenants) => {
      const result: Record<string, Tenant> = {};
      tenants.forEach((tenant) => {
        if (!tenant.name) return;
        result[tenant.name] = {
          name: tenant.name!,
          activityStatus: Deserialize.activityStatusREST(tenant.activityStatus),
        };
      });
      return result;
    });
  return {
    create: (tenants: Tenant | TenantCreate | (Tenant | TenantCreate)[]) =>
      new TenantsCreator(
        connection,
        collection,
        parseValueOrValueArray(tenants).map(Serialize.tenantsCreate)
      ).do() as Promise<Tenant[]>,
    get: async function () {
      const check = await dbVersionSupport.supportsTenantsGetGRPCMethod();
      return check.supports ? getGRPC() : getREST();
    },
    getByNames: <T extends TenantBase>(tenants: (string | T)[]) => getGRPC(tenants.map(parseStringOrTenant)),
    getByName: <T extends TenantBase>(tenant: string | T) => {
      const tenantName = parseStringOrTenant(tenant);
      return getGRPC([tenantName]).then((tenants) => tenants[tenantName] || null);
    },
    remove: <T extends TenantBase>(tenants: string | T | (string | T)[]) =>
      new TenantsDeleter(
        connection,
        collection,
        parseValueOrValueArray(tenants).map(parseStringOrTenant)
      ).do(),
    update: (tenants: Tenant | TenantUpdate | (Tenant | TenantUpdate)[]) =>
      new TenantsUpdater(
        connection,
        collection,
        parseValueOrValueArray(tenants).map(Serialize.tenantUpdate)
      ).do() as Promise<Tenant[]>,
  };
};

export default tenants;

export { Tenant, TenantBase, TenantCreate, TenantUpdate };

/**
 * Represents all the CRUD methods available on a collection's multi-tenancy specification within Weaviate.

 * The collection must have been created with multi-tenancy enabled in order to use any of these methods. This class
 * should not be instantiated directly, but is available as a property of the `Collection` class under
 * the `collection.tenants` class attribute.
 * 
 * Starting from Weaviate v1.26, the naming convention around tenant activitiy statuses is changing.
 * The changing nomenclature is as follows:
 * - `HOT` is now `ACTIVE`, which means loaded fully into memory and ready for use.
 * - `COLD` is now `INACTIVE`, which means not loaded into memory with files stored on disk.
 * 
 * With this change, new statuses are being added. One is mutable and the other two are immutable. They are:
 * - `OFFLOADED`, which means the tenant is not loaded into memory with files stored on the cloud.
 * - `OFFLOADING`, which means the tenant is transitioning to the `OFFLOADED` status.
 * - `ONLOADING`, which means the tenant is transitioning from the `OFFLOADED` status.
 */
export interface Tenants {
  /**
   * Create the specified tenants for a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @param {Tenant | TenantCreate | (Tenant | TenantCreate)[]} tenants The tenant or tenants to create.
   * @returns {Promise<Tenant[]>} The created tenant(s) as a list of Tenant.
   */
  create: (tenants: Tenant | TenantCreate | (Tenant | TenantCreate)[]) => Promise<Tenant[]>;
  /**
   * Return all tenants currently associated with a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @returns {Promise<Record<string, Tenant>>} A list of tenants as an object of Tenant types, where the key is the tenant name.
   */
  get: () => Promise<Record<string, Tenant>>;
  /**
   * Return the specified tenants from a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @typedef {TenantBase} T A type that extends TenantBase.
   * @param {(string | T)[]} names The tenants to retrieve.
   * @returns {Promise<Tenant[]>} The list of tenants. If the tenant does not exist, it will not be included in the list.
   */
  getByNames: <T extends TenantBase>(names: (string | T)[]) => Promise<Record<string, Tenant>>;
  /**
   * Return the specified tenant from a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @typedef {TenantBase} T A type that extends TenantBase.
   * @param {string | T} name The name of the tenant to retrieve.
   * @returns {Promise<Tenant | null>} The tenant as a Tenant type, or null if the tenant does not exist.
   */
  getByName: <T extends TenantBase>(name: string | T) => Promise<Tenant | null>;
  /**
   * Remove the specified tenants from a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @typedef {TenantBase} T A type that extends TenantBase.
   * @param {Tenant | Tenant[]} tenants The tenant or tenants to remove.
   * @returns {Promise<void>} An empty promise.
   */
  remove: <T extends TenantBase>(tenants: string | T | (string | T)[]) => Promise<void>;
  /**
   * Update the specified tenants for a collection in Weaviate.
   * The collection must have been created with multi-tenancy enabled.
   *
   * For details on the new activity statuses, see the docstring for the `Tenants` interface type.
   *
   * @param {TenantInput | TenantInput[]} tenants The tenant or tenants to update.
   * @returns {Promise<Tenant[]>} The updated tenant(s) as a list of Tenant.
   */
  update: (tenants: Tenant | TenantUpdate | (Tenant | TenantUpdate)[]) => Promise<Tenant[]>;
}
