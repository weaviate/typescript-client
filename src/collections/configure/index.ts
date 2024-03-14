export { QuantizerGuards } from './parsing';

import {
  DataType,
  InvertedIndexConfigCreate,
  MultiTenancyConfigCreate,
  NamedVectorConfigCreate,
  NamedVectorizerOptions,
  Properties,
  ReplicationConfigCreate,
  ShardingConfigCreate,
  VectorIndexType,
  Vectorizer,
} from '../types';

import generative from './generative';
import reranker from './reranker';
import vectorIndex from './vectorIndex';
import { vectorizer } from './vectorizer';

import { parseWithDefault } from './parsing';
import { PrimitiveKeys } from '../types/internal';

const dataType: Record<string, DataType> = {
  INT: 'int',
  INT_ARRAY: 'int[]',
  NUMBER: 'number',
  NUMBER_ARRAY: 'number[]',
  TEXT: 'text',
  TEXT_ARRAY: 'text[]',
  BOOLEAN: 'boolean',
  BOOLEAN_ARRAY: 'boolean[]',
  DATE: 'date',
  DATE_ARRAY: 'date[]',
  OBJECT: 'object',
  OBJECT_ARRAY: 'object[]',
  BLOB: 'blob',
  GEO_COORDINATES: 'geoCoordinates',
  PHONE_NUMBER: 'phoneNumber',
};

export default {
  generative,
  reranker,
  vectorizer,
  vectorIndex,
  dataType,
  invertedIndex: (config?: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    indexTimestamps?: boolean;
    indexPropertyLength?: boolean;
    indexNullState?: boolean;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }): InvertedIndexConfigCreate => {
    return {
      bm25: {
        b: parseWithDefault(config?.bm25b, 0.75),
        k1: parseWithDefault(config?.bm25k1, 1.2),
      },
      cleanupIntervalSeconds: parseWithDefault(config?.cleanupIntervalSeconds, 60),
      indexTimestamps: parseWithDefault(config?.indexTimestamps, false),
      indexPropertyLength: parseWithDefault(config?.indexPropertyLength, false),
      indexNullState: parseWithDefault(config?.indexNullState, false),
      stopwords: {
        preset: parseWithDefault(config?.stopwordsPreset, 'en'),
        additions: parseWithDefault(config?.stopwordsAdditions, []),
        removals: parseWithDefault(config?.stopwordsRemovals, []),
      },
    };
  },
  multiTenancy: (config?: { enabled?: boolean }): MultiTenancyConfigCreate => {
    return config ? { enabled: parseWithDefault(config.enabled, true) } : { enabled: true };
  },
  namedVectorizer: <T, N extends string, I extends VectorIndexType = 'hnsw', V extends Vectorizer = 'none'>(
    name: N,
    options?: NamedVectorizerOptions<PrimitiveKeys<T>[], I, V>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, V> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: options?.vectorIndexConfig ? options.vectorIndexConfig : { name: 'hnsw' as I },
      vectorizer: options?.vectorizerConfig ? options.vectorizerConfig : { name: 'none' as V },
    };
  },
  replication: (config?: { factor?: number }): ReplicationConfigCreate => {
    return config ? { factor: parseWithDefault(config.factor, 1) } : { factor: 1 };
  },
  sharding: (config?: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    actualCount?: number;
    desiredVirtualCount?: number;
    actualVirtualCount?: number;
  }): ShardingConfigCreate => {
    return {
      virtualPerPhysical: parseWithDefault(config?.virtualPerPhysical, 128),
      desiredCount: parseWithDefault(config?.desiredCount, 1),
      actualCount: parseWithDefault(config?.actualCount, 1),
      desiredVirtualCount: parseWithDefault(config?.desiredVirtualCount, 128),
      actualVirtualCount: parseWithDefault(config?.actualVirtualCount, 128),
      key: '_id',
      strategy: 'hash',
      function: 'murmur3',
    };
  },
};
