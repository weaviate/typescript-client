import { GroupByObject, GroupByResult, WeaviateGenericObject, WeaviateNonGenericObject } from './query.js';

export type GenerativeGenericObject<T, V> = WeaviateGenericObject<T, V> & {
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
export type GenerativeObject<T, V> = T extends undefined
  ? V extends undefined
    ? GenerativeNonGenericObject
    : GenerativeGenericObject<GenerativeNonGenericObject['properties'], V>
  : V extends undefined
  ? GenerativeGenericObject<T, GenerativeNonGenericObject['vectors']>
  : GenerativeGenericObject<T, V>;

/** The return of a query method in the `collection.generate` namespace. */
export type GenerativeReturn<T, V> = {
  /** The objects that were found by the query. */
  objects: GenerativeObject<T, V>[];
  /** The LLM-generated output applicable to this query as a whole. */
  generated?: string;
};

export type GenerativeGroupByResult<T, V> = GroupByResult<T, V> & {
  generated?: string;
};

/** The return of a query method in the `collection.generate` namespace where the `groupBy` argument was specified. */
export type GenerativeGroupByReturn<T, V> = {
  /** The objects that were found by the query. */
  objects: GroupByObject<T, V>[];
  /** The groups that were created by the query. */
  groups: Record<string, GenerativeGroupByResult<T, V>>;
  /** The LLM-generated output applicable to this query as a whole. */
  generated?: string;
};

/** Options available when defining queries using methods in the `collection.generate` namespace. */
export type GenerateOptions<T> = {
  /** The prompt to use when generating content relevant to each object of the collection individually. */
  singlePrompt?: string;
  /** The prompt to use when generating content relevant to objects returned by the query as a whole. */
  groupedTask?: string;
  /** The properties to use as context to be injected into the `groupedTask` prompt when performing the grouped generation. */
  groupedProperties?: T extends undefined ? string[] : (keyof T)[];
};

export type GenerateReturn<T, V> = Promise<GenerativeReturn<T, V>> | Promise<GenerativeGroupByReturn<T, V>>;
