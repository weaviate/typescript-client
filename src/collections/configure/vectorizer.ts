import {
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  Multi2VecField,
  Multi2VecPalmConfig,
  VectorIndexType,
  Vectorizer,
  VectorizerConfigType,
} from '../config/types/index.js';
import { VectorConfigCreate, VectorIndexConfigCreateType, VectorizerCreateOptions } from '../index.js';
import { PrimitiveKeys } from '../types/internal.js';
import { ConfigureNonTextVectorizerOptions, ConfigureTextVectorizerOptions } from './types/index.js';

const makeVectorizer = <T, N extends string | undefined, I extends VectorIndexType, V extends Vectorizer>(
  name: N | undefined,
  options?: VectorizerCreateOptions<PrimitiveKeys<T>[], I, V>
) => {
  return {
    vectorName: name as N,
    properties: options?.sourceProperties,
    vectorIndex: options?.vectorIndexConfig
      ? options.vectorIndexConfig
      : { name: 'hnsw' as I, config: undefined as VectorIndexConfigCreateType<I> },
    vectorizer: options?.vectorizerConfig
      ? options.vectorizerConfig
      : { name: 'none' as V, config: undefined as VectorizerConfigType<V> },
  };
};

const mapMulti2VecField = (field: string | Multi2VecField): Multi2VecField => {
  if (typeof field === 'string') {
    return { name: field };
  }
  return field;
};

const formatMulti2VecFields = (
  weights: Record<string, number[]>,
  key: string,
  fields?: Multi2VecField[]
): Record<string, number[]> => {
  if (fields !== undefined && fields.length > 0) {
    weights[key] = fields.filter((f) => f.weight !== undefined).map((f) => f.weight as number);
    if (weights[key].length === 0) {
      delete weights[key];
    }
  }
  return weights;
};

