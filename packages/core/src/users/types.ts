import { WeaviateUserTypeDB as UserTypeDB } from '../openapi/types.js';
import { Role } from '../roles/types.js';

export type User = {
  id: string;
  roles?: Role[];
  /** When the user's API key expires. `undefined` if it never expires. */
  expiresAt?: Date;
};

export type UserDB = {
  userType: UserTypeDB;
  id: string;
  roleNames: string[];
  active: boolean;

  createdAt?: Date;
  lastUsedAt?: Date;
  apiKeyFirstLetters?: string;
  /** When the user's API key expires. `undefined` if it never expires. */
  expiresAt?: Date;
};

/** Optional arguments to `users.db.create`. */
export type CreateUserOptions = {
  /** When the user's API key expires. Omit for a key that never expires. Requires Weaviate 1.41.0+. */
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
