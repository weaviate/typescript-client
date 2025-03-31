import { ConnectionREST } from '../index.js';
import { Role as WeaviateRole, WeaviateUserTypeInternal as UserTypeInternal, WeaviateUser, WeaviateDBUser } from '../openapi/types.js';
import { Role } from '../roles/types.js';
import { Map } from '../roles/util.js';
import { User, UserDB } from './types.js';

/**
* Operations supported for 'db', 'oidc', and legacy (non-namespaced) users.
* Use respective implementations in `users.db` and `users.oidc`, and `users`.
*/
interface UsersBase {
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

export interface Users extends UsersBase {
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

  db: DBUsers,
  oidc: OIDCUsers,
}

/** Operations supported for namespaced 'db' users.*/
export interface DBUsers extends UsersBase {
  /**
   * Retrieve the roles assigned to a user.
   *
   * @param {string} userId The ID of the user to retrieve the assigned roles for.
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  getAssignedRoles: (userId: string, includePermissions?: boolean) => Promise<Record<string, Role>>;

  create: (userId: string) => Promise<string>;
  delete: (userId: string) => Promise<boolean>;
  rotateKey: (userId: string) => Promise<string>;
  activate: (userId: string) => Promise<boolean>;
  deactivate: (userId: string) => Promise<boolean>;
  byName: (userId: string) => Promise<UserDB>;
  listAll: () => Promise<UserDB[]>;
}

/** Operations supported for namespaced 'oidc' users.*/
export interface OIDCUsers extends UsersBase {
  /**
   * Retrieve the roles assigned to a user.
   *
   * @param {string} userId The ID of the user to retrieve the assigned roles for.
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  getAssignedRoles: (userId: string, includePermissions?: boolean) => Promise<Record<string, Role>>;
}

const users = (connection: ConnectionREST): Users => {
  const ns = namespaced(connection);

  return {
    getMyUser: () => connection.get<WeaviateUser>('/users/own-info').then(Map.user),
    getAssignedRoles: (userId: string) =>
      connection.get<WeaviateRole[]>(`/authz/users/${userId}/roles`).then(Map.roles),
    assignRoles: (roleNames: string | string[], userId: string) =>
      ns.assignRoles(roleNames, userId),
    revokeRoles: (roleNames: string | string[], userId: string) =>
      ns.revokeRoles(roleNames, userId),
    db: db(connection),
    oidc: oidc(connection),
  };
};

const db = (connection: ConnectionREST): DBUsers => {
  const ns = namespaced(connection);

  type APIKeyResponse = { apiKey: string };
  return {
    getAssignedRoles: (userId: string, includePermissions?: boolean) => ns.getAssignedRoles(userId, 'db', includePermissions),
    assignRoles: (roleNames: string | string[], userId: string) => ns.assignRoles(roleNames, userId, 'db'),
    revokeRoles: (roleNames: string | string[], userId: string) => ns.revokeRoles(roleNames, userId, 'db'),

    create: (userId: string) => connection.postNoBody<APIKeyResponse>(`/users/db/${userId}`)
      .then(resp => resp.apiKey),
    delete: (userId: string) => connection.delete(`/users/db/${userId}`, null)
      .then(() => true).catch(() => false),
    rotateKey: (userId: string) => connection.postNoBody<APIKeyResponse>(`users/db/${userId}/rotate-key`)
      .then(resp => resp.apiKey),
    activate: (userId: string) => connection.postNoBody(`/users/db/${userId}/activate`)
      .then(() => true).catch(reason => reason.code !== undefined ? reason.code === 409 : false),
    deactivate: (userId: string) => connection.postNoBody(`/users/db/${userId}/deactivate`)
      .then(() => true).catch(reason => reason.code !== undefined ? reason.code === 409 : false),
    byName: (userId: string) => connection.get<WeaviateDBUser>(`/users/db/${userId}`, true).then(Map.dbUser),
    listAll: () => connection.get<WeaviateDBUser[]>('/users/db', true).then(Map.dbUsers),
  };
}

const oidc = (connection: ConnectionREST): OIDCUsers => {
  const ns = namespaced(connection);
  return {
    getAssignedRoles: (userId: string, includePermissions?: boolean) => ns.getAssignedRoles(userId, 'oidc', includePermissions),
    assignRoles: (roleNames: string | string[], userId: string) => ns.assignRoles(roleNames, userId, 'oidc'),
    revokeRoles: (roleNames: string | string[], userId: string) => ns.revokeRoles(roleNames, userId, 'oidc'),
  };
}

// TODO: see if we can extend definitions of UsersBase with additional UserType arg
/** Internal interface for operations that MAY accept a 'db'/'oidc' namespace. */
interface NamespacedUsers {
  getAssignedRoles: (userId: string, userType: UserTypeInternal, includePermissions?: boolean) => Promise<Record<string, Role>>;
  assignRoles: (roleNames: string | string[], userId: string, userType?: UserTypeInternal) => Promise<void>;
  revokeRoles: (roleNames: string | string[], userId: string, userType?: UserTypeInternal) => Promise<void>;
}

const namespaced = (connection: ConnectionREST): NamespacedUsers => {
  return {
    getAssignedRoles: (userId: string, userType: UserTypeInternal, includePermissions?: boolean) =>
      connection.get<WeaviateRole[]>(
        `/authz/users/${userId}/roles/${userType}${includePermissions ? '?&includeFullRoles=true' : ''}`
      ).then(Map.roles),
    assignRoles: (roleNames: string | string[], userId: string, userType?: UserTypeInternal) =>
      connection.postEmpty(`/authz/users/${userId}/assign`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
        userType: userType
      }),
    revokeRoles: (roleNames: string | string[], userId: string, userType?: UserTypeInternal) =>
      connection.postEmpty(`/authz/users/${userId}/revoke`, {
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
        userType: userType,
      }),
  };
};


export default users;
