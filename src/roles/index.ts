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
  User,
} from './types.js';
import { Map } from './util.js';

export interface Roles {
  listAll: () => Promise<Record<string, Role>>;
  ofCurrentUser: () => Promise<Record<string, Role>>;
  byName: (roleName: string) => Promise<Role | null>;
  byUser: (user: string) => Promise<Record<string, Role>>;
  assignedUsers: (roleName: string) => Promise<Record<string, User>>;
  delete: (roleName: string) => Promise<void>;
  create: (roleName: string, permissions: PermissionsInput) => Promise<Role>;
  assignToUser: (roleNames: string | string[], user: string) => Promise<void>;
  exists: (roleName: string) => Promise<boolean>;
  revokeFromUser: (roleNames: string | string[], user: string) => Promise<void>;
  addPermissions: (roleName: string, permissions: PermissionsInput) => Promise<void>;
  removePermissions: (roleName: string, permissions: PermissionsInput) => Promise<void>;
  hasPermission: (roleName: string, permission: Permission) => Promise<boolean>;
}

const roles = (connection: ConnectionREST): Roles => {
  return {
    listAll: () => connection.get<WeaviateRole[]>('/authz/roles').then(Map.roles),
    ofCurrentUser: () => connection.get<WeaviateRole[]>('/authz/users/own-roles').then(Map.roles),
    byName: (roleName: string) =>
      connection.get<WeaviateRole>(`/authz/roles/${roleName}`).then(Map.roleFromWeaviate),
    byUser: (user: string) => connection.get<WeaviateRole[]>(`/authz/users/${user}/roles`).then(Map.roles),
    assignedUsers: (roleName: string) =>
      connection.get<string[]>(`/authz/roles/${roleName}/users`).then(Map.users),
    create: (roleName: string, permissions: PermissionsInput) => {
      const perms = Map.flattenPermissions(permissions).map(Map.permissionToWeaviate);
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
    assignToUser: (roleNames: string | string[], user: string) =>
      connection.postEmpty(`/authz/users/${user}/assign`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
    revokeFromUser: (roleNames: string | string[], user: string) =>
      connection.postEmpty(`/authz/users/${user}/revoke`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
    addPermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/add-permissions`, { permissions }),
    removePermissions: (roleName: string, permissions: PermissionsInput) =>
      connection.postEmpty(`/authz/roles/${roleName}/remove-permissions`, { permissions }),
    hasPermission: (roleName: string, permission: Permission) =>
      connection.postReturn<WeaviatePermission, boolean>(
        `/authz/roles/${roleName}/has-permission`,
        Map.permissionToWeaviate(permission)
      ),
  };
};

export const permissions = {
  backup: (args: { collection: string | string[]; manage?: boolean }): BackupsPermission[] => {
    const collections = Array.isArray(args.collection) ? args.collection : [args.collection];
    return collections.flatMap((collection) => {
      const out: BackupsPermission[] = [];
      if (args.manage) {
        out.push({ collection, action: 'manage_backups' });
      }
      return out;
    });
  },
  cluster: (args: { read?: boolean }): ClusterPermission[] => {
    const out: ClusterPermission[] = [];
    if (args.read) {
      out.push({ action: 'read_cluster' });
    }
    return out;
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
      const out: CollectionsPermission[] = [];
      if (args.create_collection) {
        out.push({ collection, action: 'create_collections' });
      }
      if (args.read_config) {
        out.push({ collection, action: 'read_collections' });
      }
      if (args.update_config) {
        out.push({ collection, action: 'update_collections' });
      }
      if (args.delete_collection) {
        out.push({ collection, action: 'delete_collections' });
      }
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
      const out: DataPermission[] = [];
      if (args.create) {
        out.push({ collection, action: 'create_data' });
      }
      if (args.read) {
        out.push({ collection, action: 'read_data' });
      }
      if (args.update) {
        out.push({ collection, action: 'update_data' });
      }
      if (args.delete) {
        out.push({ collection, action: 'delete_data' });
      }
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
      const out: NodesPermission[] = [];
      if (args.read) {
        out.push({ collection, action: 'read_nodes', verbosity: args.verbosity || 'verbose' });
      }
      return out;
    });
  },
  roles: (args: { role: string | string[]; read?: boolean; manage?: boolean }): RolesPermission[] => {
    const roles = Array.isArray(args.role) ? args.role : [args.role];
    return roles.flatMap((role) => {
      const out: RolesPermission[] = [];
      if (args.read) {
        out.push({ role, action: 'read_roles' });
      }
      if (args.manage) {
        out.push({ role, action: 'manage_roles' });
      }
      return out;
    });
  },
};

export default roles;
