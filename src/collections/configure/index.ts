import {
  InvertedIndexConfigCreate,
  InvertedIndexConfigUpdate,
  MultiTenancyConfigCreate,
  MultiTenancyConfigUpdate,
  ReplicationConfigCreate,
  ReplicationConfigUpdate,
  ReplicationDeletionStrategy,
  ShardingConfigCreate,
  VectorConfigUpdate,
  VectorIndexType,
  VectorizerUpdateOptions,
} from '../types/index.js';

import generative from './generative.js';
import reranker from './reranker.js';
import { configure as configureVectorIndex, reconfigure as reconfigureVectorIndex } from './vectorIndex.js';
import { multiVectors, vectorizer, vectors } from './vectorizer.js';

import { parseWithDefault } from './parsing.js';

const dataType = {
  INT: 'int' as const,
  INT_ARRAY: 'int[]' as const,
  NUMBER: 'number' as const,
  NUMBER_ARRAY: 'number[]' as const,
  TEXT: 'text' as const,
  TEXT_ARRAY: 'text[]' as const,
  UUID: 'uuid' as const,
  UUID_ARRAY: 'uuid[]' as const,
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
  KAGOME_KR: 'kagome_kr' as const,
};

const vectorDistances = {
  COSINE: 'cosine' as const,
  DOT: 'dot' as const,
  HAMMING: 'hamming' as const,
  L2_SQUARED: 'l2-squared' as const,
};

const configure = {
  generative,
  multiVectors,
  reranker,
  /**
   * @deprecated Use `configure.vectors` instead.
   */
  vectorizer: vectorizer,
  vectors,
  vectorIndex: configureVectorIndex,
  dataType,
  tokenization,
  vectorDistances,
  /**
   * Create an `InvertedIndexConfigCreate` object to be used when defining the configuration of the keyword searching algorithm of your collection.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} [options.bm25b] The BM25 b parameter.
   * @param {number} [options.bm25k1] The BM25 k1 parameter.
   * @param {number} [options.cleanupIntervalSeconds] The interval in seconds at which the inverted index is cleaned up.
   * @param {boolean} [options.indexTimestamps] Whether to index timestamps.
   * @param {boolean} [options.indexPropertyLength] Whether to index the length of properties.
   * @param {boolean} [options.indexNullState] Whether to index the null state of properties.
   * @param {'en' | 'none'} [options.stopwordsPreset] The stopwords preset to use.
   * @param {string[]} [options.stopwordsAdditions] Additional stopwords to add.
   * @param {string[]} [options.stopwordsRemovals] Stopwords to remove.
   */
  invertedIndex: (options: {
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
      bm25:
        options.bm25b || options.bm25k1
          ? {
              b: options.bm25b,
              k1: options.bm25k1,
            }
          : undefined,
      cleanupIntervalSeconds: options.cleanupIntervalSeconds,
      indexTimestamps: options.indexTimestamps,
      indexPropertyLength: options.indexPropertyLength,
      indexNullState: options.indexNullState,
      stopwords:
        options.stopwordsAdditions || options.stopwordsRemovals || options.stopwordsPreset
          ? {
              preset: options.stopwordsPreset,
              additions: options.stopwordsAdditions,
              removals: options.stopwordsRemovals,
            }
          : undefined,
    };
  },
  /**
   * Create a `MultiTenancyConfigCreate` object to be used when defining the multi-tenancy configuration of your collection.
   *
   * @param {boolean} [options.autoTenantActivation] Whether auto-tenant activation is enabled. Default is false.
   * @param {boolean} [options.autoTenantCreation] Whether auto-tenant creation is enabled. Default is false.
   * @param {boolean} [options.enabled] Whether multi-tenancy is enabled. Default is true.
   */
  multiTenancy: (options?: {
    autoTenantActivation?: boolean;
    autoTenantCreation?: boolean;
    enabled?: boolean;
  }): MultiTenancyConfigCreate => {
    return options
      ? {
          autoTenantActivation: parseWithDefault(options.autoTenantActivation, false),
          autoTenantCreation: parseWithDefault(options.autoTenantCreation, false),
          enabled: parseWithDefault(options.enabled, true),
        }
      : { autoTenantActivation: false, autoTenantCreation: false, enabled: true };
  },
  /**
   * Create a `ReplicationConfigCreate` object to be used when defining the replication configuration of your collection.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {boolean} [options.asyncEnabled] Whether asynchronous replication is enabled. Default is false.
   * @param {ReplicationDeletionStrategy} [options.deletionStrategy] The deletion strategy when replication conflicts are detected between deletes and reads.
   * @param {number} [options.factor] The replication factor. Default is 1.
   */
  replication: (options: {
    asyncEnabled?: boolean;
    deletionStrategy?: ReplicationDeletionStrategy;
    factor?: number;
  }): ReplicationConfigCreate => {
    return {
      asyncEnabled: options.asyncEnabled,
      deletionStrategy: options.deletionStrategy,
      factor: options.factor,
    };
  },
  /**
   * Create a `ShardingConfigCreate` object to be used when defining the sharding configuration of your collection.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {number} [options.virtualPerPhysical] The number of virtual shards per physical shard.
   * @param {number} [options.desiredCount] The desired number of physical shards.
   * @param {number} [options.desiredVirtualCount] The desired number of virtual shards.
   */
  sharding: (options: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    desiredVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: options.virtualPerPhysical,
      desiredCount: options.desiredCount,
      desiredVirtualCount: options.desiredVirtualCount,
    };
  },
};

