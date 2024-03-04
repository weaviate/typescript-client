import {
  DataType,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  Img2VecNeuralConfig,
  InvertedIndexConfigCreate,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  MultiTenancyConfigCreate,
  NamedVectorConfigCreate,
  NonRefKeys,
  PQConfigCreate,
  PrimitiveKeys,
  Properties,
  Ref2VecCentroidConfig,
  ReplicationConfigCreate,
  RerankerCohereConfig,
  ShardingConfigCreate,
  Text2VecCohereConfig,
  Text2VecContextionaryConfig,
  Text2VecOpenAIConfig,
  VectorDistance,
  VectorIndexConfigCreate,
  VectorIndexConfigHNSWCreate,
  VectorIndexType,
  VectorizerConfigType,
  Vectorizer,
} from '../types';

export const namedVectorizer = {
  make: <
    N extends string,
    I extends VectorIndexType,
    V extends Vectorizer,
    C extends VectorizerConfigType<V>,
    T
  >(
    name: N,
    vectorIndexType: I,
    vectorizer: V,
    properties?: PrimitiveKeys<T>[],
    vectorIndexConfig?: VectorIndexConfigCreate<I>,
    vectorizerConfig?: C
  ): NamedVectorConfigCreate<T, N, I, V, C> => {
    return {
      name,
      properties,
      vectorIndexConfig,
      vectorIndexType,
      vectorizer: {
        name: vectorizer,
        config: vectorizerConfig,
      },
    };
  },
};

// export interface NamedVectorizer<T extends Properties> {
//   make<I extends VectorIndexType, V extends Vectorizers>(
//     name: VectorKeys<T>,
//     vectorIndexType: I,
//     vectorizer: V,
//     vectorIndexconfig?: VectorIndexConfigCreate<I>,
//     vectorizerconfig?: VectorizerConfig<V>
//   ): NamedVectorConfig<I, V, VectorizerConfig<V>>;
// }

const vectorizer = {
  none: (): ModuleConfig<'none', Record<string, never>> => {
    return {
      name: 'none',
      config: {},
    };
  },
  img2VecNeural: (config?: Img2VecNeuralConfig): ModuleConfig<'img2vec-neural', Img2VecNeuralConfig> => {
    return {
      name: 'img2vec-neural',
      config: config,
    };
  },
  multi2VecBind: (config?: Multi2VecBindConfig): ModuleConfig<'multi2vec-bind', Multi2VecBindConfig> => {
    return {
      name: 'multi2vec-bind',
      config: config,
    };
  },
  multi2VecClip: (config?: Multi2VecClipConfig): ModuleConfig<'multi2vec-clip', Multi2VecClipConfig> => {
    return {
      name: 'multi2vec-clip',
      config: config,
    };
  },
  ref2VecCentroid: (
    config: Ref2VecCentroidConfig
  ): ModuleConfig<'ref2vec-centroid', Ref2VecCentroidConfig> => {
    return {
      name: 'ref2vec-centroid',
      config: config,
    };
  },
  text2VecCohere: (config?: Text2VecCohereConfig): ModuleConfig<'text2vec-cohere', Text2VecCohereConfig> => {
    return {
      name: 'text2vec-cohere',
      config: config,
    };
  },
  text2VecContextionary: (
    config?: Text2VecContextionaryConfig
  ): ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig> => {
    return {
      name: 'text2vec-contextionary',
      config: config,
    };
  },
  text2VecOpenAI: (config?: Text2VecOpenAIConfig): ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig> => {
    return {
      name: 'text2vec-openai',
      config: config,
    };
  },
};

const generative = {
  azureOpenAI: (
    config: GenerativeAzureOpenAIConfig
  ): ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  cohere: (config?: GenerativeCohereConfig): ModuleConfig<'generative-cohere', GenerativeCohereConfig> => {
    return {
      name: 'generative-cohere',
      config: config,
    };
  },
  openAI: (config?: GenerativeOpenAIConfig): ModuleConfig<'generative-openai', GenerativeOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  palm: (config: GenerativePaLMConfig): ModuleConfig<'generative-palm', GenerativePaLMConfig> => {
    return {
      name: 'generative-palm',
      config: config,
    };
  },
};

