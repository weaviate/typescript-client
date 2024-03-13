import { ModuleConfig } from '.';
import { VectorIndexConfigFlat, VectorIndexConfigHNSW, VectorIndexType } from './vectorIndex';

export type VectorConfig = Record<
  string,
  {
    properties?: string[];
    vectorizer: ModuleConfig<Vectorizer, VectorizerConfig>;
    indexConfig: VectorIndexConfigHNSW | VectorIndexConfigFlat;
    indexType: VectorIndexType;
  }
>;

export type Vectorizer =
  | 'img2vec-neural'
  | 'multi2vec-clip'
  | 'multi2vec-bind'
  | 'ref2vec-centroid'
  | 'text2vec-aws'
  | 'text2vec-cohere'
  | 'text2vec-contextionary'
  | 'text2vec-gpt4all'
  | 'text2vec-huggingface'
  | 'text2vec-jina'
  | 'text2vec-openai'
  | 'text2vec-palm'
  | 'text2vec-transformers'
  | 'none'
  | string;

export type Img2VecNeuralConfig = {
  imageFields?: string[];
};

export type Multi2VecClipConfig = {
  imageFields?: string[];
  textFields?: string[];
  vectorizeClassName?: boolean;
};

export type Multi2VecBindConfig = {
  audioFields?: string[];
  depthFields?: string[];
  imageFields?: string[];
  IMUFields?: string[];
  textFields?: string[];
  thermalFields?: string[];
  videoFields?: string[];
  vectorizeClassName?: boolean;
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
  vectorizerClassName: boolean;
};

export type Text2VecAzureOpenAIConfig = {
  baseURL?: string;
  deploymentID: string;
  resourceName: string;
  vectorizerClassName: string;
};

export type Text2VecCohereConfig = {
  baseURL?: string;
  model?: string;
  truncate?: string;
  vectorizeClassName?: boolean;
};

export type Text2VecContextionaryConfig = {
  vectorizeClassName?: boolean;
};

export type Text2VecGPT4AllConfig = {
  vectorizeClassName?: boolean;
};

export type Text2VecHuggingFaceConfig = {
  endpointURL?: string;
  model?: string;
  passageModel?: string;
  queryModel?: string;
  waitForModel?: boolean;
  useCache?: boolean;
  useGPU?: boolean;
  vectorizeClassName?: boolean;
};

export type Text2VecJinaConfig = {
  model?: string;
  vectorizeClassName?: boolean;
};

export type Text2VecOpenAIConfig = {
  baseURL?: string;
  dimensions?: number;
  model?: string;
  modelVersion?: string;
  type?: string;
  vectorizeClassName?: boolean;
};

export type Text2VecPalmConfig = {
  projectID: string;
  apiEndpoint?: string;
  modelID?: string;
  vectorizeClassName?: boolean;
};

export type Text2VecTransformersConfig = {
  poolingStrategy?: string;
  vectorizeClassName?: boolean;
};

export type NoVectorizerConfig = {};

export type VectorizerConfigType<V> = V extends 'img2vec-neural'
  ? Img2VecNeuralConfig
  : V extends 'multi2vec-clip'
  ? Multi2VecClipConfig
  : V extends 'multi2vec-bind'
  ? Multi2VecBindConfig
  : V extends 'ref2vec-centroid'
  ? Ref2VecCentroidConfig
  : V extends 'text2vec-contextionary'
  ? Text2VecContextionaryConfig
  : V extends 'text2vec-cohere'
  ? Text2VecCohereConfig
  : V extends 'text2vec-openai'
  ? Text2VecOpenAIConfig
  : V extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export type VectorizerConfig =
  | Img2VecNeuralConfig
  | Multi2VecClipConfig
  | Multi2VecBindConfig
  | Ref2VecCentroidConfig
  | Text2VecContextionaryConfig
  | Text2VecCohereConfig
  | Text2VecOpenAIConfig
  | NoVectorizerConfig
  | Record<string, never>;
