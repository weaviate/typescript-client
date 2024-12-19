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
export type RolesAction = Extract<Action, 'manage_roles' | 'read_roles'>;

export type BackupsPermission = {
  collection: string;
  action: BackupsAction;
};

export type ClusterPermission = {
  action: ClusterAction;
};

export type CollectionsPermission = {
  collection: string;
  action: CollectionsAction;
};

export type DataPermission = {
  collection: string;
  action: DataAction;
};

export type NodesPermission = {
  collection: string;
  verbosity: 'verbose' | 'minimal';
  action: NodesAction;
};

export type RolesPermission = {
  role: string;
  action: RolesAction;
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

export type User = {
  name: string;
};

export type Permission =
  | BackupsPermission
  | ClusterPermission
  | CollectionsPermission
  | DataPermission
  | NodesPermission
  | RolesPermission;

export type PermissionsInput = Permission | Permission[] | Permission[][] | (Permission | Permission[])[];
