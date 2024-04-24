import {
  BQConfig,
  ModuleConfig,
  PQConfig,
  PQEncoderDistribution,
  PQEncoderType,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
} from '../../config/types/index.js';
import { RecursivePartial } from './base.js';

type QuantizerRecursivePartial<T> = {
  [P in keyof T]: P extends 'type' ? T[P] : RecursivePartial<T[P]> | undefined;
};

export type PQConfigCreate = QuantizerRecursivePartial<PQConfig>;

export type PQConfigUpdate = {
  centroids?: number;
  enabled?: boolean;
  segments?: number;
  trainingLimit?: number;
  encoder?: {
    type?: PQEncoderType;
    distribution?: PQEncoderDistribution;
  };
  type: 'pq';
};

export type BQConfigCreate = QuantizerRecursivePartial<BQConfig>;

export type BQConfigUpdate = {
  rescoreLimit?: number;
  type: 'bq';
};

export type VectorIndexConfigHNSWCreate = RecursivePartial<VectorIndexConfigHNSW>;

export type VectorIndexConfigHNSWUpdate = {
  dynamicEfMin?: number;
  dynamicEfMax?: number;
  dynamicEfFactor?: number;
  ef?: number;
  flatSearchCutoff?: number;
  quantizer?: PQConfigUpdate | BQConfigUpdate;
  vectorCacheMaxObjects?: number;
};

export type VectorIndexConfigCreateType<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSWCreate
  : I extends 'flat'
  ? VectorIndexConfigFlatCreate
  : I extends string
  ? Record<string, any>
  : never;

export type VectorIndexConfigFlatCreate = RecursivePartial<VectorIndexConfigFlat>;

export type VectorIndexConfigFlatUpdate = {
  quantizer?: BQConfigUpdate;
  vectorCacheMaxObjects?: number;
};

export type VectorIndexConfigCreate =
  | VectorIndexConfigFlatCreate
  | VectorIndexConfigHNSWCreate
  | Record<string, any>;

export type VectorIndexConfigUpdate =
  | VectorIndexConfigFlatUpdate
  | VectorIndexConfigHNSWUpdate
  | Record<string, any>;

export type VectorIndexConfigUpdateType<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSWUpdate
  : I extends 'flat'
  ? VectorIndexConfigFlatUpdate
  : I extends string
  ? Record<string, any>
  : never;

export type LegacyVectorizerConfigUpdate =
  | ModuleConfig<'flat', VectorIndexConfigFlatUpdate>
  | ModuleConfig<'hnsw', VectorIndexConfigHNSWUpdate>
  | ModuleConfig<string, Record<string, any>>;
