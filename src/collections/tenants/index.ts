import { ConnectionGRPC } from '../../connection/index.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { TenantActivityStatus, TenantsGetReply } from '../../proto/v1/tenants.js';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

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

const mapReply = (reply: TenantsGetReply): Record<string, Tenant> => {
  const tenants: Record<string, Tenant> = {};
  reply.tenants.forEach((t) => {
    tenants[t.name] = {
      name: t.name,
      activityStatus: ActivityStatusMapper.from(t.activityStatus),
    };
  });
  return tenants;
};

const checkSupportForGRPCTenantsGetEndpoint = async (dbVersionSupport: DbVersionSupport) => {
  const check = await dbVersionSupport.supportsTenantsGetGRPCMethod();
  if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
};

const parseTenantOrTenantArray = (tenants: Tenant | Tenant[]) =>
  Array.isArray(tenants) ? tenants : [tenants];

const parseStringOrTenant = (tenant: string | Tenant) => (typeof tenant === 'string' ? tenant : tenant.name);

const tenants = (
  connection: ConnectionGRPC,
  collection: string,
  dbVersionSupport: DbVersionSupport
): Tenants => {
  const getGRPC = (names?: string[]) =>
    checkSupportForGRPCTenantsGetEndpoint(dbVersionSupport)
      .then(() => connection.tenants(collection))
      .then((builder) => builder.withGet({ names }))
      .then(mapReply);
  const getREST = () =>
    new TenantsGetter(connection, collection).do().then((tenants) => {
      const result: Record<string, Tenant> = {};
      tenants.forEach((tenant) => {
        if (!tenant.name) return;
        result[tenant.name] = tenant as Tenant;
      });
      return result;
    });
  return {
    create: (tenants: Tenant | Tenant[]) =>
      new TenantsCreator(connection, collection, parseTenantOrTenantArray(tenants)).do() as Promise<Tenant[]>,
    get: async function () {
      const check = await dbVersionSupport.supportsTenantsGetGRPCMethod();
      return check.supports ? getGRPC() : getREST();
    },
    getByNames: (tenants: (string | Tenant)[]) => getGRPC(tenants.map(parseStringOrTenant)),
    getByName: (tenant: string | Tenant) => {
      const tenantName = parseStringOrTenant(tenant);
      return getGRPC([tenantName]).then((tenants) => tenants[tenantName] || null);
    },
    remove: (tenants: Tenant | Tenant[]) =>
      new TenantsDeleter(
        connection,
        collection,
        parseTenantOrTenantArray(tenants).map((t) => t.name)
      ).do(),
    update: (tenants: Tenant | Tenant[]) =>
      new TenantsUpdater(connection, collection, parseTenantOrTenantArray(tenants)).do() as Promise<Tenant[]>,
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
   * Return the specified tenants from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {(string | Tenant)[]} names The tenants to retrieve.
   * @returns {Promise<Tenant[]>} The list of tenants. If the tenant does not exist, it will not be included in the list.
   */
  getByNames: (names: (string | Tenant)[]) => Promise<Record<string, Tenant>>;
  /**
   * Return the specified tenant from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {string | Tenant} name The name of the tenant to retrieve.
   * @returns {Promise<Tenant | null>} The tenant as a Tenant type, or null if the tenant does not exist.
   */
  getByName: (name: string | Tenant) => Promise<Tenant | null>;
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
