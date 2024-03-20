import {
  BQConfigCreate,
  PQConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';
import { ModuleConfig, PQEncoderDistribution, PQEncoderType, VectorDistance } from '../config/types/index.js';

import { parseWithDefault, parseQuantizer } from './parsing.js';

export default {
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
  quantizer: {
    bq: (config?: { cache?: boolean; rescoreLimit?: number }): BQConfigCreate => {
      return {
        cache: parseWithDefault(config?.cache, false),
        rescoreLimit: parseWithDefault(config?.rescoreLimit, 1000),
        type: 'bq',
      };
    },
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
