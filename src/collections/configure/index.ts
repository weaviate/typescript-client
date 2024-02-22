import {
  DataType,
  GenerativeAzureOpenAIOptions,
  GenerativeCohereOptions,
  GenerativeOpenAIOptions,
  GenerativePaLMOptions,
  Img2VecNeuralOptions,
  InvertedIndexConfigCreate,
  ModuleOptions,
  Multi2VecBindOptions,
  Multi2VecClipOptions,
  MultiTenancyConfigCreate,
  PQConfigCreate,
  Ref2VecCentroidOptions,
  ReplicationConfigCreate,
  RerankerCohereOptions,
  ShardingConfigCreate,
  Text2VecCohereOptions,
  Text2VecContextionaryOptions,
  Text2VecOpenAIOptions,
  VectorDistance,
  VectorIndexConfigHNSWCreate,
} from '../types';

const vectorizer = {
  none: (): ModuleOptions<'none', Record<string, never>> => {
    return {
      name: 'none',
      options: {},
    };
  },
  img2VecNeural: (Options?: Img2VecNeuralOptions): ModuleOptions<'img2vec-neural', Img2VecNeuralOptions> => {
    return {
      name: 'img2vec-neural',
      options: Options,
    };
  },
  multi2VecBind: (Options?: Multi2VecBindOptions): ModuleOptions<'multi2vec-bind', Multi2VecBindOptions> => {
    return {
      name: 'multi2vec-bind',
      options: Options,
    };
  },
  multi2VecClip: (Options?: Multi2VecClipOptions): ModuleOptions<'multi2vec-clip', Multi2VecClipOptions> => {
    return {
      name: 'multi2vec-clip',
      options: Options,
    };
  },
  ref2VecCentroid: (
    Options: Ref2VecCentroidOptions
  ): ModuleOptions<'ref2vec-centroid', Ref2VecCentroidOptions> => {
    return {
      name: 'ref2vec-centroid',
      options: Options,
    };
  },
  text2VecCohere: (
    Options?: Text2VecCohereOptions
  ): ModuleOptions<'text2vec-cohere', Text2VecCohereOptions> => {
    return {
      name: 'text2vec-cohere',
      options: Options,
    };
  },
  text2VecContextionary: (
    Options?: Text2VecContextionaryOptions
  ): ModuleOptions<'text2vec-contextionary', Text2VecContextionaryOptions> => {
    return {
      name: 'text2vec-contextionary',
      options: Options,
    };
  },
  text2VecOpenAI: (
    Options?: Text2VecOpenAIOptions
  ): ModuleOptions<'text2vec-openai', Text2VecOpenAIOptions> => {
    return {
      name: 'text2vec-openai',
      options: Options,
    };
  },
};

const generative = {
  azureOpenAI: (
    Options: GenerativeAzureOpenAIOptions
  ): ModuleOptions<'generative-openai', GenerativeAzureOpenAIOptions> => {
    return {
      name: 'generative-openai',
      options: Options,
    };
  },
  cohere: (
    Options?: GenerativeCohereOptions
  ): ModuleOptions<'generative-cohere', GenerativeCohereOptions> => {
    return {
      name: 'generative-cohere',
      options: Options,
    };
  },
  openAI: (
    Options?: GenerativeOpenAIOptions
  ): ModuleOptions<'generative-openai', GenerativeOpenAIOptions> => {
    return {
      name: 'generative-openai',
      options: Options,
    };
  },
  palm: (Options: GenerativePaLMOptions): ModuleOptions<'generative-palm', GenerativePaLMOptions> => {
    return {
      name: 'generative-palm',
      options: Options,
    };
  },
};

const reranker = {
  cohere: (Options?: RerankerCohereOptions): ModuleOptions<'reranker-cohere', RerankerCohereOptions> => {
    return {
      name: 'reranker-cohere',
      options: Options,
    };
  },
  transformers: (): ModuleOptions<'reranker-transformers', Record<string, never>> => {
    return {
      name: 'reranker-transformers',
      options: {},
    };
  },
};

