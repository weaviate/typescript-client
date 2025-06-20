import { ConnectionREST } from '../connection/index.js';
import {
  WeaviateAssignedUser,
  Permission as WeaviatePermission,
  Role as WeaviateRole,
} from '../openapi/types.js';
import {
  BackupsPermission,
  ClusterPermission,
  CollectionsPermission,
  DataPermission,
  NodesPermission,
  Permission,
  PermissionsInput,
  Role,
  RolesPermission,
  TenantsPermission,
  UserAssignment,
  UsersPermission,
} from './types.js';
import { Map } from './util.js';

export interface Roles {
  /**
   * Retrieve all the roles in the system.
   *
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  listAll: () => Promise<Record<string, Role>>;
  /**
   * Retrieve a role by its name.
   *
   * @param {string} roleName The name of the role to retrieve.
   * @returns {Promise<Role | null>} The role if it exists, or null if it does not.
   */
  byName: (roleName: string) => Promise<Role | null>;

  /**
   * Retrieve the user IDs assigned to a role.
   *
   * @param {string} roleName The name of the role to retrieve the assigned user IDs for.
   * @returns {Promise<string[]>} The user IDs assigned to the role.
   *
   * @deprecated: Use `userAssignments` instead.
   */
  assignedUserIds: (roleName: string) => Promise<string[]>;
  /**
   * Retrieve the user IDs assigned to a role. Each user has a qualifying user type,
   * e.g. `'db_user' | 'db_env_user' | 'oidc'`.
   *
   * Note, unlike `assignedUserIds`, this method may return multiple entries for the same username,
   * if OIDC authentication is enabled: once with 'db_*' and once with 'oidc' user type.
   *
   * @param {string} roleName The name of the role to retrieve the assigned user IDs for.
   * @returns {Promise<UserAssignment[]>} User IDs and user types assigned to the role.
   */
  userAssignments: (roleName: string) => Promise<UserAssignment[]>;
  /**
   * Delete a role by its name.
   *
   * @param {string} roleName The name of the role to delete.
   * @returns {Promise<void>} A promise that resolves when the role is deleted.
   */
  delete: (roleName: string) => Promise<void>;
  /**
   * Create a new role.
   *
   * @param {string} roleName The name of the new role.
   * @param {PermissionsInput} permissions The permissions to assign to the new role.
   * @returns {Promise<Role>} The newly created role.
   */
  create: (roleName: string, permissions: PermissionsInput) => Promise<Role>;
  /**
   * Check if a role exists.
   *
   * @param {string} roleName The name of the role to check for.
   * @returns {Promise<boolean>} A promise that resolves to true if the role exists, or false if it does not.
   */
  exists: (roleName: string) => Promise<boolean>;
  /**
   * Add permissions to a role.
   *
   * @param {string} roleName The name of the role to add permissions to.
   * @param {PermissionsInput} permissions The permissions to add.
   * @returns {Promise<void>} A promise that resolves when the permissions are added.
   */
  addPermissions: (roleName: string, permissions: PermissionsInput) => Promise<void>;
  /**
   * Remove permissions from a role.
   *
   * @param {string} roleName The name of the role to remove permissions from.
   * @param {PermissionsInput} permissions The permissions to remove.
   * @returns {Promise<void>} A promise that resolves when the permissions are removed.
   */
  removePermissions: (roleName: string, permissions: PermissionsInput) => Promise<void>;
  /**
   * Check if a role has the specified permissions.
   *
   * @param {string} roleName The name of the role to check.
   * @param {Permission | Permission[]} permission The permission or permissions to check for.
   * @returns {Promise<boolean>} A promise that resolves to true if the role has the permissions, or false if it does not.
   */
  hasPermissions: (roleName: string, permission: Permission | Permission[]) => Promise<boolean>;
}

const roles = (connection: ConnectionREST): Roles => {
  return {
    listAll: () => connection.get<WeaviateRole[]>('/authz/roles').then(Map.roles),
    byName: (roleName: string) =>
      connection.get<WeaviateRole>(`/authz/roles/${roleName}`).then(Map.roleFromWeaviate),
    assignedUserIds: (roleName: string) => connection.get<string[]>(`/authz/roles/${roleName}/users`),
    userAssignments: (roleName: string) =>
      connection
        .get<WeaviateAssignedUser[]>(`/authz/roles/${roleName}/user-assignments`, true)
        .then(Map.assignedUsers),
    create: (roleName: string, permissions?: PermissionsInput) => {
      const perms = permissions
        ? Map.flattenPermissions(permissions).flatMap(Map.permissionToWeaviate)
        : undefined;
      return connection
        .postEmpty('/authz/roles', {
          name: roleName,
          permissions: perms,
        })
        .then(() => Map.roleFromWeaviate({ name: roleName, permissions: perms || [] }));
    },
    delete: (roleName: string) => connection.delete(`/authz/roles/${roleName}`, null),
    exists: (roleName: string) =>
      connection
        .get(`/authz/roles/${roleName}`)
        .then(() => true)
        .catch(() => false),
    addPermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/add-permissions`, {
        permissions: Map.flattenPermissions(permissions).flatMap(Map.permissionToWeaviate),
      }),
    removePermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/remove-permissions`, {
        permissions: Map.flattenPermissions(permissions).flatMap(Map.permissionToWeaviate),
      }),
    hasPermissions: (roleName: string, permission: Permission | Permission[]) =>
      Promise.all(
        (Array.isArray(permission) ? permission : [permission])
          .flatMap((p) => Map.permissionToWeaviate(p))
          .map((p) =>
            connection.postReturn<WeaviatePermission, boolean>(`/authz/roles/${roleName}/has-permission`, p)
          )
      ).then((r) => r.every((b) => b)),
  };
};

