export * from './generative';
export * from './reranker';
export * from './vectorIndex';
export * from './vectorizer';

import { GenerativeConfig } from './generative';
import { RerankerConfig } from './reranker';
import { VectorConfig } from './vectorizer';

export type ModuleConfig<N, C = Record<string, any>> = {
  name: N;
  config?: C;
};

export type InvertedIndexConfig = {
  bm25: {
    k1: number;
    b: number;
  };
  cleanupIntervalSeconds: number;
  indexTimestamps: boolean;
  indexPropertyLength: boolean;
  indexNullState: boolean;
  stopwords: {
    preset: string;
    additions: string[];
    removals: string[];
  };
};

export type MultiTenancyConfig = {
  enabled: boolean;
};

export type ReplicationConfig = {
  factor: number;
};

type PropertyVectorizerConfig = {
  skip: boolean;
  vectorizePropertyName: boolean;
};

export type PropertyConfig = {
  name: string;
  dataType: string;
  description?: string;
  indexInverted: boolean;
  indexFilterable: boolean;
  indexSearchable: boolean;
  nestedProperties?: PropertyConfig[];
  tokenization: string;
  vectorizerConfig?: PropertyVectorizerConfig;
};

export type ReferenceConfig = {
  name: string;
  description?: string;
  targetCollections: string[];
};

export type ShardingConfig = {
  virtualPerPhysical: number;
  desiredCount: number;
  actualCount: number;
  desiredVirtualCount: number;
  actualVirtualCount: number;
  key: '_id';
  strategy: 'hash';
  function: 'murmur3';
};

export type CollectionConfig<T> = {
  name: string;
  description?: string;
  generative?: GenerativeConfig;
  invertedIndex: InvertedIndexConfig;
  multiTenancy: MultiTenancyConfig;
  properties: PropertyConfig[];
  references: ReferenceConfig[];
  replication: ReplicationConfig;
  reranker?: RerankerConfig;
  sharding: ShardingConfig;
  vectorizer: VectorConfig;
};
