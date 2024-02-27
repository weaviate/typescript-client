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
  NamedVectorConfig,
  PQConfigCreate,
  Properties,
  Ref2VecCentroidOptions,
  ReplicationConfigCreate,
  RerankerCohereOptions,
  ShardingConfigCreate,
  Text2VecCohereOptions,
  Text2VecContextionaryOptions,
  Text2VecOpenAIOptions,
  VectorDistance,
  VectorIndexConfigCreate,
  VectorIndexConfigHNSWCreate,
  VectorIndexType,
  VectorKeys,
  VectorizerConfig,
  Vectorizers,
} from '../types';

export const namedVectorizer = {
  make: <N extends string, I extends VectorIndexType, V extends Vectorizers>(
    name: N,
    vectorIndexType: I,
    vectorizer: V,
    vectorIndexConfig?: VectorIndexConfigCreate<I>,
    vectorizerConfig?: VectorizerConfig<V>
  ): NamedVectorConfig<N, I, V, VectorizerConfig<V>> => {
    return {
      name,
      vectorIndexConfig,
      vectorIndexType,
      vectorConfig: {
        name: vectorizer,
        options: vectorizerConfig,
      },
    };
  },
};

// export interface NamedVectorizer<T extends Properties> {
//   make<I extends VectorIndexType, V extends Vectorizers>(
//     name: VectorKeys<T>,
//     vectorIndexType: I,
//     vectorizer: V,
//     vectorIndexConfig?: VectorIndexConfigCreate<I>,
//     vectorizerConfig?: VectorizerConfig<V>
//   ): NamedVectorConfig<I, V, VectorizerConfig<V>>;
// }

const vectorizer = {
  none: (): ModuleOptions<'none', Record<string, never>> => {
    return {
      name: 'none',
      options: {},
    };
  },
  img2VecNeural: (options?: Img2VecNeuralOptions): ModuleOptions<'img2vec-neural', Img2VecNeuralOptions> => {
    return {
      name: 'img2vec-neural',
      options: options,
    };
  },
  multi2VecBind: (options?: Multi2VecBindOptions): ModuleOptions<'multi2vec-bind', Multi2VecBindOptions> => {
    return {
      name: 'multi2vec-bind',
      options: options,
    };
  },
  multi2VecClip: (options?: Multi2VecClipOptions): ModuleOptions<'multi2vec-clip', Multi2VecClipOptions> => {
    return {
      name: 'multi2vec-clip',
      options: options,
    };
  },
  ref2VecCentroid: (
    options: Ref2VecCentroidOptions
  ): ModuleOptions<'ref2vec-centroid', Ref2VecCentroidOptions> => {
    return {
      name: 'ref2vec-centroid',
      options: options,
    };
  },
  text2VecCohere: (
    options?: Text2VecCohereOptions
  ): ModuleOptions<'text2vec-cohere', Text2VecCohereOptions> => {
    return {
      name: 'text2vec-cohere',
      options: options,
    };
  },
  text2VecContextionary: (
    options?: Text2VecContextionaryOptions
  ): ModuleOptions<'text2vec-contextionary', Text2VecContextionaryOptions> => {
    return {
      name: 'text2vec-contextionary',
      options: options,
    };
  },
  text2VecOpenAI: (
    options?: Text2VecOpenAIOptions
  ): ModuleOptions<'text2vec-openai', Text2VecOpenAIOptions> => {
    return {
      name: 'text2vec-openai',
      options: options,
    };
  },
};

const generative = {
  azureOpenAI: (
    options: GenerativeAzureOpenAIOptions
  ): ModuleOptions<'generative-openai', GenerativeAzureOpenAIOptions> => {
    return {
      name: 'generative-openai',
      options: options,
    };
  },
  cohere: (
    options?: GenerativeCohereOptions
  ): ModuleOptions<'generative-cohere', GenerativeCohereOptions> => {
    return {
      name: 'generative-cohere',
      options: options,
    };
  },
  openAI: (
    options?: GenerativeOpenAIOptions
  ): ModuleOptions<'generative-openai', GenerativeOpenAIOptions> => {
    return {
      name: 'generative-openai',
      options: options,
    };
  },
  palm: (options: GenerativePaLMOptions): ModuleOptions<'generative-palm', GenerativePaLMOptions> => {
    return {
      name: 'generative-palm',
      options: options,
    };
  },
};

