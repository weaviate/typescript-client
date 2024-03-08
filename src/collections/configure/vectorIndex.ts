import {
  InvertedIndexConfig,
  MultiTenancyConfig,
  PQConfig,
  ReplicationConfig,
  ShardingConfig,
  VectorDistance,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
} from '../config/types';
import { Properties, DataType } from '../types';
import { NonRefKeys, RefKeys } from '../types/internal';

import { parseWithDefault } from '.';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type InvertedIndexConfigCreate = RecursivePartial<InvertedIndexConfig>;

export type MultiTenancyConfigCreate = RecursivePartial<MultiTenancyConfig>;

export type NestedPropertyCreate<T, D> = D extends 'object' | 'object[]'
  ? PropertyConfigCreate<T extends Properties | undefined ? T : any>
  : never;

export interface PropertyConfigCreate<T> {
  name: NonRefKeys<T> & string;
  dataType: DataType<T[this['name']]>;
  description?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  nestedProperties?: NestedPropertyCreate<T[this['name']], this['dataType']>[];
  skipVectorisation?: boolean;
  tokenization?: 'word' | 'field' | 'whitespace' | 'lowercase';
  vectorizePropertyName?: boolean;
}

type ReferenceConfigBaseCreate<T> = {
  name: T extends Properties ? RefKeys<T> : string;
  description?: string;
};

export type ReferenceSingleTargetConfigCreate<T> = ReferenceConfigBaseCreate<T> & {
  targetCollection: string;
};

export type ReferenceMultiTargetConfigCreate<T> = ReferenceConfigBaseCreate<T> & {
  targetCollections: string[];
};

export type ReferenceConfigCreate<T> =
  | ReferenceSingleTargetConfigCreate<T>
  | ReferenceMultiTargetConfigCreate<T>;

export type ReplicationConfigCreate = RecursivePartial<ReplicationConfig>;

export type ShardingConfigCreate = RecursivePartial<ShardingConfig>;

export type PQConfigCreate = RecursivePartial<PQConfig>;

export type VectorIndexConfigHNSWCreate = RecursivePartial<VectorIndexConfigHNSW>;

export type VectorIndexConfigCreate<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSWCreate
  : I extends 'flat'
  ? VectorIndexConfigFlatCreate
  : I extends string
  ? Record<string, any>
  : never;

export type VectorIndexConfigFlatCreate = RecursivePartial<VectorIndexConfigFlat>;

export type VectorIndicesConfig =
  | VectorIndexConfigFlatCreate
  | VectorIndexConfigHNSWCreate
  | Record<string, any>;

export const vectorIndex = {
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
