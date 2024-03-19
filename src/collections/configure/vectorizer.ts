import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  Multi2VecPalmConfig,
  Ref2VecCentroidConfig,
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
  Vectorizer,
  VectorizerConfig,
} from '../config/types/index.js';

const makeVectorizer = <N extends Vectorizer, C extends VectorizerConfig>(
  name: N,
  config?: C
): ModuleConfig<N, C> => {
  return { name, config };
};

export const vectorizer = {
  none: () => makeVectorizer('none', {}),
  img2VecNeural: (config?: Img2VecNeuralConfig | undefined) => makeVectorizer('img2vec-neural', config),
  multi2VecBind: (config?: Multi2VecBindConfig | undefined) => makeVectorizer('multi2vec-bind', config),
  multi2VecClip: (config?: Multi2VecClipConfig | undefined) => makeVectorizer('multi2vec-clip', config),
  multi2VecPalm: (config: Multi2VecPalmConfig) => makeVectorizer('multi2vec-palm', config),
  ref2VecCentroid: (config: Ref2VecCentroidConfig) => makeVectorizer('ref2vec-centroid', config),
  text2VecAWS: (config: Text2VecAWSConfig) => makeVectorizer('text2vec-aws', config),
  text2VecAzureOpenAI: (config: Text2VecAzureOpenAIConfig) => makeVectorizer('text2vec-openai', config),
  text2VecCohere: (config?: Text2VecCohereConfig | undefined) => makeVectorizer('text2vec-cohere', config),
  text2VecContextionary: (config?: Text2VecContextionaryConfig) =>
    makeVectorizer('text2vec-contextionary', config),
  text2VecGPT4All: (config?: Text2VecGPT4AllConfig | undefined) => makeVectorizer('text2vec-gpt4all', config),
  text2VecHuggingFace: (config?: Text2VecHuggingFaceConfig | undefined) =>
    makeVectorizer('text2vec-huggingface', config),
  text2VecJina: (config?: Text2VecJinaConfig | undefined) => makeVectorizer('text2vec-jina', config),
  text2VecOpenAI: (config?: Text2VecOpenAIConfig | undefined) => makeVectorizer('text2vec-openai', config),
  text2VecPalm: (config: Text2VecPalmConfig) => makeVectorizer('text2vec-palm', config),
  text2VecTransformers: (config?: Text2VecTransformersConfig | undefined) =>
    makeVectorizer('text2vec-transformers', config),
  text2VecVoyage: (config?: Text2VecVoyageConfig | undefined) => makeVectorizer('text2vec-voyageai', config),
};
