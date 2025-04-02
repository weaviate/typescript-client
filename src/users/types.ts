import { WeaviateUserTypeDB as UserTypeDB, WeaviateUserTypeInternal } from '../openapi/types.js';
import { Role } from '../roles/types.js';

export type User = {
  id: string;
  roles?: Role[];
};

export type UserDB = {
  userType: UserTypeDB;
  id: string;
  roleNames: string[];
  active: boolean;
};

/** Optional arguments to /user/{type}/{username} enpoint. */
export type GetAssignedRolesOptions = {
  includePermissions?: boolean;
};

/** Optional arguments to /assign and /revoke endpoints. */
export type AssignRevokeOptions = { userType?: WeaviateUserTypeInternal };

