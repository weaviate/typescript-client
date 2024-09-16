import {
  GenerativeAWSConfig,
  GenerativeAnthropicConfig,
  GenerativeAnyscaleConfig,
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeMistralConfig,
  GenerativeOctoAIConfig,
  GenerativeOllamaConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  ModuleConfig,
} from '../config/types/index.js';
import {
  GenerativeAWSConfigCreate,
  GenerativeAnthropicConfigCreate,
  GenerativeAnyscaleConfigCreate,
  GenerativeAzureOpenAIConfigCreate,
  GenerativeCohereConfigCreate,
  GenerativeMistralConfigCreate,
  GenerativeOctoAIConfigCreate,
  GenerativeOllamaConfigCreate,
  GenerativeOpenAIConfigCreate,
  GenerativePaLMConfigCreate,
} from '../index.js';

export default {
  /**
   * Create a `ModuleConfig<'generative-anthropic', GenerativeAnthropicConfig | undefined>` object for use when performing AI generation using the `generative-anthropic` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-anthropic) for detailed usage.
   *
   * @param {GenerativeAnthropicConfigCreate} [config] The configuration for the `generative-anthropic` module.
   * @returns {ModuleConfig<'generative-anthropic', GenerativeAnthropicConfig | undefined>} The configuration object.
   */
  anthropic(
    config?: GenerativeAnthropicConfigCreate
  ): ModuleConfig<'generative-anthropic', GenerativeAnthropicConfig | undefined> {
    return {
      name: 'generative-anthropic',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined>` object for use when performing AI generation using the `generative-anyscale` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-anyscale) for detailed usage.
   *
   * @param {GenerativeAnyscaleConfigCreate} [config] The configuration for the `generative-aws` module.
   * @returns {ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined>} The configuration object.
   */
  anyscale(
    config?: GenerativeAnyscaleConfigCreate
  ): ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfig | undefined> {
    return {
      name: 'generative-anyscale',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-aws', GenerativeAWSConfig>` object for use when performing AI generation using the `generative-aws` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-aws) for detailed usage.
   *
   * @param {GenerativeAWSConfigCreate} config The configuration for the `generative-aws` module.
   * @returns {ModuleConfig<'generative-aws', GenerativeAWSConfig>} The configuration object.
   */
  aws(config: GenerativeAWSConfigCreate): ModuleConfig<'generative-aws', GenerativeAWSConfig> {
    return {
      name: 'generative-aws',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>` object for use when performing AI generation using the `generative-openai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai) for detailed usage.
   *
   * @param {GenerativeAzureOpenAIConfigCreate} config The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>} The configuration object.
   */
  azureOpenAI: (
    config: GenerativeAzureOpenAIConfigCreate
  ): ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: {
        deploymentId: config.deploymentId,
        resourceName: config.resourceName,
        baseURL: config.baseURL,
        frequencyPenaltyProperty: config.frequencyPenalty,
        maxTokensProperty: config.maxTokens,
        presencePenaltyProperty: config.presencePenalty,
        temperatureProperty: config.temperature,
        topPProperty: config.topP,
      },
    };
  },
  /**
   * Create a `ModuleConfig<'generative-cohere', GenerativeCohereConfig>` object for use when performing AI generation using the `generative-cohere` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-cohere) for detailed usage.
   *
   * @param {GenerativeCohereConfigCreate} [config] The configuration for the `generative-cohere` module.
   * @returns {ModuleConfig<'generative-cohere', GenerativeCohereConfig>} The configuration object.
   */
  cohere: (
    config?: GenerativeCohereConfigCreate
  ): ModuleConfig<'generative-cohere', GenerativeCohereConfig | undefined> => {
    return {
      name: 'generative-cohere',
      config: config
        ? {
            kProperty: config.k,
            maxTokensProperty: config.maxTokens,
            model: config.model,
            returnLikelihoodsProperty: config.returnLikelihoods,
            stopSequencesProperty: config.stopSequences,
            temperatureProperty: config.temperature,
          }
        : undefined,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined>` object for use when performing AI generation using the `generative-mistral` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-mistral) for detailed usage.
   *
   * @param {GenerativeMistralConfigCreate} [config] The configuration for the `generative-mistral` module.
   * @returns {ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined>} The configuration object.
   */
  mistral(
    config?: GenerativeMistralConfigCreate
  ): ModuleConfig<'generative-mistral', GenerativeMistralConfig | undefined> {
    return {
      name: 'generative-mistral',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-octoai', GenerativeOpenAIConfig | undefined>` object for use when performing AI generation using the `generative-octoai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-octoai) for detailed usage.
   *
   * @param {GenerativeOctoAIConfigCreate} [config] The configuration for the `generative-octoai` module.
   * @returns {ModuleConfig<'generative-octoai', GenerativeOctoAIConfig | undefined>} The configuration object.
   */
  octoai(
    config?: GenerativeOctoAIConfigCreate
  ): ModuleConfig<'generative-octoai', GenerativeOctoAIConfig | undefined> {
    return {
      name: 'generative-octoai',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-ollama', GenerativeOllamaConfig | undefined>` object for use when performing AI generation using the `generative-ollama` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-ollama) for detailed usage.
   *
   * @param {GenerativeOllamaConfigCreate} [config] The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-ollama', GenerativeOllamaConfig | undefined>} The configuration object.
   */
  ollama(
    config?: GenerativeOllamaConfigCreate
  ): ModuleConfig<'generative-ollama', GenerativeOllamaConfig | undefined> {
    return {
      name: 'generative-ollama',
      config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-openai', GenerativeOpenAIConfig | undefined>` object for use when performing AI generation using the `generative-openai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai) for detailed usage.
   *
   * @param {GenerativeOpenAIConfigCreate} [config] The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-openai', GenerativeOpenAIConfig | undefined>} The configuration object.
   */
  openAI: (
    config?: GenerativeOpenAIConfigCreate
  ): ModuleConfig<'generative-openai', GenerativeOpenAIConfig | undefined> => {
    return {
      name: 'generative-openai',
      config: config
        ? {
            baseURL: config.baseURL,
            frequencyPenaltyProperty: config.frequencyPenalty,
            maxTokensProperty: config.maxTokens,
            model: config.model,
            presencePenaltyProperty: config.presencePenalty,
            temperatureProperty: config.temperature,
            topPProperty: config.topP,
          }
        : undefined,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-palm', GenerativePaLMConfig>` object for use when performing AI generation using the `generative-palm` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-palm) for detailed usage.
   *
   * @param {GenerativePaLMConfigCreate} [config] The configuration for the `generative-palm` module.
   * @returns {ModuleConfig<'generative-palm', GenerativePaLMConfig>} The configuration object.
   */
  palm: (
    config?: GenerativePaLMConfigCreate
  ): ModuleConfig<'generative-palm', GenerativePaLMConfig | undefined> => {
    return {
      name: 'generative-palm',
      config,
    };
  },
};
