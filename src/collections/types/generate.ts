import { Properties } from './index.js';
import { GroupByObject, GroupByResult, WeaviateGenericObject, WeaviateNonGenericObject } from './query.js';

export type GenerativeGenericObject<T extends Properties> = WeaviateGenericObject<T> & {
  generated?: string;
};

export type GenerativeNonGenericObject = WeaviateNonGenericObject & {
  generated?: string;
};

export type GenerativeObject<T> = T extends Record<string, any>
  ? GenerativeGenericObject<T>
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
