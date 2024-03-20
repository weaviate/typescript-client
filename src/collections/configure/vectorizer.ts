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
  /**
   * Create a `ModuleConfig<'none', {}>` object with the vectorizer set to `'none'`.
   */
  none: () => makeVectorizer('none', {}),
  /**
   * Create a `ModuleConfig<'img2vec-neural', Img2VecNeuralConfig>` object with the vectorizer set to `'img2vec-neural'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/img2vec-neural) for detailed usage.
   *
   * @param {Img2VecNeuralConfig} [config] The configuration for the `img2vec-neural` vectorizer.
   * @returns {ModuleConfig<'img2vec-neural', Img2VecNeuralConfig>} The configuration object.
   */
  img2VecNeural: (config?: Img2VecNeuralConfig | undefined) => makeVectorizer('img2vec-neural', config),
  /**
   * Create a `ModuleConfig<'multi2vec-bind', Multi2VecBindConfig>` object with the vectorizer set to `'multi2vec-bind'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-bind) for detailed usage.
   *
   * @param {Multi2VecBindConfig} [config] The configuration for the `multi2vec-bind` vectorizer.
   * @returns {ModuleConfig<'multi2vec-bind', Multi2VecBindConfig>} The configuration object.
   */
  multi2VecBind: (config?: Multi2VecBindConfig | undefined) => makeVectorizer('multi2vec-bind', config),
  /**
   * Create a `ModuleConfig<'multi2vec-clip', Multi2VecClipConfig>` object with the vectorizer set to `'multi2vec-clip'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-clip) for detailed usage.
   *
   * @param {Multi2VecClipConfig} [config] The configuration for the `multi2vec-clip` vectorizer.
   * @returns {ModuleConfig<'multi2vec-clip', Multi2VecClipConfig>} The configuration object.
   */
  multi2VecClip: (config?: Multi2VecClipConfig | undefined) => makeVectorizer('multi2vec-clip', config),
  /**
   * Create a `ModuleConfig<'multi2vec-palm', Multi2VecPalmConfig>` object with the vectorizer set to `'multi2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/multi2vec-palm) for detailed usage.
   *
   * @param {Multi2VecPalmConfig} config The configuration for the `multi2vec-palm` vectorizer.
   * @returns {ModuleConfig<'multi2vec-palm', Multi2VecPalmConfig>} The configuration object.
   */
  multi2VecPalm: (config: Multi2VecPalmConfig) => makeVectorizer('multi2vec-palm', config),
  /**
   * Create a `ModuleConfig<'ref2vec-centroid', Ref2VecCentroidConfig>` object with the vectorizer set to `'ref2vec-centroid'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/ref2vec-centroid) for detailed usage.
   *
   * @param {Ref2VecCentroidConfig} config The configuration for the `ref2vec-centroid` vectorizer.
   * @returns {ModuleConfig<'ref2vec-centroid', Ref2VecCentroidConfig>} The configuration object.
   */
  ref2VecCentroid: (config: Ref2VecCentroidConfig) => makeVectorizer('ref2vec-centroid', config),
  /**
   * Create a `ModuleConfig<'text2vec-aws', Text2VecAWSConfig>` object with the vectorizer set to `'text2vec-aws'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-aws) for detailed usage.
   *
   * @param {Text2VecAWSConfig} config The configuration for the `text2vec-aws` vectorizer.
   * @returns {ModuleConfig<'text2vec-aws', Text2VecAWSConfig>} The configuration object.
   */
  text2VecAWS: (config: Text2VecAWSConfig) => makeVectorizer('text2vec-aws', config),
  /**
   * Create a `ModuleConfig<'text2vec-openai', Text2VecAzureOpenAIConfig>` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-azure-openai) for detailed usage.
   *
   * @param {Text2VecAzureOpenAIConfig} config The configuration for the `text2vec-azure-openai` vectorizer.
   * @returns {ModuleConfig<'text2vec-openai', Text2VecAzureOpenAIConfig>} The configuration object.
   */
  text2VecAzureOpenAI: (config: Text2VecAzureOpenAIConfig) => makeVectorizer('text2vec-openai', config),
  /**
   * Create a `ModuleConfig<'text2vec-cohere', Text2VecCohereConfig>` object with the vectorizer set to `'text2vec-cohere'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-cohere) for detailed usage.
   *
   * @param {Text2VecCohereConfig} [config] The configuration for the `text2vec-cohere` vectorizer.
   * @returns {ModuleConfig<'text2vec-cohere', Text2VecCohereConfig>} The configuration object.
   */
  text2VecCohere: (config?: Text2VecCohereConfig | undefined) => makeVectorizer('text2vec-cohere', config),
  /**
   * Create a `ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig>` object with the vectorizer set to `'text2vec-contextionary'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-contextionary) for detailed usage.
   *
   * @param {Text2VecContextionaryConfig} [config] The configuration for the `text2vec-contextionary` vectorizer.
   * @returns {ModuleConfig<'text2vec-contextionary', Text2VecContextionaryConfig>} The configuration object.
   */
  text2VecContextionary: (config?: Text2VecContextionaryConfig) =>
    makeVectorizer('text2vec-contextionary', config),
  /**
   * Create a `ModuleConfig<'text2vec-gpt4all', Text2VecGPT4AllConfig>` object with the vectorizer set to `'text2vec-gpt4all'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-gpt4all) for detailed usage.
   *
   * @param {Text2VecGPT4AllConfig} [config] The configuration for the `text2vec-gpt4all` vectorizer.
   * @returns {ModuleConfig<'text2vec-gpt4all', Text2VecGPT4AllConfig>} The configuration object.
   */
  text2VecGPT4All: (config?: Text2VecGPT4AllConfig | undefined) => makeVectorizer('text2vec-gpt4all', config),
  /**
   * Create a `ModuleConfig<'text2vec-huggingface', Text2VecHuggingFaceConfig>` object with the vectorizer set to `'text2vec-huggingface'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-huggingface) for detailed usage.
   *
   * @param {Text2VecHuggingFaceConfig} [config] The configuration for the `text2vec-huggingface` vectorizer.
   * @returns {ModuleConfig<'text2vec-huggingface', Text2VecHuggingFaceConfig>} The configuration object.
   */
  text2VecHuggingFace: (config?: Text2VecHuggingFaceConfig | undefined) =>
    makeVectorizer('text2vec-huggingface', config),
  /**
   * Create a `ModuleConfig<'text2vec-jina', Text2VecJinaConfig>` object with the vectorizer set to `'text2vec-jina'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-jina) for detailed usage.
   *
   * @param {Text2VecJinaConfig} [config] The configuration for the `text2vec-jina` vectorizer.
   * @returns {ModuleConfig<'text2vec-jina', Text2VecJinaConfig>} The configuration object.
   */
  text2VecJina: (config?: Text2VecJinaConfig | undefined) => makeVectorizer('text2vec-jina', config),
  /**
   * Create a `ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig>` object with the vectorizer set to `'text2vec-openai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-openai) for detailed usage.
   *
   * @param {Text2VecOpenAIConfig} [config] The configuration for the `text2vec-openai` vectorizer.
   * @returns {ModuleConfig<'text2vec-openai', Text2VecOpenAIConfig>} The configuration object.
   */
  text2VecOpenAI: (config?: Text2VecOpenAIConfig | undefined) => makeVectorizer('text2vec-openai', config),
  /**
   * Create a `ModuleConfig<'text2vec-palm', Text2VecPalmConfig>` object with the vectorizer set to `'text2vec-palm'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-palm) for detailed usage.
   *
   * @param {Text2VecPalmConfig} config The configuration for the `text2vec-palm` vectorizer.
   * @returns {ModuleConfig<'text2vec-palm', Text2VecPalmConfig>} The configuration object.
   */
  text2VecPalm: (config: Text2VecPalmConfig) => makeVectorizer('text2vec-palm', config),
  /**
   * Create a `ModuleConfig<'text2vec-transformers', Text2VecTransformersConfig>` object with the vectorizer set to `'text2vec-transformers'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers) for detailed usage.
   *
   * @param {Text2VecTransformersConfig} [config] The configuration for the `text2vec-transformers` vectorizer.
   * @returns {ModuleConfig<'text2vec-transformers', Text2VecTransformersConfig>} The configuration object.
   */
  text2VecTransformers: (config?: Text2VecTransformersConfig | undefined) =>
    makeVectorizer('text2vec-transformers', config),
  /**
   * Create a `ModuleConfig<'text2vec-voyageai', Text2VecVoyageConfig>` object with the vectorizer set to `'text2vec-voyageai'`.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-voyageai) for detailed usage.
   *
   * @param {Text2VecVoyageConfig} [config] The configuration for the `text2vec-voyageai` vectorizer.
   * @returns {ModuleConfig<'text2vec-voyageai', Text2VecVoyageConfig>} The configuration object.
   */
  text2VecVoyage: (config?: Text2VecVoyageConfig | undefined) => makeVectorizer('text2vec-voyageai', config),
};