export const permissions = {
  /**
   * Create a set of permissions specific to Weaviate's backup functionality.
   *
   * For all collections, provide the `collection` argument as `'*'`.
   *
   * @param {string | string[]} args.collection The collection or collections to create permissions for.
   * @param {boolean} [args.manage] Whether to allow managing backups. Defaults to `false`.
   * @returns {BackupsPermission[]} The permissions for the specified collections.
   */
  backup: (args: { collection: string | string[]; manage?: boolean }): BackupsPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: BackupsPermission = { collection, actions: [] };
      if (args.manage) out.actions.push('manage_backups');
      return out;
    });
  },
  /**
   * Create a set of permissions specific to Weaviate's cluster endpoints.
   *
   * @param {boolean} [args.read] Whether to allow reading cluster information. Defaults to `false`.
   */
  cluster: (args: { read?: boolean }): ClusterPermission[] => {
    const out: ClusterPermission = { actions: [] };
    if (args.read) out.actions.push('read_cluster');
    return [out];
  },
  /**
   * Create a set of permissions specific to any operations involving collections.
   *
   * For all collections, provide the `collection` argument as `'*'`.
   *
   * @param {string | string[]} args.collection The collection or collections to create permissions for.
   * @param {boolean} [args.create_collection] Whether to allow creating collections. Defaults to `false`.
   * @param {boolean} [args.read_config] Whether to allow reading collection configurations. Defaults to `false`.
   * @param {boolean} [args.update_config] Whether to allow updating collection configurations. Defaults to `false`.
   * @param {boolean} [args.delete_collection] Whether to allow deleting collections. Defaults to `false`.
   */
  collections: (args: {
    collection: string | string[];
    create_collection?: boolean;
    read_config?: boolean;
    update_config?: boolean;
    delete_collection?: boolean;
  }): CollectionsPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: CollectionsPermission = { collection, actions: [] };
      if (args.create_collection) out.actions.push('create_collections');
      if (args.read_config) out.actions.push('read_collections');
      if (args.update_config) out.actions.push('update_collections');
      if (args.delete_collection) out.actions.push('delete_collections');
      return out;
    });
  },
  /**
   * Create a set of permissions specific to any operations involving objects within collections and tenants.
   *
   * For all collections, provide the `collection` argument as `'*'`.
   * For all tenants, provide the `tenant` argument as `'*'`.
   *
   * Providing arrays of collections and tenants will create permissions for each combination of collection and tenant.
   * E.g., `data({ collection: ['A', 'B'], tenant: ['X', 'Y'] })` will create permissions for tenants `X` and `Y` in both collections `A` and `B`.
   *
   * @param {string | string[]} args.collection The collection or collections to create permissions for.
   * @param {string | string[]} [args.tenant] The tenant or tenants to create permissions for. Defaults to `'*'`.
   * @param {boolean} [args.create] Whether to allow creating objects. Defaults to `false`.
   * @param {boolean} [args.read] Whether to allow reading objects. Defaults to `false`.
   * @param {boolean} [args.update] Whether to allow updating objects. Defaults to `false`.
   * @param {boolean} [args.delete] Whether to allow deleting objects. Defaults to `false`.
   */
  data: (args: {
    collection: string | string[];
    tenant?: string | string[];
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }): DataPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    const tenants = Array.isArray(args.tenant) ? args.tenant : [args.tenant ?? '*'];
    const combinations = collections.flatMap((collection) =>
      tenants.map((tenant) => ({ collection, tenant }))
    );
    return combinations.flatMap(({ collection, tenant }) => {
      const out: DataPermission = { collection, tenant, actions: [] };
      if (args.create) out.actions.push('create_data');
      if (args.read) out.actions.push('read_data');
      if (args.update) out.actions.push('update_data');
      if (args.delete) out.actions.push('delete_data');
      return out;
    });
  },
  /**
   * This namespace contains methods to create permissions specific to nodes.
   */
  nodes: {
    /**
     * Create a set of permissions specific to reading nodes with verbosity set to `minimal`.
     *
     * @param {boolean} [args.read] Whether to allow reading nodes. Defaults to `false`.
     * @returns {NodesPermission[]} The permissions for reading nodes.
     */
    minimal: (args: { read?: boolean }): NodesPermission[] => {
      const out: NodesPermission = {
        collection: '*',
        actions: [],
        verbosity: 'minimal',
      };
      if (args.read) out.actions.push('read_nodes');
      return [out];
    },
    /**
     * Create a set of permissions specific to reading nodes with verbosity set to `verbose`.
     *
     * @param {string | string[]} args.collection The collection or collections to create permissions for.
     * @param {boolean} [args.read] Whether to allow reading nodes. Defaults to `false`.
     * @returns {NodesPermission[]} The permissions for reading nodes.
     */
    verbose: (args: { collection: string | string[]; read?: boolean }): NodesPermission[] => {
      const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
      return collections.flatMap((collection) => {
        const out: NodesPermission = {
          collection,
          actions: [],
          verbosity: 'verbose',
        };
        if (args.read) out.actions.push('read_nodes');
        return out;
      });
    },
  },
  /**
   * Create a set of permissions specific to any operations involving roles.
   *
   * @param {string | string[]} args.role The role or roles to create permissions for.
   * @param {boolean} [args.create] Whether to allow creating roles. Defaults to `false`.
   * @param {boolean} [args.read] Whether to allow reading roles. Defaults to `false`.
   * @param {boolean} [args.update] Whether to allow updating roles. Defaults to `false`.
   * @param {boolean} [args.delete] Whether to allow deleting roles. Defaults to `false`.
   * @returns {RolesPermission[]} The permissions for the specified roles.
   */
  roles: (args: {
    role: string | string[];
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }): RolesPermission[] => {
    const roles = Array.isArray(args.role) ? args.role : [args.role];
    return roles.flatMap((role) => {
      const out: RolesPermission = { role, actions: [] };
      if (args.create) out.actions.push('create_roles');
      if (args.read) out.actions.push('read_roles');
      if (args.update) out.actions.push('update_roles');
      if (args.delete) out.actions.push('delete_roles');
      return out;
    });
  },
  /**
   * Create a set of permissions specific to any operations involving tenants.
   *
   * For all collections, provide the `collection` argument as `'*'`.
   * For all tenants, provide the `tenant` argument as `'*'`.
   *
   * Providing arrays of collections and tenants will create permissions for each combination of collection and tenant.
   * E.g., `tenants({ collection: ['A', 'B'], tenant: ['X', 'Y'] })` will create permissions for tenants `X` and `Y` in both collections `A` and `B`.
   *
   * @param {string | string[] | Record<string, string | string[]>} args.collection The collection or collections to create permissions for.
   * @param {string | string[]} [args.tenant] The tenant or tenants to create permissions for. Defaults to `'*'`.
   * @param {boolean} [args.create] Whether to allow creating tenants. Defaults to `false`.
   * @param {boolean} [args.read] Whether to allow reading tenants. Defaults to `false`.
   * @param {boolean} [args.update] Whether to allow updating tenants. Defaults to `false`.
   * @param {boolean} [args.delete] Whether to allow deleting tenants. Defaults to `false`.
   * @returns {TenantsPermission[]} The permissions for the specified tenants.
   */
  tenants: (args: {
    collection: string | string[];
    tenant?: string | string[];
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }): TenantsPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    const tenants = Array.isArray(args.tenant) ? args.tenant : [args.tenant ?? '*'];
    const combinations = collections.flatMap((collection) =>
      tenants.map((tenant) => ({ collection, tenant }))
    );
    return combinations.flatMap(({ collection, tenant }) => {
      const out: TenantsPermission = { collection, tenant, actions: [] };
      if (args.create) out.actions.push('create_tenants');
      if (args.read) out.actions.push('read_tenants');
      if (args.update) out.actions.push('update_tenants');
      if (args.delete) out.actions.push('delete_tenants');
      return out;
    });
  },
  /**
   * Create a set of permissions specific to any operations involving users.
   *
   * @param {string | string[]} args.user The user or users to create permissions for.
   * @param {boolean} [args.assignAndRevoke] Whether to allow assigning and revoking users. Defaults to `false`.
   * @param {boolean} [args.read] Whether to allow reading users. Defaults to `false`.
   * @returns {UsersPermission[]} The permissions for the specified users.
   */
  users: (args: {
    user: string | string[];
    assignAndRevoke?: boolean;
    read?: boolean;
  }): UsersPermission[] => {
    const users = Array.isArray(args.user) ? args.user : [args.user];
    return users.flatMap((user) => {
      const out: UsersPermission = { users: user, actions: [] };
      if (args.assignAndRevoke) out.actions.push('assign_and_revoke_users');
      if (args.read) out.actions.push('read_users');
      return out;
    });
  },
};

export default roles;
