import {
  WeaviateAssignedUser,
  WeaviateDBUser,
  WeaviateGroupAssignment,
  Permission as WeaviatePermission,
  Role as WeaviateRole,
  WeaviateUser,
} from '../openapi/types.js';
import { User, UserDB } from '../users/types.js';
import {
  AliasAction,
  AliasPermission,
  BackupsAction,
  BackupsPermission,
  ClusterAction,
  ClusterPermission,
  CollectionsAction,
  CollectionsPermission,
  DataAction,
  DataPermission,
  GroupAssignment,
  NodesAction,
  NodesPermission,
  Permission,
  PermissionsInput,
  Role,
  RolesAction,
  RolesPermission,
  TenantsAction,
  TenantsPermission,
  UserAssignment,
  UsersAction,
  UsersPermission,
} from './types.js';

/** ZERO_TIME is the timestamp Weaviate server sends in abscence of a value (null value). */
const ZERO_TIME = '0001-01-01T00:00:00.000Z';

export class PermissionGuards {
  private static includes = <A extends string>(permission: Permission, ...actions: A[]): boolean =>
    actions.filter((a) => Array.from<string>(permission.actions).includes(a)).length > 0;
  static isAlias = (permission: Permission): permission is AliasPermission =>
    PermissionGuards.includes<AliasAction>(
      permission,
      'create_aliases',
      'read_aliases',
      'update_aliases',
      'delete_aliases'
    );
  static isBackups = (permission: Permission): permission is BackupsPermission =>
    PermissionGuards.includes<BackupsAction>(permission, 'manage_backups');
  static isCluster = (permission: Permission): permission is ClusterPermission =>
    PermissionGuards.includes<ClusterAction>(permission, 'read_cluster');
  static isCollections = (permission: Permission): permission is CollectionsPermission =>
    PermissionGuards.includes<CollectionsAction>(
      permission,
      'create_collections',
      'delete_collections',
      'read_collections',
      'update_collections'
    );
  static isData = (permission: Permission): permission is DataPermission =>
    PermissionGuards.includes<DataAction>(
      permission,
      'create_data',
      'delete_data',
      'read_data',
      'update_data'
    );
  static isNodes = (permission: Permission): permission is NodesPermission =>
    PermissionGuards.includes<NodesAction>(permission, 'read_nodes');
  static isRoles = (permission: Permission): permission is RolesPermission =>
    PermissionGuards.includes<RolesAction>(
      permission,
      'create_roles',
      'read_roles',
      'update_roles',
      'delete_roles'
    );
  static isTenants = (permission: Permission): permission is TenantsPermission =>
    PermissionGuards.includes<TenantsAction>(
      permission,
      'create_tenants',
      'delete_tenants',
      'read_tenants',
      'update_tenants'
    );
  static isUsers = (permission: Permission): permission is UsersPermission =>
    PermissionGuards.includes<UsersAction>(permission, 'read_users', 'assign_and_revoke_users');
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
    if (PermissionGuards.isAlias(permission)) {
      return Array.from(permission.actions).map((action) => ({
        aliases: permission,
        action,
      }));
    }
    if (PermissionGuards.isBackups(permission)) {
      return Array.from(permission.actions).map((action) => ({
        backups: permission,
        action,
      }));
    } else if (PermissionGuards.isCluster(permission)) {
      return Array.from(permission.actions).map((action) => ({ action }));
    } else if (PermissionGuards.isCollections(permission)) {
      return Array.from(permission.actions).map((action) => ({
        collections: permission,
        action,
      }));
    } else if (PermissionGuards.isData(permission)) {
      return Array.from(permission.actions).map((action) => ({
        data: permission,
        action,
      }));
    } else if (PermissionGuards.isNodes(permission)) {
      return Array.from(permission.actions).map((action) => ({
        nodes: permission,
        action,
      }));
    } else if (PermissionGuards.isRoles(permission)) {
      return Array.from(permission.actions).map((action) => ({ roles: permission, action }));
    } else if (PermissionGuards.isTenants(permission)) {
      return Array.from(permission.actions).map((action) => ({
        tenants: permission,
        action,
      }));
    } else if (PermissionGuards.isUsers(permission)) {
      return Array.from(permission.actions).map((action) => ({ users: permission, action }));
    } else {
      throw new Error(`Unknown permission type: ${JSON.stringify(permission, null, 2)}`);
    }
  };

  static roleFromWeaviate = (role: WeaviateRole): Role => PermissionsMapping.use(role).map();

  static roles = (roles: WeaviateRole[]): Record<string, Role> =>
    roles.reduce(
      (acc, role) => ({
        ...acc,
        [role.name]: Map.roleFromWeaviate(role),
      }),
      {} as Record<string, Role>
    );

  static groupsAssignments = (groups: WeaviateGroupAssignment[]): GroupAssignment[] =>
    groups.map((g) => ({
      groupID: g.groupId || '',
      groupType: g.groupType,
    }));

  static users = (users: string[]): Record<string, User> =>
    users.reduce(
      (acc, user) => ({
        ...acc,
        [user]: { id: user },
      }),
      {} as Record<string, User>
    );
  static user = (user: WeaviateUser): User => ({
    id: user.username,
    roles: user.roles?.map(Map.roleFromWeaviate),
  });
  static dbUser = (user: WeaviateDBUser): UserDB => ({
    userType: user.dbUserType,
    id: user.userId,
    roleNames: user.roles,
    active: user.active,
    createdAt: Map.unknownDate(user.createdAt),
    lastUsedAt: Map.unknownDate(user.lastUsedAt),
    apiKeyFirstLetters: user.apiKeyFirstLetters as string,
  });
  static dbUsers = (users: WeaviateDBUser[]): UserDB[] => users.map(Map.dbUser);
  static assignedUsers = (users: WeaviateAssignedUser[]): UserAssignment[] =>
    users.map((user) => ({
      id: user.userId || '',
      userType: user.userType,
    }));
  static unknownDate = (date?: unknown): Date | undefined =>
    date !== undefined && typeof date === 'string' && date !== ZERO_TIME ? new Date(date) : undefined;
}

