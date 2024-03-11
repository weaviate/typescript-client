import {
  GenerativeAzureOpenAIConfig,
  GenerativeCohereConfig,
  GenerativeOpenAIConfig,
  GenerativePaLMConfig,
  ModuleConfig,
} from '../config/types';

export default {
  azureOpenAI: (
    config: GenerativeAzureOpenAIConfig
  ): ModuleConfig<'generative-openai', GenerativeAzureOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  cohere: (config?: GenerativeCohereConfig): ModuleConfig<'generative-cohere', GenerativeCohereConfig> => {
    return {
      name: 'generative-cohere',
      config: config,
    };
  },
  openAI: (config?: GenerativeOpenAIConfig): ModuleConfig<'generative-openai', GenerativeOpenAIConfig> => {
    return {
      name: 'generative-openai',
      config: config,
    };
  },
  palm: (config: GenerativePaLMConfig): ModuleConfig<'generative-palm', GenerativePaLMConfig> => {
    return {
      name: 'generative-palm',
      config: config,
    };
  },
};
