import configure from './index.js';
import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  Multi2VecPalmConfig,
  NamedVectorConfigCreate,
  Properties,
  Text2VecAWSConfig,
  Text2VecAzureOpenAIConfig,
  Text2VecCohereConfig,
  Text2VecContextionaryConfig,
  Text2VecGPT4AllConfig,
  Text2VecHuggingFaceConfig,
  Text2VecJinaConfig,
  Text2VecOpenAIConfig,
  Text2VecPalmConfig,
  Text2VecTransformersConfig,
  Text2VecVoyageConfig,
} from '../types/index.js';
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

describe('Unit testing of the vectorizer factory class', () => {
  it('should create the correct Img2VecNeuralConfig type with defaults', () => {
    const config = configure.vectorizer.img2VecNeural();
    expect(config).toEqual<ModuleConfig<'img2vec-neural', Img2VecNeuralConfig>>({
      name: 'img2vec-neural',
    });
  });

  it('should create the correct Img2VecNeuralConfig type with custom values', () => {
    const config = configure.vectorizer.img2VecNeural({
      imageFields: ['field1', 'field2'],
    });
    expect(config).toEqual<ModuleConfig<'img2vec-neural', Img2VecNeuralConfig>>({
      name: 'img2vec-neural',
      config: {
        imageFields: ['field1', 'field2'],
      },
    });
  });

  it('should create the correct Multi2VecClipConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecClip();
    expect(config).toEqual<ModuleConfig<'multi2vec-clip', Img2VecNeuralConfig>>({
      name: 'multi2vec-clip',
    });
  });

  it('should create the correct Multi2VecClipConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecClip({
      imageFields: ['field1', 'field2'],
      textFields: ['field3', 'field4'],
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'multi2vec-clip', Multi2VecClipConfig>>({
      name: 'multi2vec-clip',
      config: {
        imageFields: ['field1', 'field2'],
        textFields: ['field3', 'field4'],
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Multi2VecBindConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecBind();
    expect(config).toEqual<ModuleConfig<'multi2vec-bind', Multi2VecBindConfig>>({
      name: 'multi2vec-bind',
    });
  });

  it('should create the correct Multi2VecBindConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecBind({
      audioFields: ['field1', 'field2'],
      depthFields: ['field3', 'field4'],
      imageFields: ['field5', 'field6'],
      IMUFields: ['field7', 'field8'],
      textFields: ['field9', 'field10'],
      thermalFields: ['field11', 'field12'],
      videoFields: ['field13', 'field14'],
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'multi2vec-bind', Multi2VecBindConfig>>({
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
    });
  });

  it('should create the correct Multi2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.multi2VecPalm({
      projectId: 'project-id',
    });
    expect(config).toEqual<ModuleConfig<'multi2vec-palm', Multi2VecPalmConfig>>({
      name: 'multi2vec-palm',
      config: {
        projectId: 'project-id',
      },
    });
  });

  it('should create the correct Multi2VecPalmConfig type with custom values', () => {
    const config = configure.vectorizer.multi2VecPalm({
      projectId: 'project-id',
      location: 'location',
      modelId: 'model-id',
      dimensions: 256,
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'multi2vec-palm', Multi2VecPalmConfig>>({
      name: 'multi2vec-palm',
      config: {
        projectId: 'project-id',
        location: 'location',
        modelId: 'model-id',
        dimensions: 256,
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecAWSConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecAWS({
      region: 'region',
      service: 'service',
    });
    expect(config).toEqual<ModuleConfig<'text2vec-aws', Text2VecAWSConfig>>({
      name: 'text2vec-aws',
      config: {
        region: 'region',
        service: 'service',
      },
    });
  });

  it('should create the correct Text2VecAWSConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecAWS({
      endpoint: 'endpoint',
      model: 'model',
      region: 'region',
      service: 'service',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-aws', Text2VecAWSConfig>>({
      name: 'text2vec-aws',
      config: {
        endpoint: 'endpoint',
        model: 'model',
        region: 'region',
        service: 'service',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecAzureOpenAI({
      deploymentID: 'deployment-id',
      resourceName: 'resource-name',
    });
    expect(config).toEqual<ModuleConfig<'text2vec-openai', Text2VecAzureOpenAIConfig>>({
      name: 'text2vec-openai',
      config: {
        deploymentID: 'deployment-id',
        resourceName: 'resource-name',
      },
    });
  });

  it('should create the correct Text2VecAzureOpenAIConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecAzureOpenAI({
      baseURL: 'base-url',
      deploymentID: 'deployment-id',
      resourceName: 'resource-name',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-openai', Text2VecAzureOpenAIConfig>>({
      name: 'text2vec-openai',
      config: {
        baseURL: 'base-url',
        deploymentID: 'deployment-id',
        resourceName: 'resource-name',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecCohereConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecCohere();
    expect(config).toEqual<ModuleConfig<'text2vec-cohere', Text2VecCohereConfig>>({
      name: 'text2vec-cohere',
    });
  });

  it('should create the correct Text2VecCohereConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecCohere({
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-cohere', Text2VecCohereConfig>>({
      name: 'text2vec-cohere',
      config: {
        baseURL: 'base-url',
        model: 'model',
        truncate: true,
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecContextionaryConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecContextionary();
    expect(config).toEqual<ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig>>({
      name: 'text2vec-contextionary',
    });
  });

  it('should create the correct Text2VecContextionaryConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecContextionary({
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig>>({
      name: 'text2vec-contextionary',
      config: {
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecGPT4AllConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecGPT4All();
    expect(config).toEqual<ModuleConfig<'text2vec-gpt4all', Text2VecGPT4AllConfig>>({
      name: 'text2vec-gpt4all',
    });
  });

  it('should create the correct Text2VecGPT4AllConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecGPT4All({
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-gpt4all', Text2VecGPT4AllConfig>>({
      name: 'text2vec-gpt4all',
      config: {
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecHuggingFaceConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecHuggingFace();
    expect(config).toEqual<ModuleConfig<'text2vec-huggingface', Text2VecHuggingFaceConfig>>({
      name: 'text2vec-huggingface',
    });
  });

  it('should create the correct Text2VecHuggingFaceConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecHuggingFace({
      endpointURL: 'endpoint-url',
      model: 'model',
      passageModel: 'passage-model',
      queryModel: 'query-model',
      useCache: true,
      useGPU: true,
      waitForModel: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-huggingface', Text2VecHuggingFaceConfig>>({
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
    });
  });

  it('should create the correct Text2VecJinaConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecJina();
    expect(config).toEqual<ModuleConfig<'text2vec-jina', Text2VecJinaConfig>>({
      name: 'text2vec-jina',
    });
  });

  it('should create the correct Text2VecJinaConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecJina({
      model: 'model',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-jina', Text2VecJinaConfig>>({
      name: 'text2vec-jina',
      config: {
        model: 'model',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecOpenAIConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecOpenAI();
    expect(config).toEqual<ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig>>({
      name: 'text2vec-openai',
    });
  });

  it('should create the correct Text2VecOpenAIConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecOpenAI({
      baseURL: 'base-url',
      dimensions: 256,
      model: 'model',
      modelVersion: 'model-version',
      type: 'type',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig>>({
      name: 'text2vec-openai',
      config: {
        baseURL: 'base-url',
        dimensions: 256,
        model: 'model',
        modelVersion: 'model-version',
        type: 'type',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecPalm({
      projectId: 'project-id',
    });
    expect(config).toEqual<ModuleConfig<'text2vec-palm', Text2VecPalmConfig>>({
      name: 'text2vec-palm',
      config: {
        projectId: 'project-id',
      },
    });
  });

  it('should create the correct Text2VecPalmConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecPalm({
      apiEndpoint: 'api-endpoint',
      modelId: 'model-id',
      projectId: 'project-id',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-palm', Text2VecPalmConfig>>({
      name: 'text2vec-palm',
      config: {
        apiEndpoint: 'api-endpoint',
        modelId: 'model-id',
        projectId: 'project-id',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecTransformersConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecTransformers();
    expect(config).toEqual<ModuleConfig<'text2vec-transformers', Text2VecTransformersConfig>>({
      name: 'text2vec-transformers',
    });
  });

  it('should create the correct Text2VecTransformersConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecTransformers({
      poolingStrategy: 'pooling-strategy',
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-transformers', Text2VecTransformersConfig>>({
      name: 'text2vec-transformers',
      config: {
        poolingStrategy: 'pooling-strategy',
        vectorizeClassName: true,
      },
    });
  });

  it('should create the correct Text2VecVoyageConfig type with defaults', () => {
    const config = configure.vectorizer.text2VecVoyage();
    expect(config).toEqual<ModuleConfig<'text2vec-voyageai', Text2VecVoyageConfig>>({
      name: 'text2vec-voyageai',
    });
  });

  it('should create the correct Text2VecVoyageConfig type with custom values', () => {
    const config = configure.vectorizer.text2VecVoyage({
      baseURL: 'base-url',
      model: 'model',
      truncate: true,
      vectorizeClassName: true,
    });
    expect(config).toEqual<ModuleConfig<'text2vec-voyageai', Text2VecVoyageConfig>>({
      name: 'text2vec-voyageai',
      config: {
        baseURL: 'base-url',
        model: 'model',
        truncate: true,
        vectorizeClassName: true,
      },
    });
  });
});

