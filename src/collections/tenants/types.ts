/** The base type for a tenant. Only the name is required. */
export type TenantBase = {
  /** The name of the tenant. */
  name: string;
};

/** The expected type when creating a tenant. */
export type TenantCreate = TenantBase & {
  /** The activity status of the tenant. Defaults to 'ACTIVE' if not provided. */
  activityStatus?: 'ACTIVE' | 'INACTIVE';
};

/** The expected type when updating a tenant. */
export type TenantUpdate = TenantBase & {
  /** The activity status of the tenant. Must be set to one of the options. */
  activityStatus: 'ACTIVE' | 'INACTIVE' | 'OFFLOADED';
};

/** The expected type when getting tenants. */
export type TenantsGetOptions = {
  tenants?: string;
};

/**
 * The expected type returned by all tenant methods.
 *
 * WARNING: The `COLD` and `HOT` statuses are deprecated and will be replaced in a future release.
 * See the docstring for the `activityStatus` field in this type for more information.
 */
export type Tenant = TenantBase & {
  /**
   * `COLD` and `HOT` are included for backwards compatability purposes and are deprecated.
   *
   * In a future release, these will be removed in favour of the new statuses as so:
   * - `HOT` -> `ACTIVE`
   * - `COLD` -> `INACTIVE`
   */
  activityStatus: 'COLD' | 'HOT' | 'OFFLOADED' | 'OFFLOADING' | 'ONLOADING';
};
