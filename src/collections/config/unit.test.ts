import {
  WeaviateInvertedIndexConfig,
  WeaviateMultiTenancyConfig,
  WeaviateVectorsConfig,
} from '../../openapi/types';
import { MergeWithExisting } from './classes';

describe('Unit testing of the MergeWithExisting class', () => {
  const invertedIndex: WeaviateInvertedIndexConfig = {
    bm25: {
      b: 0.8,
      k1: 1.3,
    },
    cleanupIntervalSeconds: 61,
    indexPropertyLength: true,
    indexTimestamps: true,
    stopwords: {
      preset: 'en',
    },
  };

  const hnswVectorConfig: WeaviateVectorsConfig = {
    name: {
      vectorIndexConfig: {
        skip: false,
        cleanupIntervalSeconds: 300,
        maxConnections: 64,
        efConstruction: 128,
        ef: -1,
        dynamicEfMin: 100,
        dynamicEfMax: 500,
        dynamicEfFactor: 8,
        vectorCacheMaxObjects: 1000000000000,
        flatSearchCutoff: 40000,
        distance: 'cosine',
        pq: {
          enabled: false,
          bitCompression: false,
          segments: 0,
          centroids: 256,
          trainingLimit: 100000,
          encoder: {
            type: 'kmeans',
            distribution: 'log-normal',
          },
        },
        bq: {
          enabled: false,
        },
        sq: {
          enabled: false,
        },
      },
      vectorIndexType: 'hnsw',
      vectorizer: {
        'text2vec-contextionary': {
          properties: ['name'],
          vectorizeCollectionName: false,
        },
      },
    },
  };

  it('should merge a full invertedIndexUpdate with existing schema', () => {
    const merged = MergeWithExisting.invertedIndex(JSON.parse(JSON.stringify(invertedIndex)), {
      bm25: {
        b: 0.9,
        k1: 1.4,
      },
      cleanupIntervalSeconds: 62,
      stopwords: {
        additions: ['foo', 'bar'],
        preset: 'none',
        removals: ['baz'],
      },
    });
    expect(merged).toEqual({
      bm25: {
        b: 0.9,
        k1: 1.4,
      },
      cleanupIntervalSeconds: 62,
      indexPropertyLength: true,
      indexTimestamps: true,
      stopwords: {
        preset: 'none',
        additions: ['foo', 'bar'],
        removals: ['baz'],
      },
    });
  });

  const flatVectorConfig: WeaviateVectorsConfig = {
    name: {
      vectorIndexConfig: {
        distance: 'cosine',
        vectorCacheMaxObjects: 1000000000000,
        pq: {
          enabled: false,
          rescoreLimit: -1,
          cache: false,
        },
        bq: {
          enabled: false,
          rescoreLimit: -1,
          cache: false,
        },
      },
      vectorIndexType: 'flat',
      vectorizer: {
        'text2vec-contextionary': {
          properties: ['name'],
          vectorizeCollectionName: false,
        },
      },
    },
  };

  const multiTenancyConfig: WeaviateMultiTenancyConfig = {
    enabled: false,
    autoTenantActivation: false,
    autoTenantCreation: false,
  };

  it('should merge a partial invertedIndexUpdate with existing schema', () => {
    const merged = MergeWithExisting.invertedIndex(JSON.parse(JSON.stringify(invertedIndex)), {
      bm25: {
        b: 0.9,
      },
      stopwords: {
        removals: ['baz'],
      },
    });
    expect(merged).toEqual({
      bm25: {
        b: 0.9,
        k1: 1.3,
      },
      cleanupIntervalSeconds: 61,
      indexPropertyLength: true,
      indexTimestamps: true,
      stopwords: {
        preset: 'en',
        removals: ['baz'],
      },
    });
  });

  it('should merge a no quantizer HNSW vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(JSON.parse(JSON.stringify(hnswVectorConfig)), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            skip: true,
            cleanupIntervalSeconds: 301,
            maxConnections: 65,
            efConstruction: 129,
            ef: -2,
            dynamicEfMin: 101,
            dynamicEfMax: 501,
            dynamicEfFactor: 9,
            vectorCacheMaxObjects: 1000000000001,
            flatSearchCutoff: 40001,
            distance: 'euclidean',
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...hnswVectorConfig.name.vectorIndexConfig,
          skip: true,
          cleanupIntervalSeconds: 301,
          maxConnections: 65,
          efConstruction: 129,
          ef: -2,
          dynamicEfMin: 101,
          dynamicEfMax: 501,
          dynamicEfFactor: 9,
          vectorCacheMaxObjects: 1000000000001,
          flatSearchCutoff: 40001,
          distance: 'euclidean',
        },
        vectorIndexType: 'hnsw',
        vectorizer: {
          'text2vec-contextionary': {
            properties: ['name'],
            vectorizeCollectionName: false,
          },
        },
      },
    });
  });

  it('should merge a PQ quantizer HNSW vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(JSON.parse(JSON.stringify(hnswVectorConfig)), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            quantizer: {
              type: 'pq',
              bitCompression: true,
              segments: 1,
              centroids: 512,
              trainingLimit: 200000,
              encoder: {
                type: 'kmeans',
                distribution: 'normal',
              },
            },
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...hnswVectorConfig.name.vectorIndexConfig,
          pq: {
            enabled: true,
            bitCompression: true,
            segments: 1,
            centroids: 512,
            trainingLimit: 200000,
            encoder: {
              type: 'kmeans',
              distribution: 'normal',
            },
          },
        },
        vectorIndexType: 'hnsw',
        vectorizer: {
          'text2vec-contextionary': {
            properties: ['name'],
            vectorizeCollectionName: false,
          },
        },
      },
    });
  });

  it('should merge a BQ quantizer HNSW vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(JSON.parse(JSON.stringify(hnswVectorConfig)), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            quantizer: {
              type: 'bq',
              rescoreLimit: 1000,
            },
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...hnswVectorConfig.name.vectorIndexConfig,
          bq: {
            enabled: true,
            rescoreLimit: 1000,
          },
        },
        vectorIndexType: 'hnsw',
        vectorizer: {
          'text2vec-contextionary': {
            properties: ['name'],
            vectorizeCollectionName: false,
          },
        },
      },
    });
  });

  it('should merge a SQ quantizer HNSW vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(JSON.parse(JSON.stringify(hnswVectorConfig)), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            quantizer: {
              type: 'sq',
              rescoreLimit: 1000,
              trainingLimit: 10000,
            },
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...hnswVectorConfig.name.vectorIndexConfig,
          sq: {
            enabled: true,
            rescoreLimit: 1000,
            trainingLimit: 10000,
          },
        },
        vectorIndexType: 'hnsw',
        vectorizer: {
          'text2vec-contextionary': {
            properties: ['name'],
            vectorizeCollectionName: false,
          },
        },
      },
    });
  });

  it('should merge a BQ quantizer Flat vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(JSON.parse(JSON.stringify(flatVectorConfig)), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            quantizer: {
              type: 'bq',
              rescoreLimit: 1000,
            },
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...flatVectorConfig.name.vectorIndexConfig,
          bq: {
            cache: false,
            enabled: true,
            rescoreLimit: 1000,
          },
        },
        vectorIndexType: 'flat',
        vectorizer: {
          'text2vec-contextionary': {
            properties: ['name'],
            vectorizeCollectionName: false,
          },
        },
      },
    });
  });

  it('should merge full multi tenancy config with existing schema', () => {
    const merged = MergeWithExisting.multiTenancy(JSON.parse(JSON.stringify(multiTenancyConfig)), {
      autoTenantActivation: true,
      autoTenantCreation: true,
    });
    expect(merged).toEqual({
      autoTenantActivation: true,
      autoTenantCreation: true,
    });
  });
});
