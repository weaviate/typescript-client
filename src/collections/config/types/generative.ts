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

export type GenerativeAnthropicConfig = {
  maxTokens?: number;
  model?: string;
  stopSequences?: string[];
  temperature?: number;
  topK?: number;
  topP?: number;
};

export type GenerativeAnyscaleConfig = {
  model?: string;
  temperature?: number;
};

export type GenerativeCohereConfig = {
  kProperty?: number;
  model?: string;
  maxTokensProperty?: number;
  returnLikelihoodsProperty?: string;
  stopSequencesProperty?: string[];
  temperatureProperty?: number;
};

export type GenerativeDatabricksConfig = {
  endpoint: string;
  maxTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
};

export type GenerativeFriendliAIConfig = {
  baseURL?: string;
  maxTokens?: number;
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
  resourceName?: string;
  deploymentId?: string;
  isAzure?: true;
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
  | GenerativeAnthropicConfig
  | GenerativeAnyscaleConfig
  | GenerativeAWSConfig
  | GenerativeAzureOpenAIConfig
  | GenerativeCohereConfig
  | GenerativeMistralConfig
  | GenerativeOctoAIConfig
  | GenerativeOllamaConfig
  | GenerativeOpenAIConfig
  | GenerativePaLMConfig
  | Record<string, any>
  | undefined;

export type GenerativeConfigType<G> = G extends 'generative-anthropic'
  ? GenerativeAnthropicConfig
  : G extends 'generative-anyscale'
  ? GenerativeAnyscaleConfig
  : G extends 'generative-aws'
  ? GenerativeAWSConfig
  : G extends 'generative-azure-openai'
  ? GenerativeOpenAIConfig
  : G extends 'generative-cohere'
  ? GenerativeAzureOpenAIConfig
  : G extends 'generative-databricks'
  ? GenerativeDatabricksConfig
  : G extends 'generative-friendliai'
  ? GenerativeFriendliAIConfig
  : G extends 'generative-mistral'
  ? GenerativeMistralConfig
  : G extends 'generative-octoai'
  ? GenerativeOctoAIConfig
  : G extends 'generative-ollama'
  ? GenerativeOllamaConfig
  : G extends 'generative-openai'
  ? GenerativePaLMConfig
  : G extends 'none'
  ? undefined
  : Record<string, any> | undefined;

export type GenerativeSearch =
  | 'generative-anthropic'
  | 'generative-anyscale'
  | 'generative-aws'
  | 'generative-azure-openai'
  | 'generative-cohere'
  | 'generative-databricks'
  | 'generative-friendliai'
  | 'generative-mistral'
  | 'generative-octoai'
  | 'generative-ollama'
  | 'generative-openai'
  | 'generative-palm'
  | 'none'
  | string;
