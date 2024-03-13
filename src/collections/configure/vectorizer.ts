import { NamedVectorConfigCreate, NamedVectorizerOptionsCreate, VectorIndexConfigCreateType } from './types';
import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
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
  VectorIndexType,
  Vectorizer,
  VectorizerConfig,
} from '../config/types';

const makeNamedVectorizer = <
  N extends string,
  I extends VectorIndexType,
  V extends Vectorizer,
  C extends VectorizerConfig,
  T
>(
  name: N,
  vectorIndexType: I,
  vectorizerFactory: (config?: C) => ModuleConfig<V, C>,
  options?: NamedVectorizerOptionsCreate<C, I, T>
) => {
  return {
    vectorName: name,
    vectorIndex: {
      name: vectorIndexType,
      config: options?.vectorIndexConfig,
    },
    vectorizer: vectorizerFactory(options?.vectorizerConfig),
    properties: options?.properties,
  };
};

export const namedVectorizer = {
  none: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    vectorIndexConfig?: VectorIndexConfigCreateType<I>
  ) =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.none, { vectorizerConfig: {}, vectorIndexConfig }),
  img2VecNeural: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Img2VecNeuralConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'img2vec-neural'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.img2VecNeural, options),
  multi2VecBind: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Multi2VecBindConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'multi2vec-bind'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.multi2VecBind, options),
  multi2VecClip: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Multi2VecClipConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'multi2vec-clip'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.multi2VecClip, options),
  ref2VecCentroid: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    vectorizerConfig: Ref2VecCentroidConfig,
    options?: NamedVectorizerOptionsCreate<never, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'ref2vec-centroid'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.ref2VecCentroid, options),
  text2VecAWS: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecAWSConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-aws'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecAWS),
  text2VecAzureOpenAI: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecAzureOpenAIConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-openai'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecAzureOpenAI, options),
  text2VecCohere: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecCohereConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-cohere'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecCohere, options),
  text2VecContextionary: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecContextionaryConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-contextionary'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecContextionary, options),
  text2VecGPT4All: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecGPT4AllConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-gpt4all'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecGPT4All, options),
  text2VecHuggingFace: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecHuggingFaceConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-huggingface'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecHuggingFace, options),
  text2VecJina: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecJinaConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-jina'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecJina, options),
  text2VecOpenAI: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecOpenAIConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-openai'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecOpenAI, options),
  text2VecPalm: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecPalmConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-palm'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecPalm, options),
  text2VecTransformers: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecTransformersConfig, I, T>
  ): NamedVectorConfigCreate<T, N, I, 'text2vec-transformers'> =>
    makeNamedVectorizer(name, vectorIndexType, vectorizer.text2VecTransformers, options),
};

const makeVectorizer = <N extends Vectorizer, C extends VectorizerConfig>(
  name: N,
  config?: C
): ModuleConfig<N, C> => {
  return { name, config };
};

export const vectorizer = {
  none: () => makeVectorizer('none', {}),
  img2VecNeural: (config?: Img2VecNeuralConfig) => makeVectorizer('img2vec-neural', config),
  multi2VecBind: (config?: Multi2VecBindConfig) => makeVectorizer('multi2vec-bind', config),
  multi2VecClip: (config?: Multi2VecClipConfig) => makeVectorizer('multi2vec-clip', config),
  ref2VecCentroid: (config?: Ref2VecCentroidConfig) => makeVectorizer('ref2vec-centroid', config),
  text2VecAWS: (config?: Text2VecAWSConfig) => makeVectorizer('text2vec-aws', config),
  text2VecAzureOpenAI: (config?: Text2VecAzureOpenAIConfig) => makeVectorizer('text2vec-openai', config),
  text2VecCohere: (config?: Text2VecCohereConfig) => makeVectorizer('text2vec-cohere', config),
  text2VecContextionary: (config?: Text2VecContextionaryConfig) =>
    makeVectorizer('text2vec-contextionary', config),
  text2VecGPT4All: (config?: Text2VecGPT4AllConfig) => makeVectorizer('text2vec-gpt4all', config),
  text2VecHuggingFace: (config?: Text2VecHuggingFaceConfig) => makeVectorizer('text2vec-huggingface', config),
  text2VecJina: (config?: Text2VecJinaConfig) => makeVectorizer('text2vec-jina', config),
  text2VecOpenAI: (config?: Text2VecOpenAIConfig) => makeVectorizer('text2vec-openai', config),
  text2VecPalm: (config?: Text2VecPalmConfig) => makeVectorizer('text2vec-palm', config),
  text2VecTransformers: (config?: Text2VecTransformersConfig) =>
    makeVectorizer('text2vec-transformers', config),
};
