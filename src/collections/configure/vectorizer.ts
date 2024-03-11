import { NamedVectorConfigCreate, NamedVectorizerOptionsCreate, VectorIndexConfigCreateType } from './types';
import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  Ref2VecCentroidConfig,
  Text2VecCohereConfig,
  Text2VecContextionaryConfig,
  Text2VecOpenAIConfig,
  VectorIndexType,
} from '../config/types';

export const namedVectorizer = {
  none: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    vectorIndexConfig?: VectorIndexConfigCreateType<I>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      vectorIndex: {
        name: vectorIndexType,
        config: vectorIndexConfig,
      },
      vectorizer: vectorizer.none(),
    };
  },
  img2VecNeural: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Img2VecNeuralConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.img2VecNeural(options?.vectorizerConfig),
    };
  },
  multi2VecBind: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Multi2VecBindConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.multi2VecBind(options?.vectorizerConfig),
    };
  },
  multi2VecClip: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Multi2VecClipConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.multi2VecClip(options?.vectorizerConfig),
    };
  },
  ref2VecCentroid: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    vectorizerConfig: Ref2VecCentroidConfig,
    options?: NamedVectorizerOptionsCreate<never, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.ref2VecCentroid(vectorizerConfig),
    };
  },
  text2VecCohere: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecCohereConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.text2VecCohere(options?.vectorizerConfig),
    };
  },
  text2VecContextionary: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecContextionaryConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.text2VecContextionary(options?.vectorizerConfig),
    };
  },
  text2VecOpenAI: <N extends string, I extends VectorIndexType, T>(
    name: N,
    vectorIndexType: I,
    options?: NamedVectorizerOptionsCreate<Text2VecOpenAIConfig, I, T>
  ): NamedVectorConfigCreate<T, N> => {
    return {
      vectorName: name,
      properties: options?.properties,
      vectorIndex: {
        name: vectorIndexType,
        config: options?.vectorIndexConfig,
      },
      vectorizer: vectorizer.text2VecOpenAI(options?.vectorizerConfig),
    };
  },
};

export const vectorizer = {
  none: (): ModuleConfig<'none', Record<string, never>> => {
    return {
      name: 'none',
      config: {},
    };
  },
  img2VecNeural: (config?: Img2VecNeuralConfig): ModuleConfig<'img2vec-neural', Img2VecNeuralConfig> => {
    return {
      name: 'img2vec-neural',
      config: config,
    };
  },
  multi2VecBind: (config?: Multi2VecBindConfig): ModuleConfig<'multi2vec-bind', Multi2VecBindConfig> => {
    return {
      name: 'multi2vec-bind',
      config: config,
    };
  },
  multi2VecClip: (config?: Multi2VecClipConfig): ModuleConfig<'multi2vec-clip', Multi2VecClipConfig> => {
    return {
      name: 'multi2vec-clip',
      config: config,
    };
  },
  ref2VecCentroid: (
    config: Ref2VecCentroidConfig
  ): ModuleConfig<'ref2vec-centroid', Ref2VecCentroidConfig> => {
    return {
      name: 'ref2vec-centroid',
      config: config,
    };
  },
  text2VecCohere: (config?: Text2VecCohereConfig): ModuleConfig<'text2vec-cohere', Text2VecCohereConfig> => {
    return {
      name: 'text2vec-cohere',
      config: config,
    };
  },
  text2VecContextionary: (
    config?: Text2VecContextionaryConfig
  ): ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig> => {
    return {
      name: 'text2vec-contextionary',
      config: config,
    };
  },
  text2VecOpenAI: (config?: Text2VecOpenAIConfig): ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig> => {
    return {
      name: 'text2vec-openai',
      config: config,
    };
  },
};
