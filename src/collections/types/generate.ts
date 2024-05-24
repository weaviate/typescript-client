import { Properties } from './index.js';
import { GroupByObject, GroupByResult, WeaviateGenericObject, WeaviateNonGenericObject } from './query.js';

export type GenerativeGenericObject<T extends Properties> = WeaviateGenericObject<T> & {
  /** The LLM-generated output applicable to this single object. */
  generated?: string;
};

export type GenerativeNonGenericObject = WeaviateNonGenericObject & {
  /** The LLM-generated output applicable to this single object. */
  generated?: string;
};

/** An object belonging to a collection as returned by the methods in the `collection.generate` namespace.
 *
 * Depending on the generic type `T`, the object will have subfields that map from `T`'s specific type definition.
 * If not, then the object will be non-generic and have a `properties` field that maps from a generic string to a `WeaviateField`.
 */
export type GenerativeObject<T> = T extends Properties
  ? GenerativeGenericObject<T>
  : GenerativeNonGenericObject;

/** The return of a query method in the `collection.generate` namespace. */
export type GenerativeReturn<T> = {
  /** The objects that were found by the query. */
  objects: GenerativeObject<T>[];
  /** The LLM-generated output applicable to this query as a whole. */
  generated?: string;
};

export type GenerativeGroupByResult<T> = GroupByResult<T> & {
  generated?: string;
};

/** The return of a query method in the `collection.generate` namespace where the `groupBy` argument was specified. */
export type GenerativeGroupByReturn<T> = {
  /** The objects that were found by the query. */
  objects: GroupByObject<T>[];
  /** The groups that were created by the query. */
  groups: Record<string, GenerativeGroupByResult<T>>;
  /** The LLM-generated output applicable to this query as a whole. */
  generated?: string;
};
