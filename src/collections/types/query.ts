import { Properties, WeaviateField } from '../index.js';
import { CrossReferenceDefault } from '../references/index.js';
import {
  ExtractCrossReferenceType,
  NonRefKeys,
  RefKeys,
  QueryProperty,
  QueryReference,
  QueryNestedDefault,
} from './internal.js';

type Metadata = {
  creationTime: Date;
  updateTime: Date;
  distance: number;
  certainty: number;
  score: number;
  explainScore: string;
  rerankScore: number;
  isConsistent: boolean;
};

export type MetadataKeys = (keyof Metadata)[];

export type QueryMetadata = 'all' | MetadataKeys | undefined;

export type ReturnMetadata = Partial<Metadata>;

export type WeaviateGenericObject<T extends Properties> = {
  /** The generic returned properties of the object derived from the type `T`. */
  properties: ReturnProperties<T>;
  /** The returned metadata of the object. */
  metadata: ReturnMetadata | undefined;
  /** The returned references of the object derived from the type `T`. */
  references: ReturnReferences<T> | undefined;
  /** The UUID of the object. */
  uuid: string;
  /** The returned vectors of the object. */
  vectors: Vectors;
};

export type WeaviateNonGenericObject = {
  /** The returned properties of the object. */
  properties: Record<string, WeaviateField>;
  /** The returned metadata of the object. */
  metadata: ReturnMetadata | undefined;
  /** The returned references of the object. */
  references: Record<string, CrossReferenceDefault> | undefined;
  /** The UUID of the object. */
  uuid: string;
  /** The returned vectors of the object. */
  vectors: Vectors;
};

export type ReturnProperties<T extends Properties> = Pick<T, NonRefKeys<T>>;

export type ReturnReferences<T extends Properties> = Pick<T, RefKeys<T>>;

export type Vectors = Record<string, number[]>;

export type ReturnVectors<V> = V extends string[]
  ? { [Key in V[number]]: number[] }
  : Record<string, number[]>;

/** An object belonging to a collection as returned by the methods in the `collection.query` namespace.
 *
 * Depending on the generic type `T`, the object will have subfields that map from `T`'s specific type definition.
 * If not, then the object will be non-generic and have a `properties` field that maps from a generic string to a `WeaviateField`.
 */
export type WeaviateObject<T> = T extends Properties ? WeaviateGenericObject<T> : WeaviateNonGenericObject;

/** The return of a query method in the `collection.query` namespace. */
export type WeaviateReturn<T> = {
  /** The objects that were found by the query. */
  objects: WeaviateObject<T>[];
};

export type GroupByObject<T> = WeaviateObject<T> & {
  belongsToGroup: string;
};

export type GroupByResult<T> = {
  name: string;
  minDistance: number;
  maxDistance: number;
  numberOfObjects: number;
  objects: WeaviateObject<T>[];
};

/** The return of a query method in the `collection.query` namespace where the `groupBy` argument was specified. */
export type GroupByReturn<T> = {
  /** The objects that were found by the query. */
  objects: GroupByObject<T>[];
  /** The groups that were created by the query. */
  groups: Record<string, GroupByResult<T>>;
};

export type GroupByOptions<T> = T extends undefined
  ? {
      property: string;
      numberOfGroups: number;
      objectsPerGroup: number;
    }
  : {
      property: keyof T;
      numberOfGroups: number;
      objectsPerGroup: number;
    };

export type RerankOptions<T> = T extends undefined
  ? {
      property: string;
      query: string;
    }
  : {
      property: keyof T;
      query?: string;
    };

interface BaseRefProperty<T> {
  /** The property to link on when defining the references traversal. */
  linkOn: RefKeys<T>;
  /** Whether to return the vector(s) of the referenced objects in the query. */
  includeVector?: boolean | string[];
  /** The metadata to return for the referenced objects. */
  returnMetadata?: QueryMetadata;
  /** The properties to return for the referenced objects. */
  returnProperties?: QueryProperty<T>[];
  /** The references to return for the referenced objects. */
  returnReferences?: QueryReference<ExtractCrossReferenceType<T[this['linkOn']]>>[];
  /** The collection to target when traversing the references. Required for multi-target references. */
  targetCollection?: string;
}

export type RefProperty<T> = BaseRefProperty<T>;

export type RefPropertyDefault = {
  /** The property to link on when defining the references traversal. */
  linkOn: string;
  /** Whether to return the vector(s) of the referenced objects in the query. */
  includeVector?: boolean | string[];
  /** The metadata to return for the referenced objects. */
  returnMetadata?: QueryMetadata;
  /** The properties to return for the referenced objects. */
  returnProperties?: (string | QueryNestedDefault)[];
  /** The references to return for the referenced objects. */
  returnReferences?: RefPropertyDefault[];
  /** The collection to target when traversing the references. Required for multi-target references. */
  targetCollection?: string;
};

export type SortBy = {
  property: string;
  ascending?: boolean;
};
