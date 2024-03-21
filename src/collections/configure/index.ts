import {
  InvertedIndexConfigCreate,
  InvertedIndexConfigUpdate,
  ModuleConfig,
  MultiTenancyConfigCreate,
  NamedVectorConfigCreate,
  NamedVectorConfigUpdate,
  NamedVectorizerCreateOptions,
  NamedVectorizerUpdateOptions,
  ReplicationConfigCreate,
  ShardingConfigCreate,
  VectorIndexConfigUpdateType,
  VectorIndexType,
  Vectorizer,
} from '../types/index.js';

import generative from './generative.js';
import reranker from './reranker.js';
import { configure as configureVectorIndex, reconfigure as reconfigureVectorIndex } from './vectorIndex.js';
import { vectorizer } from './vectorizer.js';

import { parseWithDefault } from './parsing.js';
import { PrimitiveKeys } from '../types/internal.js';

const dataType = {
  INT: 'int' as const,
  INT_ARRAY: 'int[]' as const,
  NUMBER: 'number' as const,
  NUMBER_ARRAY: 'number[]' as const,
  TEXT: 'text' as const,
  TEXT_ARRAY: 'text[]' as const,
  BOOLEAN: 'boolean' as const,
  BOOLEAN_ARRAY: 'boolean[]' as const,
  DATE: 'date' as const,
  DATE_ARRAY: 'date[]' as const,
  OBJECT: 'object' as const,
  OBJECT_ARRAY: 'object[]' as const,
  BLOB: 'blob' as const,
  GEO_COORDINATES: 'geoCoordinates' as const,
  PHONE_NUMBER: 'phoneNumber' as const,
};

const tokenization = {
  WORD: 'word' as const,
  LOWERCASE: 'lowercase' as const,
  WHITESPACE: 'whitespace' as const,
  FIELD: 'field' as const,
  TRIGRAM: 'trigram' as const,
  GSE: 'gse' as const,
};

const vectorDistances = {
  COSINE: 'cosine' as const,
  DOT: 'dot' as const,
  HAMMING: 'hamming' as const,
  L2_SQUARED: 'l2-squared' as const,
};

const configure = {
  generative,
  reranker,
  vectorizer,
  vectorIndex: configureVectorIndex,
  dataType,
  tokenization,
  vectorDistances,
  /**
   * Create an `InvertedIndexConfigCreate` object to be used when defining the configuration of the keyword searching algorithm of Weaviate.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} options.bm25b The BM25 b parameter. Default is 0.75.
   * @param {number} options.bm25k1 The BM25 k1 parameter. Default is 1.2.
   * @param {number} options.cleanupIntervalSeconds The interval in seconds at which the inverted index is cleaned up. Default is 60.
   * @param {boolean} options.indexTimestamps Whether to index timestamps. Default is false.
   * @param {boolean} options.indexPropertyLength Whether to index the length of properties. Default is false.
   * @param {boolean} options.indexNullState Whether to index the null state of properties. Default is false.
   * @param {'en' | 'none'} options.stopwordsPreset The stopwords preset to use. Default is 'en'.
   * @param {string[]} options.stopwordsAdditions Additional stopwords to add. Default is [].
   * @param {string[]} options.stopwordsRemovals Stopwords to remove. Default is [].
   */
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
  /**
   * Create a `MultiTenancyConfigCreate` object to be used when defining the multi-tenancy configuration of Weaviate.
   *
   * @param {boolean} config.enabled Whether multi-tenancy is enabled. Default is true.
   */
  multiTenancy: (options?: { enabled?: boolean }): MultiTenancyConfigCreate => {
    return options ? { enabled: parseWithDefault(options.enabled, true) } : { enabled: true };
  },
  /**
   * Create a `NamedVectorConfigCreate` object to be used when defining the named vector configuration of Weaviate.
   *
   * @param {string} name The name of the vector.
   * @param {NamedVectorizerOptions} [options] The options for the named vector.
   */
  namedVectorizer: <T, N extends string, I extends VectorIndexType = 'hnsw', V extends Vectorizer = 'none'>(
    name: N,
    options?: NamedVectorizerCreateOptions<PrimitiveKeys<T>[], I, V>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, V> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: options?.vectorIndexConfig ? options.vectorIndexConfig : { name: 'hnsw' as I },
      vectorizer: options?.vectorizerConfig ? options.vectorizerConfig : { name: 'none' as V },
    };
  },
  /**
   * Create a `ReplicationConfigCreate` object to be used when defining the replication configuration of Weaviate.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {number} config.factor The replication factor. Default is 1.
   */
  replication: (config?: { factor?: number }): ReplicationConfigCreate => {
    return config ? { factor: parseWithDefault(config.factor, 1) } : { factor: 1 };
  },
  /**
   * Create a `ShardingConfigCreate` object to be used when defining the sharding configuration of Weaviate.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {number} options.virtualPerPhysical The number of virtual shards per physical shard. Default is 128.
   * @param {number} options.desiredCount The desired number of physical shards. Default is 1.
   * @param {number} options.desiredVirtualCount The desired number of virtual shards. Default is 128.
   */
  sharding: (options?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    desiredVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: parseWithDefault(options?.virtualPerPhysical, 128),
      desiredCount: parseWithDefault(options?.desiredCount, 1),
      desiredVirtualCount: parseWithDefault(options?.desiredVirtualCount, 128),
    };
  },
};

const reconfigure = {
  vectorIndex: reconfigureVectorIndex,
  /**
   * Create an `InvertedIndexConfigUpdate` object to be used when updating the configuration of the keyword searching algorithm of Weaviate.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} options.bm25b The BM25 b parameter. Default is 0.75.
   * @param {number} options.bm25k1 The BM25 k1 parameter. Default is 1.2.
   * @param {number} options.cleanupIntervalSeconds The interval in seconds at which the inverted index is cleaned up. Default is 60.
   * @param {'en' | 'none'} options.stopwordsPreset The stopwords preset to use. Default is 'en'.
   * @param {string[]} options.stopwordsAdditions Additional stopwords to add. Default is [].
   * @param {string[]} options.stopwordsRemovals Stopwords to remove. Default is [].
   */
  invertedIndex: (options?: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }): InvertedIndexConfigUpdate => {
    return {
      bm25: {
        b: options?.bm25b,
        k1: options?.bm25k1,
      },
      cleanupIntervalSeconds: options?.cleanupIntervalSeconds,
      stopwords: {
        preset: options?.stopwordsPreset,
        additions: options?.stopwordsAdditions,
        removals: options?.stopwordsRemovals,
      },
    };
  },
  /**
   * Create a `NamedVectorConfigUpdate` object to be used when updating the named vector configuration of Weaviate.
   *
   * @param {string} name The name of the vector.
   * @param {NamedVectorizerOptions} [options] The options for the named vector.
   */
  namedVectorizer: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    options: NamedVectorizerUpdateOptions<I>
  ): NamedVectorConfigUpdate<N, I> => {
    return {
      vectorName: name,
      vectorIndex: options.vectorIndexConfig,
    };
  },
  /**
   * Create a `ReplicationConfigUpdate` object to be used when defining the replication configuration of Weaviate.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {number} options.factor The replication factor. Default is 1.
   */
  replication: (options?: { factor?: number }): ReplicationConfigCreate => {
    return options ? { factor: options.factor } : { factor: 1 };
  },
};

export { configure, reconfigure };
