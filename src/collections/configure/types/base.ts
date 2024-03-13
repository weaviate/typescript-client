import {
  InvertedIndexConfig,
  MultiTenancyConfig,
  ReplicationConfig,
  ShardingConfig,
} from '../../config/types';
import { Properties, DataType } from '../../types';
import { NonRefKeys, RefKeys } from '../../types/internal';
import { WeaviateNestedProperty, WeaviateProperty } from '../../../openapi/types';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type InvertedIndexConfigCreate = RecursivePartial<InvertedIndexConfig>;

export type MultiTenancyConfigCreate = RecursivePartial<MultiTenancyConfig>;

type NestedPropertyCreate<T> = {
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
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  skipVectorisation?: boolean;
  tokenization?: WeaviateProperty['tokenization'];
  vectorizePropertyName?: boolean;
};

type NestedPropertyConfigCreateBase = {
  indexInverted?: boolean;
  indexFilterable?: boolean;
  indexSearchable?: boolean;
  tokenization?: WeaviateNestedProperty['tokenization'];
};

export type PropertyConfigCreate<T> = {
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

export type ShardingConfigCreate = RecursivePartial<ShardingConfig>;
