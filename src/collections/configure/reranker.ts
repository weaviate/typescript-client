import { ModuleConfig, RerankerCohereConfig } from '../config/types/index.js';

export default {
  /**
   * Create a `ModuleConfig<'reranker-cohere', RerankerCohereConfig>` object for use when reranking using the `reranker-cohere` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/reranker-cohere) for detailed usage.
   *
   * @param {RerankerCohereConfig} [config] The configuration for the `reranker-cohere` module.
   * @returns {ModuleConfig<'reranker-cohere', RerankerCohereConfig>} The configuration object.
   */
  cohere: (
    config?: RerankerCohereConfig
  ): ModuleConfig<'reranker-cohere', RerankerCohereConfig | undefined> => {
    return {
      name: 'reranker-cohere',
      config: config,
    };
  },
  /**
   * Create a `ModuleConfig<'reranker-transformers', Record<string, never>>` object for use when reranking using the `reranker-transformers` module.
   *
   * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/reranker-transformers) for detailed usage.
   *
   * @returns {ModuleConfig<'reranker-transformers', Record<string, never>>} The configuration object.
   */
  transformers: (): ModuleConfig<'reranker-transformers', Record<string, never>> => {
    return {
      name: 'reranker-transformers',
      config: {},
    };
  },
};
