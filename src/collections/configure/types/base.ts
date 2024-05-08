import {
  InvertedIndexConfig,
  MultiTenancyConfig,
  ReplicationConfig,
  ShardingConfig,
} from '../../config/types/index.js';
import { Properties, DataType } from '../../types/index.js';
import { NonRefKeys, RefKeys } from '../../types/internal.js';
import { WeaviateNestedProperty, WeaviateProperty } from '../../../openapi/types.js';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type InvertedIndexConfigCreate = RecursivePartial<InvertedIndexConfig>;

export type InvertedIndexConfigUpdate = {
  bm25?: {
    b?: number;
    k1?: number;
  };
  cleanupIntervalSeconds?: number;
  stopwords?: {
    preset?: string;
    additions?: string[];
    removals?: string[];
  };
};

export type MultiTenancyConfigCreate = RecursivePartial<MultiTenancyConfig>;

type NestedPropertyCreate<T = undefined> = T extends undefined
  ? {
      name: string;
      dataType: DataType;
      description?: string;
      nestedProperties?: NestedPropertyConfigCreate<T, DataType>[];
      indexInverted?: boolean;
      indexFilterable?: boolean;
      indexSearchable?: boolean;
      tokenization?: WeaviateNestedProperty['tokenization'];
    }
  : {
      [K in NonRefKeys<T>]: RequiresNested<DataType<T[K]>> extends true
        ? {
            name: K;
            dataType: DataType<T[K]>;
            nestedProperties: NestedPropertyConfigCreate<T[K], DataType<T[K]>>[];
          } & NestedPropertyConfigCreateBase
        : {
            name: K;
            dataType: DataType<T[K]>;
            nestedProperties?: NestedPropertyConfigCreate<T[K], DataType<T[K]>>[];
          } & NestedPropertyConfigCreateBase;
    }[NonRefKeys<T>];

export type NestedPropertyConfigCreate<T, D> = D extends 'object' | 'object[]'
  ? T extends (infer U)[]
    ? NestedPropertyCreate<U>
    : NestedPropertyCreate<T>
  : never;

type RequiresNested<T> = T extends 'object' | 'object[]' ? true : false;

type PropertyConfigCreateBase = {
  description?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  tokenization?: WeaviateProperty['tokenization'];
  skipVectorization?: boolean;
  vectorizePropertyName?: boolean;
};

type NestedPropertyConfigCreateBase = {
  description?: string;
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  tokenization?: WeaviateNestedProperty['tokenization'];
};

export type PropertyConfigCreate<T> = T extends undefined
  ? {
      name: string;
      dataType: DataType;
      description?: string;
      nestedProperties?: NestedPropertyConfigCreate<T, DataType>[];
      indexInverted?: boolean;
      indexFilterable?: boolean;
      indexSearchable?: boolean;
      tokenization?: WeaviateProperty['tokenization'];
      skipVectorization?: boolean;
      vectorizePropertyName?: boolean;
    }
  : {
      [K in NonRefKeys<T>]: RequiresNested<DataType<T[K]>> extends true
        ? {
            name: K;
            dataType: DataType<T[K]>;
            nestedProperties: NestedPropertyConfigCreate<T[K], DataType<T[K]>>[];
          } & PropertyConfigCreateBase
        : {
            name: K;
            dataType: DataType<T[K]>;
            nestedProperties?: NestedPropertyConfigCreate<T[K], DataType<T[K]>>[];
          } & PropertyConfigCreateBase;
    }[NonRefKeys<T>];

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

export type ReplicationConfigUpdate = {
  factor?: number;
};

export type ShardingConfigCreate = {
  virtualPerPhysical?: number;
  desiredCount?: number;
  desiredVirtualCount?: number;
};
