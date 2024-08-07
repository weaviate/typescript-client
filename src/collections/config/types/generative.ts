export type GenerativeOpenAIConfigBase = {
  baseURL?: string;
  frequencyPenaltyProperty?: number;
  maxTokensProperty?: number;
  presencePenaltyProperty?: number;
  temperatureProperty?: number;
  topPProperty?: number;
};

export type GenerativeAWSConfig = {
  region: string;
  service: string;
  model?: string;
  endpoint?: string;
};

export type GenerativeAnyscaleConfig = {
  model?: string;
  temperature?: number;
};

export type GenerativeMistralConfig = {
  maxTokens?: number;
  model?: string;
  temperature?: number;
};

export type GenerativeOctoAIConfig = {
  baseURL?: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
};

export type GenerativeOllamaConfig = {
  apiEndpoint?: string;
  model?: string;
};

export type GenerativeOpenAIConfig = GenerativeOpenAIConfigBase & {
  model?: string;
};

export type GenerativeAzureOpenAIConfig = GenerativeOpenAIConfigBase & {
  resourceName: string;
  deploymentId: string;
};

export type GenerativeCohereConfig = {
  kProperty?: number;
  model?: string;
  maxTokensProperty?: number;
  returnLikelihoodsProperty?: string;
  stopSequencesProperty?: string[];
  temperatureProperty?: number;
};

export type GenerativePaLMConfig = {
  apiEndpoint?: string;
  maxOutputTokens?: number;
  modelId?: string;
  projectId?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
};

export type GenerativeConfig =
  | GenerativeOpenAIConfig
  | GenerativeCohereConfig
  | GenerativePaLMConfig
  | Record<string, any>
  | undefined;

export type GenerativeConfigType<G> = G extends 'generative-openai'
  ? GenerativeOpenAIConfig
  : G extends 'generative-cohere'
  ? GenerativeCohereConfig
  : G extends 'generative-palm'
  ? GenerativePaLMConfig
  : G extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export type GenerativeSearch =
  | 'generative-anyscale'
  | 'generative-aws'
  | 'generative-mistral'
  | 'generative-octoai'
  | 'generative-ollama'
  | 'generative-openai'
  | 'generative-cohere'
  | 'generative-palm'
  | 'none'
  | string;
