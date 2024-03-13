import { ExtractCrossReferenceType, NonRefKeys, RefKeys, QueryProperty, QueryReference } from './internal';

export type MetadataQuery = (
  | 'creationTime'
  | 'updateTime'
  | 'distance'
  | 'certainty'
  | 'score'
  | 'explainScore'
  | 'isConsistent'
)[];

export type MetadataReturn = {
  creationTime?: number;
  updateTime?: number;
  distance?: number;
  certainty?: number;
  score?: number;
  explainScore?: string;
  isConsistent?: boolean;
};

export type WeaviateObject<T> = {
  properties: ReturnProperties<T>;
  metadata: MetadataReturn | undefined;
  references: ReturnReferences<T> | undefined;
  uuid: string;
  vectors: Vectors;
};

export type ReturnProperties<T> = Pick<T, NonRefKeys<T>>;

export type ReturnReferences<T> = Pick<T, RefKeys<T>>;

export type Vectors = Record<string, number[]>;

export type ReturnVectors<V> = V extends string[]
  ? { [Key in V[number]]: number[] }
  : Record<string, number[]>;

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

export type GroupByOptions<T> = {
  property: keyof T;
  numberOfGroups: number;
  objectsPerGroup: number;
};

interface BaseRefProperty<T> {
  // linkOn: keyof T & string; // https://github.com/microsoft/TypeScript/issues/56239
  linkOn: RefKeys<T>;
  includeVector?: boolean | string[];
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<
    T extends Record<string, any> ? ExtractCrossReferenceType<T[this['linkOn']]> : any
  >[];
  targetCollection?: string;
}

export type RefProperty<T> = BaseRefProperty<T>;

export type SortBy = {
  property: string;
  ascending?: boolean;
};
