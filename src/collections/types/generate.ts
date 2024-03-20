import { GroupByObject, GroupByResult, WeaviateObjectType, WeaviateNonGenericObject } from './query.js';

export type GenerateObject<T> = T extends Record<string, any>
  ? WeaviateObjectType<T> & {
      generated?: string;
    }
  : WeaviateNonGenericObject & {
      generated?: string;
    };

export type GenerativeReturn<T> = {
  objects: GenerateObject<T>[];
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
