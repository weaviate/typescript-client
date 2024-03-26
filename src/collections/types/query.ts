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

// export type MetadataQuery = (
//   | 'creationTime'
//   | 'updateTime'
//   | 'distance'
//   | 'certainty'
//   | 'score'
//   | 'explainScore'
//   | 'isConsistent'
// )[];

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

export type QueryMetadata = MetadataKeys | undefined;

// export type ReturnMetadata<M extends MetadataKeys> = {
//   [Key in M[number]]: Metadata[Key];
// };

export type ReturnMetadata = Partial<Metadata>;

export type WeaviateObjectType<T extends Properties> = {
  properties: ReturnProperties<T>;
  metadata: ReturnMetadata | undefined;
  references: ReturnReferences<T> | undefined;
  uuid: string;
  vectors: Vectors;
};

export type WeaviateNonGenericObject = {
  properties: Record<string, WeaviateField>;
  metadata: ReturnMetadata | undefined;
  references: Record<string, CrossReferenceDefault> | undefined;
  uuid: string;
  vectors: Vectors;
};

export type ReturnProperties<T extends Properties> = Pick<T, NonRefKeys<T>>;

export type ReturnReferences<T extends Properties> = Pick<T, RefKeys<T>>;

export type Vectors = Record<string, number[]>;

export type ReturnVectors<V> = V extends string[]
  ? { [Key in V[number]]: number[] }
  : Record<string, number[]>;

export type WeaviateObject<T> = T extends Record<string, any>
  ? WeaviateObjectType<T>
  : WeaviateNonGenericObject;

export type WeaviateReturn<T> = {
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

export type GroupByReturn<T> = {
  objects: GroupByObject<T>[];
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

interface BaseRefProperty<T extends Properties> {
  // linkOn: keyof T & string; // https://github.com/microsoft/TypeScript/issues/56239
  linkOn: RefKeys<T>;
  includeVector?: boolean | string[];
  returnMetadata?: QueryMetadata;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<ExtractCrossReferenceType<T[this['linkOn']]>>[];
  targetCollection?: string;
}

export type RefProperty<T extends Properties> = BaseRefProperty<T>;

export type RefPropertyDefault = {
  linkOn: string;
  includeVector?: boolean | string[];
  returnMetadata?: QueryMetadata;
  returnProperties?: (string | QueryNestedDefault)[];
  returnReferences?: RefPropertyDefault[];
  targetCollection?: string;
};

export type SortBy = {
  property: string;
  ascending?: boolean;
};
