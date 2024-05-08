import {
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  ModuleConfig,
} from '../config/types/index.js';

export default {
  /**
   * Create a `ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>` object for use when performing AI generation using the `generative-openai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai) for detailed usage.
   *
   * @param {GenerativeAzureOpenAIConfig} config The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig>} The configuration object.
   */
  azureOpenAI: (
    config: GenerativeAzureOpenAIConfig
  ): ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-cohere', GenerativeCohereConfig>` object for use when performing AI generation using the `generative-cohere` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-cohere) for detailed usage.
   *
   * @param {GenerativeCohereConfig} [config] The configuration for the `generative-cohere` module.
   * @returns {ModuleConfig<'generative-cohere', GenerativeCohereConfig>} The configuration object.
   */
  cohere: (
    config?: GenerativeCohereConfig
  ): ModuleConfig<'generative-cohere', GenerativeCohereConfig | undefined> => {
    return {
      name: 'generative-cohere',
      config: config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-openai', GenerativeOpenAIConfig>` object for use when performing AI generation using the `generative-openai` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-openai) for detailed usage.
   *
   * @param {GenerativeOpenAIConfig} [config] The configuration for the `generative-openai` module.
   * @returns {ModuleConfig<'generative-openai', GenerativeOpenAIConfig>} The configuration object.
   */
  openAI: (
    config?: GenerativeOpenAIConfig
  ): ModuleConfig<'generative-openai', GenerativeOpenAIConfig | undefined> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  /**
   * Create a `ModuleConfig<'generative-palm', GenerativePaLMConfig>` object for use when performing AI generation using the `generative-palm` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/reader-generator-modules/generative-palm) for detailed usage.
   *
   * @param {GenerativePaLMConfig} config The configuration for the `generative-palm` module.
   * @returns {ModuleConfig<'generative-palm', GenerativePaLMConfig>} The configuration object.
   */
  palm: (config: GenerativePaLMConfig): ModuleConfig<'generative-palm', GenerativePaLMConfig> => {
    return {
      name: 'generative-palm',
      config: config,
    };
  },
};
