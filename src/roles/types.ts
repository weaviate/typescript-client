import { Action } from '../openapi/types.js';

export type BackupsAction = Extract<Action, 'manage_backups'>;
export type ClusterAction = Extract<Action, 'read_cluster'>;
export type CollectionsAction = Extract<
  Action,
  | 'create_collections'
  | 'delete_collections'
  | 'read_collections'
  | 'update_collections'
  | 'manage_collections'
>;
export type DataAction = Extract<
  Action,
  'create_data' | 'delete_data' | 'read_data' | 'update_data' | 'manage_data'
>;
export type NodesAction = Extract<Action, 'read_nodes'>;
export type RolesAction = Extract<Action, 'create_roles' | 'read_roles' | 'update_roles' | 'delete_roles'>;

export type BackupsPermission = {
  collection: string;
  actions: BackupsAction[];
};

export type ClusterPermission = {
  actions: ClusterAction[];
};

export type CollectionsPermission = {
  collection: string;
  actions: CollectionsAction[];
};

export type DataPermission = {
  collection: string;
  actions: DataAction[];
};

export type NodesPermission = {
  collection: string;
  verbosity: 'verbose' | 'minimal';
  actions: NodesAction[];
};

export type RolesPermission = {
  role: string;
  actions: RolesAction[];
};

export type Role = {
  name: string;
  backupsPermissions: BackupsPermission[];
  clusterPermissions: ClusterPermission[];
  collectionsPermissions: CollectionsPermission[];
  dataPermissions: DataPermission[];
  nodesPermissions: NodesPermission[];
  rolesPermissions: RolesPermission[];
};

export type Permission =
  | BackupsPermission
  | ClusterPermission
  | CollectionsPermission
  | DataPermission
  | NodesPermission
  | RolesPermission;

export type PermissionsInput = Permission | Permission[] | Permission[][] | (Permission | Permission[])[];
