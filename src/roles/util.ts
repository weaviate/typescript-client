import { Permission as WeaviatePermission, Role as WeaviateRole, WeaviateUser } from '../openapi/types.js';
import { User } from '../users/types.js';
import {
  BackupsAction,
  BackupsPermission,
  ClusterPermission,
  CollectionsAction,
  CollectionsPermission,
  DataAction,
  DataPermission,
  NodesAction,
  NodesPermission,
  Permission,
  PermissionsInput,
  Role,
  RolesAction,
  RolesPermission,
} from './types.js';

export class PermissionGuards {
  private static includes = (permission: Permission, ...actions: string[]): boolean =>
    actions.filter((a) => Array.from<string>(permission.actions).includes(a)).length > 0;
  static isBackups = (permission: Permission): permission is BackupsPermission =>
    PermissionGuards.includes(permission, 'manage_backups');
  static isCluster = (permission: Permission): permission is ClusterPermission =>
    PermissionGuards.includes(permission, 'read_cluster');
  static isCollections = (permission: Permission): permission is CollectionsPermission =>
    PermissionGuards.includes(
      permission,
      'create_collections',
      'delete_collections',
      'read_collections',
      'update_collections',
      'manage_collections'
    );
  static isData = (permission: Permission): permission is DataPermission =>
    PermissionGuards.includes(
      permission,
      'create_data',
      'delete_data',
      'read_data',
      'update_data',
      'manage_data'
    );
  static isNodes = (permission: Permission): permission is NodesPermission =>
    PermissionGuards.includes(permission, 'read_nodes');
  static isRoles = (permission: Permission): permission is RolesPermission =>
    PermissionGuards.includes(permission, 'create_role', 'read_roles', 'update_roles', 'delete_roles');
  static isPermission = (permissions: PermissionsInput): permissions is Permission =>
    !Array.isArray(permissions);
  static isPermissionArray = (permissions: PermissionsInput): permissions is Permission[] =>
    Array.isArray(permissions) && permissions.every(PermissionGuards.isPermission);
  static isPermissionMatrix = (permissions: PermissionsInput): permissions is Permission[][] =>
    Array.isArray(permissions) && permissions.every(PermissionGuards.isPermissionArray);
  static isPermissionTuple = (permissions: PermissionsInput): permissions is (Permission | Permission[])[] =>
    Array.isArray(permissions) &&
    permissions.every(
      (permission) =>
        PermissionGuards.isPermission(permission) || PermissionGuards.isPermissionArray(permission)
    );
}

export class Map {
  static flattenPermissions = (permissions: PermissionsInput): Permission[] =>
    !Array.isArray(permissions) ? [permissions] : permissions.flat(2);

  static permissionToWeaviate = (permission: Permission): WeaviatePermission[] => {
    if (PermissionGuards.isBackups(permission)) {
      return Array.from(permission.actions).map((action) => ({
        backups: { collection: permission.collection },
        action,
      }));
    } else if (PermissionGuards.isCluster(permission)) {
      return Array.from(permission.actions).map((action) => ({ action }));
    } else if (PermissionGuards.isCollections(permission)) {
      return Array.from(permission.actions).map((action) => ({
        collections: { collection: permission.collection },
        action,
      }));
    } else if (PermissionGuards.isData(permission)) {
      return Array.from(permission.actions).map((action) => ({
        data: { collection: permission.collection },
        action,
      }));
    } else if (PermissionGuards.isNodes(permission)) {
      return Array.from(permission.actions).map((action) => ({
        nodes: { collection: permission.collection, verbosity: permission.verbosity },
        action,
      }));
    } else if (PermissionGuards.isRoles(permission)) {
      return Array.from(permission.actions).map((action) => ({ roles: { role: permission.role }, action }));
    } else {
      throw new Error(`Unknown permission type: ${JSON.stringify(permission, null, 2)}`);
    }
  };

  static roleFromWeaviate = (role: WeaviateRole): Role => {
    const perms = {
      backups: {} as Record<string, BackupsPermission>,
      cluster: {} as Record<string, ClusterPermission>,
      collections: {} as Record<string, CollectionsPermission>,
      data: {} as Record<string, DataPermission>,
      nodes: {} as Record<string, NodesPermission>,
      roles: {} as Record<string, RolesPermission>,
    };
    role.permissions.forEach((permission) => {
      if (permission.backups !== undefined) {
        const key = permission.backups.collection;
        if (key === undefined) throw new Error('Backups permission missing collection');
        if (perms.backups[key] === undefined) perms.backups[key] = { collection: key, actions: [] };
        perms.backups[key].actions.push(permission.action as BackupsAction);
      } else if (permission.action === 'read_cluster') {
        if (perms.cluster[''] === undefined) perms.cluster[''] = { actions: [] };
        perms.cluster[''].actions.push('read_cluster');
      } else if (permission.collections !== undefined) {
        const key = permission.collections.collection;
        if (key === undefined) throw new Error('Collections permission missing collection');
        if (perms.collections[key] === undefined) perms.collections[key] = { collection: key, actions: [] };
        perms.collections[key].actions.push(permission.action as CollectionsAction);
      } else if (permission.data !== undefined) {
        const key = permission.data.collection;
        if (key === undefined) throw new Error('Data permission missing collection');
        if (perms.data[key] === undefined) perms.data[key] = { collection: key, actions: [] };
        perms.data[key].actions.push(permission.action as DataAction);
      } else if (permission.nodes !== undefined) {
        const { collection, verbosity } = permission.nodes;
        if (collection === undefined) throw new Error('Nodes permission missing collection');
        if (verbosity === undefined) throw new Error('Nodes permission missing verbosity');
        const key = `${collection}#${verbosity}`;
        if (perms.nodes[key] === undefined) perms.nodes[key] = { collection, verbosity, actions: [] };
        perms.nodes[key].actions.push(permission.action as NodesAction);
      } else if (permission.roles !== undefined) {
        const key = permission.roles.role;
        if (key === undefined) throw new Error('Roles permission missing role');
        if (perms.roles[key] === undefined) perms.roles[key] = { role: key, actions: [] };
        perms.roles[key].actions.push(permission.action as RolesAction);
      }
    });
    return {
      name: role.name,
      backupsPermissions: Object.values(perms.backups),
      clusterPermissions: Object.values(perms.cluster),
      collectionsPermissions: Object.values(perms.collections),
      dataPermissions: Object.values(perms.data),
      nodesPermissions: Object.values(perms.nodes),
      rolesPermissions: Object.values(perms.roles),
    };
  };

  static roles = (roles: WeaviateRole[]): Record<string, Role> =>
    roles.reduce((acc, role) => {
      acc[role.name] = Map.roleFromWeaviate(role);
      return acc;
    }, {} as Record<string, Role>);

  static users = (users: string[]): Record<string, User> =>
    users.reduce((acc, user) => {
      acc[user] = { id: user };
      return acc;
    }, {} as Record<string, User>);
  static user = (user: WeaviateUser): User => ({
    id: user.username,
    roles: user.roles?.map(Map.roleFromWeaviate),
  });
}