const reranker = {
  cohere: (options?: RerankerCohereOptions): ModuleOptions<'reranker-cohere', RerankerCohereOptions> => {
    return {
      name: 'reranker-cohere',
      options: options,
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
  hnsw: (options?: {
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
      cleanupIntervalSeconds: parseWithDefault(options?.cleanupIntervalSeconds, 300),
      distance: parseWithDefault(options?.distanceMetric, 'cosine'),
      dynamicEfFactor: parseWithDefault(options?.dynamicEfFactor, 8),
      dynamicEfMax: parseWithDefault(options?.dynamicEfMax, 500),
      dynamicEfMin: parseWithDefault(options?.dynamicEfMin, 100),
      ef: parseWithDefault(options?.ef, -1),
      efConstruction: parseWithDefault(options?.efConstruction, 128),
      flatSearchCutoff: parseWithDefault(options?.flatSearchCutoff, 40000),
      maxConnections: parseWithDefault(options?.maxConnections, 64),
      pq: options?.pq
        ? {
            bitCompression: parseWithDefault(options.pq.bitCompression, false),
            centroids: parseWithDefault(options.pq.centroids, 256),
            enabled: true,
            encoder: options.pq.encoder
              ? {
                  distribution: parseWithDefault(options.pq.encoder.distribution, 'log_normal'),
                  type: parseWithDefault(options?.pq.encoder.type, 'kmeans'),
                }
              : undefined,
            segments: parseWithDefault(options?.pq.segments, 0),
            trainingLimit: parseWithDefault(options?.pq.trainingLimit, 100000),
          }
        : undefined,
      skip: parseWithDefault(options?.skip, false),
      vectorCacheMaxObjects: parseWithDefault(options?.vectorCacheMaxObjects, 1000000000000),
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
  namedVectorizer,
  reranker,
  vectorizer,
  vectorIndex,
  dataType,
  invertedIndex: (options?: {
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
        b: parseWithDefault(options?.bm25b, 0.75),
        k1: parseWithDefault(options?.bm25k1, 1.2),
      },
      cleanupIntervalSeconds: parseWithDefault(options?.cleanupIntervalSeconds, 60),
      indexTimestamps: parseWithDefault(options?.indexTimestamps, false),
      indexPropertyLength: parseWithDefault(options?.indexPropertyLength, false),
      indexNullState: parseWithDefault(options?.indexNullState, false),
      stopwords: {
        preset: parseWithDefault(options?.stopwordsPreset, 'en'),
        additions: parseWithDefault(options?.stopwordsAdditions, []),
        removals: parseWithDefault(options?.stopwordsRemovals, []),
      },
    };
  },
  multiTenancy: (options?: { enabled?: boolean }): MultiTenancyConfigCreate => {
    return options ? { enabled: parseWithDefault(options.enabled, true) } : { enabled: true };
  },
  replication: (options?: { factor?: number }): ReplicationConfigCreate => {
    return options ? { factor: parseWithDefault(options.factor, 1) } : { factor: 1 };
  },
  sharding: (options?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    actualCount?: number;
    desiredVirtualCount?: number;
    actualVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: parseWithDefault(options?.virtualPerPhysical, 128),
      desiredCount: parseWithDefault(options?.desiredCount, 1),
      actualCount: parseWithDefault(options?.actualCount, 1),
      desiredVirtualCount: parseWithDefault(options?.desiredVirtualCount, 128),
      actualVirtualCount: parseWithDefault(options?.actualVirtualCount, 128),
      key: '_id',
      strategy: 'hash',
      function: 'murmur3',
    };
  },
};

function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}
