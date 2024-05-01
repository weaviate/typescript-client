export type RerankerTransformersConfig = {};

export type RerankerCohereConfig = {
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0' | string;
};

export type RerankerVoyageAIConfig = {
  model?: 'rerank-lite-1' | string;
};

export type RerankerConfig =
  | RerankerCohereConfig
  | RerankerTransformersConfig
  | RerankerVoyageAIConfig
  | Record<string, any>
  | undefined;

export type Reranker = 'reranker-cohere' | 'reranker-transformers' | 'reranker-voyageai' | 'none' | string;

export type RerankerConfigType<R> = R extends 'reranker-cohere'
  ? RerankerCohereConfig
  : R extends 'reranker-transformers'
  ? RerankerTransformersConfig
  : R extends 'reranker-voyageai'
  ? RerankerVoyageAIConfig
  : R extends 'none'
  ? undefined
  : Record<string, any> | undefined;
