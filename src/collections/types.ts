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
  invertedIndex?: InvertedIndexConfig;
  multiTenancy?: MultiTenancyConfig;
  properties?: PropertyConfig[];
  replication?: ReplicationConfig;
  sharding?: ShardingConfig;
  vectorIndex?: VectorIndexConfig;
  vectorizer?: VectorizerConfig;
}

interface Img2VecNeural {
  'img2vec-neural': {
    imageFields?: string[];
  };
}

interface Multi2VecClip {
  'multi2vec-clip': {
    imageFields?: string[];
    textFields?: string[];
    vectorizeClassName?: boolean;
  };
}

interface Multi2VecBind {
  'multi2vec-bind': {
    audioFields?: string[];
    depthFields?: string[];
    imageFields?: string[];
    IMUFields?: string[];
    textFields?: string[];
    thermalFields?: string[];
    videoFields?: string[];
    vectorizeClassName?: boolean;
  };
}

interface Ref2VecCentroid {
  'ref2vec-centroid': {
    referenceProperties: string[];
    method: 'mean';
  };
}

interface Text2VecContextionary {
  'text2vec-contextionary': {
    vectorizeClassName?: boolean;
  };
}

interface Text2VecOpenAIConfig {
  'text2vec-openai': {
    model?: 'ada' | 'babbage' | 'curie' | 'davinci';
    modelVersion?: string;
    type?: 'text' | 'code';
    vectorizeClassName?: boolean;
  };
}

interface Text2VecCohere {
  'text2vec-cohere': {
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
  };
}

export type VectorizerConfig =
  | Img2VecNeural
  | Multi2VecClip
  | Multi2VecBind
  | Ref2VecCentroid
  | Text2VecContextionary
  | Text2VecCohere
  | Text2VecOpenAIConfig;
