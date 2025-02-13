import { ConnectionREST } from '../index.js';
import { Permission as WeaviatePermission, Role as WeaviateRole } from '../openapi/types.js';
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
   */
  assignedUserIds: (roleName: string) => Promise<string[]>;
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
    create: (roleName: string, permissions: PermissionsInput) => {
      const perms = Map.flattenPermissions(permissions).flatMap(Map.permissionToWeaviate);
      return connection
        .postEmpty<WeaviateRole>('/authz/roles', {
          name: roleName,
          permissions: perms,
        })
        .then(() => Map.roleFromWeaviate({ name: roleName, permissions: perms }));
    },
    delete: (roleName: string) => connection.delete(`/authz/roles/${roleName}`, null),
    exists: (roleName: string) =>
      connection
        .get(`/authz/roles/${roleName}`)
        .then(() => true)
        .catch(() => false),
    addPermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/add-permissions`, { permissions }),
    removePermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/remove-permissions`, { permissions }),
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
  backup: (args: { collection: string | string[]; manage?: boolean }): BackupsPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: BackupsPermission = { collection, actions: [] };
      if (args.manage) out.actions.push('manage_backups');
      return out;
    });
  },
  cluster: (args: { read?: boolean }): ClusterPermission[] => {
    const out: ClusterPermission = { actions: [] };
    if (args.read) out.actions.push('read_cluster');
    return [out];
  },
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
  data: (args: {
    collection: string | string[];
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }): DataPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: DataPermission = { collection, actions: [] };
      if (args.create) out.actions.push('create_data');
      if (args.read) out.actions.push('read_data');
      if (args.update) out.actions.push('update_data');
      if (args.delete) out.actions.push('delete_data');
      return out;
    });
  },
  nodes: (args: {
    collection: string | string[];
    verbosity?: 'verbose' | 'minimal';
    read?: boolean;
  }): NodesPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: NodesPermission = {
        collection,
        actions: [],
        verbosity: args.verbosity || 'verbose',
      };
      if (args.read) out.actions.push('read_nodes');
      return out;
    });
  },
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
};

export default roles;
