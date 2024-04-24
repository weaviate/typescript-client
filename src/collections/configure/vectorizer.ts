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
  Text2VecVoyageAIConfig,
  VectorIndexType,
  Vectorizer,
  VectorizerConfig,
  VectorizerConfigType,
} from '../config/types/index.js';
import { ConfigureNonTextVectorizerOptions, ConfigureTextVectorizerOptions } from './types/index.js';
import {
  NamedVectorConfigCreate,
  NamedVectorizerCreateOptions,
  VectorIndexConfigCreateType,
} from '../index.js';
import { PrimitiveKeys } from '../types/internal.js';

const makeNamedVectorizer = <T, N extends string, I extends VectorIndexType, V extends Vectorizer>(
  name: N,
  options?: NamedVectorizerCreateOptions<PrimitiveKeys<T>[], I, V>
): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, V> => {
  return {
    vectorName: name,
    properties: options?.sourceProperties,
    vectorIndex: options?.vectorIndexConfig
      ? options.vectorIndexConfig
      : { name: 'hnsw' as I, config: undefined as VectorIndexConfigCreateType<I> },
    vectorizer: options?.vectorizerConfig
      ? options.vectorizerConfig
      : { name: 'none' as V, config: undefined as VectorizerConfigType<V> },
  };
};

export const namedVectorizer = {
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'none'`.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'none'>} [opts] The configuration options for the `none` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, 'none'>} The configuration object.
   */
  none: <N extends string, I extends VectorIndexType>(
    name: N,
    opts?: ConfigureNonTextVectorizerOptions<I, 'none'>
  ): NamedVectorConfigCreate<never, N, I, 'none'> =>
    makeNamedVectorizer(name, { vectorIndexConfig: opts?.vectorIndexConfig }),
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'img2vec-neural'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'img2vec-neural'>} [opts] The configuration options for the `img2vec-neural` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, 'img2vec-neural'>} The configuration object.
   */
  img2VecNeural: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureNonTextVectorizerOptions<I, 'img2vec-neural'>
  ): NamedVectorConfigCreate<never, N, I, 'img2vec-neural'> => {
    const { vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'img2vec-neural',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'multi2vec-bind'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'multi2vec-bind'>} [opts] The configuration options for the `multi2vec-bind` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-bind'>} The configuration object.
   */
  multi2VecBind: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureNonTextVectorizerOptions<I, 'multi2vec-bind'>
  ): NamedVectorConfigCreate<never, N, I, 'multi2vec-bind'> => {
    const { vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-bind',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'multi2vec-clip'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'multi2vec-clip'>} [opts] The configuration options for the `multi2vec-clip` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-clip'>} The configuration object.
   */
  multi2VecClip: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureNonTextVectorizerOptions<I, 'multi2vec-clip'>
  ): NamedVectorConfigCreate<never, N, I, 'multi2vec-clip'> => {
    const { vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-clip',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'multi2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'multi2vec-palm'>} opts The configuration options for the `multi2vec-palm` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-palm'>} The configuration object.
   */
  multi2VecPalm: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts: ConfigureNonTextVectorizerOptions<I, 'multi2vec-palm'>
  ): NamedVectorConfigCreate<never, N, I, 'multi2vec-palm'> => {
    const { vectorIndexConfig, ...config } = opts;
    return makeNamedVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-palm',
        config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'ref2vec-centroid'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureNonTextVectorizerOptions<I, 'ref2vec-centroid'>} opts The configuration options for the `ref2vec-centroid` vectorizer.
   * @returns {NamedVectorConfigCreate<never, N, I, 'ref2vec-centroid'>} The configuration object.
   */
  ref2VecCentroid: <N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts: ConfigureNonTextVectorizerOptions<I, 'ref2vec-centroid'>
  ): NamedVectorConfigCreate<never, N, I, 'ref2vec-centroid'> => {
    const { vectorIndexConfig, ...config } = opts;
    return makeNamedVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'ref2vec-centroid',
        config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-aws'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-aws) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-aws'>} opts The configuration options for the `text2vec-aws` vectorizer.
   * @returns { NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'>} The configuration object.
   */
  text2VecAWS: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts: ConfigureTextVectorizerOptions<T, I, 'text2vec-aws'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts;
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-aws',
        config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-azure-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-azure-openai'>} opts The configuration options for the `text2vec-azure-openai` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'>} The configuration object.
   */
  text2VecAzureOpenAI: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts: ConfigureTextVectorizerOptions<T, I, 'text2vec-azure-openai'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts;
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-azure-openai',
        config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-cohere'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-cohere'>} [opts] The configuration options for the `text2vec-cohere` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'>} The configuration object.
   */
  text2VecCohere: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-cohere'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-cohere',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-contextionary'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-contextionary'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'>} The configuration object.
   */
  text2VecContextionary: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-contextionary'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-contextionary',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-gpt4all'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-gpt4all'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'>} The configuration object.
   */
  text2VecGPT4All: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-gpt4all'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-gpt4all',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-huggingface'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-huggingface'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'>} The configuration object.
   */
  text2VecHuggingFace: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-huggingface'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-huggingface',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-jina'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-jina) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-jina'>} [opts] The configuration for the `text2vec-jina` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'>} The configuration object.
   */
  text2VecJina: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-jina'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-jina',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-openai'>} [opts] The configuration for the `text2vec-openai` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'>} The configuration object.
   */
  text2VecOpenAI: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-openai'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-openai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-palm) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-palm'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'>} The configuration object.
   */
  text2VecPalm: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts: ConfigureTextVectorizerOptions<T, I, 'text2vec-palm'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts;
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-palm',
        config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-transformers'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-transformers'>} [opts] The configuration for the `text2vec-transformers` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'>} The configuration object.
   */
  text2VecTransformers: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-transformers'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-transformers',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `NamedVectorConfigCreate` object with the vectorizer set to `'text2vec-voyageai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai) for detailed usage.
   *
   * @param {string} name The name of the vector.
   * @param {ConfigureTextVectorizerOptions<T, I, 'text2vec-voyageai'>} [opts] The configuration for the `text2vec-voyageai` vectorizer.
   * @returns {NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'>} The configuration object.
   */
  text2VecVoyageAI: <T, N extends string, I extends VectorIndexType = 'hnsw'>(
    name: N,
    opts?: ConfigureTextVectorizerOptions<T, I, 'text2vec-voyageai'>
  ): NamedVectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'> => {
    const { sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeNamedVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-voyageai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
};
