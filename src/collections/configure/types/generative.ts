import {
  GenerativeAWSConfig,
  GenerativeAnyscaleConfig,
  GenerativeMistralConfig,
  GenerativeOctoAIConfig,
  GenerativeOllamaConfig,
  GenerativePaLMConfig,
} from '../../index.js';

export type GenerativeOpenAIConfigBaseCreate = {
  baseURL?: string;
  frequencyPenalty?: number;
  maxTokens?: number;
  presencePenalty?: number;
  temperature?: number;
  topP?: number;
};

export type GenerativeOpenAIConfigCreate = GenerativeOpenAIConfigBaseCreate & {
  model?: string;
};

export type GenerativeAzureOpenAIConfigCreate = GenerativeOpenAIConfigBaseCreate & {
  resourceName: string;
  deploymentId: string;
};

export type GenerativeCohereConfigCreate = {
  k?: number;
  maxTokens?: number;
  model?: string;
  returnLikelihoods?: string;
  stopSequences?: string[];
  temperature?: number;
};

export type GenerativeAnyscaleConfigCreate = GenerativeAnyscaleConfig;

export type GenerativeAWSConfigCreate = GenerativeAWSConfig;

export type GenerativeMistralConfigCreate = GenerativeMistralConfig;

export type GenerativeOctoAIConfigCreate = GenerativeOctoAIConfig;

export type GenerativeOllamaConfigCreate = GenerativeOllamaConfig;

export type GenerativePaLMConfigCreate = GenerativePaLMConfig;

export type GenerativeConfigCreate =
  | GenerativeOpenAIConfigCreate
  | GenerativeCohereConfigCreate
  | GenerativePaLMConfigCreate
  | Record<string, any>
  | undefined;

export type GenerativeConfigCreateType<G> = G extends 'generative-openai'
  ? GenerativeOpenAIConfigCreate
  : G extends 'generative-cohere'
  ? GenerativeCohereConfigCreate
  : G extends 'generative-palm'
  ? GenerativePaLMConfigCreate
  : G extends 'none'
  ? undefined
  : Record<string, any> | undefined;