const vectorIndex = {
  hnsw: (Options?: {
    cleanupIntervalSeconds?: number;
    distanceMetric?: VectorDistance;
    dynamicEfFactor?: number;
    dynamicEfMax?: number;
    dynamicEfMin?: number;
    ef?: number;
    efConstruction?: number;
    flatSearchCutoff?: number;
    maxConnections?: number;
    pq?: PQConfigCreate;
    skip?: boolean;
    vectorCacheMaxObjects?: number;
  }): VectorIndexConfigHNSWCreate => {
    return {
      cleanupIntervalSeconds: parseWithDefault(Options?.cleanupIntervalSeconds, 300),
      distance: parseWithDefault(Options?.distanceMetric, 'cosine'),
      dynamicEfFactor: parseWithDefault(Options?.dynamicEfFactor, 8),
      dynamicEfMax: parseWithDefault(Options?.dynamicEfMax, 500),
      dynamicEfMin: parseWithDefault(Options?.dynamicEfMin, 100),
      ef: parseWithDefault(Options?.ef, -1),
      efConstruction: parseWithDefault(Options?.efConstruction, 128),
      flatSearchCutoff: parseWithDefault(Options?.flatSearchCutoff, 40000),
      maxConnections: parseWithDefault(Options?.maxConnections, 64),
      pq: Options?.pq
        ? {
            bitCompression: parseWithDefault(Options.pq.bitCompression, false),
            centroids: parseWithDefault(Options.pq.centroids, 256),
            enabled: true,
            encoder: Options.pq.encoder
              ? {
                  distribution: parseWithDefault(Options.pq.encoder.distribution, 'log_normal'),
                  type: parseWithDefault(Options?.pq.encoder.type, 'kmeans'),
                }
              : undefined,
            segments: parseWithDefault(Options?.pq.segments, 0),
            trainingLimit: parseWithDefault(Options?.pq.trainingLimit, 100000),
          }
        : undefined,
      skip: parseWithDefault(Options?.skip, false),
      vectorCacheMaxObjects: parseWithDefault(Options?.vectorCacheMaxObjects, 1000000000000),
    };
  },
};

const dataType: Record<string, DataType> = {
  INT: 'int',
  INT_ARRAY: 'int[]',
  NUMBER: 'number',
  NUMBER_ARRAY: 'number[]',
  TEXT: 'text',
  TEXT_ARRAY: 'text[]',
  BOOLEAN: 'boolean',
  BOOLEAN_ARRAY: 'boolean[]',
  DATE: 'date',
  DATE_ARRAY: 'date[]',
  OBJECT: 'object',
  OBJECT_ARRAY: 'object[]',
  BLOB: 'blob',
  GEO_COORDINATES: 'geoCoordinates',
  PHONE_NUMBER: 'phoneNumber',
};

export default {
  generative,
  reranker,
  vectorizer,
  vectorIndex,
  dataType,
  invertedIndex: (Options?: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    indexTimestamps?: boolean;
    indexPropertyLength?: boolean;
    indexNullState?: boolean;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }): InvertedIndexConfigCreate => {
    return {
      bm25: {
        b: parseWithDefault(Options?.bm25b, 0.75),
        k1: parseWithDefault(Options?.bm25k1, 1.2),
      },
      cleanupIntervalSeconds: parseWithDefault(Options?.cleanupIntervalSeconds, 60),
      indexTimestamps: parseWithDefault(Options?.indexTimestamps, false),
      indexPropertyLength: parseWithDefault(Options?.indexPropertyLength, false),
      indexNullState: parseWithDefault(Options?.indexNullState, false),
      stopwords: {
        preset: parseWithDefault(Options?.stopwordsPreset, 'en'),
        additions: parseWithDefault(Options?.stopwordsAdditions, []),
        removals: parseWithDefault(Options?.stopwordsRemovals, []),
      },
    };
  },
  multiTenancy: (Options?: { enabled?: boolean }): MultiTenancyConfigCreate => {
    return Options ? { enabled: parseWithDefault(Options.enabled, true) } : { enabled: true };
  },
  replication: (Options?: { factor?: number }): ReplicationConfigCreate => {
    return Options ? { factor: parseWithDefault(Options.factor, 1) } : { factor: 1 };
  },
  sharding: (Options?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    actualCount?: number;
    desiredVirtualCount?: number;
    actualVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: parseWithDefault(Options?.virtualPerPhysical, 128),
      desiredCount: parseWithDefault(Options?.desiredCount, 1),
      actualCount: parseWithDefault(Options?.actualCount, 1),
      desiredVirtualCount: parseWithDefault(Options?.desiredVirtualCount, 128),
      actualVirtualCount: parseWithDefault(Options?.actualVirtualCount, 128),
      key: '_id',
      strategy: 'hash',
      function: 'murmur3',
    };
  },
};

function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}
