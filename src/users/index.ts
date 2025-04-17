import { WeaviateUnexpectedStatusCodeError } from '../errors.js';
import { ConnectionREST } from '../index.js';
import {
  WeaviateUserTypeInternal as UserTypeInternal,
  WeaviateDBUser,
  Role as WeaviateRole,
  WeaviateUser,
} from '../openapi/types.js';
import { Role } from '../roles/types.js';
import { Map } from '../roles/util.js';
import {
  AssignRevokeOptions,
  DeactivateOptions,
  GetAssignedRolesOptions,
  GetUserOptions,
  User,
  UserDB,
} from './types.js';

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
  /** @deprecated: Use `users.db.assignRoles` or `users.oidc.assignRoles` instead. */
  assignRoles: (roleNames: string | string[], userId: string) => Promise<void>;
  /** @deprecated: Use `users.db.revokeRoles` or `users.oidc.revokeRoles` instead. */
  revokeRoles: (roleNames: string | string[], userId: string) => Promise<void>;

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
   *
   * @deprecated: Use `users.db.getAssignedRoles` or `users.oidc.getAssignedRoles` instead.
   */
  getAssignedRoles: (userId: string) => Promise<Record<string, Role>>;

  db: DBUsers;
  oidc: OIDCUsers;
}

/** Operations supported for namespaced 'db' users.*/
export interface DBUsers extends UsersBase {
  /**
   * Retrieve the roles assigned to a 'db_user' user.
   *
   * @param {string} userId The ID of the user to retrieve the assigned roles for.
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  getAssignedRoles: (userId: string, opts?: GetAssignedRolesOptions) => Promise<Record<string, Role>>;

  /** Create a new 'db_user' user.
   *
   * @param {string} userId The ID of the user to create. Must consist of valid URL characters only.
   * @returns {Promise<string>} API key for the newly created user.
   */
  create: (userId: string) => Promise<string>;

  /**
   * Delete a 'db_user' user. It is not possible to delete 'db_env_user' users programmatically.
   *
   * @param {string} userId The ID of the user to delete.
   * @returns {Promise<boolean>} `true` if the user has been successfully deleted.
   */
  delete: (userId: string) => Promise<boolean>;

  /**
   * Rotate the API key of a 'db_user' user. The old API key becomes invalid.
   * API keys of 'db_env_user' users are defined in the server's environment
   * and cannot be modified programmatically.
   *
   * @param {string} userId The ID of the user to create a new API key for.
   * @returns {Promise<string>} New API key for the user.
   */
  rotateKey: (userId: string) => Promise<string>;

  /**
   * Activate 'db_user' user.
   *
   * @param {string} userId The ID of the user to activate.
   * @returns {Promise<boolean>} `true` if the user has been successfully activated.
   */
  activate: (userId: string) => Promise<boolean>;

  /**
   * Deactivate 'db_user' user.
   *
   * @param {string} userId The ID of the user to deactivate.
   * @returns {Promise<boolean>} `true` if the user has been successfully deactivated.
   */
  deactivate: (userId: string, opts?: DeactivateOptions) => Promise<boolean>;

  /**
   * Retrieve information about the 'db_user' / 'db_env_user' user.
   *
   * @param {string} userId The ID of the user to get.
   * @returns {Promise<UserDB>} ID, status, and assigned roles of a 'db_*' user.
   */
  byName: (userId: string, opts?: GetUserOptions) => Promise<UserDB>;

  /**
   * List all 'db_user' / 'db_env_user' users.
   *
   * @returns {Promise<UserDB[]>} ID, status, and assigned roles for each 'db_*' user.
   */
  listAll: (opts?: GetUserOptions) => Promise<UserDB[]>;
}

/** Operations supported for namespaced 'oidc' users.*/
export interface OIDCUsers extends UsersBase {
  /**
   * Retrieve the roles assigned to an 'oidc' user.
   *
   * @param {string} userId The ID of the user to retrieve the assigned roles for.
   * @returns {Promise<Record<string, Role>>} A map of role names to their respective roles.
   */
  getAssignedRoles: (userId: string, opts?: GetAssignedRolesOptions) => Promise<Record<string, Role>>;
}

const users = (connection: ConnectionREST): Users => {
  const base = baseUsers(connection);

  return {
    getMyUser: () => connection.get<WeaviateUser>('/users/own-info').then(Map.user),
    getAssignedRoles: (userId: string) =>
      connection.get<WeaviateRole[]>(`/authz/users/${userId}/roles`).then(Map.roles),
    assignRoles: (roleNames: string | string[], userId: string) => base.assignRoles(roleNames, userId),
    revokeRoles: (roleNames: string | string[], userId: string) => base.revokeRoles(roleNames, userId),
    db: db(connection),
    oidc: oidc(connection),
  };
};

