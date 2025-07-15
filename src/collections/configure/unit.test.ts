import { requireAtLeast } from '../../../test/version.js';
import {
  GenerativeAWSConfig,
  GenerativeAnthropicConfig,
  GenerativeAnyscaleConfig,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeDatabricksConfig,
  GenerativeFriendliAIConfig,
  GenerativeGoogleConfig,
  GenerativeMistralConfig,
  GenerativeOllamaConfig,
  GenerativeOpenAIConfig,
  GenerativeXAIConfig,
  ModuleConfig,
  RerankerCohereConfig,
  RerankerJinaAIConfig,
  RerankerNvidiaConfig,
  RerankerTransformersConfig,
  RerankerVoyageAIConfig,
  VectorConfigCreate,
} from '../types/index.js';
import { configure } from './index.js';
import {
  InvertedIndexConfigCreate,
  MultiTenancyConfigCreate,
  ReplicationConfigCreate,
  ReplicationConfigUpdate,
  ShardingConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';

describe('Unit testing of the configure & reconfigure factory classes', () => {
  it('should create the correct InvertedIndexConfig type with defaults', () => {
    const config = configure.invertedIndex({});
    expect(config).toEqual<InvertedIndexConfigCreate>({});
  });

  it('should create the correct InvertedIndexConfig type with all values', () => {
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
      autoTenantActivation: false,
      autoTenantCreation: false,
      enabled: true,
    });
  });

  it('should create the correct MultiTenancyConfig type with all values', () => {
    const config = configure.multiTenancy({
      autoTenantActivation: true,
      autoTenantCreation: true,
      enabled: false,
    });
    expect(config).toEqual<MultiTenancyConfigCreate>({
      autoTenantActivation: true,
      autoTenantCreation: true,
      enabled: false,
    });
  });

  it('should create the correct ReplicationConfigCreate type with all values', () => {
    const config = configure.replication({
      asyncEnabled: true,
      deletionStrategy: 'DeleteOnConflict',
      factor: 2,
    });
    expect(config).toEqual<ReplicationConfigCreate>({
      asyncEnabled: true,
      deletionStrategy: 'DeleteOnConflict',
      factor: 2,
    });
  });

  it('should create the correct ReplicationConfigUpdate type with all values', () => {
    const config = configure.replication({
      asyncEnabled: true,
      deletionStrategy: 'DeleteOnConflict',
      factor: 2,
    });
    expect(config).toEqual<ReplicationConfigUpdate>({
      asyncEnabled: true,
      deletionStrategy: 'DeleteOnConflict',
      factor: 2,
    });
  });

  it('should create the correct ShardingConfig type with all values', () => {
    const config = configure.sharding({
      virtualPerPhysical: 256,
      desiredCount: 2,
      desiredVirtualCount: 256,
    });
    expect(config).toEqual<ShardingConfigCreate>({
      virtualPerPhysical: 256,
      desiredCount: 2,
      desiredVirtualCount: 256,
    });
  });

  describe('using the vectorIndex namespace', () => {
    it('should create the correct HNSW VectorIndexConfig type with defaults', () => {
      const config = configure.vectorIndex.hnsw({ quantizer: configure.vectorIndex.quantizer.pq() });
      expect(config).toEqual<ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>>({
        name: 'hnsw',
        config: {
          quantizer: {
            type: 'pq',
          },
          type: 'hnsw',
        },
      });
    });

    it('should create the correct HNSW VectorIndexConfig type with all values', () => {
      const config = configure.vectorIndex.hnsw({
        cleanupIntervalSeconds: 120,
        distanceMetric: 'dot',
        dynamicEfFactor: 16,
        dynamicEfMax: 1000,
        dynamicEfMin: 200,
        ef: 100,
        efConstruction: 256,
        flatSearchCutoff: 80000,
        filterStrategy: 'acorn',
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
          filterStrategy: 'acorn',
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
          type: 'hnsw',
          vectorCacheMaxObjects: 2000000000000,
        },
      });
    });

    it('should create the correct flat VectorIndexConfig type with defaults', () => {
      const config = configure.vectorIndex.flat({ quantizer: configure.vectorIndex.quantizer.bq() });
      expect(config).toEqual<ModuleConfig<'flat', VectorIndexConfigFlatCreate | undefined>>({
        name: 'flat',
        config: {
          quantizer: {
            type: 'bq',
          },
          type: 'flat',
        },
      });
    });
  });

  it('should create the correct flat VectorIndexConfig type with all values', () => {
    const config = configure.vectorIndex.flat({
      distanceMetric: 'cosine',
      vectorCacheMaxObjects: 1000000000,
      quantizer: configure.vectorIndex.quantizer.bq({
        cache: true,
        rescoreLimit: 100,
      }),
    });
    expect(config).toEqual<ModuleConfig<'flat', VectorIndexConfigFlatCreate>>({
      name: 'flat',
      config: {
        distance: 'cosine',
        vectorCacheMaxObjects: 1000000000,
        quantizer: {
          cache: true,
          rescoreLimit: 100,
          type: 'bq',
        },
        type: 'flat',
      },
    });
  });

  it('should create an hnsw VectorIndexConfig type with SQ quantizer', () => {
    const config = configure.vectorIndex.hnsw({
      quantizer: configure.vectorIndex.quantizer.sq({
        rescoreLimit: 100,
        trainingLimit: 200,
      }),
    });
    expect(config).toEqual<ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>>({
      name: 'hnsw',
      config: {
        quantizer: {
          rescoreLimit: 100,
          trainingLimit: 200,
          type: 'sq',
        },
        type: 'hnsw',
      },
    });
  });

  it('should create an hnsw VectorIndexConfig type with multivector enabled', () => {
    const config = configure.vectorIndex.hnsw({
      multiVector: configure.vectorIndex.multiVector.multiVector({ aggregation: 'maxSim' }),
    });
    expect(config).toEqual<ModuleConfig<'hnsw', VectorIndexConfigHNSWCreate>>({
      name: 'hnsw',
      config: {
        multiVector: {
          aggregation: 'maxSim',
        },
        type: 'hnsw',
      },
    });
  });
});

