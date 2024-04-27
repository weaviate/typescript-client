import { configure } from './index.js';
import { ModuleConfig, VectorConfigCreate } from '../types/index.js';
import {
  InvertedIndexConfigCreate,
  MultiTenancyConfigCreate,
  ReplicationConfigCreate,
  ShardingConfigCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';

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
      desiredVirtualCount: 128,
    });
  });

  it('should create the correct ShardingConfig type with custom values', () => {
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

describe('Unit testing of the vectorizer factory class', () => {
  it('should create the correct Img2VecNeuralConfig type with defaults', () => {
    const config = configure.vectorizer.img2VecNeural('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'img2vec-neural'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'img2vec-neural',
        config: undefined,
      },
    });
  });

  it('should create the correct Img2VecNeuralConfig type with custom values', () => {
    const config = configure.vectorizer.img2VecNeural('test', {
      imageFields: ['field1', 'field2'],
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'img2vec-neural'>>({
      vectorName: 'test',
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
    const config = configure.vectorizer.multi2VecClip('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-clip'>>({
      vectorName: 'test',
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

  it('should create the correct Multi2VecClipConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecClip('test', {
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-clip'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-clip',
        config: {
          imageFields: ['field1', 'field2'],
          textFields: ['field3', 'field4'],
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecBindConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecBind('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-bind'>>({
      vectorName: 'test',
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

  it('should create the correct Multi2VecBindConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecBind('test', {
      audioFields: ['field1', 'field2'],
      depthFields: ['field3', 'field4'],
      imageFields: ['field5', 'field6'],
      IMUFields: ['field7', 'field8'],
      textFields: ['field9', 'field10'],
      thermalFields: ['field11', 'field12'],
      videoFields: ['field13', 'field14'],
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-bind'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecPalm('test', {
      projectId: 'project-id',
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-palm'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-palm',
        config: {
          projectId: 'project-id',
        },
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecPalm('test', {
      projectId: 'project-id',
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'multi2vec-palm'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'multi2vec-palm',
        config: {
          projectId: 'project-id',
          location: 'location',
          modelId: 'model-id',
          dimensions: 256,
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecAWSConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecAWS('test', {
      region: 'region',
      service: 'service',
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-aws'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecAWSConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecAWS('test', {
      endpoint: 'endpoint',
      model: 'model',
      region: 'region',
      service: 'service',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-aws'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecAzureOpenAI('test', {
      deploymentID: 'deployment-id',
      resourceName: 'resource-name',
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-azure-openai'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-azure-openai',
        config: {
          deploymentID: 'deployment-id',
          resourceName: 'resource-name',
        },
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecAzureOpenAI('test', {
      baseURL: 'base-url',
      deploymentID: 'deployment-id',
      resourceName: 'resource-name',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-azure-openai'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-azure-openai',
        config: {
          baseURL: 'base-url',
          deploymentID: 'deployment-id',
          resourceName: 'resource-name',
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecCohereConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecCohere('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-cohere'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecCohereConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecCohere('test', {
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-cohere'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecContextionaryConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecContextionary('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-contextionary'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecContextionaryConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecContextionary('test', {
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-contextionary'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-contextionary',
        config: {
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecGPT4AllConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecGPT4All('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-gpt4all'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecGPT4AllConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecGPT4All('test', {
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-gpt4all'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-gpt4all',
        config: {
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecHuggingFaceConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecHuggingFace('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-huggingface'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecHuggingFaceConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecHuggingFace('test', {
      endpointURL: 'endpoint-url',
      model: 'model',
      passageModel: 'passage-model',
      queryModel: 'query-model',
      useCache: true,
      useGPU: true,
      waitForModel: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-huggingface'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecJinaConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecJina('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-jina'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecJinaConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecJina('test', {
      model: 'model',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-jina'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-jina',
        config: {
          model: 'model',
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecOpenAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecOpenAI('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-openai'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecOpenAIConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecOpenAI('test', {
      baseURL: 'base-url',
      dimensions: 256,
      model: 'model',
      modelVersion: 'model-version',
      type: 'type',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-openai'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecPalm('test', {
      projectId: 'project-id',
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-palm'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-palm',
        config: {
          projectId: 'project-id',
        },
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecPalm('test', {
      apiEndpoint: 'api-endpoint',
      modelId: 'model-id',
      projectId: 'project-id',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-palm'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecTransformersConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecTransformers('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-transformers'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecTransformersConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecTransformers('test', {
      poolingStrategy: 'pooling-strategy',
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-transformers'>>({
      vectorName: 'test',
      vectorIndex: {
        name: 'hnsw',
        config: undefined,
      },
      vectorizer: {
        name: 'text2vec-transformers',
        config: {
          poolingStrategy: 'pooling-strategy',
          vectorizeClassName: true,
        },
      },
    });
  });

  it('should create the correct Text2VecVoyageAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecVoyageAI('test');
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-voyageai'>>({
      vectorName: 'test',
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

  it('should create the correct Text2VecVoyageConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecVoyageAI('test', {
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<VectorConfigCreate<never, 'test', 'hnsw', 'text2vec-voyageai'>>({
      vectorName: 'test',
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
          vectorizeClassName: true,
        },
      },
    });
  });
});
