import {
  BQConfig,
  InvertedIndexConfig,
  MultiTenancyConfig,
  PQConfig,
  ReplicationConfig,
  ShardingConfig,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
} from '../../config/types';
import { Properties, DataType } from '../../types';
import { NonRefKeys, RefKeys } from '../../types/internal';

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