describe('Unit testing of the vectorizer factory class', () => {
  it('should create the correct Img2VecNeuralConfig type with all values', () => {
    const config = configure.vectors.img2VecNeural({
      name: 'test',
      imageFields: ['field1', 'field2'],
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'img2vec-neural'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'img2vec-neural',
        config: {
          imageFields: ['field1', 'field2'],
        },
      },
    });
  });

  it('should create the correct Multi2VecCohereConfig type with defaults', () => {
    const config = configure.vectors.multi2VecCohere();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-cohere'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-cohere',
        config: undefined,
      },
    });
  });

  it('should create the correct Multi2VecCohereConfig type with all values', () => {
    const config = configure.vectors.multi2VecCohere({
      name: 'test',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-cohere'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-cohere',
        config: {
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecCohereConfig type with all values and weights', () => {
    const config = configure.vectors.multi2VecCohere({
      name: 'test',
      model: 'model',
      imageFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      textFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-cohere'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-cohere',
        config: {
          model: 'model',
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeCollectionName: true,
          weights: {
            imageFields: [0.1, 0.2],
            textFields: [0.3, 0.4],
          },
        },
      },
    });
  });

  it('should create the correct Multi2VecClipConfig type with defaults', () => {
    const config = configure.vectors.multi2VecClip();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-clip'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-clip',
        config: undefined,
      },
    });
  });

  it('should create the correct Multi2VecClipConfig type with all values', () => {
    const config = configure.vectors.multi2VecClip({
      name: 'test',
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-clip'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-clip',
        config: {
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecClipConfig type with all values and weights', () => {
    const config = configure.vectors.multi2VecClip({
      name: 'test',
      imageFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      textFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-clip'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-clip',
        config: {
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeCollectionName: true,
          weights: {
            imageFields: [0.1, 0.2],
            textFields: [0.3, 0.4],
          },
        },
      },
    });
  });

  it('should create the correct Multi2VecBindConfig type with defaults', () => {
    const config = configure.vectors.multi2VecBind();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-bind'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-bind',
        config: undefined,
      },
    });
  });

  it('should create the correct Multi2VecBindConfig type with all values', () => {
    const config = configure.vectors.multi2VecBind({
      name: 'test',
      audioFields: ['field1', 'field2'],
      depthFields: ['field3', 'field4'],
      imageFields: ['field5', 'field6'],
      IMUFields: ['field7', 'field8'],
      textFields: ['field9', 'field10'],
      thermalFields: ['field11', 'field12'],
      videoFields: ['field13', 'field14'],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-bind'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-bind',
        config: {
          audioFields: ['field1', 'field2'],
          depthFields: ['field3', 'field4'],
          imageFields: ['field5', 'field6'],
          IMUFields: ['field7', 'field8'],
          textFields: ['field9', 'field10'],
          thermalFields: ['field11', 'field12'],
          videoFields: ['field13', 'field14'],
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecBindConfig type with all values and weights', () => {
    const config = configure.vectors.multi2VecBind({
      name: 'test',
      audioFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      depthFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      imageFields: [
        { name: 'field5', weight: 0.5 },
        { name: 'field6', weight: 0.6 },
      ],
      IMUFields: [
        { name: 'field7', weight: 0.7 },
        { name: 'field8', weight: 0.8 },
      ],
      textFields: [
        { name: 'field9', weight: 0.9 },
        { name: 'field10', weight: 1.0 },
      ],
      thermalFields: [
        { name: 'field11', weight: 1.1 },
        { name: 'field12', weight: 1.2 },
      ],
      videoFields: [
        { name: 'field13', weight: 1.3 },
        { name: 'field14', weight: 1.4 },
      ],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-bind'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-bind',
        config: {
          audioFields: ['field1', 'field2'],
          depthFields: ['field3', 'field4'],
          imageFields: ['field5', 'field6'],
          IMUFields: ['field7', 'field8'],
          textFields: ['field9', 'field10'],
          thermalFields: ['field11', 'field12'],
          videoFields: ['field13', 'field14'],
          vectorizeCollectionName: true,
          weights: {
            audioFields: [0.1, 0.2],
            depthFields: [0.3, 0.4],
            imageFields: [0.5, 0.6],
            IMUFields: [0.7, 0.8],
            textFields: [0.9, 1.0],
            thermalFields: [1.1, 1.2],
            videoFields: [1.3, 1.4],
          },
        },
      },
    });
  });

  it('should create the correct Multi2VecGoogleConfig type with defaults', () => {
    const config = configure.vectors.multi2VecGoogle({
      projectId: 'project-id',
      location: 'location',
    });
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-google'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-google',
        config: {
          projectId: 'project-id',
          location: 'location',
        },
      },
    });
  });

  it('should create the correct Multi2VecGoogleonfig type with all values', () => {
    const config = configure.vectors.multi2VecGoogle({
      name: 'test',
      projectId: 'project-id',
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      videoFields: ['field5', 'field6'],
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-google'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-google',
        config: {
          projectId: 'project-id',
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          videoFields: ['field5', 'field6'],
          location: 'location',
          modelId: 'model-id',
          dimensions: 256,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecGoogleConfig type with all values and weights', () => {
    const config = configure.vectors.multi2VecGoogle({
      name: 'test',
      projectId: 'project-id',
      imageFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      textFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      videoFields: [
        { name: 'field5', weight: 0.5 },
        { name: 'field6', weight: 0.6 },
      ],
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-google'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-google',
        config: {
          projectId: 'project-id',
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          videoFields: ['field5', 'field6'],
          location: 'location',
          modelId: 'model-id',
          dimensions: 256,
          vectorizeCollectionName: true,
          weights: {
            imageFields: [0.1, 0.2],
            textFields: [0.3, 0.4],
            videoFields: [0.5, 0.6],
          },
        },
      },
    });
  });

  it('should create the correct Multi2VecJinaAIConfig type with defaults', () => {
    const config = configure.vectors.multi2VecJinaAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-jinaai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-jinaai',
        config: undefined,
      },
    });
  });

  it('should create the correct Multi2VecJinaAIConfig type with all values and weights', () => {
    const config = configure.vectors.multi2VecJinaAI({
      name: 'test',
      imageFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      textFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-jinaai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-jinaai',
        config: {
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeCollectionName: true,
          weights: {
            imageFields: [0.1, 0.2],
            textFields: [0.3, 0.4],
          },
        },
      },
    });
  });

  requireAtLeast(1, 32, 0).it('should create the correct Multi2MultivecJinaAIConfig with values', () => {
    const config = configure.multiVectors.multi2MultivecJinaAI({
      name: 'multi-jina',
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
    });
    expect(config).toEqual<VectorConfigCreate<never, string, 'hnsw', 'multi2multivec-jinaai'>>({
      name: 'multi-jina',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2multivec-jinaai',
        config: {
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
        },
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type using deprecated method with defaults', () => {
    const config = configure.vectors.multi2VecPalm({
      projectId: 'project-id',
      location: 'location',
    });
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-palm'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-palm',
        config: {
          projectId: 'project-id',
          location: 'location',
        },
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type using deprecated method with all values', () => {
    const config = configure.vectors.multi2VecPalm({
      name: 'test',
      projectId: 'project-id',
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      videoFields: ['field5', 'field6'],
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-palm'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-palm',
        config: {
          projectId: 'project-id',
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          videoFields: ['field5', 'field6'],
          location: 'location',
          modelId: 'model-id',
          dimensions: 256,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type using deprecated method with all values and weights', () => {
    const config = configure.vectors.multi2VecPalm({
      name: 'test',
      projectId: 'project-id',
      imageFields: [
        { name: 'field1', weight: 0.1 },
        { name: 'field2', weight: 0.2 },
      ],
      textFields: [
        { name: 'field3', weight: 0.3 },
        { name: 'field4', weight: 0.4 },
      ],
      videoFields: [
        { name: 'field5', weight: 0.5 },
        { name: 'field6', weight: 0.6 },
      ],
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-palm'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-palm',
        config: {
          projectId: 'project-id',
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          videoFields: ['field5', 'field6'],
          location: 'location',
          modelId: 'model-id',
          dimensions: 256,
          vectorizeCollectionName: true,
          weights: {
            imageFields: [0.1, 0.2],
            textFields: [0.3, 0.4],
            videoFields: [0.5, 0.6],
          },
        },
      },
    });
  });

  it('should create the correct Multi2VecVoyageAIConfig type with defaults', () => {
    const config = configure.vectors.multi2VecVoyageAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'multi2vec-voyageai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-voyageai',
        config: undefined,
      },
    });
  });

  it('should create the correct Multi2VecVoyageAIConfig type with all values', () => {
    const config = configure.vectors.multi2VecVoyageAI({
      baseURL: 'base-url',
      model: 'model',
      name: 'test',
      truncate: true,
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-voyageai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-voyageai',
        config: {
          baseURL: 'base-url',
          model: 'model',
          truncate: true,
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecAWSConfig type with defaults', () => {
    const config = configure.vectors.text2VecAWS({
      region: 'region',
      service: 'service',
    });
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-aws'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-aws',
        config: {
          region: 'region',
          service: 'service',
        },
      },
    });
  });

  it('should create the correct Text2VecAWSConfig type with all values', () => {
    const config = configure.vectors.text2VecAWS({
      name: 'test',
      endpoint: 'endpoint',
      model: 'model',
      region: 'region',
      service: 'service',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-aws'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-aws',
        config: {
          endpoint: 'endpoint',
          model: 'model',
          region: 'region',
          service: 'service',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with defaults', () => {
    const config = configure.vectors.text2VecAzureOpenAI({
      deploymentId: 'deployment-id',
      resourceName: 'resource-name',
    });
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-azure-openai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-azure-openai',
        config: {
          deploymentId: 'deployment-id',
          resourceName: 'resource-name',
        },
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with all values', () => {
    const config = configure.vectors.text2VecAzureOpenAI({
      name: 'test',
      baseURL: 'base-url',
      deploymentId: 'deployment-id',
      resourceName: 'resource-name',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-azure-openai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-azure-openai',
        config: {
          baseURL: 'base-url',
          deploymentId: 'deployment-id',
          resourceName: 'resource-name',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecCohereConfig type with defaults', () => {
    const config = configure.vectors.text2VecCohere();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-cohere'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-cohere',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecCohereConfig type with all values', () => {
    const config = configure.vectors.text2VecCohere({
      name: 'test',
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-cohere'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-cohere',
        config: {
          baseURL: 'base-url',
          model: 'model',
          truncate: true,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecContextionaryConfig type with defaults', () => {
    const config = configure.vectors.text2VecContextionary();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-contextionary'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-contextionary',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecContextionaryConfig type with all values', () => {
    const config = configure.vectors.text2VecContextionary({
      name: 'test',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-contextionary'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-contextionary',
        config: {
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecDatabricksConfig type with required & defaults', () => {
    const config = configure.vectors.text2VecDatabricks({
      name: 'test',
      endpoint: 'endpoint',
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-databricks'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-databricks',
        config: {
          endpoint: 'endpoint',
        },
      },
    });
  });

  it('should create the correct Text2VecDatabricksConfig type with all values', () => {
    const config = configure.vectors.text2VecDatabricks({
      name: 'test',
      endpoint: 'endpoint',
      instruction: 'instruction',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-databricks'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-databricks',
        config: {
          endpoint: 'endpoint',
          instruction: 'instruction',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecGPT4AllConfig type with defaults', () => {
    const config = configure.vectors.text2VecGPT4All();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-gpt4all'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-gpt4all',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecGPT4AllConfig type with all values', () => {
    const config = configure.vectors.text2VecGPT4All({
      name: 'test',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-gpt4all'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-gpt4all',
        config: {
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecHuggingFaceConfig type with defaults', () => {
    const config = configure.vectors.text2VecHuggingFace();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-huggingface'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-huggingface',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecHuggingFaceConfig type with all values', () => {
    const config = configure.vectors.text2VecHuggingFace({
      name: 'test',
      endpointURL: 'endpoint-url',
      model: 'model',
      passageModel: 'passage-model',
      queryModel: 'query-model',
      useCache: true,
      useGPU: true,
      waitForModel: true,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-huggingface'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-huggingface',
        config: {
          endpointURL: 'endpoint-url',
          model: 'model',
          passageModel: 'passage-model',
          queryModel: 'query-model',
          useCache: true,
          useGPU: true,
          waitForModel: true,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecJinaAIConfig type with defaults', () => {
    const config = configure.vectors.text2VecJinaAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-jinaai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-jinaai',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecJinaAIConfig type with all values', () => {
    const config = configure.vectors.text2VecJinaAI({
      name: 'test',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-jinaai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-jinaai',
        config: {
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecNvidiaConfig type with defaults', () => {
    const config = configure.vectors.text2VecNvidia();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-nvidia'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-nvidia',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecNvidiaConfig type with all values', () => {
    const config = configure.vectors.text2VecNvidia({
      name: 'test',
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-nvidia'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-nvidia',
        config: {
          baseURL: 'base-url',
          model: 'model',
          truncate: true,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecMistralConfig type with defaults', () => {
    const config = configure.vectors.text2VecMistral();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-mistral'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-mistral',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecMistralConfig type with all values', () => {
    const config = configure.vectors.text2VecMistral({
      baseURL: 'base-url',
      name: 'test',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-mistral'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-mistral',
        config: {
          baseURL: 'base-url',
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecOllamaConfig type with defaults', () => {
    const config = configure.vectors.text2VecOllama();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-ollama'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-ollama',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecOllamaConfig type with all values', () => {
    const config = configure.vectors.text2VecOllama({
      name: 'test',
      apiEndpoint: 'api-endpoint',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-ollama'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-ollama',
        config: {
          apiEndpoint: 'api-endpoint',
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecOpenAIConfig type with defaults', () => {
    const config = configure.vectors.text2VecOpenAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-openai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-openai',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecOpenAIConfig type with all values', () => {
    const config = configure.vectors.text2VecOpenAI({
      name: 'test',
      baseURL: 'base-url',
      dimensions: 256,
      model: 'model',
      modelVersion: 'model-version',
      type: 'type',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-openai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-openai',
        config: {
          baseURL: 'base-url',
          dimensions: 256,
          model: 'model',
          modelVersion: 'model-version',
          type: 'type',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecGoogleConfig type with defaults', () => {
    const config = configure.vectors.text2VecGoogle();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-google'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-google',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecGoogleConfig type with all values', () => {
    const config = configure.vectors.text2VecGoogle({
      name: 'test',
      apiEndpoint: 'api-endpoint',
      modelId: 'model-id',
      projectId: 'project-id',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-google'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-google',
        config: {
          apiEndpoint: 'api-endpoint',
          modelId: 'model-id',
          projectId: 'project-id',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type using deprecated method with defaults', () => {
    const config = configure.vectors.text2VecPalm();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-palm'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-palm',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type using deprecated method with all values', () => {
    const config = configure.vectors.text2VecPalm({
      name: 'test',
      apiEndpoint: 'api-endpoint',
      modelId: 'model-id',
      projectId: 'project-id',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-palm'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-palm',
        config: {
          apiEndpoint: 'api-endpoint',
          modelId: 'model-id',
          projectId: 'project-id',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecTransformersConfig type with defaults', () => {
    const config = configure.vectors.text2VecTransformers();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-transformers'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-transformers',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecTransformersConfig type with all values', () => {
    const config = configure.vectors.text2VecTransformers({
      name: 'test',
      poolingStrategy: 'pooling-strategy',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-transformers'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-transformers',
        config: {
          poolingStrategy: 'pooling-strategy',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecVoyageAIConfig type with defaults', () => {
    const config = configure.vectors.text2VecVoyageAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-voyageai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-voyageai',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecVoyageConfig type with all values', () => {
    const config = configure.vectors.text2VecVoyageAI({
      name: 'test',
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-voyageai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-voyageai',
        config: {
          baseURL: 'base-url',
          model: 'model',
          truncate: true,
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecWeaviateConfig type with defaults', () => {
    const config = configure.vectors.text2VecWeaviate();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-weaviate'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-weaviate',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecWeaviateConfig type with all values', () => {
    const config = configure.vectors.text2VecWeaviate({
      name: 'test',
      baseURL: 'base-url',
      dimensions: 256,
      model: 'model',
      quantizer: configure.vectorIndex.quantizer.pq(),
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-weaviate'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: {
          quantizer: {
            bitCompression: undefined,
            centroids: undefined,
            encoder: undefined,
            segments: undefined,
            trainingLimit: undefined,
            type: 'pq',
          },
          type: 'hnsw',
        },
      },
      vectorizer: {
        name: 'text2vec-weaviate',
        config: {
          baseURL: 'base-url',
          dimensions: 256,
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });
});

describe('Unit testing of the multiVectors factory class', () => {
  it('should create the correct self provided type with defaults', () => {
    const config = configure.multiVectors.selfProvided();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'none'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: {
          multiVector: {
            aggregation: undefined,
            encoding: undefined,
          },
          type: 'hnsw',
        },
      },
      vectorizer: {
        name: 'none',
        config: {},
      },
    });
  });
  it('should create the correct self provided type with all values', () => {
    const config = configure.multiVectors.selfProvided({
      name: 'test',
      encoding: configure.vectorIndex.multiVector.encoding.muvera({ ksim: 10 }),
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'none'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: {
          multiVector: {
            aggregation: undefined,
            encoding: {
              dprojections: undefined,
              ksim: 10,
              repetitions: undefined,
              type: 'muvera',
            },
          },
          type: 'hnsw',
        },
      },
      vectorizer: {
        name: 'none',
        config: {},
      },
    });
  });
  it('should create the correct Text2MultiVecJinaAIConfig type with defaults', () => {
    const config = configure.multiVectors.text2VecJinaAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2multivec-jinaai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: {
          multiVector: {
            aggregation: undefined,
            encoding: undefined,
          },
          type: 'hnsw',
        },
      },
      vectorizer: {
        name: 'text2multivec-jinaai',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2MultiVecJinaAIConfig type with all values', () => {
    const config = configure.multiVectors.text2VecJinaAI({
      name: 'test',
      encoding: configure.vectorIndex.multiVector.encoding.muvera({ ksim: 10 }),
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2multivec-jinaai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: {
          multiVector: {
            aggregation: undefined,
            encoding: {
              dprojections: undefined,
              ksim: 10,
              repetitions: undefined,
              type: 'muvera',
            },
          },
          type: 'hnsw',
        },
      },
      vectorizer: {
        name: 'text2multivec-jinaai',
        config: {
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });
});

describe('Unit testing of the generative factory class', () => {
  it('should create the correct GenerativeAnthropicConfig type with required & default values', () => {
    const config = configure.generative.anthropic();
    expect(config).toEqual<ModuleConfig<'generative-anthropic', GenerativeAnthropicConfig | undefined>>({
      name: 'generative-anthropic',
      config: undefined,
    });
  });

  it('should create the correct GenerativeAnthropicConfig type with all values', () => {
    const config = configure.generative.anthropic({
      maxTokens: 100,
      model: 'model',
      stopSequences: ['stop1', 'stop2'],
      temperature: 0.5,
      topK: 10,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-anthropic', GenerativeAnthropicConfig>>({
      name: 'generative-anthropic',
      config: {
        maxTokens: 100,
        model: 'model',
        stopSequences: ['stop1', 'stop2'],
        temperature: 0.5,
        topK: 10,
        topP: 0.8,
      },
    });
  });

  it('should create the correct GenerativeAnyscaleConfig type with required & default values', () => {
    const config = configure.generative.anyscale();
    expect(config).toEqual<ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined>>({
      name: 'generative-anyscale',
      config: undefined,
    });
  });

  it('should create the correct GenerativeAnyscaleConfig type with all values', () => {
    const config = configure.generative.anyscale({
      baseURL: 'base-url',
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined>>({
      name: 'generative-anyscale',
      config: {
        baseURL: 'base-url',
        model: 'model',
        temperature: 0.5,
      },
    });
  });

  it('should create the correct GenerativeAWSConfig type with required & default values', () => {
    const config = configure.generative.aws({
      region: 'region',
      service: 'service',
    });
    expect(config).toEqual<ModuleConfig<'generative-aws', GenerativeAWSConfig>>({
      name: 'generative-aws',
      config: {
        region: 'region',
        service: 'service',
      },
    });
  });

  it('should create the correct GenerativeAWSConfig type with all values', () => {
    const config = configure.generative.aws({
      endpoint: 'endpoint',
      model: 'model',
      region: 'region',
      service: 'service',
    });
    expect(config).toEqual<ModuleConfig<'generative-aws', GenerativeAWSConfig>>({
      name: 'generative-aws',
      config: {
        endpoint: 'endpoint',
        model: 'model',
        region: 'region',
        service: 'service',
      },
    });
  });

  it('should create the correct GenerativeAzureOpenAIConfig type with required & default values', () => {
    const config = configure.generative.azureOpenAI({
      resourceName: 'resource-name',
      deploymentId: 'deployment-id',
    });
    expect(config).toEqual<ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>>({
      name: 'generative-openai',
      config: {
        resourceName: 'resource-name',
        deploymentId: 'deployment-id',
      },
    });
  });

  it('should create the correct GenerativeAzureOpenAIConfig type with all values', () => {
    const config = configure.generative.azureOpenAI({
      resourceName: 'resource-name',
      deploymentId: 'deployment-id',
      baseURL: 'base-url',
      frequencyPenalty: 0.5,
      maxTokens: 100,
      presencePenalty: 0.3,
      temperature: 0.7,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>>({
      name: 'generative-openai',
      config: {
        resourceName: 'resource-name',
        deploymentId: 'deployment-id',
        baseURL: 'base-url',
        frequencyPenaltyProperty: 0.5,
        maxTokensProperty: 100,
        presencePenaltyProperty: 0.3,
        temperatureProperty: 0.7,
        topPProperty: 0.8,
      },
    });
  });

  it('should create the correct GenerativeCohereConfig type with required & default values', () => {
    const config = configure.generative.cohere();
    expect(config).toEqual<ModuleConfig<'generative-cohere', GenerativeCohereConfig | undefined>>({
      name: 'generative-cohere',
      config: undefined,
    });
  });

  it('should create the correct GenerativeCohereConfig type with all values', () => {
    const config = configure.generative.cohere({
      k: 5,
      maxTokens: 100,
      model: 'model',
      returnLikelihoods: 'return-likelihoods',
      stopSequences: ['stop1', 'stop2'],
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-cohere', GenerativeCohereConfig | undefined>>({
      name: 'generative-cohere',
      config: {
        kProperty: 5,
        maxTokensProperty: 100,
        model: 'model',
        returnLikelihoodsProperty: 'return-likelihoods',
        stopSequencesProperty: ['stop1', 'stop2'],
        temperatureProperty: 0.5,
      },
    });
  });

  it('should create the correct GenerativeDatabricksConfig type with required & default values', () => {
    const config = configure.generative.databricks({
      endpoint: 'endpoint',
    });
    expect(config).toEqual<ModuleConfig<'generative-databricks', GenerativeDatabricksConfig>>({
      name: 'generative-databricks',
      config: {
        endpoint: 'endpoint',
      },
    });
  });

  it('should create the correct GenerativeDatabricksConfig type with all values', () => {
    const config = configure.generative.databricks({
      endpoint: 'endpoint',
      maxTokens: 100,
      temperature: 0.5,
      topK: 10,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-databricks', GenerativeDatabricksConfig>>({
      name: 'generative-databricks',
      config: {
        endpoint: 'endpoint',
        maxTokens: 100,
        temperature: 0.5,
        topK: 10,
        topP: 0.8,
      },
    });
  });

  it('should create the correct GenerativeFriendliAIConfig type with required & default values', () => {
    const config = configure.generative.friendliai();
    expect(config).toEqual<ModuleConfig<'generative-friendliai', GenerativeFriendliAIConfig | undefined>>({
      name: 'generative-friendliai',
      config: undefined,
    });
  });

  it('should create the correct GenerativeFriendliAIConfig type with all values', () => {
    const config = configure.generative.friendliai({
      baseURL: 'base-url',
      maxTokens: 100,
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-friendliai', GenerativeFriendliAIConfig | undefined>>({
      name: 'generative-friendliai',
      config: {
        baseURL: 'base-url',
        maxTokens: 100,
        model: 'model',
        temperature: 0.5,
      },
    });
  });

  it('should create the correct GenerativeMistralConfig type with required & default values', () => {
    const config = configure.generative.mistral();
    expect(config).toEqual<ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined>>({
      name: 'generative-mistral',
      config: undefined,
    });
  });

  it('should create the correct GenerativeMistralConfig type with all values', () => {
    const config = configure.generative.mistral({
      baseURL: 'base-url',
      maxTokens: 100,
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined>>({
      name: 'generative-mistral',
      config: {
        baseURL: 'base-url',
        maxTokens: 100,
        model: 'model',
        temperature: 0.5,
      },
    });
  });

  it('should create the correct GenerativeOllamaConfig type with required & default values', () => {
    const config = configure.generative.ollama();
    expect(config).toEqual<ModuleConfig<'generative-ollama', GenerativeOllamaConfig | undefined>>({
      name: 'generative-ollama',
      config: undefined,
    });
  });

  it('should create the correct GenerativeOllamaConfig type with all values', () => {
    const config = configure.generative.ollama({
      apiEndpoint: 'api-endpoint',
      model: 'model',
    });
    expect(config).toEqual<ModuleConfig<'generative-ollama', GenerativeOllamaConfig | undefined>>({
      name: 'generative-ollama',
      config: {
        apiEndpoint: 'api-endpoint',
        model: 'model',
      },
    });
  });

  it('should create the correct GenerativeOpenAIConfig type with required & default values', () => {
    const config = configure.generative.openAI();
    expect(config).toEqual<ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig | undefined>>({
      name: 'generative-openai',
      config: undefined,
    });
  });

  it('should create the correct GenerativeOpenAIConfig type with all values', () => {
    const config = configure.generative.openAI({
      baseURL: 'base-url',
      frequencyPenalty: 0.5,
      maxTokens: 100,
      model: 'model',
      presencePenalty: 0.3,
      temperature: 0.7,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-openai', GenerativeOpenAIConfig | undefined>>({
      name: 'generative-openai',
      config: {
        baseURL: 'base-url',
        frequencyPenaltyProperty: 0.5,
        maxTokensProperty: 100,
        model: 'model',
        presencePenaltyProperty: 0.3,
        temperatureProperty: 0.7,
        topPProperty: 0.8,
      },
    });
  });

  it('should create the correct GenerativeXAIConfig type with required & default values', () => {
    const config = configure.generative.xai();
    expect(config).toEqual<ModuleConfig<'generative-xai', GenerativeXAIConfig | undefined>>({
      name: 'generative-xai',
      config: undefined,
    });
  });

  it('should create the correct GenerativeXAIConfig type with all values', () => {
    const config = configure.generative.xai({
      baseURL: 'base-url',
      maxTokens: 100,
      model: 'model',
      temperature: 0.5,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-xai', GenerativeXAIConfig | undefined>>({
      name: 'generative-xai',
      config: {
        baseURL: 'base-url',
        maxTokens: 100,
        model: 'model',
        temperature: 0.5,
        topP: 0.8,
      },
    });
  });

  it('should create the correct GeneratGoogleConfig type with required & default values', () => {
    const config = configure.generative.google();
    expect(config).toEqual<ModuleConfig<'generative-google', undefined>>({
      name: 'generative-google',
      config: undefined,
    });
  });

  it('should create the correct GeneratGoogleConfig type using deprecated method with required & default values', () => {
    const config = configure.generative.palm();
    expect(config).toEqual<ModuleConfig<'generative-palm', undefined>>({
      name: 'generative-palm',
      config: undefined,
    });
  });

  it('should create the correct GenerativeGoogleConfig type using deprecated method with all values', () => {
    const config = configure.generative.palm({
      apiEndpoint: 'api-endpoint',
      maxOutputTokens: 100,
      modelId: 'model-id',
      projectId: 'project-id',
      temperature: 0.5,
      topK: 5,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-palm', GenerativeGoogleConfig>>({
      name: 'generative-palm',
      config: {
        apiEndpoint: 'api-endpoint',
        maxOutputTokens: 100,
        modelId: 'model-id',
        projectId: 'project-id',
        temperature: 0.5,
        topK: 5,
        topP: 0.8,
      },
    });
  });

  it('should create the correct GenerativeGoogleConfig type with all values', () => {
    const config = configure.generative.google({
      apiEndpoint: 'api-endpoint',
      maxOutputTokens: 100,
      modelId: 'model-id',
      projectId: 'project-id',
      temperature: 0.5,
      topK: 5,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-google', GenerativeGoogleConfig>>({
      name: 'generative-google',
      config: {
        apiEndpoint: 'api-endpoint',
        maxOutputTokens: 100,
        modelId: 'model-id',
        projectId: 'project-id',
        temperature: 0.5,
        topK: 5,
        topP: 0.8,
      },
    });
  });
});

describe('Unit testing of the reranker factory class', () => {
  it('should create the correct RerankerCohereConfig type using required & default values', () => {
    const config = configure.reranker.cohere();
    expect(config).toEqual<ModuleConfig<'reranker-cohere', RerankerCohereConfig | undefined>>({
      name: 'reranker-cohere',
      config: undefined,
    });
  });

  it('should create the correct RerankerCohereConfig type with all values', () => {
    const config = configure.reranker.cohere({
      model: 'model',
    });
    expect(config).toEqual<ModuleConfig<'reranker-cohere', RerankerCohereConfig | undefined>>({
      name: 'reranker-cohere',
      config: {
        model: 'model',
      },
    });
  });

  it('should create the correct RerankerJinaAIConfig type using required & default values', () => {
    const config = configure.reranker.jinaai();
    expect(config).toEqual<ModuleConfig<'reranker-jinaai', RerankerJinaAIConfig | undefined>>({
      name: 'reranker-jinaai',
      config: undefined,
    });
  });

  it('should create the correct RerankerJinaAIConfig type with all values', () => {
    const config = configure.reranker.jinaai({
      model: 'model',
    });
    expect(config).toEqual<ModuleConfig<'reranker-jinaai', RerankerJinaAIConfig | undefined>>({
      name: 'reranker-jinaai',
      config: {
        model: 'model',
      },
    });
  });

  it('should create the correct RerankerNvidiaConfig type with required & default values', () => {
    const config = configure.reranker.nvidia();
    expect(config).toEqual<ModuleConfig<'reranker-nvidia', RerankerNvidiaConfig | undefined>>({
      name: 'reranker-nvidia',
      config: undefined,
    });
  });

  it('should create the correct RerankerNvidiaConfig type with all values', () => {
    const config = configure.reranker.nvidia({
      baseURL: 'base-url',
      model: 'model',
    });
    expect(config).toEqual<ModuleConfig<'reranker-nvidia', RerankerNvidiaConfig | undefined>>({
      name: 'reranker-nvidia',
      config: {
        baseURL: 'base-url',
        model: 'model',
      },
    });
  });

  it('should create the correct RerankerTransformersConfig type using required & default values', () => {
    const config = configure.reranker.transformers();
    expect(config).toEqual<ModuleConfig<'reranker-transformers', RerankerTransformersConfig>>({
      name: 'reranker-transformers',
      config: {},
    });
  });

  it('should create the correct RerankerVoyageAIConfig with required & default values', () => {
    const config = configure.reranker.voyageAI();
    expect(config).toEqual<ModuleConfig<'reranker-voyageai', RerankerVoyageAIConfig | undefined>>({
      name: 'reranker-voyageai',
      config: undefined,
    });
  });

  it('should create the correct RerankerVoyageAIConfig type with all values', () => {
    const config = configure.reranker.voyageAI({
      baseURL: 'base-url',
      model: 'model',
    });
    expect(config).toEqual<ModuleConfig<'reranker-voyageai', RerankerVoyageAIConfig | undefined>>({
      name: 'reranker-voyageai',
      config: {
        baseURL: 'base-url',
        model: 'model',
      },
    });
  });
});
