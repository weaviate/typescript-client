import { VectorConfigCreate, VectorIndexConfigCreateType } from '../index.js';
import { PrimitiveKeys } from '../types/internal.js';
import { ConfigureNonTextVectorizerOptions, ConfigureTextVectorizerOptions } from './types/index.js';
export declare const vectorizer: {
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'none'`.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'none'>} [opts] The configuration options for the `none` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'none'>} The configuration object.
   */
  none: <N extends string | undefined = undefined, I extends string = 'hnsw'>(
    opts?:
      | {
          name?: N | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I, VectorIndexConfigCreateType<I>>
            | undefined;
        }
      | undefined
  ) => VectorConfigCreate<never, N, I, 'none'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'img2vec-neural'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/img2vec-neural) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'img2vec-neural'>} [opts] The configuration options for the `img2vec-neural` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'img2vec-neural'>} The configuration object.
   */
  img2VecNeural: <N_1 extends string | undefined = undefined, I_1 extends string = 'hnsw'>(
    opts: import('../index.js').Img2VecNeuralConfig & {
      name?: N_1 | undefined;
      vectorIndexConfig?:
        | import('../index.js').ModuleConfig<I_1, VectorIndexConfigCreateType<I_1>>
        | undefined;
    }
  ) => VectorConfigCreate<never, N_1, I_1, 'img2vec-neural'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-bind'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/imagebind/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-bind'>} [opts] The configuration options for the `multi2vec-bind` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-bind'>} The configuration object.
   */
  multi2VecBind: <N_2 extends string | undefined = undefined, I_2 extends string = 'hnsw'>(
    opts?:
      | (import('./types/vectorizer.js').Multi2VecBindConfigCreate & {
          name?: N_2 | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_2, VectorIndexConfigCreateType<I_2>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<never, N_2, I_2, 'multi2vec-bind'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-clip'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-clip'>} [opts] The configuration options for the `multi2vec-clip` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-clip'>} The configuration object.
   */
  multi2VecClip: <N_3 extends string | undefined = undefined, I_3 extends string = 'hnsw'>(
    opts?:
      | (import('./types/vectorizer.js').Multi2VecClipConfigCreate & {
          name?: N_3 | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_3, VectorIndexConfigCreateType<I_3>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<never, N_3, I_3, 'multi2vec-clip'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-palm'>} opts The configuration options for the `multi2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-palm'>} The configuration object.
   * @deprecated Use `multi2VecGoogle` instead.
   */
  multi2VecPalm: <N_4 extends string | undefined = undefined, I_4 extends string = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N_4, I_4, 'multi2vec-palm'>
  ) => VectorConfigCreate<never, N_4, I_4, 'multi2vec-palm'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'multi2vec-google'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings-multimodal) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'multi2vec-google'>} opts The configuration options for the `multi2vec-google` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>[], N, I, 'multi2vec-google'>} The configuration object.
   */
  multi2VecGoogle: <N_5 extends string | undefined = undefined, I_5 extends string = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N_5, I_5, 'multi2vec-google'>
  ) => VectorConfigCreate<never, N_5, I_5, 'multi2vec-google'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'ref2vec-centroid'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/ref2vec-centroid) for detailed usage.
   *
   * @param {ConfigureNonTextVectorizerOptions<N, I, 'ref2vec-centroid'>} opts The configuration options for the `ref2vec-centroid` vectorizer.
   * @returns {VectorConfigCreate<never, N, I, 'ref2vec-centroid'>} The configuration object.
   */
  ref2VecCentroid: <N_6 extends string | undefined = undefined, I_6 extends string = 'hnsw'>(
    opts: ConfigureNonTextVectorizerOptions<N_6, I_6, 'ref2vec-centroid'>
  ) => VectorConfigCreate<never, N_6, I_6, 'ref2vec-centroid'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-aws'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/aws/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<N, T, I, 'text2vec-aws'>} opts The configuration options for the `text2vec-aws` vectorizer.
   * @returns { VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-aws'>} The configuration object.
   */
  text2VecAWS: <T, N_7 extends string | undefined = undefined, I_7 extends string = 'hnsw'>(
    opts: ConfigureTextVectorizerOptions<T, N_7, I_7, 'text2vec-aws'>
  ) => VectorConfigCreate<PrimitiveKeys<T>, N_7, I_7, 'text2vec-aws'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-azure-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-azure-openai'>} opts The configuration options for the `text2vec-azure-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-azure-openai'>} The configuration object.
   */
  text2VecAzureOpenAI: <T_1, N_8 extends string | undefined = undefined, I_8 extends string = 'hnsw'>(
    opts: ConfigureTextVectorizerOptions<T_1, N_8, I_8, 'text2vec-azure-openai'>
  ) => VectorConfigCreate<PrimitiveKeys<T_1>, N_8, I_8, 'text2vec-azure-openai'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-cohere'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/cohere/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-cohere'>} [opts] The configuration options for the `text2vec-cohere` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-cohere'>} The configuration object.
   */
  text2VecCohere: <T_2, N_9 extends string | undefined = undefined, I_9 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecCohereConfig & {
          name?: N_9 | undefined;
          sourceProperties?: PrimitiveKeys<T_2>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_9, VectorIndexConfigCreateType<I_9>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_2>, N_9, I_9, 'text2vec-cohere'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-contextionary'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/text2vec-contextionary) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-contextionary'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-contextionary'>} The configuration object.
   */
  text2VecContextionary: <T_3, N_10 extends string | undefined = undefined, I_10 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecContextionaryConfig & {
          name?: N_10 | undefined;
          sourceProperties?: PrimitiveKeys<T_3>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_10, VectorIndexConfigCreateType<I_10>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_3>, N_10, I_10, 'text2vec-contextionary'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-databricks'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/databricks/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-databricks'>} opts The configuration for the `text2vec-databricks` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-databricks'>} The configuration object.
   */
  text2VecDatabricks: <T_4, N_11 extends string | undefined = undefined, I_11 extends string = 'hnsw'>(
    opts: ConfigureTextVectorizerOptions<T_4, N_11, I_11, 'text2vec-databricks'>
  ) => VectorConfigCreate<PrimitiveKeys<T_4>, N_11, I_11, 'text2vec-databricks'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-gpt4all'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/gpt4all/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-gpt4all'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-gpt4all'>} The configuration object.
   */
  text2VecGPT4All: <T_5, N_12 extends string | undefined = undefined, I_12 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecGPT4AllConfig & {
          name?: N_12 | undefined;
          sourceProperties?: PrimitiveKeys<T_5>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_12, VectorIndexConfigCreateType<I_12>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_5>, N_12, I_12, 'text2vec-gpt4all'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-huggingface'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/huggingface/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-huggingface'>} [opts] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-huggingface'>} The configuration object.
   */
  text2VecHuggingFace: <T_6, N_13 extends string | undefined = undefined, I_13 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecHuggingFaceConfig & {
          name?: N_13 | undefined;
          sourceProperties?: PrimitiveKeys<T_6>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_13, VectorIndexConfigCreateType<I_13>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_6>, N_13, I_13, 'text2vec-huggingface'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-jina'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/jinaai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-jina'>} [opts] The configuration for the `text2vec-jina` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-jina'>} The configuration object.
   */
  text2VecJina: <T_7, N_14 extends string | undefined = undefined, I_14 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecJinaConfig & {
          name?: N_14 | undefined;
          sourceProperties?: PrimitiveKeys<T_7>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_14, VectorIndexConfigCreateType<I_14>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_7>, N_14, I_14, 'text2vec-jina'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-mistral'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/mistral/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-mistral'>} [opts] The configuration for the `text2vec-mistral` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-mistral'>} The configuration object.
   */
  text2VecMistral: <T_8, N_15 extends string | undefined = undefined, I_15 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecMistralConfig & {
          name?: N_15 | undefined;
          sourceProperties?: PrimitiveKeys<T_8>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_15, VectorIndexConfigCreateType<I_15>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_8>, N_15, I_15, 'text2vec-mistral'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-octoai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/octoai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-octoai'>} [opts] The configuration for the `text2vec-octoai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-octoai'>} The configuration object.
   */
  text2VecOctoAI: <T_9, N_16 extends string | undefined = undefined, I_16 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecOctoAIConfig & {
          name?: N_16 | undefined;
          sourceProperties?: PrimitiveKeys<T_9>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_16, VectorIndexConfigCreateType<I_16>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_9>, N_16, I_16, 'text2vec-octoai'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-openai'>} [opts] The configuration for the `text2vec-openai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-openai'>} The configuration object.
   */
  text2VecOpenAI: <T_10, N_17 extends string | undefined = undefined, I_17 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecOpenAIConfig & {
          name?: N_17 | undefined;
          sourceProperties?: PrimitiveKeys<T_10>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_17, VectorIndexConfigCreateType<I_17>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_10>, N_17, I_17, 'text2vec-openai'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-ollama'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/ollama/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-ollama'>} [opts] The configuration for the `text2vec-ollama` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-ollama'>} The configuration object.
   */
  text2VecOllama: <T_11, N_18 extends string | undefined = undefined, I_18 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecOllamaConfig & {
          name?: N_18 | undefined;
          sourceProperties?: PrimitiveKeys<T_11>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_18, VectorIndexConfigCreateType<I_18>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_11>, N_18, I_18, 'text2vec-ollama'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-palm'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-palm'>} The configuration object.
   * @deprecated Use `text2VecGoogle` instead.
   */
  text2VecPalm: <T_12, N_19 extends string | undefined = undefined, I_19 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecGoogleConfig & {
          name?: N_19 | undefined;
          sourceProperties?: PrimitiveKeys<T_12>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_19, VectorIndexConfigCreateType<I_19>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_12>, N_19, I_19, 'text2vec-palm'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-google'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-google'>} opts The configuration for the `text2vec-palm` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-google'>} The configuration object.
   */
  text2VecGoogle: <T_13, N_20 extends string | undefined = undefined, I_20 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecGoogleConfig & {
          name?: N_20 | undefined;
          sourceProperties?: PrimitiveKeys<T_13>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_20, VectorIndexConfigCreateType<I_20>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_13>, N_20, I_20, 'text2vec-google'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-transformers'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-transformers'>} [opts] The configuration for the `text2vec-transformers` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-transformers'>} The configuration object.
   */
  text2VecTransformers: <T_14, N_21 extends string | undefined = undefined, I_21 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecTransformersConfig & {
          name?: N_21 | undefined;
          sourceProperties?: PrimitiveKeys<T_14>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_21, VectorIndexConfigCreateType<I_21>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_14>, N_21, I_21, 'text2vec-transformers'>;
  /**
   * Create a `VectorConfigCreate` object with the vectorizer set to `'text2vec-voyageai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/voyageai/embeddings) for detailed usage.
   *
   * @param {ConfigureTextVectorizerOptions<T, N, I, 'text2vec-voyageai'>} [opts] The configuration for the `text2vec-voyageai` vectorizer.
   * @returns {VectorConfigCreate<PrimitiveKeys<T>, N, I, 'text2vec-voyageai'>} The configuration object.
   */
  text2VecVoyageAI: <T_15, N_22 extends string | undefined = undefined, I_22 extends string = 'hnsw'>(
    opts?:
      | (import('../index.js').Text2VecVoyageAIConfig & {
          name?: N_22 | undefined;
          sourceProperties?: PrimitiveKeys<T_15>[] | undefined;
          vectorIndexConfig?:
            | import('../index.js').ModuleConfig<I_22, VectorIndexConfigCreateType<I_22>>
            | undefined;
        })
      | undefined
  ) => VectorConfigCreate<PrimitiveKeys<T_15>, N_22, I_22, 'text2vec-voyageai'>;
};
