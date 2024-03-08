import { ModuleConfig, RerankerCohereConfig } from '../config/types';

export const reranker = {
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
