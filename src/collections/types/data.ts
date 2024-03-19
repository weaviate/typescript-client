import { NonReferenceInputs, ReferenceInputs } from './internal.js';

export type DataObject<T> = {
  id?: string;
  properties?: NonReferenceInputs<T>;
  references?: ReferenceInputs<T>;
  vector?: number[];
};

export type DeleteManyObject = {
  id: string;
  successful: boolean;
  error?: string;
};

export type DeleteManyReturn<V> = {
  failed: number;
  matches: number;
  objects: V extends true ? DeleteManyObject[] : undefined;
  successful: number;
};

export interface ReferenceToMultiTarget {
  targetCollection: string;
  uuids: string | string[];
}
