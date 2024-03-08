import { ModuleConfig } from '.';
import { VectorIndexConfig, VectorIndexType } from './vectorIndex';

export type VectorConfig = Record<
  string,
  {
    properties?: string[];
    vectorizer: ModuleConfig<Vectorizer, VectorizerConfig>;
    indexConfig: VectorIndexConfig<VectorIndexType>;
    indexType: VectorIndexType;
  }
>;

export type Vectorizer =
  | 'img2vec-neural'
  | 'multi2vec-clip'
  | 'multi2vec-bind'
  | 'ref2vec-centroid'
  | 'text2vec-contextionary'
  | 'text2vec-cohere'
  | 'text2vec-openai'
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

export type Text2VecContextionaryConfig = {
  vectorizeClassName?: boolean;
};

export type Text2VecOpenAIConfig = {
  model?: 'ada' | 'babbage' | 'curie' | 'davinci';
  modelVersion?: string;
  type?: 'text' | 'code';
  vectorizeClassName?: boolean;
};

export type Text2VecCohereConfig = {
  model?:
    | 'embed-multilingual-v2.0'
    | 'small'
    | 'medium'
    | 'large'
    | 'multilingual-22-12'
    | 'embed-english-v2.0'
    | 'embed-english-light-v2.0';
  truncate?: 'RIGHT' | 'NONE';
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
