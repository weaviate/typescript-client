export { GeoCoordinate, PhoneNumber } from '../proto/v1/properties';
import { GeoCoordinate, PhoneNumber } from '../proto/v1/properties';

import { BatchReference } from '../openapi/types';
import { CrossReference, ReferenceManager } from './references';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type DataType<T = any> = T extends string
  ? 'text' | 'blob'
  : T extends number
  ? 'number' | 'int'
  : T extends boolean
  ? 'boolean'
  : T extends Date
  ? 'date'
  : T extends object
  ? 'object'
  : T extends string[]
  ? 'text[]'
  : T extends number[]
  ? 'number[]' | 'int[]'
  : T extends boolean[]
  ? 'boolean[]'
  : T extends Date[]
  ? 'date[]'
  : T extends object[]
  ? 'object[]'
  : T extends GeoCoordinate
  ? 'geoCoordinates'
  : T extends PhoneNumber
  ? 'phoneNumber'
  : never;

export type InvertedIndexConfig = {
  bm25: {
    k1: number;
    b: number;
  };
  cleanupIntervalSeconds: number;
  indexTimestamps: boolean;
  indexPropertyLength: boolean;
  indexNullState: boolean;
  stopwords: {
    preset: string;
    additions: string[];
    removals: string[];
  };
};
export interface InvertedIndexConfigCreate extends RecursivePartial<InvertedIndexConfig> {}

export type MultiTenancyConfig = {
  enabled: boolean;
};
export interface MultiTenancyConfigCreate extends RecursivePartial<MultiTenancyConfig> {}

type NestedPropertyCreate<T, D> = D extends 'object' | 'object[]'
  ? PropertyConfigCreate<T extends Properties ? T : any>
  : never;

export interface PropertyConfigCreate<T> {
  name: NonRefKeys<T> & string;
  dataType: DataType<T[this['name']]>;
  description?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  nestedProperties?: NestedPropertyCreate<T[this['name']], this['dataType']>[];
  skipVectorisation?: boolean;
  tokenization?: 'word' | 'field' | 'whitespace' | 'lowercase';
  vectorizePropertyName?: boolean;
}

type PropertyVectorizerConfig = {
  skip: boolean;
  vectorizePropertyName: boolean;
};

export type PropertyConfig = {
  name: string;
  dataType: string;
  description?: string;
  indexInverted: boolean;
  indexFilterable: boolean;
  indexSearchable: boolean;
  nestedProperties?: PropertyConfig[];
  tokenization: string;
  vectorizerConfig?: PropertyVectorizerConfig;
};

export type ReferenceConfig = {
  name: string;
  description?: string;
  targetCollections: string[];
};

interface ReferenceConfigBaseCreate<T> {
  name: T extends Properties ? RefKeys<T> : string;
  description?: string;
}

export interface ReferenceSingleTargetConfigCreate<T> extends ReferenceConfigBaseCreate<T> {
  targetCollection: string;
}

export interface ReferenceMultiTargetConfigCreate<T> extends ReferenceConfigBaseCreate<T> {
  targetCollections: string[];
}

export type ReferenceConfigCreate<T> =
  | ReferenceSingleTargetConfigCreate<T>
  | ReferenceMultiTargetConfigCreate<T>;

export type ReplicationConfig = {
  factor: number;
};
export interface ReplicationConfigCreate extends RecursivePartial<ReplicationConfig> {}

export type ShardingConfig = {
  virtualPerPhysical: number;
  desiredCount: number;
  actualCount: number;
  desiredVirtualCount: number;
  actualVirtualCount: number;
  key: '_id';
  strategy: 'hash';
  function: 'murmur3';
};
export interface ShardingConfigCreate extends RecursivePartial<ShardingConfig> {}

export type VectorDistance = 'cosine' | 'dot' | 'l2-squared' | 'hamming';

export type PQEncoderType = 'kmeans' | 'tile';
export type PQEncoderDistribution = 'log_normal' | 'normal';

export type VectorIndexType = 'hnsw' | 'flat' | string;

export type PQConfig = {
  bitCompression: boolean;
  centroids: number;
  enabled: boolean;
  encoder: PQEncoderConfig;
  segments: number;
  trainingLimit: number;
};
export interface PQConfigCreate extends RecursivePartial<PQConfig> {}

export type PQEncoderConfig = {
  type: PQEncoderType;
  distribution: PQEncoderDistribution;
};

