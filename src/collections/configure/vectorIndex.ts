import { ModuleConfig, PQEncoderDistribution, PQEncoderType, VectorDistance } from '../config/types/index.js';
import {
  BQConfigCreate,
  BQConfigUpdate,
  PQConfigCreate,
  PQConfigUpdate,
  SQConfigCreate,
  SQConfigUpdate,
  VectorIndexConfigDynamicCreate,
  VectorIndexConfigDynamicCreateOptions,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigFlatCreateOptions,
  VectorIndexConfigFlatUpdate,
  VectorIndexConfigHNSWCreate,
  VectorIndexConfigHNSWCreateOptions,
  VectorIndexConfigHNSWUpdate,
} from './types/index.js';

import { parseQuantizer } from './parsing.js';

const isModuleConfig = <N, C>(config: ModuleConfig<N, C> | C): config is ModuleConfig<N, C> => {
  return config && typeof config === 'object' && 'name' in config && 'config' in config;
};

const configure = {
  /**
   * Create a `ModuleConfig<'flat', VectorIndexConfigFlatCreate | undefined>` object when defining the configuration of the FLAT vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `configure.vectorizer` method.
   *
   * @param {VectorIndexConfigFlatCreateOptions} [opts] The options available for configuring the flat vector index.
   * @returns {ModuleConfig<'flat', VectorIndexConfigFlatCreate | undefined>} The configuration object.
   */
  flat: (
    opts?: VectorIndexConfigFlatCreateOptions
  ): ModuleConfig<'flat', VectorIndexConfigFlatCreate | undefined> => {
    const { distanceMetric: distance, vectorCacheMaxObjects, quantizer } = opts || {};
    return {
      name: 'flat',
      config: {
        distance,
        vectorCacheMaxObjects,
        quantizer: parseQuantizer(quantizer),
      },
    };
  },
  /**
   * Create a `ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate | undefined>` object when defining the configuration of the HNSW vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `configure.vectorizer` method.
   *
   * @param {VectorIndexConfigHNSWCreateOptions} [opts] The options available for configuring the HNSW vector index.
   * @returns {ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate | undefined>} The configuration object.
   */
  hnsw: (
    opts?: VectorIndexConfigHNSWCreateOptions
  ): ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate | undefined> => {
    const { distanceMetric, ...rest } = opts || {};
    return {
      name: 'hnsw',
      config: rest
        ? {
            ...rest,
            distance: distanceMetric,
            quantizer: parseQuantizer(rest.quantizer),
          }
        : undefined,
    };
  },
  /**
   * Create a `ModuleConfig<'dynamic', VectorIndexConfigDynamicCreate | undefined>` object when defining the configuration of the dynamic vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `configure.vectorizer` method.
   *
   * @param {VectorIndexConfigDynamicCreateOptions} [opts] The options available for configuring the dynamic vector index.
   * @returns {ModuleConfig<'dynamic', VectorIndexConfigDynamicCreate | undefined>} The configuration object.
   */
  dynamic: (
    opts?: VectorIndexConfigDynamicCreateOptions
  ): ModuleConfig<'dynamic', VectorIndexConfigDynamicCreate | undefined> => {
    return {
      name: 'dynamic',
      config: opts
        ? {
            distance: opts.distanceMetric,
            threshold: opts.threshold,
            hnsw: isModuleConfig(opts.hnsw) ? opts.hnsw.config : configure.hnsw(opts.hnsw).config,
            flat: isModuleConfig(opts.flat) ? opts.flat.config : configure.flat(opts.flat).config,
          }
        : undefined,
    };
  },
  /**
   * Define the quantizer configuration to use when creating a vector index.
   */
  quantizer: {
    /**
     * Create an object of type `BQConfigCreate` to be used when defining the quantizer configuration of a vector index.
     *
     * @param {boolean} [options.cache] Whether to cache the quantizer. Default is false.
     * @param {number} [options.rescoreLimit] The rescore limit. Default is 1000.
     * @returns {BQConfigCreate} The object of type `BQConfigCreate`.
     */
    bq: (options?: { cache?: boolean; rescoreLimit?: number }): BQConfigCreate => {
      return {
        cache: options?.cache,
        rescoreLimit: options?.rescoreLimit,
        type: 'bq',
      };
    },
    /**
     * Create an object of type `PQConfigCreate` to be used when defining the quantizer configuration of a vector index.
     *
     * @param {boolean} [options.bitCompression] Whether to use bit compression.
     * @param {number} [options.centroids] The number of centroids[.
     * @param {PQEncoderDistribution} ]options.encoder.distribution The encoder distribution.
     * @param {PQEncoderType} [options.encoder.type] The encoder type.
     * @param {number} [options.segments] The number of segments.
     * @param {number} [options.trainingLimit] The training limit.
     * @returns {PQConfigCreate} The object of type `PQConfigCreate`.
     */
    pq: (options?: {
      bitCompression?: boolean;
      centroids?: number;
      encoder?: {
        distribution?: PQEncoderDistribution;
        type?: PQEncoderType;
      };
      segments?: number;
      trainingLimit?: number;
    }): PQConfigCreate => {
      return {
        bitCompression: options?.bitCompression,
        centroids: options?.centroids,
        encoder: options?.encoder
          ? {
              distribution: options.encoder.distribution,
              type: options.encoder.type,
            }
          : undefined,
        segments: options?.segments,
        trainingLimit: options?.trainingLimit,
        type: 'pq',
      };
    },
    /**
     * Create an object of type `SQConfigCreate` to be used when defining the quantizer configuration of a vector index.
     *
     * @param {number} [options.rescoreLimit] The rescore limit.
     * @param {number} [options.trainingLimit] The training limit.
     * @returns {SQConfigCreate} The object of type `SQConfigCreate`.
     */
    sq: (options?: { rescoreLimit?: number; trainingLimit?: number }): SQConfigCreate => {
      return {
        rescoreLimit: options?.rescoreLimit,
        trainingLimit: options?.trainingLimit,
        type: 'sq',
      };
    },
  },
};

