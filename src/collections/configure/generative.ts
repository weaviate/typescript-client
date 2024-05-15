import {
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  ModuleConfig,
} from '../config/types/index.js';
import {
  GenerativeAzureOpenAIConfigCreate,
  GenerativeCohereConfigCreate,
  GenerativeOpenAIConfigCreate,
  GenerativePaLMConfigCreate,
} from '../index.js';

export default {
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
   * Create a `ModuleConfig<'generative-openai', GenerativeOpenAIConfig>` object for use when performing AI generation using the `generative-openai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai) for detailed usage.
   *
   * @param {GenerativeOpenAIConfigCreate} [config] The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-openai', GenerativeOpenAIConfig>} The configuration object.
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
   * @param {GenerativePaLMConfigCreate} config The configuration for the `generative-palm` module.
   * @returns {ModuleConfig<'generative-palm', GenerativePaLMConfig>} The configuration object.
   */
  palm: (config: GenerativePaLMConfigCreate): ModuleConfig<'generative-palm', GenerativePaLMConfig> => {
    return {
      name: 'generative-palm',
      config: config,
    };
  },
};