export type VectorIndexConfigHNSW = {
  cleanupIntervalSeconds: number;
  distance: VectorDistance;
  dynamicEfMin: number;
  dynamicEfMax: number;
  dynamicEfFactor: number;
  efConstruction: number;
  ef: number;
  flatSearchCutoff: number;
  maxConnections: number;
  pq: PQConfig;
  skip: boolean;
  vectorCacheMaxObjects: number;
};
export interface VectorIndexConfigHNSWCreate extends RecursivePartial<VectorIndexConfigHNSW> {}

export type VectorIndexConfig<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSW
  : I extends 'flat'
  ? VectorIndexConfigFlat
  : I extends string
  ? Record<string, any>
  : never;

export type VectorIndexConfigCreate<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSWCreate
  : I extends 'flat'
  ? VectorIndexConfigFlatCreate
  : I extends string
  ? Record<string, any>
  : never;

export type BQConfig = {
  cache: boolean;
  rescoreLimit: number;
};

export type VectorIndexConfigFlat = {
  distance: VectorDistance;
  vectorCacheMaxObjects: number;
  bq: BQConfig;
};
export interface VectorIndexConfigFlatCreate extends RecursivePartial<VectorIndexConfigFlat> {}

export type VectorIndicesOptions =
  | VectorIndexConfigFlatCreate
  | VectorIndexConfigHNSWCreate
  | Record<string, any>;

export interface CollectionConfigCreate<T, I, G, R, V> {
  name: string;
  description?: string;
  generative?: ModuleOptions<G>;
  invertedIndex?: InvertedIndexConfigCreate;
  multiTenancy?: MultiTenancyConfigCreate;
  properties?: PropertyConfigCreate<T>[];
  references?: ReferenceConfigCreate<T>[];
  replication?: ReplicationConfigCreate;
  reranker?: ModuleOptions<R>;
  sharding?: ShardingConfigCreate;
  vectorIndex?: ModuleOptions<I>;
  vectorizer?: ModuleOptions<V>;
}

export type CollectionConfig<T, I, G, R, V> = {
  name: string;
  description?: string;
  generative: GenerativeConfig<G>;
  invertedIndex: InvertedIndexConfig;
  multiTenancy: MultiTenancyConfig;
  properties: PropertyConfig[];
  references: ReferenceConfig[];
  replication: ReplicationConfig;
  reranker: RerankerConfig<R>;
  sharding: ShardingConfig;
  vectorIndex: VectorIndexConfig<I>;
  vectorIndexType: I;
  vectorizer: VectorizerConfig<V>;
};

export interface Img2VecNeuralOptions {
  imageFields?: string[];
}

export interface Multi2VecClipOptions {
  imageFields?: string[];
  textFields?: string[];
  vectorizeClassName?: boolean;
}

export interface Multi2VecBindOptions {
  audioFields?: string[];
  depthFields?: string[];
  imageFields?: string[];
  IMUFields?: string[];
  textFields?: string[];
  thermalFields?: string[];
  videoFields?: string[];
  vectorizeClassName?: boolean;
}

export interface Ref2VecCentroidOptions {
  referenceProperties: string[];
  method: 'mean';
}

export interface Text2VecContextionaryOptions {
  vectorizeClassName?: boolean;
}

export interface Text2VecOpenAIOptions {
  model?: 'ada' | 'babbage' | 'curie' | 'davinci';
  modelVersion?: string;
  type?: 'text' | 'code';
  vectorizeClassName?: boolean;
}

export interface Text2VecCohereOptions {
  model?:
    | 'embed-multilingual-v2.0'
    | 'small'
    | 'medium'
    | 'large'
    | 'multilingual-22-12'
    | 'embed-english-v2.0'
    | 'embed-english-light-v2.0';
  truncate?: 'RIGHT' | 'NONE';
  vectorizeClassName?: boolean;
}

export interface NoVectorizerOptions {}

export type VectorizersOptions =
  | Img2VecNeuralOptions
  | Multi2VecClipOptions
  | Multi2VecBindOptions
  | Ref2VecCentroidOptions
  | Text2VecContextionaryOptions
  | Text2VecCohereOptions
  | Text2VecOpenAIOptions
  | NoVectorizerOptions
  | Record<string, never>;

interface GenerativeOpenAIOptionsBase {
  frequencyPenaltyProperty?: number;
  presencePenaltyProperty?: number;
  maxTokensProperty?: number;
  temperatureProperty?: number;
  topPProperty?: number;
}

export interface GenerativeOpenAIOptions extends GenerativeOpenAIOptionsBase {
  model?: string;
}

export interface GenerativeAzureOpenAIOptions extends GenerativeOpenAIOptionsBase {
  resourceName: string;
  deploymentId: string;
}