const db = (connection: ConnectionREST): DBUsers => {
  const ns = namespacedUsers(connection);

  /** expectCode returns false if the contained WeaviateUnexpectedStatusCodeError
   * has an known error code and rethrows the error otherwise. */
  const expectCode = (code: number): ((_: any) => boolean) => {
    return (error) => {
      if (error instanceof WeaviateUnexpectedStatusCodeError && error.code === code) {
        return false;
      }
      throw error;
    };
  };

  type APIKeyResponse = { apikey: string };
  return {
    getAssignedRoles: (userId: string, opts?: GetAssignedRolesOptions) =>
      ns.getAssignedRoles('db', userId, opts),
    assignRoles: (roleNames: string | string[], userId: string) =>
      ns.assignRoles(roleNames, userId, { userType: 'db' }),
    revokeRoles: (roleNames: string | string[], userId: string) =>
      ns.revokeRoles(roleNames, userId, { userType: 'db' }),

    create: (userId: string) =>
      connection.postReturn<null, APIKeyResponse>(`/users/db/${userId}`, null).then((resp) => resp.apikey),
    delete: (userId: string) =>
      connection
        .delete(`/users/db/${userId}`, null)
        .then(() => true)
        .catch(() => false),
    rotateKey: (userId: string) =>
      connection
        .postReturn<null, APIKeyResponse>(`/users/db/${userId}/rotate-key`, null)
        .then((resp) => resp.apikey),
    activate: (userId: string) =>
      connection
        .postEmpty<null>(`/users/db/${userId}/activate`, null)
        .then(() => true)
        .catch(expectCode(409)),
    deactivate: (userId: string, opts?: DeactivateOptions) =>
      connection
        .postEmpty<DeactivateOptions | null>(`/users/db/${userId}/deactivate`, opts || null)
        .then(() => true)
        .catch(expectCode(409)),
    byName: (userId: string, opts?: GetUserOptions) =>
      connection
        .get<WeaviateDBUser>(
          `/users/db/${userId}?includeLastUsedTime=${opts?.includeLastUsedTime || false}`,
          true
        )
        .then(Map.dbUser),
    listAll: (opts?: GetUserOptions) =>
      connection
        .get<WeaviateDBUser[]>(`/users/db?includeLastUsedTime=${opts?.includeLastUsedTime || false}`, true)
        .then(Map.dbUsers),
  };
};

const oidc = (connection: ConnectionREST): OIDCUsers => {
  const ns = namespacedUsers(connection);
  return {
    getAssignedRoles: (userId: string, opts?: GetAssignedRolesOptions) =>
      ns.getAssignedRoles('oidc', userId, opts),
    assignRoles: (roleNames: string | string[], userId: string) =>
      ns.assignRoles(roleNames, userId, { userType: 'oidc' }),
    revokeRoles: (roleNames: string | string[], userId: string) =>
      ns.revokeRoles(roleNames, userId, { userType: 'oidc' }),
  };
};

/** Internal interface for operations that MAY accept a 'db'/'oidc' namespace. */
interface NamespacedUsers {
  getAssignedRoles: (
    userType: UserTypeInternal,
    userId: string,
    opts?: GetAssignedRolesOptions
  ) => Promise<Record<string, Role>>;
  assignRoles: (roleNames: string | string[], userId: string, opts?: AssignRevokeOptions) => Promise<void>;
  revokeRoles: (roleNames: string | string[], userId: string, opts?: AssignRevokeOptions) => Promise<void>;
}

/** Implementation of the operations common to 'db', 'oidc', and legacy users. */
const baseUsers = (connection: ConnectionREST): UsersBase => {
  const ns = namespacedUsers(connection);
  return {
    assignRoles: (roleNames: string | string[], userId: string) => ns.assignRoles(roleNames, userId),
    revokeRoles: (roleNames: string | string[], userId: string) => ns.revokeRoles(roleNames, userId),
  };
};

/** Implementation of the operations common to 'db' and 'oidc' users. */
const namespacedUsers = (connection: ConnectionREST): NamespacedUsers => {
  return {
    getAssignedRoles: (userType: UserTypeInternal, userId: string, opts?: GetAssignedRolesOptions) =>
      connection
        .get<WeaviateRole[]>(
          `/authz/users/${userId}/roles/${userType}?includeFullRoles=${opts?.includePermissions || false}`
        )
        .then(Map.roles),
    assignRoles: (roleNames: string | string[], userId: string, opts?: AssignRevokeOptions) =>
      connection.postEmpty(`/authz/users/${userId}/assign`, {
        ...opts,
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
    revokeRoles: (roleNames: string | string[], userId: string, opts?: AssignRevokeOptions) =>
      connection.postEmpty(`/authz/users/${userId}/revoke`, {
        ...opts,
        roles: Array.isArray(roleNames) ? roleNames : [roleNames],
      }),
  };
};

export default users;