const reconfigure = {
  /**
   * Create a `ModuleConfig<'flat', VectorIndexConfigFlatUpdate>` object to update the configuration of the FLAT vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `reconfigure.vectorizer` method.
   *
   * @param {VectorDistance} [options.distanceMetric] The distance metric to use. Default is 'cosine'.
   * @param {number} [options.vectorCacheMaxObjects] The maximum number of objects to cache in the vector cache. Default is 1000000000000.
   * @param {BQConfigCreate} [options.quantizer] The quantizer configuration to use. Default is `bq`.
   * @returns {ModuleConfig<'flat', VectorIndexConfigFlatCreate>} The configuration object.
   */
  flat: (options: {
    vectorCacheMaxObjects?: number;
    quantizer?: BQConfigUpdate;
  }): ModuleConfig<'flat', VectorIndexConfigFlatUpdate> => {
    return {
      name: 'flat',
      config: {
        vectorCacheMaxObjects: options.vectorCacheMaxObjects,
        quantizer: parseQuantizer(options.quantizer),
      },
    };
  },
  /**
   * Create a `ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>` object to update the configuration of the HNSW vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `reconfigure.vectorizer` method.
   *
   * @param {number} [options.dynamicEfFactor] The dynamic ef factor. Default is 8.
   * @param {number} [options.dynamicEfMax] The dynamic ef max. Default is 500.
   * @param {number} [options.dynamicEfMin] The dynamic ef min. Default is 100.
   * @param {number} [options.ef] The ef parameter. Default is -1.
   * @param {number} [options.flatSearchCutoff] The flat search cutoff. Default is 40000.
   * @param {PQConfigUpdate | BQConfigUpdate} [options.quantizer] The quantizer configuration to use. Use `vectorIndex.quantizer.bq` or `vectorIndex.quantizer.pq` to make one.
   * @param {number} [options.vectorCacheMaxObjects] The maximum number of objects to cache in the vector cache. Default is 1000000000000.
   * @returns {ModuleConfig<'hnsw', VectorIndexConfigHNSWUpdate>} The configuration object.
   */
  hnsw: (options: {
    dynamicEfFactor?: number;
    dynamicEfMax?: number;
    dynamicEfMin?: number;
    ef?: number;
    flatSearchCutoff?: number;
    quantizer?: PQConfigUpdate | BQConfigUpdate | SQConfigUpdate;
    vectorCacheMaxObjects?: number;
  }): ModuleConfig<'hnsw', VectorIndexConfigHNSWUpdate> => {
    return {
      name: 'hnsw',
      config: options,
    };
  },
  /**
   * Define the quantizer configuration to use when creating a vector index.
   */
  quantizer: {
    /**
     * Create an object of type `BQConfigUpdate` to be used when updating the quantizer configuration of a vector index.
     *
     * NOTE: If the vector index already has a quantizer configured, you cannot change its quantizer type; only its values.
     * So if you want to change the quantizer type, you must recreate the collection.
     *
     * @param {boolean} [options.cache] Whether to cache the quantizer. Default is false.
     * @param {number} [options.rescoreLimit] The rescore limit. Default is 1000.
     * @returns {BQConfigCreate} The configuration object.
     */
    bq: (options?: { cache?: boolean; rescoreLimit?: number }): BQConfigUpdate => {
      return {
        ...options,
        type: 'bq',
      };
    },
    /**
     * Create an object of type `PQConfigUpdate` to be used when updating the quantizer configuration of a vector index.
     *
     * NOTE: If the vector index already has a quantizer configured, you cannot change its quantizer type; only its values.
     * So if you want to change the quantizer type, you must recreate the collection.
     *
     * @param {number} [options.centroids] The number of centroids. Default is 256.
     * @param {PQEncoderDistribution} [options.pqEncoderDistribution] The encoder distribution. Default is 'log-normal'.
     * @param {PQEncoderType} [options.pqEncoderType] The encoder type. Default is 'kmeans'.
     * @param {number} [options.segments] The number of segments. Default is 0.
     * @param {number} [options.trainingLimit] The training limit. Default is 100000.
     * @returns {PQConfigUpdate} The configuration object.
     */
    pq: (options?: {
      centroids?: number;
      pqEncoderDistribution?: PQEncoderDistribution;
      pqEncoderType?: PQEncoderType;
      segments?: number;
      trainingLimit?: number;
    }): PQConfigUpdate => {
      const { pqEncoderDistribution, pqEncoderType, ...rest } = options || {};
      return {
        ...rest,
        encoder:
          pqEncoderDistribution || pqEncoderType
            ? {
                distribution: pqEncoderDistribution,
                type: pqEncoderType,
              }
            : undefined,
        type: 'pq',
      };
    },
    /**
     * Create an object of type `SQConfigUpdate` to be used when updating the quantizer configuration of a vector index.
     *
     * NOTE: If the vector index already has a quantizer configured, you cannot change its quantizer type; only its values.
     * So if you want to change the quantizer type, you must recreate the collection.
     *
     * @param {number} [options.rescoreLimit] The rescore limit. Default is 1000.
     * @param {number} [options.trainingLimit] The training limit. Default is 100000.
     * @returns {SQConfigUpdate} The configuration object.
     */
    sq: (options?: { rescoreLimit?: number; trainingLimit?: number }): SQConfigUpdate => {
      return {
        ...options,
        type: 'sq',
      };
    },
  },
};

export { configure, reconfigure };
