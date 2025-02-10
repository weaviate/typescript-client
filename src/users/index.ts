import { ConnectionREST } from '../index.js';
import { Role as WeaviateRole, WeaviateUser } from '../openapi/types.js';
import { Role } from '../roles/types.js';
import { Map } from '../roles/util.js';
import { User } from './types.js';

export interface Users {
  getMyUser: () => Promise<User>;
  getAssignedRoles: (userId: string) => Promise<Record<string, Role>>;
  assignRoles: (roleNames: string | string[], userId: string) => Promise<void>;
  revokeRoles: (roleNames: string | string[], userId: string) => Promise<void>;
}

const users = (connection: ConnectionREST): Users => {
  return {
    getMyUser: () => connection.get<WeaviateUser>('/users/own-info').then(Map.user),
    getAssignedRoles: (userId: string) =>
      connection.get<WeaviateRole[]>(`/authz/users/${userId}/roles`).then(Map.roles),
    assignRoles: (roleNames: string | string[], userId: string) =>
      connection.postEmpty(`/authz/users/${userId}/assign`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
    revokeRoles: (roleNames: string | string[], userId: string) =>
      connection.postEmpty(`/authz/users/${userId}/revoke`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
  };
};

export default users;
