import { describe, expect, it } from 'vitest';
import { MergeWithExisting } from '../../../src/collections/config/classes';
import { GenerativeCohereConfig, RerankerCohereConfig } from '../../../src/collections/config/types';
import {
  WeaviateInvertedIndexConfig,
  WeaviateModuleConfig,
  WeaviateMultiTenancyConfig,
  WeaviateVectorsConfig,
} from '../../../src/openapi/types';

describe('Unit testing of the MergeWithExisting class', () => {
  const deepCopy = (config: any) => JSON.parse(JSON.stringify(config));

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
    const merged = MergeWithExisting.invertedIndex(deepCopy(invertedIndex), {
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
    enabled: true,
    autoTenantActivation: false,
    autoTenantCreation: false,
  };

  const moduleConfig: WeaviateModuleConfig = {
    'generative-cohere': {
      kProperty: 0.1,
      model: 'model',
      maxTokensProperty: '5',
      returnLikelihoodsProperty: 'likelihoods',
      stopSequencesProperty: ['and'],
      temperatureProperty: 5.2,
    },
    'reranker-cohere': {},
  };

  it('should merge a partial invertedIndexUpdate with existing schema', () => {
    const merged = MergeWithExisting.invertedIndex(deepCopy(invertedIndex), {
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
    const merged = MergeWithExisting.vectors(deepCopy(hnswVectorConfig), [
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
    const merged = MergeWithExisting.vectors(deepCopy(hnswVectorConfig), [
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
    const merged = MergeWithExisting.vectors(deepCopy(hnswVectorConfig), [
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
    const merged = MergeWithExisting.vectors(deepCopy(hnswVectorConfig), [
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

  it('should merge a RQ quantizer HNSW vectorIndexConfig with existing schema', () => {
    const merged = MergeWithExisting.vectors(deepCopy(hnswVectorConfig), [
      {
        name: 'name',
        vectorIndex: {
          name: 'hnsw',
          config: {
            quantizer: {
              type: 'rq',
              rescoreLimit: 1000,
              bits: 128,
            },
          },
        },
      },
    ]);
    expect(merged).toEqual({
      name: {
        vectorIndexConfig: {
          ...hnswVectorConfig.name.vectorIndexConfig,
          rq: {
            enabled: true,
            rescoreLimit: 1000,
            bits: 128,
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
    const merged = MergeWithExisting.vectors(deepCopy(flatVectorConfig), [
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
    const merged = MergeWithExisting.multiTenancy(deepCopy(multiTenancyConfig), {
      autoTenantActivation: true,
      autoTenantCreation: true,
    });
    expect(merged).toEqual({
      enabled: true,
      autoTenantActivation: true,
      autoTenantCreation: true,
    });
  });

  it('should merge a generative config with existing schema', () => {
    const merged = MergeWithExisting.generative(deepCopy(moduleConfig), {
      name: 'generative-cohere',
      config: {
        kProperty: 0.2,
      } as GenerativeCohereConfig,
    });
    expect(merged).toEqual({
      ...moduleConfig,
      'generative-cohere': {
        ...(moduleConfig['generative-cohere'] as any),
        kProperty: 0.2,
      } as GenerativeCohereConfig,
    });
  });

  it('should merge a reranker config with existing schema', () => {
    const merged = MergeWithExisting.reranker(deepCopy(moduleConfig), {
      name: 'reranker-cohere',
      config: {
        model: 'other',
      } as RerankerCohereConfig,
    });
    expect(merged).toEqual({
      ...moduleConfig,
      'reranker-cohere': {
        ...(moduleConfig['reranker-cohere'] as any),
        model: 'other',
      } as RerankerCohereConfig,
    });
  });
});