export interface GenerativeCohereOptions {
  kProperty?: number;
  model?: string;
  maxTokensProperty?: number;
  returnLikelihoodsProperty?: string;
  stopSequencesProperty?: string[];
  temperatureProperty?: number;
}

export interface GenerativePaLMOptions {
  apiEndpoint?: string;
  maxOutputTokens?: number;
  modelId?: string;
  projectId: string;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface ModuleOptions<N, O = Record<string, any>> {
  name: N;
  options?: O;
}

export type GenerativeSearchesOptions =
  | GenerativeAzureOpenAIOptions
  | GenerativeOpenAIOptions
  | GenerativeCohereOptions
  | GenerativePaLMOptions
  | Record<string, any>;

export interface RerankerTransformersOptions {}

export interface RerankerCohereOptions {
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0' | string;
}

export type RerankersOptions = RerankerCohereOptions | Record<string, any>;

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
  metadata?: MetadataReturn;
  references: ReturnReferences<T> | undefined;
  uuid: string;
  vector?: number[];
};

export type WeaviateReturn<T> = {
  objects: WeaviateObject<T>[];
};

export type GenerateObject<T> = WeaviateObject<T> & {
  generated?: string;
};

export type GenerativeReturn<T> = {
  objects: GenerateObject<T>[];
  generated?: string;
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

export type GenerativeGroupByResult<T> = GroupByResult<T> & {
  generated?: string;
};

export type GroupByReturn<T> = {
  objects: GroupByObject<T>[];
  groups: Record<string, GroupByResult<T>>;
};

export type GenerativeGroupByReturn<T> = {
  objects: GroupByObject<T>[];
  groups: Record<string, GenerativeGroupByResult<T>>;
  generated?: string;
};

interface BaseRefProperty<T> {
  // linkOn: keyof T & string; // https://github.com/microsoft/TypeScript/issues/56239
  linkOn: RefKeys<T>;
  returnMetadata?: MetadataQuery;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<
    T extends Record<string, any> ? ExtractCrossReferenceType<T[this['linkOn']]> : any
  >[];
  targetCollection?: string;
}

export interface GroupByOptions<T extends Properties> {
  property: keyof T;
  numberOfGroups: number;
  objectsPerGroup: number;
}

export interface RefProperty<T> extends BaseRefProperty<T> {
  // targetCollection: undefined
}

export type ExtractCrossReferenceType<T> = T extends CrossReference<infer U> ? U : never;

type ExtractNestedType<T> = T extends NestedProperties | NestedProperties[] ? T : never;

export interface MultiRefProperty<T> extends BaseRefProperty<T> {
  // targetCollection: string;
}

type A = {
  a: string;
  b: {
    c: string;
  };
};

export interface QueryNested<T> {
  name: NestedKeys<T>;
  properties: QueryProperty<ExtractNestedType<T[this['name']]>>[];
}

export type QueryProperty<T> = PrimitiveKeys<T> | QueryNested<T>;
export type QueryReference<T> = RefProperty<T> | MultiRefProperty<T>;
export type NonRefProperty<T> = keyof T | QueryNested<T>;
export type NonPrimitiveProperty<T> = RefProperty<T> | MultiRefProperty<T> | QueryNested<T>;

export type ResolvedNestedProperty<T> = QueryNested<ExtractNestedType<T>>;

export type PrimitiveKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends PrimitiveField | undefined ? Key : never;
}[keyof Obj] &
  string;

export type NestedKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends PrimitiveField ? never : Key;
}[keyof Obj] &
  string;

export type RefKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends CrossReference<any> | undefined ? Key : never;
}[keyof Obj] &
  string;

// export type NonRefKeys<Obj> = {
//   [Key in keyof Obj]: Obj[Key] extends WeaviateField ? Key : never;
// }[keyof Obj] &
//   string;

export type NonRefs<Obj> = {
  [Key in NonRefKeys<Obj>]: Obj[Key];
};

export type Refs<Obj> = {
  [Key in RefKeys<Obj>]: Obj[Key];
};

export type ReferenceInput = string | string[] | ReferenceToMultiTarget;

export type ReferenceInputs<Obj> = {
  [Key in RefKeys<Obj>]: ReferenceInput | ReferenceManager<ExtractCrossReferenceType<Obj[Key]>>;
};

// Helper type to determine if a type is a WeaviateField excluding undefined
type IsWeaviateField<T> = T extends WeaviateField ? T : never;

// Modified NonRefKey to differentiate optional from required keys
export type NonRefKeys<Obj> = {
  [Key in keyof Obj]-?: undefined extends Obj[Key]
    ? IsWeaviateField<Exclude<Obj[Key], undefined>> extends never
      ? never
      : Key
    : IsWeaviateField<Obj[Key]> extends never
    ? never
    : Key;
}[keyof Obj] &
  string;

