import { ConnectionREST } from '../index.js';
import { Role as WeaviateRole, WeaviateUser } from '../openapi/types.js';
import { Role } from '../roles/types.js';
import { Map } from '../roles/util.js';
import { User } from './types.js';

export interface Users {
  /**
   * Retrieve the information relevant to the currently authenticated user.
   *
   * @returns {Promise<User>} The user information.
   */
  getMyUser: () => Promise<User>;
  /**
   * Retrieve the roles assigned to a user.
   *
   * @param {string} userId The ID of the user to retrieve the assigned roles for.
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  getAssignedRoles: (userId: string) => Promise<Record<string, Role>>;
  /**
   * Assign roles to a user.
   *
   * @param {string | string[]} roleNames The name or names of the roles to assign.
   * @param {string} userId The ID of the user to assign the roles to.
   * @returns {Promise<void>} A promise that resolves when the roles are assigned.
   */
  assignRoles: (roleNames: string | string[], userId: string) => Promise<void>;
  /**
   * Revoke roles from a user.
   *
   * @param {string | string[]} roleNames The name or names of the roles to revoke.
   * @param {string} userId The ID of the user to revoke the roles from.
   * @returns {Promise<void>} A promise that resolves when the roles are revoked.
   */
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
