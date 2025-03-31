import { Role } from '../roles/types.js';
import { WeaviateUserTypeDB as UserTypeDB } from '../openapi/types.js';

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


