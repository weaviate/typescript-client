export type RerankerTransformersConfig = {};
export type RerankerCohereConfig = {
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0' | string;
};
export type RerankerVoyageAIConfig = {
  model?: 'rerank-lite-1' | string;
};
export type RerankerJinaAIConfig = {
  model?:
    | 'jina-reranker-v2-base-multilingual'
    | 'jina-reranker-v1-base-en'
    | 'jina-reranker-v1-turbo-en'
    | 'jina-reranker-v1-tiny-en'
    | 'jina-colbert-v1-en'
    | string;
};
export type RerankerConfig =
  | RerankerCohereConfig
  | RerankerJinaAIConfig
  | RerankerTransformersConfig
  | RerankerVoyageAIConfig
  | Record<string, any>
  | undefined;
export type Reranker =
  | 'reranker-cohere'
  | 'reranker-jinaai'
  | 'reranker-transformers'
  | 'reranker-voyageai'
  | 'none'
  | string;
export type RerankerConfigType<R> = R extends 'reranker-cohere'
  ? RerankerCohereConfig
  : R extends 'reranker-jinaai'
  ? RerankerJinaAIConfig
  : R extends 'reranker-transformers'
  ? RerankerTransformersConfig
  : R extends 'reranker-voyageai'
  ? RerankerVoyageAIConfig
  : R extends 'none'
  ? undefined
  : Record<string, any> | undefined;
