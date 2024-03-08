export interface RerankerTransformersConfig {}

export interface RerankerCohereConfig {
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0' | string;
}

export type RerankerConfig = RerankerCohereConfig | RerankerTransformersConfig | Record<string, any>;

export type Reranker = 'reranker-cohere' | 'reranker-transformers' | 'none' | string;

export type RerankerConfigType<R> = R extends 'reranker-cohere'
  ? RerankerCohereConfig
  : R extends 'reranker-transformers'
  ? RerankerTransformersConfig
  : R extends 'none'
  ? undefined
  : Record<string, any> | undefined;