class PermissionsMapping {
  private mappings: PermissionMappings;
  private role: WeaviateRole;

  private constructor(role: WeaviateRole) {
    this.mappings = {
      aliases: {},
      backups: {},
      cluster: {},
      collections: {},
      data: {},
      nodes: {},
      roles: {},
      tenants: {},
      users: {},
    };
    this.role = role;
  }

  public static use = (role: WeaviateRole) => new PermissionsMapping(role);

  public map = (): Role => {
    // If truncated roles are requested (?includeFullRoles=false),
    // role.permissions are not present.
    if (this.role.permissions !== null) {
      this.role.permissions.forEach(this.permissionFromWeaviate);
    }
    return {
      name: this.role.name,
      aliasPermissions: Object.values(this.mappings.aliases),
      backupsPermissions: Object.values(this.mappings.backups),
      clusterPermissions: Object.values(this.mappings.cluster),
      collectionsPermissions: Object.values(this.mappings.collections),
      dataPermissions: Object.values(this.mappings.data),
      nodesPermissions: Object.values(this.mappings.nodes),
      rolesPermissions: Object.values(this.mappings.roles),
      tenantsPermissions: Object.values(this.mappings.tenants),
      usersPermissions: Object.values(this.mappings.users),
    };
  };

  private aliases = (permission: WeaviatePermission) => {
    if (permission.aliases !== undefined) {
      const { alias, collection } = permission.aliases;
      if (alias === undefined) throw new Error('Alias permission missing an alias');
      if (this.mappings.aliases[alias] === undefined) {
        this.mappings.aliases[alias] = { alias, collection: collection || '*', actions: [] };
      }
      this.mappings.aliases[alias].actions.push(permission.action as AliasAction);
    }
  };

  private backups = (permission: WeaviatePermission) => {
    if (permission.backups !== undefined) {
      const key = permission.backups.collection;
      if (key === undefined) throw new Error('Backups permission missing collection');
      if (this.mappings.backups[key] === undefined)
        this.mappings.backups[key] = { collection: key, actions: [] };
      this.mappings.backups[key].actions.push(permission.action as BackupsAction);
    }
  };