describe('Unit testing of the namedVectorizer factory class', () => {
  it('should create a NamedVectorConfigCreate type with no vectorizer and a default vector index', () => {
    const config = configure.namedVectorizer('vector');
    expect(config).toEqual<NamedVectorConfigCreate<Properties, 'vector', 'hnsw', 'none'>>({
      vectorName: 'vector',
      vectorIndex: {
        name: 'hnsw',
      },
      vectorizer: {
        name: 'none',
      },
    });
  });

  it('should create a NamedVectorConfigCreate type with no vectorizer and a custom vector index', () => {
    const config = configure.namedVectorizer('vector', { vectorIndexConfig: configure.vectorIndex.flat() });
    expect(config).toEqual<NamedVectorConfigCreate<Properties, 'vector', 'flat', 'none'>>({
      vectorName: 'vector',
      vectorIndex: {
        name: 'flat',
        config: {
          distance: 'cosine',
          quantizer: undefined,
          vectorCacheMaxObjects: 1000000000000,
        },
      },
      vectorizer: {
        name: 'none',
      },
    });
  });

  it('should create a NamedVectorConfigCreate type with a vectorizer and a vector index', () => {
    const config = configure.namedVectorizer('vector', {
      vectorIndexConfig: configure.vectorIndex.hnsw({
        efConstruction: 256,
      }),
      vectorizerConfig: configure.vectorizer.img2VecNeural(),
    });
    expect(config).toEqual<NamedVectorConfigCreate<Properties, 'vector', 'hnsw', 'img2vec-neural'>>({
      vectorName: 'vector',
      vectorIndex: {
        name: 'hnsw',
        config: {
          cleanupIntervalSeconds: 300,
          distance: 'cosine',
          dynamicEfFactor: 8,
          dynamicEfMax: 500,
          dynamicEfMin: 100,
          ef: -1,
          efConstruction: 256,
          flatSearchCutoff: 40000,
          maxConnections: 64,
          skip: false,
          vectorCacheMaxObjects: 1000000000000,
        },
      },
      vectorizer: {
        name: 'img2vec-neural',
      },
    });
  });
});
