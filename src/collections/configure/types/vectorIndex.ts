import { BQConfig, PQConfig, VectorIndexConfigFlat, VectorIndexConfigHNSW } from '../../config/types';
import { RecursivePartial } from './base';

type QuantizerRecursivePartial<T> = {
  [P in keyof T]: P extends 'type' ? T[P] : RecursivePartial<T[P]> | undefined;
};

export type PQConfigCreate = QuantizerRecursivePartial<PQConfig>;

export type BQConfigCreate = QuantizerRecursivePartial<BQConfig>;

export type VectorIndexConfigHNSWCreate = RecursivePartial<VectorIndexConfigHNSW>;

export type VectorIndexConfigCreateType<I> = I extends 'hnsw'
  ? VectorIndexConfigHNSWCreate
  : I extends 'flat'
  ? VectorIndexConfigFlatCreate
  : I extends string
  ? Record<string, any>
  : never;

export type VectorIndexConfigFlatCreate = RecursivePartial<VectorIndexConfigFlat>;

export type VectorIndexConfigCreate =
  | VectorIndexConfigFlatCreate
  | VectorIndexConfigHNSWCreate
  | Record<string, any>;
