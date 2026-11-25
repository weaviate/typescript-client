import { WeaviateUserTypeDB as UserTypeDB } from '../openapi/types.js';
import { Role } from '../roles/types.js';

export type User = {
  id: string;
  roles?: Role[];
  /** Time at which the user's API key stops authenticating. `undefined` means it never expires. */
  expiresAt?: Date;
};

export type UserDB = {
  userType: UserTypeDB;
  id: string;
  roleNames: string[];
  /** Administratively enabled. Expiration does not change this value, so compare `expiresAt` with the current time. */
  active: boolean;

  createdAt?: Date;
  lastUsedAt?: Date;
  apiKeyFirstLetters?: string;
  /** Time at which the user's API key stops authenticating. `undefined` means it never expires. */
  expiresAt?: Date;
};

/** Optional arguments to `users.db.create`. */
export type CreateUserOptions = {
  /**
   * Future time at which the user's API key stops authenticating. Weaviate stores it in UTC to the millisecond.
   * Omit it for a user that never expires. Requires Weaviate 1.41.0+ and a Weaviate license key on the server.
   */
  expiresAt?: Date;
};

/** Optional arguments to /user/{type}/{username} enpoint. */
export type GetAssignedRolesOptions = {
  includePermissions?: boolean;
};

/** Optional arguments to /deactivate endpoint. */
export type DeactivateOptions = { revokeKey?: boolean };

/** Optional arguments to /users and /users/<id> endpoints. */
export type GetUserOptions = { includeLastUsedTime?: boolean };