const reranker = {
  cohere: (config?: RerankerCohereConfig): ModuleConfig<'reranker-cohere', RerankerCohereConfig> => {
    return {
      name: 'reranker-cohere',
      config: config,
    };
  },
  transformers: (): ModuleConfig<'reranker-transformers', Record<string, never>> => {
    return {
      name: 'reranker-transformers',
      config: {},
    };
  },
};

const vectorIndex = {
  hnsw: (config?: {
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
      cleanupIntervalSeconds: parseWithDefault(config?.cleanupIntervalSeconds, 300),
      distance: parseWithDefault(config?.distanceMetric, 'cosine'),
      dynamicEfFactor: parseWithDefault(config?.dynamicEfFactor, 8),
      dynamicEfMax: parseWithDefault(config?.dynamicEfMax, 500),
      dynamicEfMin: parseWithDefault(config?.dynamicEfMin, 100),
      ef: parseWithDefault(config?.ef, -1),
      efConstruction: parseWithDefault(config?.efConstruction, 128),
      flatSearchCutoff: parseWithDefault(config?.flatSearchCutoff, 40000),
      maxConnections: parseWithDefault(config?.maxConnections, 64),
      pq: config?.pq
        ? {
            bitCompression: parseWithDefault(config.pq.bitCompression, false),
            centroids: parseWithDefault(config.pq.centroids, 256),
            enabled: true,
            encoder: config.pq.encoder
              ? {
                  distribution: parseWithDefault(config.pq.encoder.distribution, 'log_normal'),
                  type: parseWithDefault(config?.pq.encoder.type, 'kmeans'),
                }
              : undefined,
            segments: parseWithDefault(config?.pq.segments, 0),
            trainingLimit: parseWithDefault(config?.pq.trainingLimit, 100000),
          }
        : undefined,
      skip: parseWithDefault(config?.skip, false),
      vectorCacheMaxObjects: parseWithDefault(config?.vectorCacheMaxObjects, 1000000000000),
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
  invertedIndex: (config?: {
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
        b: parseWithDefault(config?.bm25b, 0.75),
        k1: parseWithDefault(config?.bm25k1, 1.2),
      },
      cleanupIntervalSeconds: parseWithDefault(config?.cleanupIntervalSeconds, 60),
      indexTimestamps: parseWithDefault(config?.indexTimestamps, false),
      indexPropertyLength: parseWithDefault(config?.indexPropertyLength, false),
      indexNullState: parseWithDefault(config?.indexNullState, false),
      stopwords: {
        preset: parseWithDefault(config?.stopwordsPreset, 'en'),
        additions: parseWithDefault(config?.stopwordsAdditions, []),
        removals: parseWithDefault(config?.stopwordsRemovals, []),
      },
    };
  },
  multiTenancy: (config?: { enabled?: boolean }): MultiTenancyConfigCreate => {
    return config ? { enabled: parseWithDefault(config.enabled, true) } : { enabled: true };
  },
  replication: (config?: { factor?: number }): ReplicationConfigCreate => {
    return config ? { factor: parseWithDefault(config.factor, 1) } : { factor: 1 };
  },
  sharding: (config?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    actualCount?: number;
    desiredVirtualCount?: number;
    actualVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: parseWithDefault(config?.virtualPerPhysical, 128),
      desiredCount: parseWithDefault(config?.desiredCount, 1),
      actualCount: parseWithDefault(config?.actualCount, 1),
      desiredVirtualCount: parseWithDefault(config?.desiredVirtualCount, 128),
      actualVirtualCount: parseWithDefault(config?.actualVirtualCount, 128),
      key: '_id',
      strategy: 'hash',
      function: 'murmur3',
    };
  },
};

function parseWithDefault<D>(value: D | undefined, defaultValue: D): D {
  return value !== undefined ? value : defaultValue;
}
