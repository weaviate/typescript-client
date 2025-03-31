import { Role } from '../roles/types.js';

export type User = {
  id: string;
  roles?: Role[];
};
