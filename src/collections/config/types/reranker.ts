export type RerankerTransformersConfig = {};

export type RerankerCohereConfig = {
  model?: 'rerank-english-v2.0' | 'rerank-multilingual-v2.0' | string;
};

export type RerankerVoyageAIConfig = {
  baseURL?: string;
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

export type RerankerNvidiaConfig = {
  baseURL?: string;
  model?: 'nvidia/rerank-qa-mistral-4b' | string;
};

export type RerankerContextualAIConfig = {
  baseURL?: string;
  model?:
    | 'ctxl-rerank-v2-instruct-multilingual'
    | 'ctxl-rerank-v2-instruct-multilingual-mini'
    | 'ctxl-rerank-v1-instruct'
    | string;
  instruction?: string;
  topN?: number;
};

export type RerankerConfig =
  | RerankerCohereConfig
  | RerankerContextualAIConfig
  | RerankerJinaAIConfig
  | RerankerNvidiaConfig
  | RerankerTransformersConfig
  | RerankerVoyageAIConfig
  | Record<string, any>
  | undefined;

export type Reranker =
  | 'reranker-cohere'
  | 'reranker-contextualai'
  | 'reranker-jinaai'
  | 'reranker-nvidia'
  | 'reranker-transformers'
  | 'reranker-voyageai'
  | 'none'
  | string;

export type RerankerConfigType<R> = R extends 'reranker-cohere'
  ? RerankerCohereConfig
  : R extends 'reranker-jinaai'
  ? RerankerJinaAIConfig
  : R extends 'reranker-nvidia'
  ? RerankerNvidiaConfig
  : R extends 'reranker-contextualai'
  ? RerankerContextualAIConfig
  : R extends 'reranker-transformers'
  ? RerankerTransformersConfig
  : R extends 'reranker-voyageai'
  ? RerankerVoyageAIConfig
  : R extends 'none'
  ? undefined
  : Record<string, any> | undefined;
