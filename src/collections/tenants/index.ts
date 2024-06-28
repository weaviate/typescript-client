import { ConnectionGRPC } from '../../connection/index.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { TenantActivityStatus, TenantsGetReply } from '../../proto/v1/tenants.js';
import { TenantsCreator, TenantsDeleter, TenantsGetter, TenantsUpdater } from '../../schema/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

export type Tenant = {
  name: string;
  activityStatus: 'COLD' | 'HOT' | 'FREEZING' | 'FROZEN' | 'UNFREEZING' | 'UNFROZEN';
};

export type TenantInput = {
  name: string;
  activityStatus?: 'COLD' | 'HOT';
};

export type TenantsGetOptions = {
  tenants?: string;
};

class ActivityStatusMapper {
  static from(
    status: TenantActivityStatus
  ): 'COLD' | 'HOT' | 'FROZEN' | 'FREEZING' | 'UNFREEZING' | 'UNFROZEN' {
    switch (status) {
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD:
        return 'COLD';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT:
        return 'HOT';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_FREEZING:
        return 'FREEZING';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN:
        return 'FROZEN';
      case TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNFREEZING:
        return 'UNFREEZING';
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

const parseTenantOrTenantArray = (tenants: TenantInput | TenantInput[]) =>
  Array.isArray(tenants) ? tenants : [tenants];

const parseStringOrTenant = (tenant: string | TenantInput) =>
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
    create: (tenants: TenantInput | TenantInput[]) =>
      new TenantsCreator(connection, collection, parseTenantOrTenantArray(tenants)).do() as Promise<Tenant[]>,
    get: async function () {
      const check = await dbVersionSupport.supportsTenantsGetGRPCMethod();
      return check.supports ? getGRPC() : getREST();
    },
    getByNames: (tenants: (string | TenantInput)[]) => getGRPC(tenants.map(parseStringOrTenant)),
    getByName: (tenant: string | TenantInput) => {
      const tenantName = parseStringOrTenant(tenant);
      return getGRPC([tenantName]).then((tenants) => tenants[tenantName] || null);
    },
    remove: (tenants: TenantInput | TenantInput[]) =>
      new TenantsDeleter(
        connection,
        collection,
        parseTenantOrTenantArray(tenants).map((t) => t.name)
      ).do(),
    update: (tenants: TenantInput | TenantInput[]) =>
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
   * @param {TenantInput | TenantInput[]} tenants The tenant or tenants to create.
   * @returns {Promise<Tenant[]>} The created tenant(s) as a list of Tenant.
   */
  create: (tenants: TenantInput | TenantInput[]) => Promise<Tenant[]>;
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
   * @param {(string | TenantInput)[]} names The tenants to retrieve.
   * @returns {Promise<Tenant[]>} The list of tenants. If the tenant does not exist, it will not be included in the list.
   */
  getByNames: (names: (string | TenantInput)[]) => Promise<Record<string, Tenant>>;
  /**
   * Return the specified tenant from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {string | TenantInput} name The name of the tenant to retrieve.
   * @returns {Promise<Tenant | null>} The tenant as a Tenant type, or null if the tenant does not exist.
   */
  getByName: (name: string | TenantInput) => Promise<Tenant | null>;
  /**
   * Remove the specified tenants from a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {Tenant | Tenant[]} tenants The tenant or tenants to remove.
   * @returns {Promise<void>} An empty promise.
   */
  remove: (tenants: TenantInput | TenantInput[]) => Promise<void>;
  /**
   * Update the specified tenants for a collection in Weaviate.
   *
   * The collection must have been created with multi-tenancy enabled.
   *
   * @param {TenantInput | TenantInput[]} tenants The tenant or tenants to update.
   * @returns {Promise<Tenant[]>} The updated tenant(s) as a list of Tenant.
   */
  update: (tenants: TenantInput | TenantInput[]) => Promise<Tenant[]>;
}