// Adjusted NonRefs to correctly map over Obj and preserve optional types
export type NonReferenceInputs<Obj> = {
  [Key in keyof Obj as Key extends NonRefKeys<Obj> ? Key : never]: MapPhoneNumberType<Obj[Key]>;
};

export type MapPhoneNumberType<T> = T extends PhoneNumber ? PhoneNumberInput : T;

export interface ReferenceToMultiTarget {
  targetCollection: string;
  uuids: string | string[];
}

export type IsEmptyType<T> = keyof T extends never ? true : false;

export type ReturnProperties<T> = Pick<T, NonRefKeys<T>>;

export type ReturnReferences<T> = Pick<T, RefKeys<T>>;

export interface SortBy {
  property: string;
  ascending?: boolean;
}

export type Reference<T> = {
  objects: WeaviateObject<T>[];
};

type PrimitiveField =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | Date
  | Date[]
  | Blob
  | GeoCoordinate
  | PhoneNumber
  | null;

type NestedField = NestedProperties | NestedProperties[];

export type WeaviateField = PrimitiveField | NestedField;

export interface Properties {
  [k: string]: WeaviateField | CrossReference<Properties> | undefined;
}

export interface NestedProperties {
  [k: string]: WeaviateField;
}

// export type FiltersREST = {
//   operator: Operator;
//   operands?: FiltersREST[];
//   path?: string[];
// } & {
//   [Key in AllowedKeys]?: AllowedValues;
// };

type AllowedKeys =
  | 'valueText'
  | 'valueDate'
  | 'valueBoolean'
  | 'valueNumber'
  | 'valueInt'
  | 'valueTextArray'
  | 'valueDateArray'
  | 'valueBooleanArray'
  | 'valueNumberArray'
  | 'valueIntArray';
type AllowedValues = string | string[] | boolean | boolean[] | number | number[];

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

export type BatchObjectsReturn<T> = {
  allResponses: (string | ErrorObject<T>)[];
  elapsedSeconds: number;
  errors: Record<number, ErrorObject<T>>;
  hasErrors: boolean;
  uuids: Record<number, string>;
};

export type ErrorObject<T> = {
  code?: number;
  message: string;
  object: BatchObject<T>;
  originalUuid?: string;
};

export type BatchObject<T> = {
  collection: string;
  properties?: NonReferenceInputs<T>;
  references?: ReferenceInputs<T>;
  uuid?: string;
  vector?: number[];
  tenant?: string;
};

export type ErrorReference = {
  message: string;
  reference: BatchReference;
};

export type BatchReferencesReturn = {
  elapsedSeconds: number;
  errors: Record<number, ErrorReference>;
  hasErrors: boolean;
};

export type GenerativeSearches =
  | 'generative-openai'
  | 'generative-cohere'
  | 'generative-palm'
  | 'none'
  | string;

export type Rerankers = 'reranker-cohere' | 'reranker-transformers' | 'none' | string;

export type Vectorizers =
  | 'img2vec-neural'
  | 'multi2vec-clip'
  | 'multi2vec-bind'
  | 'ref2vec-centroid'
  | 'text2vec-contextionary'
  | 'text2vec-cohere'
  | 'text2vec-openai'
  | 'none'
  | string;

export type GenerativeConfig<G> = G extends 'generative-openai'
  ? GenerativeOpenAIOptions
  : G extends 'generative-cohere'
  ? GenerativeCohereOptions
  : G extends 'generative-palm'
  ? GenerativePaLMOptions
  : G extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export type VectorizerConfig<V> = V extends 'img2vec-neural'
  ? Img2VecNeuralOptions
  : V extends 'multi2vec-clip'
  ? Multi2VecClipOptions
  : V extends 'multi2vec-bind'
  ? Multi2VecBindOptions
  : V extends 'ref2vec-centroid'
  ? Ref2VecCentroidOptions
  : V extends 'text2vec-contextionary'
  ? Text2VecContextionaryOptions
  : V extends 'text2vec-cohere'
  ? Text2VecCohereOptions
  : V extends 'text2vec-openai'
  ? Text2VecOpenAIOptions
  : V extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export type RerankerConfig<R> = R extends 'reranker-cohere'
  ? RerankerCohereOptions
  : R extends 'reranker-transformers'
  ? RerankerTransformersOptions
  : R extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export interface PhoneNumberInput {
  number: string;
  defaultCountry?: string;
}
