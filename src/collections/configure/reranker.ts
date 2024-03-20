import { ModuleConfig, RerankerCohereConfig } from '../config/types/index.js';

export default {
  cohere: (config?: RerankerCohereConfig): ModuleConfig<'reranker-cohere', RerankerCohereConfig> => {
    return {
      name: 'reranker-cohere',
      config: config,
    };
  },
  transformers: (): ModuleConfig<'reranker-transformers', Record<string, never>> => {
    return {
      name: 'reranker-transformers',
      config: {},
    };
  },
};
