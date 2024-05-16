export * from './generative.js';
export * from './reranker.js';
export * from './vectorIndex.js';
export * from './vectorizer.js';

import {
  InvertedIndexConfigUpdate,
  LegacyVectorizerConfigUpdate,
  VectorConfigUpdate,
  ReplicationConfigUpdate,
} from '../../configure/types/index.js';
import { GenerativeConfig } from './generative.js';
import { RerankerConfig } from './reranker.js';
import { VectorConfig } from './vectorizer.js';
import { VectorIndexType } from './vectorIndex.js';

export type ModuleConfig<N, C = undefined> = {
  name: N;
  config: C;
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
  autoTenantCreation: boolean;
  enabled: boolean;
};

export type ReplicationConfig = {
  factor: number;
};

export type PropertyVectorizerConfig = Record<
  string,
  {
    skip: boolean;
    vectorizePropertyName: boolean;
  }
>;

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

export type CollectionConfig = {
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

export type CollectionConfigUpdate = {
  description?: string;
  invertedIndex?: InvertedIndexConfigUpdate;
  replication?: ReplicationConfigUpdate;
  vectorizer?: LegacyVectorizerConfigUpdate | VectorConfigUpdate<string, VectorIndexType>[];
};
