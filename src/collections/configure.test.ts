import Configure from './configure';

describe('Unit testing of the Configure factory class', () => {
  it('should create the correct InvertedIndexConfig type with defaults', () => {
    const config = Configure.invertedIndex();
    expect(config).toEqual({
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
    const config = Configure.invertedIndex({
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
    expect(config).toEqual({
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
    const config = Configure.multiTenancy();
    expect(config).toEqual({
      enabled: true,
    });
  });

  it('should create the correct MultiTenancyConfig type with custom values', () => {
    const config = Configure.multiTenancy({
      enabled: false,
    });
    expect(config).toEqual({
      enabled: false,
    });
  });

  it('should crete the correct ReplicationConfig type with defaults', () => {
    const config = Configure.replication();
    expect(config).toEqual({
      factor: 1,
    });
  });

  it('should create the correct ReplicationConfig type with custom values', () => {
    const config = Configure.replication({
      factor: 2,
    });
    expect(config).toEqual({
      factor: 2,
    });
  });

  it('should create the correct ShardingConfig type with defaults', () => {
    const config = Configure.sharding();
    expect(config).toEqual({
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
    const config = Configure.sharding({
      virtualPerPhysical: 256,
      desiredCount: 2,
      actualCount: 2,
      desiredVirtualCount: 256,
      actualVirtualCount: 256,
    });
    expect(config).toEqual({
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

  it('should create the correct VectorIndexConfig type with defaults', () => {
    const config = Configure.VectorIndex.hnsw();
    expect(config).toEqual({
      cleanupIntervalSeconds: 300,
      distance: 'cosine',
      dynamicEfFactor: 8,
      dynamicEfMax: 500,
      dynamicEfMin: 100,
      ef: -1,
      efConstruction: 128,
      flatSearchCutoff: 40000,
      maxConnections: 64,
      pq: undefined,
      skip: false,
      vectorCacheMaxObjects: 1000000000000,
    });
  });

  it('should create the correct VectorIndexConfig type with custom values', () => {
    const config = Configure.VectorIndex.hnsw({
      cleanupIntervalSeconds: 120,
      distanceMetric: 'dot',
      dynamicEfFactor: 16,
      dynamicEfMax: 1000,
      dynamicEfMin: 200,
      ef: 100,
      efConstruction: 256,
      flatSearchCutoff: 80000,
      maxConnections: 128,
      pq: {
        bitCompression: true,
        centroids: 512,
        encoder: {
          distribution: 'normal',
          type: 'tile',
        },
        segments: 1,
        trainingLimit: 200000,
      },
      skip: true,
      vectorCacheMaxObjects: 2000000000000,
    });
    expect(config).toEqual({
      cleanupIntervalSeconds: 120,
      distance: 'dot',
      dynamicEfFactor: 16,
      dynamicEfMax: 1000,
      dynamicEfMin: 200,
      ef: 100,
      efConstruction: 256,
      flatSearchCutoff: 80000,
      maxConnections: 128,
      pq: {
        bitCompression: true,
        centroids: 512,
        enabled: true,
        encoder: {
          distribution: 'normal',
          type: 'tile',
        },
        segments: 1,
        trainingLimit: 200000,
      },
      skip: true,
      vectorCacheMaxObjects: 2000000000000,
    });
  });
});
