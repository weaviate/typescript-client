import { GroupByObject, GroupByResult, WeaviateObject } from './query';

export type GenerateObject<T> = WeaviateObject<T> & {
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