export const vectorizer = {
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'none'`.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'none'>} [opts] The configuration options for the `none` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'none'>} The configuration object.
   */
  none: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureNonTextVectorizerOptions<N, I, 'none'>
  ): VectorConfigCreate<never, N, I, 'none'> => {
    const { name, vectorIndexConfig } = opts || {};
    return makeVectorizer(name, { vectorIndexConfig });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'img2vec-neural'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'img2vec-neural'>} [opts] The configuration options for the `img2vec-neural` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'img2vec-neural'>} The configuration object.
   */
  img2VecNeural: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N, I, 'img2vec-neural'>
  ): VectorConfigCreate<never, N, I, 'img2vec-neural'> => {
    const { name, vectorIndexConfig, ...config } = opts;
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'img2vec-neural',
        config: config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-bind'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-bind'>} [opts] The configuration options for the `multi2vec-bind` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-bind'>} The configuration object.
   */
  multi2VecBind: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-bind'>
  ): VectorConfigCreate<never, N, I, 'multi2vec-bind'> => {
    const { name, vectorIndexConfig, ...config } = opts || {};
    const audioFields = config.audioFields?.map(mapMulti2VecField);
    const depthFields = config.depthFields?.map(mapMulti2VecField);
    const imageFields = config.imageFields?.map(mapMulti2VecField);
    const IMUFields = config.IMUFields?.map(mapMulti2VecField);
    const textFields = config.textFields?.map(mapMulti2VecField);
    const thermalFields = config.thermalFields?.map(mapMulti2VecField);
    const videoFields = config.videoFields?.map(mapMulti2VecField);
    let weights: Multi2VecClipConfig['weights'] = {};
    weights = formatMulti2VecFields(weights, 'audioFields', audioFields);
    weights = formatMulti2VecFields(weights, 'depthFields', depthFields);
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'IMUFields', IMUFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    weights = formatMulti2VecFields(weights, 'thermalFields', thermalFields);
    weights = formatMulti2VecFields(weights, 'videoFields', videoFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-bind',
        config:
          Object.keys(config).length === 0
            ? undefined
            : {
                ...config,
                audioFields: audioFields?.map((f) => f.name),
                depthFields: depthFields?.map((f) => f.name),
                imageFields: imageFields?.map((f) => f.name),
                IMUFields: IMUFields?.map((f) => f.name),
                textFields: textFields?.map((f) => f.name),
                thermalFields: thermalFields?.map((f) => f.name),
                videoFields: videoFields?.map((f) => f.name),
                weights: Object.keys(weights).length === 0 ? undefined : weights,
              },
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-clip'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-clip'>} [opts] The configuration options for the `multi2vec-clip` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-clip'>} The configuration object.
   */
  multi2VecClip: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-clip'>
  ): VectorConfigCreate<never, N, I, 'multi2vec-clip'> => {
    const { name, vectorIndexConfig, ...config } = opts || {};
    const imageFields = config.imageFields?.map(mapMulti2VecField);
    const textFields = config.textFields?.map(mapMulti2VecField);
    let weights: Multi2VecBindConfig['weights'] = {};
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-clip',
        config:
          Object.keys(config).length === 0
            ? undefined
            : {
                ...config,
                imageFields: imageFields?.map((f) => f.name),
                textFields: textFields?.map((f) => f.name),
                weights: Object.keys(weights).length === 0 ? undefined : weights,
              },
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-palm'>} opts The configuration options for the `multi2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-palm'>} The configuration object.
   */
  multi2VecPalm: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-palm'>
  ): VectorConfigCreate<never, N, I, 'multi2vec-palm'> => {
    const { name, vectorIndexConfig, ...config } = opts;
    const imageFields = config.imageFields?.map(mapMulti2VecField);
    const textFields = config.textFields?.map(mapMulti2VecField);
    const videoFields = config.videoFields?.map(mapMulti2VecField);
    let weights: Multi2VecPalmConfig['weights'] = {};
    weights = formatMulti2VecFields(weights, 'imageFields', imageFields);
    weights = formatMulti2VecFields(weights, 'textFields', textFields);
    weights = formatMulti2VecFields(weights, 'videoFields', videoFields);
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'multi2vec-palm',
        config: {
          ...config,
          imageFields: imageFields?.map((f) => f.name),
          textFields: textFields?.map((f) => f.name),
          videoFields: videoFields?.map((f) => f.name),
          weights: Object.keys(weights).length === 0 ? undefined : weights,
        },
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'ref2vec-centroid'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'ref2vec-centroid'>} opts The configuration options for the `ref2vec-centroid` vectorizer.
   * @returns {VectorConfigCreate<never, N, I, 'ref2vec-centroid'>} The configuration object.
   */
  ref2VecCentroid: <N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N, I, 'ref2vec-centroid'>
  ): VectorConfigCreate<never, N, I, 'ref2vec-centroid'> => {
    const { name, vectorIndexConfig, ...config } = opts;
    return makeVectorizer(name, {
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'ref2vec-centroid',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-aws'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-aws) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<N, T, I, 'text2vec-aws'>} opts The configuration options for the `text2vec-aws` vectorizer.
   * @returns { VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'>} The configuration object.
   */
  text2VecAWS: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-aws'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts;
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-aws',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-azure-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-azure-openai'>} opts The configuration options for the `text2vec-azure-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'>} The configuration object.
   */
  text2VecAzureOpenAI: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-azure-openai'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts;
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-azure-openai',
        config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-cohere'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-cohere'>} [opts] The configuration options for the `text2vec-cohere` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'>} The configuration object.
   */
  text2VecCohere: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-cohere'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-cohere',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-contextionary'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-contextionary'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'>} The configuration object.
   */
  text2VecContextionary: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-contextionary'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-contextionary',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-gpt4all'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-gpt4all'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'>} The configuration object.
   */
  text2VecGPT4All: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-gpt4all'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-gpt4all',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-huggingface'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-huggingface'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'>} The configuration object.
   */
  text2VecHuggingFace: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-huggingface'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-huggingface',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-jina'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-jina) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-jina'>} [opts] The configuration for the `text2vec-jina` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'>} The configuration object.
   */
  text2VecJina: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-jina'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-jina',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-openai'>} [opts] The configuration for the `text2vec-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'>} The configuration object.
   */
  text2VecOpenAI: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-openai'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-openai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-ollama'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-ollama) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-ollama'>} [opts] The configuration for the `text2vec-ollama` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-ollama'>} The configuration object.
   */
  text2VecOllama: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-ollama'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-ollama'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-ollama',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-palm) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-palm'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'>} The configuration object.
   */
  text2VecPalm: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-palm'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-palm',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-transformers'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-transformers'>} [opts] The configuration for the `text2vec-transformers` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'>} The configuration object.
   */
  text2VecTransformers: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-transformers'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-transformers',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-voyageai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-voyageai'>} [opts] The configuration for the `text2vec-voyageai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'>} The configuration object.
   */
  text2VecVoyageAI: <T, N extends string | undefined = undefined, I extends VectorIndexType = 'hnsw'>(
    opts?: ConfigureTextVectorizerOptions<T, N, I, 'text2vec-voyageai'>
  ): VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'> => {
    const { name, sourceProperties, vectorIndexConfig, ...config } = opts || {};
    return makeVectorizer(name, {
      sourceProperties,
      vectorIndexConfig,
      vectorizerConfig: {
        name: 'text2vec-voyageai',
        config: Object.keys(config).length === 0 ? undefined : config,
      },
    });
  },
};

const l = vectorizer.text2VecContextionary();