  private cluster = (permission: WeaviatePermission) => {
    if (permission.action === 'read_cluster') {
      if (this.mappings.cluster[''] === undefined) this.mappings.cluster[''] = { actions: [] };
      this.mappings.cluster[''].actions.push('read_cluster');
    }
  };

  private collections = (permission: WeaviatePermission) => {
    if (permission.collections !== undefined) {
      const key = permission.collections.collection;
      if (key === undefined) throw new Error('Collections permission missing collection');
      if (this.mappings.collections[key] === undefined)
        this.mappings.collections[key] = { collection: key, actions: [] };
      this.mappings.collections[key].actions.push(permission.action as CollectionsAction);
    }
  };

  private data = (permission: WeaviatePermission) => {
    if (permission.data !== undefined) {
      const { collection, tenant } = permission.data;
      if (collection === undefined) throw new Error('Data permission missing collection');
      const key = tenant === undefined ? collection : `${collection}#${tenant}`;
      if (this.mappings.data[key] === undefined)
        this.mappings.data[key] = { collection, tenant: tenant || '*', actions: [] };
      this.mappings.data[key].actions.push(permission.action as DataAction);
    }
  };

  private nodes = (permission: WeaviatePermission) => {
    if (permission.nodes !== undefined) {
      let { collection } = permission.nodes;
      const { verbosity } = permission.nodes;
      if (verbosity === undefined) throw new Error('Nodes permission missing verbosity');
      if (verbosity === 'verbose') {
        if (collection === undefined) throw new Error('Nodes permission missing collection');
      } else if (verbosity === 'minimal') collection = '*';
      else throw new Error('Nodes permission missing verbosity');
      const key = `${collection}#${verbosity}`;
      if (this.mappings.nodes[key] === undefined)
        this.mappings.nodes[key] = { collection, verbosity, actions: [] };
      this.mappings.nodes[key].actions.push(permission.action as NodesAction);
    }
  };

  private roles = (permission: WeaviatePermission) => {
    if (permission.roles !== undefined) {
      const key = permission.roles.role;
      if (key === undefined) throw new Error('Roles permission missing role');
      if (this.mappings.roles[key] === undefined) this.mappings.roles[key] = { role: key, actions: [] };
      this.mappings.roles[key].actions.push(permission.action as RolesAction);
    }
  };

  private tenants = (permission: WeaviatePermission) => {
    if (permission.tenants !== undefined) {
      const { collection, tenant } = permission.tenants;
      if (collection === undefined) throw new Error('Tenants permission missing collection');
      const key = tenant === undefined ? collection : `${collection}#${tenant}`;
      if (this.mappings.tenants[key] === undefined)
        this.mappings.tenants[key] = { collection, tenant: tenant || '*', actions: [] };
      this.mappings.tenants[key].actions.push(permission.action as TenantsAction);
    }
  };

  private users = (permission: WeaviatePermission) => {
    if (permission.users !== undefined) {
      const key = permission.users.users;
      if (key === undefined) throw new Error('Users permission missing user');
      if (this.mappings.users[key] === undefined) this.mappings.users[key] = { users: key, actions: [] };
      this.mappings.users[key].actions.push(permission.action as UsersAction);
    }
  };

  private permissionFromWeaviate = (permission: WeaviatePermission) => {
    this.aliases(permission);
    this.backups(permission);
    this.cluster(permission);
    this.collections(permission);
    this.data(permission);
    this.nodes(permission);
    this.roles(permission);
    this.tenants(permission);
    this.users(permission);
  };
}

type PermissionMappings = {
  aliases: Record<string, AliasPermission>;
  backups: Record<string, BackupsPermission>;
  cluster: Record<string, ClusterPermission>;
  collections: Record<string, CollectionsPermission>;
  data: Record<string, DataPermission>;
  nodes: Record<string, NodesPermission>;
  roles: Record<string, RolesPermission>;
  tenants: Record<string, TenantsPermission>;
  users: Record<string, UsersPermission>;
};