const reconfigure = {
  vectorIndex: reconfigureVectorIndex,
  /**
   * Create an `InvertedIndexConfigUpdate` object to be used when updating the configuration of the keyword searching algorithm of your collection.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} [options.bm25b] The BM25 b parameter.
   * @param {number} [options.bm25k1] The BM25 k1 parameter.
   * @param {number} [options.cleanupIntervalSeconds] The interval in seconds at which the inverted index is cleaned up.
   * @param {'en' | 'none'} [options.stopwordsPreset] The stopwords preset to use.
   * @param {string[]} [options.stopwordsAdditions] Additional stopwords to add.
   * @param {string[]} [options.stopwordsRemovals] Stopwords to remove.
   */
  invertedIndex: (options: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }): InvertedIndexConfigUpdate => {
    return {
      bm25:
        options.bm25b || options.bm25k1
          ? {
              b: options.bm25b,
              k1: options.bm25k1,
            }
          : undefined,
      cleanupIntervalSeconds: options.cleanupIntervalSeconds,
      stopwords:
        options.stopwordsAdditions || options.stopwordsRemovals || options.stopwordsPreset
          ? {
              preset: options.stopwordsPreset,
              additions: options.stopwordsAdditions,
              removals: options.stopwordsRemovals,
            }
          : undefined,
    };
  },
  /**
   * @deprecated Use `vectors` instead.
   */
  vectorizer: {
    /**
     * Create a `VectorConfigUpdate` object to be used when updating the named vector configuration of Weaviate.
     *
     * @param {string} name The name of the vector.
     * @param {VectorizerOptions} options The options for the named vector.
     */
    update: <N extends string | undefined, I extends VectorIndexType>(
      options: VectorizerUpdateOptions<N, I>
    ): VectorConfigUpdate<N, I> => {
      return {
        name: options?.name as N,
        vectorIndex: options.vectorIndexConfig,
      };
    },
  },
  vectors: {
    /**
     * Create a `VectorConfigUpdate` object to be used when updating the named vector configuration of Weaviate.
     *
     * @param {string} name The name of the vector.
     * @param {VectorizerOptions} options The options for the named vector.
     */
    update: <N extends string | undefined, I extends VectorIndexType>(
      options: VectorizerUpdateOptions<N, I>
    ): VectorConfigUpdate<N, I> => {
      return {
        name: options?.name as N,
        vectorIndex: options.vectorIndexConfig,
      };
    },
  },
  /**
   * Create a `ReplicationConfigUpdate` object to be used when updating the replication configuration of Weaviate.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {boolean} [options.asyncEnabled] Whether to enable asynchronous replication.
   * @param {ReplicationDeletionStrategy} [options.deletionStrategy] The deletion strategy to update when replication conflicts are detected between deletes and reads.
   * @param {number} [options.factor] The replication factor to update.
   */
  replication: (options: {
    asyncEnabled?: boolean;
    deletionStrategy?: ReplicationDeletionStrategy;
    factor?: number;
  }): ReplicationConfigUpdate => {
    return {
      asyncEnabled: options.asyncEnabled,
      deletionStrategy: options.deletionStrategy,
      factor: options.factor,
    };
  },
  /**
   * Create a `MultiTenancyConfigUpdate` object to be used when updating the multi-tenancy configuration of Weaviate.
   *
   * Note: You cannot update a single-tenant collection to become a multi-tenant collection. You must instead create a new multi-tenant collection and migrate the data over manually.
   *
   * @param {boolean} [options.autoTenantActivation] Whether to enable auto-tenant activation.
   * @param {boolean} [options.autoTenantCreation] Whether to enable auto-tenant creation.
   *
   */
  multiTenancy: (options: {
    autoTenantActivation?: boolean;
    autoTenantCreation?: boolean;
  }): MultiTenancyConfigUpdate => {
    return {
      autoTenantActivation: options.autoTenantActivation,
      autoTenantCreation: options.autoTenantCreation,
    };
  },
  generative: configure.generative,
  reranker: configure.reranker,
};

export {
  configure,
  dataType,
  generative,
  multiVectors,
  reconfigure,
  reranker,
  tokenization,
  vectorDistances,
  configureVectorIndex as vectorIndex,
  vectorizer,
  vectors,
};
