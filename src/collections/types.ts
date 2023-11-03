export type DataType =
  | 'int'
  | 'int[]'
  | 'number'
  | 'number[]'
  | 'text'
  | 'text[]'
  | 'boolean'
  | 'boolean[]'
  | 'date'
  | 'date[]'
  | 'object'
  | 'object[]'
  | 'geoCoordinates'
  | 'phoneNumber'
  | string
  | string[];

export interface InvertedIndexConfig {
  bm25?: {
    k1?: number;
    b?: number;
  };
  cleanupIntervalSeconds?: number;
  indexTimestamps?: boolean;
  indexPropertyLength?: boolean;
  indexNullState?: boolean;
  stopwords: {
    preset?: 'en' | 'none';
    additions?: string[];
    removals?: string[];
  };
}

export interface MultiTenancyConfig {
  enabled?: boolean;
}

export interface PropertyConfig {
  name: string;
  dataType: string[];
  description?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  nestedProperties?: PropertyConfig[];
  skipVectorisation?: boolean;
  tokenization?: 'word' | 'field' | 'whitespace' | 'lowercase';
  vectorizePropertyName?: boolean;
}

export interface ReplicationConfig {
  factor?: number;
}

export interface ShardingConfig {
  virtualPerPhysical?: number;
  desiredCount?: number;
  actualCount?: number;
  desiredVirtualCount?: number;
  actualVirtualCount?: number;
}

export type VectorDistance = 'cosine' | 'dot' | 'l2-squared' | 'hamming';

export interface VectorIndexConfig {
  cleanupIntervalSeconds?: number;
  distance: VectorDistance;
  dynamicEfMin?: number;
  dynamicEfMax?: number;
  dynamicEfFactor?: number;
  efConstruction?: number;
  ef?: number;
  flatSearchCutoff?: number;
  maxConnections?: number;
  pq?: {
    bitCompression?: boolean;
    centroids?: number;
    enabled?: boolean;
    encoder?: {
      type?: 'kmeans' | 'tile';
      distribution?: 'log_normal' | 'normal';
    };
    segments?: number;
    trainingLimit?: number;
  };
  skip?: boolean;
  vectorCacheMaxObjects?: number;
}

export interface CollectionConfig {
  name: string;
  description?: string;
  generative?: GenerativeConfig;
  invertedIndex?: InvertedIndexConfig;
  multiTenancy?: MultiTenancyConfig;
  properties?: PropertyConfig[];
  replication?: ReplicationConfig;
  sharding?: ShardingConfig;
  vectorIndex?: VectorIndexConfig;
  vectorizer?: VectorizerConfig;
}

export interface Img2VecNeuralArgs {
  imageFields?: string[];
}
export interface Img2VecNeuralConfig {
  'img2vec-neural': Img2VecNeuralArgs;
}

export interface Multi2VecClipArgs {
  imageFields?: string[];
  textFields?: string[];
  vectorizeClassName?: boolean;
}
export interface Multi2VecClipConfig {
  'multi2vec-clip': Multi2VecClipArgs;
}

export interface Multi2VecBindArgs {
  audioFields?: string[];
  depthFields?: string[];
  imageFields?: string[];
  IMUFields?: string[];
  textFields?: string[];
  thermalFields?: string[];
  videoFields?: string[];
  vectorizeClassName?: boolean;
}
export interface Multi2VecBindConfig {
  'multi2vec-bind': Multi2VecBindArgs;
}

export interface Ref2VecCentroidArgs {
  referenceProperties: string[];
  method: 'mean';
}
export interface Ref2VecCentroidConfig {
  'ref2vec-centroid': Ref2VecCentroidArgs;
}

export interface Text2VecContextionaryArgs {
  vectorizeClassName?: boolean;
}
export interface Text2VecContextionaryConfig {
  'text2vec-contextionary': Text2VecContextionaryArgs;
}

