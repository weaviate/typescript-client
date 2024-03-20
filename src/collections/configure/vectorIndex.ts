import {
  BQConfigCreate,
  PQConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';
import { ModuleConfig, PQEncoderDistribution, PQEncoderType, VectorDistance } from '../config/types/index.js';

import { parseWithDefault, parseQuantizer } from './parsing.js';

export default {
  /**
   * Create a `ModuleConfig<'flat', VectorIndexConfigFlatCreate>` object to update the configuration of the FLAT vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `namedVectorizer` method.
   *
   * @param {VectorDistance} [config.distanceMetric] The distance metric to use. Default is 'cosine'.
   * @param {number} [config.vectorCacheMaxObjects] The maximum number of objects to cache in the vector cache. Default is 1000000000000.
   * @param {BQConfigCreate} [config.quantizer] The quantizer configuration to use. Default is `bq`.
   * @returns {ModuleConfig<'flat', VectorIndexConfigFlatCreate>} The configuration object.
   */
  flat: (config?: {
    distanceMetric?: VectorDistance;
    vectorCacheMaxObjects?: number;
    quantizer?: BQConfigCreate;
  }): ModuleConfig<'flat', VectorIndexConfigFlatCreate> => {
    return {
      name: 'flat',
      config: {
        distance: parseWithDefault(config?.distanceMetric, 'cosine'),
        vectorCacheMaxObjects: parseWithDefault(config?.vectorCacheMaxObjects, 1000000000000),
        quantizer: parseQuantizer(config?.quantizer),
      },
    };
  },
  /**
   * Create a `ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>` object to update the configuration of the HNSW vector index.
   *
   * Use this method when defining the `options.vectorIndexConfig` argument of the `namedVectorizer` method.
   *
   * @param {number} [config.cleanupIntervalSeconds] The interval in seconds at which to clean up the index. Default is 300.
   * @param {VectorDistance} [config.distanceMetric] The distance metric to use. Default is 'cosine'.
   * @param {number} [config.dynamicEfFactor] The dynamic ef factor. Default is 8.
   * @param {number} [config.dynamicEfMax] The dynamic ef max. Default is 500.
   * @param {number} [config.dynamicEfMin] The dynamic ef min. Default is 100.
   * @param {number} [config.ef] The ef parameter. Default is -1.
   * @param {number} [config.efConstruction] The ef construction parameter. Default is 128.
   * @param {number} [config.flatSearchCutoff] The flat search cutoff. Default is 40000.
   * @param {number} [config.maxConnections] The maximum number of connections. Default is 64.
   * @param {PQConfigCreate | BQConfigCreate} [config.quantizer] The quantizer configuration to use. Use `vectorIndex.quantizer.bq` or `vectorIndex.quantizer.pq` to make one.
   * @param {boolean} [config.skip] Whether to skip the index. Default is false.
   * @param {number} [config.vectorCacheMaxObjects] The maximum number of objects to cache in the vector cache. Default is 1000000000000.
   * @returns The `ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>` object.
   */
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
    quantizer?: PQConfigCreate | BQConfigCreate;
    skip?: boolean;
    vectorCacheMaxObjects?: number;
  }): ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate> => {
    return {
      name: 'hnsw',
      config: {
        cleanupIntervalSeconds: parseWithDefault(config?.cleanupIntervalSeconds, 300),
        distance: parseWithDefault(config?.distanceMetric, 'cosine'),
        dynamicEfFactor: parseWithDefault(config?.dynamicEfFactor, 8),
        dynamicEfMax: parseWithDefault(config?.dynamicEfMax, 500),
        dynamicEfMin: parseWithDefault(config?.dynamicEfMin, 100),
        ef: parseWithDefault(config?.ef, -1),
        efConstruction: parseWithDefault(config?.efConstruction, 128),
        flatSearchCutoff: parseWithDefault(config?.flatSearchCutoff, 40000),
        maxConnections: parseWithDefault(config?.maxConnections, 64),
        quantizer: parseQuantizer(config?.quantizer),
        skip: parseWithDefault(config?.skip, false),
        vectorCacheMaxObjects: parseWithDefault(config?.vectorCacheMaxObjects, 1000000000000),
      },
    };
  },
  /**
   * Define the quantizer configuration to use when creating a vector index.
   */
  quantizer: {
    /**
     * Create a `BQConfigCreate` object to be used when defining the quantizer configuration of a vector index.
     *
     * @param config.cache Whether to cache the quantizer. Default is false.
     * @param config.rescoreLimit The rescore limit. Default is 1000.
     * @returns The `BQConfigCreate` object.
     */
    bq: (config?: { cache?: boolean; rescoreLimit?: number }): BQConfigCreate => {
      return {
        cache: parseWithDefault(config?.cache, false),
        rescoreLimit: parseWithDefault(config?.rescoreLimit, 1000),
        type: 'bq',
      };
    },
    /**
     * Create a `PQConfigCreate` object to be used when defining the quantizer configuration of a vector index.
     *
     * @param config.bitCompression Whether to use bit compression. Default is false.
     * @param config.centroids The number of centroids. Default is 256.
     * @param config.encoder.distribution The encoder distribution. Default is 'log-normal'.
     * @param config.encoder.type The encoder type. Default is 'kmeans'.
     * @param config.segments The number of segments. Default is 0.
     * @param config.trainingLimit The training limit. Default is 100000.
     * @returns The `PQConfigCreate` object.
     */
    pq: (config?: {
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
        bitCompression: parseWithDefault(config?.bitCompression, false),
        centroids: parseWithDefault(config?.centroids, 256),
        encoder: config?.encoder
          ? {
              distribution: parseWithDefault(config.encoder.distribution, 'log-normal'),
              type: parseWithDefault(config.encoder.type, 'kmeans'),
            }
          : {
              distribution: 'log-normal',
              type: 'kmeans',
            },
        segments: parseWithDefault(config?.segments, 0),
        trainingLimit: parseWithDefault(config?.trainingLimit, 100000),
        type: 'pq',
      };
    },
  },
};
