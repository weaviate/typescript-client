import configure from '.';
import { ModuleConfig } from '../types';
import {
  InvertedIndexConfigCreate,
  MultiTenancyConfigCreate,
  ReplicationConfigCreate,
  ShardingConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types';

describe('Unit testing of the configure factory class', () => {
  it('should create the correct InvertedIndexConfig type with defaults', () => {
    const config = configure.invertedIndex();
    expect(config).toEqual<InvertedIndexConfigCreate>({
      bm25: {
        b: 0.75,
        k1: 1.2,
      },
      cleanupIntervalSeconds: 60,
      indexTimestamps: false,
      indexPropertyLength: false,
      indexNullState: false,
      stopwords: {
        additions: [],
        preset: 'en',
        removals: [],
      },
    });
  });

  it('should create the correct InvertedIndexConfig type with custom values', () => {
    const config = configure.invertedIndex({
      bm25b: 0.5,
      bm25k1: 1.5,
      cleanupIntervalSeconds: 120,
      indexTimestamps: true,
      indexPropertyLength: true,
      indexNullState: true,
      stopwordsPreset: 'none',
      stopwordsAdditions: ['a', 'b'],
      stopwordsRemovals: ['c', 'd'],
    });
    expect(config).toEqual<InvertedIndexConfigCreate>({
      bm25: {
        b: 0.5,
        k1: 1.5,
      },
      cleanupIntervalSeconds: 120,
      indexTimestamps: true,
      indexPropertyLength: true,
      indexNullState: true,
      stopwords: {
        additions: ['a', 'b'],
        preset: 'none',
        removals: ['c', 'd'],
      },
    });
  });

  it('should create the correct MultiTenancyConfig type with defaults', () => {
    const config = configure.multiTenancy();
    expect(config).toEqual<MultiTenancyConfigCreate>({
      enabled: true,
    });
  });

  it('should create the correct MultiTenancyConfig type with custom values', () => {
    const config = configure.multiTenancy({
      enabled: false,
    });
    expect(config).toEqual<MultiTenancyConfigCreate>({
      enabled: false,
    });
  });

  it('should crete the correct ReplicationConfig type with defaults', () => {
    const config = configure.replication();
    expect(config).toEqual<ReplicationConfigCreate>({
      factor: 1,
    });
  });

  it('should create the correct ReplicationConfig type with custom values', () => {
    const config = configure.replication({
      factor: 2,
    });
    expect(config).toEqual<ReplicationConfigCreate>({
      factor: 2,
    });
  });

  it('should create the correct ShardingConfig type with defaults', () => {
    const config = configure.sharding();
    expect(config).toEqual<ShardingConfigCreate>({
      virtualPerPhysical: 128,
      desiredCount: 1,
      actualCount: 1,
      desiredVirtualCount: 128,
      actualVirtualCount: 128,
      function: 'murmur3',
      key: '_id',
      strategy: 'hash',
    });
  });

  it('should create the correct ShardingConfig type with custom values', () => {
    const config = configure.sharding({
      virtualPerPhysical: 256,
      desiredCount: 2,
      actualCount: 2,
      desiredVirtualCount: 256,
      actualVirtualCount: 256,
    });
    expect(config).toEqual<ShardingConfigCreate>({
      virtualPerPhysical: 256,
      desiredCount: 2,
      actualCount: 2,
      desiredVirtualCount: 256,
      actualVirtualCount: 256,
      function: 'murmur3',
      key: '_id',
      strategy: 'hash',
    });
  });

  describe('using the vectorIndex namespace', () => {
    it('should create the correct HNSW VectorIndexConfig type with defaults', () => {
      const config = configure.vectorIndex.hnsw({ quantizer: configure.vectorIndex.quantizer.pq() });
      expect(config).toEqual<ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>>({
        name: 'hnsw',
        config: {
          cleanupIntervalSeconds: 300,
          distance: 'cosine',
          dynamicEfFactor: 8,
          dynamicEfMax: 500,
          dynamicEfMin: 100,
          ef: -1,
          efConstruction: 128,
          flatSearchCutoff: 40000,
          maxConnections: 64,
          quantizer: {
            bitCompression: false,
            centroids: 256,
            encoder: {
              distribution: 'log-normal',
              type: 'kmeans',
            },
            segments: 0,
            trainingLimit: 100000,
            type: 'pq',
          },
          skip: false,
          vectorCacheMaxObjects: 1000000000000,
        },
      });
    });

    it('should create the correct HNSW VectorIndexConfig type with custom values', () => {
      const config = configure.vectorIndex.hnsw({
        cleanupIntervalSeconds: 120,
        distanceMetric: 'dot',
        dynamicEfFactor: 16,
        dynamicEfMax: 1000,
        dynamicEfMin: 200,
        ef: 100,
        efConstruction: 256,
        flatSearchCutoff: 80000,
        maxConnections: 128,
        quantizer: configure.vectorIndex.quantizer.pq({
          bitCompression: true,
          centroids: 512,
          encoder: {
            distribution: 'normal',
            type: 'tile',
          },
          segments: 1,
          trainingLimit: 200000,
        }),
        skip: true,
        vectorCacheMaxObjects: 2000000000000,
      });
      expect(config).toEqual<ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>>({
        name: 'hnsw',
        config: {
          cleanupIntervalSeconds: 120,
          distance: 'dot',
          dynamicEfFactor: 16,
          dynamicEfMax: 1000,
          dynamicEfMin: 200,
          ef: 100,
          efConstruction: 256,
          flatSearchCutoff: 80000,
          maxConnections: 128,
          quantizer: {
            bitCompression: true,
            centroids: 512,
            encoder: {
              distribution: 'normal',
              type: 'tile',
            },
            segments: 1,
            trainingLimit: 200000,
            type: 'pq',
          },
          skip: true,
          vectorCacheMaxObjects: 2000000000000,
        },
      });
    });

    it('should create the correct flat VectorIndexConfig type with defaults', () => {
      const config = configure.vectorIndex.flat();
      expect(config).toEqual<ModuleConfig<'flat', VectorIndexConfigFlatCreate>>({
        name: 'flat',
        config: {
          distance: 'cosine',
          quantizer: undefined,
          vectorCacheMaxObjects: 1000000000000,
        },
      });
    });
  });
});
