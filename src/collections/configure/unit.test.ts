import {
  GenerativeAWSConfig,
  GenerativeAnthropicConfig,
  GenerativeAnyscaleConfig,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeDatabricksConfig,
  GenerativeFriendliAIConfig,
  GenerativeMistralConfig,
  GenerativeOctoAIConfig,
  GenerativeOllamaConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  ModuleConfig,
  VectorConfigCreate,
} from '../types/index.js';
import { configure } from './index.js';
import {
  InvertedIndexConfigCreate,
  MultiTenancyConfigCreate,
  ReplicationConfigCreate,
  ShardingConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';

describe('Unit testing of the configure factory class', () => {
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

  it('should create the correct ReplicationConfig type with all values', () => {
    const config = configure.replication({
      asyncEnabled: true,
      factor: 2,
    });
    expect(config).toEqual<ReplicationConfigCreate>({
      asyncEnabled: true,
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
      const config = configure.vectorIndex.flat({ quantizer: configure.vectorIndex.quantizer.bq() });
      expect(config).toEqual<ModuleConfig<'flat', VectorIndexConfigFlatCreate | undefined>>({
        name: 'flat',
        config: {
          quantizer: {
            type: 'bq',
          },
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
      },
    });
  });
});

describe('Unit testing of the vectorizer factory class', () => {
  it('should create the correct Img2VecNeuralConfig type with all values', () => {
    const config = configure.vectorizer.img2VecNeural({
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

  it('should create the correct Multi2VecClipConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecClip();
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
    const config = configure.vectorizer.multi2VecClip({
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
    const config = configure.vectorizer.multi2VecClip({
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
    const config = configure.vectorizer.multi2VecBind();
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
    const config = configure.vectorizer.multi2VecBind({
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
    const config = configure.vectorizer.multi2VecBind({
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

  it('should create the correct Multi2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecPalm({
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

  it('should create the correct Multi2VecPalmConfig type with all values', () => {
    const config = configure.vectorizer.multi2VecPalm({
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

  it('should create the correct Multi2VecPalmConfig type with all values and weights', () => {
    const config = configure.vectorizer.multi2VecPalm({
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

  it('should create the correct Text2VecAWSConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecAWS({
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
    const config = configure.vectorizer.text2VecAWS({
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
    const config = configure.vectorizer.text2VecAzureOpenAI({
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
    const config = configure.vectorizer.text2VecAzureOpenAI({
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
    const config = configure.vectorizer.text2VecCohere();
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
    const config = configure.vectorizer.text2VecCohere({
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
    const config = configure.vectorizer.text2VecContextionary();
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
    const config = configure.vectorizer.text2VecContextionary({
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

  it('should create the correct Text2VecGPT4AllConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecGPT4All();
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
    const config = configure.vectorizer.text2VecGPT4All({
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
    const config = configure.vectorizer.text2VecHuggingFace();
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
    const config = configure.vectorizer.text2VecHuggingFace({
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

  it('should create the correct Text2VecJinaConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecJina();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-jina'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-jina',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecJinaConfig type with all values', () => {
    const config = configure.vectorizer.text2VecJina({
      name: 'test',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-jina'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-jina',
        config: {
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecMistralConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecMistral();
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
    const config = configure.vectorizer.text2VecMistral({
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
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecOctoAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecOctoAI();
    expect(config).toEqual<VectorConfigCreate<never, undefined, 'hnsw', 'text2vec-octoai'>>({
      name: undefined,
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-octoai',
        config: undefined,
      },
    });
  });

  it('should create the correct Text2VecOctoAIConfig type with all values', () => {
    const config = configure.vectorizer.text2VecOctoAI({
      name: 'test',
      baseURL: 'base-url',
      model: 'model',
      vectorizeCollectionName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-octoai'>>({
      name: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-octoai',
        config: {
          baseURL: 'base-url',
          model: 'model',
          vectorizeCollectionName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecOllamaConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecOllama();
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
    const config = configure.vectorizer.text2VecOllama({
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
    const config = configure.vectorizer.text2VecOpenAI();
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
    const config = configure.vectorizer.text2VecOpenAI({
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

  it('should create the correct Text2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecPalm();
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

  it('should create the correct Text2VecPalmConfig type with all values', () => {
    const config = configure.vectorizer.text2VecPalm({
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
    const config = configure.vectorizer.text2VecTransformers();
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
    const config = configure.vectorizer.text2VecTransformers({
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
    const config = configure.vectorizer.text2VecVoyageAI();
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
    const config = configure.vectorizer.text2VecVoyageAI({
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
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined>>({
      name: 'generative-anyscale',
      config: {
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
      maxTokens: 100,
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined>>({
      name: 'generative-mistral',
      config: {
        maxTokens: 100,
        model: 'model',
        temperature: 0.5,
      },
    });
  });

  it('should create the correct GenerativeOctoAIConfig type with required & default values', () => {
    const config = configure.generative.octoai();
    expect(config).toEqual<ModuleConfig<'generative-octoai', GenerativeOctoAIConfig | undefined>>({
      name: 'generative-octoai',
      config: undefined,
    });
  });

  it('should create the correct GenerativeOctoAIConfig type with all values', () => {
    const config = configure.generative.octoai({
      baseURL: 'base-url',
      maxTokens: 100,
      model: 'model',
      temperature: 0.5,
    });
    expect(config).toEqual<ModuleConfig<'generative-octoai', GenerativeOctoAIConfig | undefined>>({
      name: 'generative-octoai',
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

  it('should create the correct GenerativePaLMConfig type with required & default values', () => {
    const config = configure.generative.palm();
    expect(config).toEqual<ModuleConfig<'generative-palm', undefined>>({
      name: 'generative-palm',
      config: undefined,
    });
  });

  it('should create the correct GenerativePaLMConfig type with all values', () => {
    const config = configure.generative.palm({
      apiEndpoint: 'api-endpoint',
      maxOutputTokens: 100,
      modelId: 'model-id',
      projectId: 'project-id',
      temperature: 0.5,
      topK: 5,
      topP: 0.8,
    });
    expect(config).toEqual<ModuleConfig<'generative-palm', GenerativePaLMConfig>>({
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
});
