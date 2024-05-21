import { Properties } from './index.js';
import { GroupByObject, GroupByResult, WeaviateObjectType, WeaviateNonGenericObject } from './query.js';

export type GenerativeObjectType<T extends Properties> = WeaviateObjectType<T> & {
  generated?: string;
};

export type GenerativeNonGenericObject = WeaviateNonGenericObject & {
  generated?: string;
};

export type GenerativeObject<T> = T extends Record<string, any>
  ? GenerativeObjectType<T>
  : GenerativeNonGenericObject;

export type GenerativeReturn<T> = {
  objects: GenerativeObject<T>[];
  generated?: string;
};

export type GenerativeGroupByResult<T> = GroupByResult<T> & {
  generated?: string;
};

export type GenerativeGroupByReturn<T> = {
  objects: GroupByObject<T>[];
  groups: Record<string, GenerativeGroupByResult<T>>;
  generated?: string;
};
