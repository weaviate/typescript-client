import {
  GenerativeAzureOpenAIArgs,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereArgs,
  GenerativeCohereConfig,
  GenerativeOpenAIArgs,
  GenerativeOpenAIConfig,
  GenerativePaLMArgs,
  GenerativePaLMConfig,
  Img2VecNeuralArgs,
  Img2VecNeuralConfig,
  InvertedIndexConfig,
  Multi2VecBindArgs,
  Multi2VecBindConfig,
  Multi2VecClipArgs,
  Multi2VecClipConfig,
  MultiTenancyConfig,
  PqEncoderDistribution,
  PqEncoderType,
  Ref2VecCentroidArgs,
  Ref2VecCentroidConfig,
  ReplicationConfig,
  ShardingConfig,
  Text2VecCohereArgs,
  Text2VecCohereConfig,
  Text2VecContextionaryArgs,
  Text2VecContextionaryConfig,
  Text2VecOpenAIArgs,
  Text2VecOpenAIConfig,
  VectorDistance,
  VectorIndexConfig,
} from './types';

class Vectorizer {
  static img2VecNeural = (args?: Img2VecNeuralArgs): Img2VecNeuralConfig => {
    return {
      'img2vec-neural': args ? args : {},
    };
  };

  static multi2VecBind = (args?: Multi2VecBindArgs): Multi2VecBindConfig => {
    return {
      'multi2vec-bind': args ? args : {},
    };
  };

  static multi2VecClip = (args?: Multi2VecClipArgs): Multi2VecClipConfig => {
    return {
      'multi2vec-clip': args ? args : {},
    };
  };

  static ref2VecCentroid = (args: Ref2VecCentroidArgs): Ref2VecCentroidConfig => {
    return {
      'ref2vec-centroid': args,
    };
  };

  static text2VecCohere = (args?: Text2VecCohereArgs): Text2VecCohereConfig => {
    return {
      'text2vec-cohere': args ? args : {},
    };
  };

  static text2VecContextionary = (args?: Text2VecContextionaryArgs): Text2VecContextionaryConfig => {
    return {
      'text2vec-contextionary': args ? args : {},
    };
  };

  static text2VecOpenAI = (args?: Text2VecOpenAIArgs): Text2VecOpenAIConfig => {
    return {
      'text2vec-openai': args ? args : {},
    };
  };
}

class Generative {
  static azureOpenai = (args: GenerativeAzureOpenAIArgs): GenerativeAzureOpenAIConfig => {
    return {
      'generative-openai': args,
    };
  };

  static cohere = (args?: GenerativeCohereArgs): GenerativeCohereConfig => {
    return {
      'generative-cohere': args ? args : {},
    };
  };

  static openai = (args?: GenerativeOpenAIArgs): GenerativeOpenAIConfig => {
    return {
      'generative-openai': args ? args : {},
    };
  };

  static palm = (args: GenerativePaLMArgs): GenerativePaLMConfig => {
    return {
      'generative-palm': args,
    };
  };
}

export default class Configure {
  static Vectorizer = Vectorizer;
  static Generative = Generative;

  static invertedIndex = (args?: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    indexTimestamps?: boolean;
    indexPropertyLength?: boolean;
    indexNullState?: boolean;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }): InvertedIndexConfig => {
    return {
      bm25: {
        b: this.default(args?.bm25b, 0.75),
        k1: this.default(args?.bm25k1, 1.2),
      },
      cleanupIntervalSeconds: this.default(args?.cleanupIntervalSeconds, 60),
      indexTimestamps: this.default(args?.indexTimestamps, false),
      indexPropertyLength: this.default(args?.indexPropertyLength, false),
      indexNullState: this.default(args?.indexNullState, false),
      stopwords: {
        preset: this.default(args?.stopwordsPreset, 'en'),
        additions: this.default(args?.stopwordsAdditions, undefined),
        removals: this.default(args?.stopwordsRemovals, undefined),
      },
    };
  };

  static multiTenancy = (args?: { enabled?: boolean }): MultiTenancyConfig => {
    return args ? { enabled: this.default(args.enabled, true) } : { enabled: true };
  };

  static replication = (args?: { factor?: number }): ReplicationConfig => {
    return args ? { factor: this.default(args.factor, 1) } : { factor: 1 };
  };

  static sharding = (args?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    actualCount?: number;
    desiredVirtualCount?: number;
    actualVirtualCount?: number;
  }): ShardingConfig => {
    return {
      virtualPerPhysical: this.default(args?.virtualPerPhysical, 128),
      desiredCount: this.default(args?.desiredCount, 1),
      actualCount: this.default(args?.actualCount, 1),
      desiredVirtualCount: this.default(args?.desiredVirtualCount, 128),
      actualVirtualCount: this.default(args?.actualVirtualCount, 128),
    };
  };

  static vectorIndex = (args?: {
    cleanupIntervalSeconds?: number;
    distanceMetric?: VectorDistance;
    dynamicEfFactor?: number;
    dynamicEfMax?: number;
    dynamicEfMin?: number;
    ef?: number;
    efConstruction?: number;
    flatSearchCutoff?: number;
    maxConnections?: number;
    pqBitCompression?: boolean;
    pqCentroids?: number;
    pqEnabled?: boolean;
    pqEncoderDistribution?: PqEncoderDistribution;
    pqEncoderType?: PqEncoderType;
    pqSegments?: number;
    pqTrainingLimit?: number;
    skip?: boolean;
    vectorCacheMaxObjects?: number;
  }): VectorIndexConfig => {
    return {
      cleanupIntervalSeconds: this.default(args?.cleanupIntervalSeconds, 300),
      distance: this.default(args?.distanceMetric, 'cosine'),
      dynamicEfFactor: this.default(args?.dynamicEfFactor, 8),
      dynamicEfMax: this.default(args?.dynamicEfMax, 500),
      dynamicEfMin: this.default(args?.dynamicEfMin, 100),
      ef: this.default(args?.ef, -1),
      efConstruction: this.default(args?.efConstruction, 128),
      flatSearchCutoff: this.default(args?.flatSearchCutoff, 40000),
      maxConnections: this.default(args?.maxConnections, 64),
      pq: {
        bitCompression: this.default(args?.pqBitCompression, false),
        centroids: this.default(args?.pqCentroids, 256),
        enabled: this.default(args?.pqEnabled, false),
        encoder: {
          distribution: this.default(args?.pqEncoderDistribution, 'log_normal'),
          type: this.default(args?.pqEncoderType, 'kmeans'),
        },
        segments: this.default(args?.pqSegments, 0),
        trainingLimit: this.default(args?.pqTrainingLimit, 100000),
      },
      skip: this.default(args?.skip, false),
      vectorCacheMaxObjects: this.default(args?.vectorCacheMaxObjects, 1000000000000),
    };
  };

  private static default<D>(value: D | undefined, defaultValue: D): D {
    return value !== undefined ? value : defaultValue;
  }
}
