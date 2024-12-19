import { Permission as WeaviatePermission, Role as WeaviateRole } from '../openapi/types.js';
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
  User,
} from './types.js';

export class PermissionGuards {
  static isBackups = (permission: Permission): permission is BackupsPermission =>
    (permission as BackupsPermission).action === 'manage_backups';
  static isCluster = (permission: Permission): permission is ClusterPermission =>
    (permission as ClusterPermission).action === 'read_cluster';
  static isCollections = (permission: Permission): permission is CollectionsPermission =>
    [
      'create_collections',
      'delete_collections',
      'read_collections',
      'update_collections',
      'manage_collections',
    ].includes((permission as CollectionsPermission).action);
  static isData = (permission: Permission): permission is DataPermission =>
    ['create_data', 'delete_data', 'read_data', 'update_data', 'manage_data'].includes(
      (permission as DataPermission).action
    );
  static isNodes = (permission: Permission): permission is NodesPermission =>
    (permission as NodesPermission).action === 'read_nodes';
  static isRoles = (permission: Permission): permission is RolesPermission =>
    (permission as RolesPermission).action === 'manage_roles';
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

  static permissionToWeaviate = (permission: Permission): WeaviatePermission => {
    if (PermissionGuards.isBackups(permission)) {
      return { backups: { collection: permission.collection }, action: permission.action };
    } else if (PermissionGuards.isCluster(permission)) {
      return { action: permission.action };
    } else if (PermissionGuards.isCollections(permission)) {
      return { collections: { collection: permission.collection }, action: permission.action };
    } else if (PermissionGuards.isData(permission)) {
      return { data: { collection: permission.collection }, action: permission.action };
    } else if (PermissionGuards.isNodes(permission)) {
      return {
        nodes: { collection: permission.collection, verbosity: permission.verbosity },
        action: permission.action,
      };
    } else if (PermissionGuards.isRoles(permission)) {
      return { roles: { role: permission.role }, action: permission.action };
    } else {
      throw new Error(`Unknown permission type: ${permission}`);
    }
  };

  static roleFromWeaviate = (role: WeaviateRole): Role => {
    const out: Role = {
      name: role.name,
      backupsPermissions: [],
      clusterPermissions: [],
      collectionsPermissions: [],
      dataPermissions: [],
      nodesPermissions: [],
      rolesPermissions: [],
    };
    role.permissions.forEach((permission) => {
      if (permission.backups !== undefined) {
        if (permission.backups.collection === undefined) {
          throw new Error('Backups permission missing collection');
        }
        out.backupsPermissions.push({
          collection: permission.backups?.collection,
          action: permission.action as BackupsAction,
        });
      } else if (permission.action === 'read_cluster') {
        out.clusterPermissions.push({
          action: permission.action,
        });
      } else if (permission.collections !== undefined) {
        if (permission.collections.collection === undefined) {
          throw new Error('Collections permission missing collection');
        }
        out.collectionsPermissions.push({
          collection: permission.collections.collection,
          action: permission.action as CollectionsAction,
        });
      } else if (permission.data !== undefined) {
        if (permission.data.collection === undefined) {
          throw new Error('Data permission missing collection');
        }
        out.dataPermissions.push({
          collection: permission.data.collection,
          action: permission.action as DataAction,
        });
      } else if (permission.nodes !== undefined) {
        if (permission.nodes.collection === undefined) {
          throw new Error('Nodes permission missing collection');
        }
        if (permission.nodes.verbosity === undefined) {
          throw new Error('Nodes permission missing verbosity');
        }
        out.nodesPermissions.push({
          collection: permission.nodes.collection,
          verbosity: permission.nodes.verbosity,
          action: permission.action as NodesAction,
        });
      } else if (permission.roles !== undefined) {
        if (permission.roles.role === undefined) {
          throw new Error('Roles permission missing role');
        }
        out.rolesPermissions.push({
          role: permission.roles.role,
          action: permission.action as RolesAction,
        });
      }
    });
    return out;
  };

  static roles = (roles: WeaviateRole[]): Record<string, Role> =>
    roles.reduce((acc, role) => {
      acc[role.name] = Map.roleFromWeaviate(role);
      return acc;
    }, {} as Record<string, Role>);

  static users = (users: string[]): Record<string, User> =>
    users.reduce((acc, user) => {
      acc[user] = { name: user };
      return acc;
    }, {} as Record<string, User>);
}