export interface Text2VecOpenAIArgs {
  model?: 'ada' | 'babbage' | 'curie' | 'davinci';
  modelVersion?: string;
  type?: 'text' | 'code';
  vectorizeClassName?: boolean;
}
export interface Text2VecOpenAIConfig {
  'text2vec-openai': Text2VecOpenAIArgs;
}

export interface Text2VecCohereArgs {
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
export interface Text2VecCohereConfig {
  'text2vec-cohere': Text2VecCohereArgs;
}

export type VectorizerConfig =
  | Img2VecNeuralConfig
  | Multi2VecClipConfig
  | Multi2VecBindConfig
  | Ref2VecCentroidConfig
  | Text2VecContextionaryConfig
  | Text2VecCohereConfig
  | Text2VecOpenAIConfig;

interface GenerativeOpenAIArgsBase {
  frequencyPenaltyProperty?: number;
  presencePenaltyProperty?: number;
  maxTokensProperty?: number;
  temperatureProperty?: number;
  topPProperty?: number;
}

export interface GenerativeOpenAIArgs extends GenerativeOpenAIArgsBase {
  model?: string;
}
export interface GenerativeOpenAIConfig {
  'generative-openai': GenerativeOpenAIArgs;
}

export interface GenerativeAzureOpenAIArgs extends GenerativeOpenAIArgsBase {
  resourceName: string;
  deploymentId: string;
}
export interface GenerativeAzureOpenAIConfig {
  'generative-openai': GenerativeAzureOpenAIArgs;
}

export interface GenerativeCohereArgs {
  kProperty?: number;
  model?: string;
  maxTokensProperty?: number;
  returnLikelihoodsProperty?: string;
  stopSequencesProperty?: string[];
  temperatureProperty?: number;
}
export interface GenerativeCohereConfig {
  'generative-cohere': GenerativeCohereArgs;
}

export interface GenerativePaLMArgs {
  apiEndpoint?: string;
  maxOutputTokens?: number;
  modelId?: string;
  projectId: string;
  temperature?: number;
  topK?: number;
  topP?: number;
}
export interface GenerativePaLMConfig {
  'generative-palm': GenerativePaLMArgs;
}

export type GenerativeConfig =
  | GenerativeAzureOpenAIConfig
  | GenerativeOpenAIConfig
  | GenerativeCohereConfig
  | GenerativePaLMConfig;

export interface MetadataQuery {
  uuid?: boolean;
  vector?: boolean;
  creationTimeUnix?: boolean;
  lastUpdateTimeUnix?: boolean;
  distance?: boolean;
  certainty?: boolean;
  score?: boolean;
  explainScore?: boolean;
  isConsistent?: boolean;
}

export type MetadataReturn = {
  uuid?: string;
  vector?: number[];
  creationTimeUnix?: number;
  lastUpdateTimeUnix?: number;
  distance?: number;
  certainty?: number;
  score?: number;
  explainScore?: string;
  isConsistent?: boolean;
};

export type WeaviateObject<T> = {
  properties: T;
  metadata: MetadataReturn;
};

export type QueryReturn<T> = {
  objects: WeaviateObject<T>[];
};

export interface RefProperty {
  type: 'ref';
  linkOn: string;
  returnProperties: Property[];
  returnMetadata: MetadataQuery;
}

export interface MultiRefProperty {
  type: 'multi-ref';
  linkOn: string;
  returnProperties: Property[];
  returnMetadata: MetadataQuery;
  targetCollection: string;
}

export interface NestedProperty {
  type: 'nested';
  name: string;
  properties: NonRefProperty[];
}

export type Property = 'string' | RefProperty | MultiRefProperty | NestedProperty;
export type NonRefProperty = 'string' | NestedProperty;
export type NonPrimitiveProperty = RefProperty | MultiRefProperty | NestedProperty;

export interface SortBy {
  property: string;
  ascending?: boolean;
}
