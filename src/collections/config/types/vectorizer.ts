import { ModuleConfig } from './index.js';
import { VectorIndexConfigFlat, VectorIndexConfigHNSW, VectorIndexType } from './vectorIndex.js';

export type VectorConfig = Record<
  string,
  {
    properties?: string[];
    vectorizer: ModuleConfig<Vectorizer, VectorizerConfig> | ModuleConfig<string, any>;
    indexConfig: VectorIndexConfigHNSW | VectorIndexConfigFlat;
    indexType: VectorIndexType;
  }
>;

export type Vectorizer =
  | 'img2vec-neural'
  | 'multi2vec-clip'
  | 'multi2vec-bind'
  | 'multi2vec-palm'
  | 'ref2vec-centroid'
  | 'text2vec-aws'
  | 'text2vec-azure-openai'
  | 'text2vec-cohere'
  | 'text2vec-contextionary'
  | 'text2vec-gpt4all'
  | 'text2vec-huggingface'
  | 'text2vec-jina'
  | 'text2vec-openai'
  | 'text2vec-palm'
  | 'text2vec-transformers'
  | 'text2vec-voyageai'
  | 'none';

export type Img2VecNeuralConfig = {
  imageFields?: string[];
};

export type Multi2VecClipConfig = {
  imageFields?: string[];
  textFields?: string[];
  vectorizeCollectionName?: boolean;
};

export type Multi2VecBindConfig = {
  audioFields?: string[];
  depthFields?: string[];
  imageFields?: string[];
  IMUFields?: string[];
  textFields?: string[];
  thermalFields?: string[];
  videoFields?: string[];
  vectorizeCollectionName?: boolean;
};

export type Multi2VecPalmConfig = {
  projectId: string;
  imageFields?: string[];
  textFields?: string[];
  videoFields?: string[];
  location?: string;
  modelId?: string;
  dimensions?: number;
  vectorizeCollectionName?: boolean;
};

export type Ref2VecCentroidConfig = {
  referenceProperties: string[];
  method: 'mean';
};

export type Text2VecAWSConfig = {
  endpoint?: string;
  model?: string;
  region: string;
  service: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecAzureOpenAIConfig = {
  baseURL?: string;
  deploymentID: string;
  resourceName: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecCohereConfig = {
  baseURL?: string;
  model?: string;
  truncate?: boolean;
  vectorizeCollectionName?: boolean;
};

export type Text2VecContextionaryConfig = {
  vectorizeCollectionName?: boolean;
};

export type Text2VecGPT4AllConfig = {
  vectorizeCollectionName?: boolean;
};

export type Text2VecHuggingFaceConfig = {
  endpointURL?: string;
  model?: string;
  passageModel?: string;
  queryModel?: string;
  useCache?: boolean;
  useGPU?: boolean;
  waitForModel?: boolean;
  vectorizeCollectionName?: boolean;
};

export type Text2VecJinaConfig = {
  model?: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecOpenAIConfig = {
  baseURL?: string;
  dimensions?: number;
  model?: string;
  modelVersion?: string;
  type?: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecPalmConfig = {
  apiEndpoint?: string;
  modelId?: string;
  projectId?: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecTransformersConfig = {
  poolingStrategy?: string;
  vectorizeCollectionName?: boolean;
};

export type Text2VecVoyageAIConfig = {
  baseURL?: string;
  model?: string;
  truncate?: boolean;
  vectorizeCollectionName?: boolean;
};

export type NoVectorizerConfig = {};

export type VectorizerConfigType<V> = V extends 'img2vec-neural'
  ? Img2VecNeuralConfig | undefined
  : V extends 'multi2vec-clip'
  ? Multi2VecClipConfig | undefined
  : V extends 'multi2vec-bind'
  ? Multi2VecBindConfig | undefined
  : V extends 'multi2vec-palm'
  ? Multi2VecPalmConfig
  : V extends 'ref2vec-centroid'
  ? Ref2VecCentroidConfig
  : V extends 'text2vec-aws'
  ? Text2VecAWSConfig
  : V extends 'text2vec-contextionary'
  ? Text2VecContextionaryConfig | undefined
  : V extends 'text2vec-cohere'
  ? Text2VecCohereConfig | undefined
  : V extends 'text2vec-gpt4all'
  ? Text2VecGPT4AllConfig | undefined
  : V extends 'text2vec-huggingface'
  ? Text2VecHuggingFaceConfig | undefined
  : V extends 'text2vec-jina'
  ? Text2VecJinaConfig | undefined
  : V extends 'text2vec-openai'
  ? Text2VecOpenAIConfig | undefined
  : V extends 'text2vec-azure-openai'
  ? Text2VecAzureOpenAIConfig
  : V extends 'text2vec-palm'
  ? Text2VecPalmConfig | undefined
  : V extends 'text2vec-transformers'
  ? Text2VecTransformersConfig | undefined
  : V extends 'text2vec-voyageai'
  ? Text2VecVoyageAIConfig | undefined
  : V extends 'none'
  ? {}
  : V extends undefined
  ? undefined
  : never;

export type VectorizerConfig =
  | Img2VecNeuralConfig
  | Multi2VecClipConfig
  | Multi2VecBindConfig
  | Multi2VecPalmConfig
  | Ref2VecCentroidConfig
  | Text2VecAWSConfig
  | Text2VecAzureOpenAIConfig
  | Text2VecContextionaryConfig
  | Text2VecCohereConfig
  | Text2VecGPT4AllConfig
  | Text2VecHuggingFaceConfig
  | Text2VecJinaConfig
  | Text2VecOpenAIConfig
  | Text2VecPalmConfig
  | Text2VecTransformersConfig
  | Text2VecVoyageAIConfig
  | NoVectorizerConfig;
