import { NonReferenceInputs, ReferenceInputs } from './internal.js';
import { Vectors } from './query.js';

export type DataObject<T> = {
  id?: string;
  properties?: NonReferenceInputs<T>;
  references?: ReferenceInputs<T>;
  vectors?: number[] | Vectors;
};

export type DeleteManyObject = {
  /** Undefined when the server returned no uuid for this object. */
  id?: string;
  successful: boolean;
  error?: string;
};

export type DeleteManyReturn<V> = {
  failed: number;
  matches: number;
  objects: V extends true ? DeleteManyObject[] : undefined;
  successful: number;
};

export type ReferenceToMultiTarget = {
  targetCollection: string;
  uuids: string | string[];
};
