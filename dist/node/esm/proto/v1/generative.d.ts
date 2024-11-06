import _m0 from 'protobufjs/minimal.js';
import { TextArray } from './base.js';
export declare const protobufPackage = 'weaviate.v1';
export interface GenerativeSearch {
  /** @deprecated */
  singleResponsePrompt: string;
  /** @deprecated */
  groupedResponseTask: string;
  /** @deprecated */
  groupedProperties: string[];
  single: GenerativeSearch_Single | undefined;
  grouped: GenerativeSearch_Grouped | undefined;
}
export interface GenerativeSearch_Single {
  prompt: string;
  debug: boolean;
  /** only allow one at the beginning, but multiple in the future */
  queries: GenerativeProvider[];
}
export interface GenerativeSearch_Grouped {
  task: string;
  properties?: TextArray | undefined;
}
export interface GenerativeProvider {
  returnMetadata: boolean;
  anthropic?: GenerativeAnthropic | undefined;
  anyscale?: GenerativeAnyscale | undefined;
  aws?: GenerativeAWS | undefined;
  cohere?: GenerativeCohere | undefined;
  dummy?: GenerativeDummy | undefined;
  mistral?: GenerativeMistral | undefined;
  octoai?: GenerativeOctoAI | undefined;
  ollama?: GenerativeOllama | undefined;
  openai?: GenerativeOpenAI | undefined;
  google?: GenerativeGoogle | undefined;
}
export interface GenerativeAnthropic {
  baseUrl?: string | undefined;
  maxTokens?: number | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
  topK?: number | undefined;
  topP?: number | undefined;
  stopSequences?: TextArray | undefined;
}
export interface GenerativeAnyscale {
  baseUrl?: string | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
}
export interface GenerativeAWS {
  model?: string | undefined;
  temperature?: number | undefined;
}
export interface GenerativeCohere {
  baseUrl?: string | undefined;
  frequencyPenalty?: number | undefined;
  maxTokens?: number | undefined;
  model?: string | undefined;
  k?: number | undefined;
  p?: number | undefined;
  presencePenalty?: number | undefined;
  stopSequences?: TextArray | undefined;
  temperature?: number | undefined;
}
export interface GenerativeDummy {}
export interface GenerativeMistral {
  baseUrl?: string | undefined;
  maxTokens?: number | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
  topP?: number | undefined;
}
export interface GenerativeOctoAI {
  baseUrl?: string | undefined;
  maxTokens?: number | undefined;
  model?: string | undefined;
  n?: number | undefined;
  temperature?: number | undefined;
  topP?: number | undefined;
}
export interface GenerativeOllama {
  apiEndpoint?: string | undefined;
  model?: string | undefined;
  temperature?: number | undefined;
}
export interface GenerativeOpenAI {
  frequencyPenalty?: number | undefined;
  logProbs?: boolean | undefined;
  maxTokens?: number | undefined;
  model: string;
  n?: number | undefined;
  presencePenalty?: number | undefined;
  stop?: TextArray | undefined;
  temperature?: number | undefined;
  topP?: number | undefined;
  topLogProbs?: number | undefined;
}
export interface GenerativeGoogle {
  frequencyPenalty?: number | undefined;
  maxTokens?: number | undefined;
  model?: string | undefined;
  presencePenalty?: number | undefined;
  temperature?: number | undefined;
  topK?: number | undefined;
  topP?: number | undefined;
  stopSequences?: TextArray | undefined;
}
export interface GenerativeAnthropicMetadata {
  usage: GenerativeAnthropicMetadata_Usage | undefined;
}
export interface GenerativeAnthropicMetadata_Usage {
  inputTokens: number;
  outputTokens: number;
}
export interface GenerativeAnyscaleMetadata {}
export interface GenerativeAWSMetadata {}
export interface GenerativeCohereMetadata {
  apiVersion?: GenerativeCohereMetadata_ApiVersion | undefined;
  billedUnits?: GenerativeCohereMetadata_BilledUnits | undefined;
  tokens?: GenerativeCohereMetadata_Tokens | undefined;
  warnings?: TextArray | undefined;
}
export interface GenerativeCohereMetadata_ApiVersion {
  version?: string | undefined;
  isDeprecated?: boolean | undefined;
  isExperimental?: boolean | undefined;
}
export interface GenerativeCohereMetadata_BilledUnits {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
  searchUnits?: number | undefined;
  classifications?: number | undefined;
}
export interface GenerativeCohereMetadata_Tokens {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
}
export interface GenerativeDummyMetadata {}
export interface GenerativeMistralMetadata {
  usage?: GenerativeMistralMetadata_Usage | undefined;
}
export interface GenerativeMistralMetadata_Usage {
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
  totalTokens?: number | undefined;
}
export interface GenerativeOctoAIMetadata {
  usage?: GenerativeOctoAIMetadata_Usage | undefined;
}
export interface GenerativeOctoAIMetadata_Usage {
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
  totalTokens?: number | undefined;
}
export interface GenerativeOllamaMetadata {}
export interface GenerativeOpenAIMetadata {
  usage?: GenerativeOpenAIMetadata_Usage | undefined;
}
export interface GenerativeOpenAIMetadata_Usage {
  promptTokens?: number | undefined;
  completionTokens?: number | undefined;
  totalTokens?: number | undefined;
}
export interface GenerativeGoogleMetadata {
  metadata?: GenerativeGoogleMetadata_Metadata | undefined;
  usageMetadata?: GenerativeGoogleMetadata_UsageMetadata | undefined;
}
export interface GenerativeGoogleMetadata_TokenCount {
  totalBillableCharacters?: number | undefined;
  totalTokens?: number | undefined;
}
export interface GenerativeGoogleMetadata_TokenMetadata {
  inputTokenCount?: GenerativeGoogleMetadata_TokenCount | undefined;
  outputTokenCount?: GenerativeGoogleMetadata_TokenCount | undefined;
}
export interface GenerativeGoogleMetadata_Metadata {
  tokenMetadata?: GenerativeGoogleMetadata_TokenMetadata | undefined;
}
export interface GenerativeGoogleMetadata_UsageMetadata {
  promptTokenCount?: number | undefined;
  candidatesTokenCount?: number | undefined;
  totalTokenCount?: number | undefined;
}
export interface GenerativeMetadata {
  anthropic?: GenerativeAnthropicMetadata | undefined;
  anyscale?: GenerativeAnyscaleMetadata | undefined;
  aws?: GenerativeAWSMetadata | undefined;
  cohere?: GenerativeCohereMetadata | undefined;
  dummy?: GenerativeDummyMetadata | undefined;
  mistral?: GenerativeMistralMetadata | undefined;
  octoai?: GenerativeOctoAIMetadata | undefined;
  ollama?: GenerativeOllamaMetadata | undefined;
  openai?: GenerativeOpenAIMetadata | undefined;
  google?: GenerativeGoogleMetadata | undefined;
}
export interface GenerativeReply {
  result: string;
  debug?: GenerativeDebug | undefined;
  metadata?: GenerativeMetadata | undefined;
}
export interface GenerativeResult {
  values: GenerativeReply[];
}
export interface GenerativeDebug {
  fullPrompt?: string | undefined;
}
export declare const GenerativeSearch: {
  encode(message: GenerativeSearch, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeSearch;
  fromJSON(object: any): GenerativeSearch;
  toJSON(message: GenerativeSearch): unknown;
  create(base?: DeepPartial<GenerativeSearch>): GenerativeSearch;
  fromPartial(object: DeepPartial<GenerativeSearch>): GenerativeSearch;
};
export declare const GenerativeSearch_Single: {
  encode(message: GenerativeSearch_Single, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeSearch_Single;
  fromJSON(object: any): GenerativeSearch_Single;
  toJSON(message: GenerativeSearch_Single): unknown;
  create(base?: DeepPartial<GenerativeSearch_Single>): GenerativeSearch_Single;
  fromPartial(object: DeepPartial<GenerativeSearch_Single>): GenerativeSearch_Single;
};
export declare const GenerativeSearch_Grouped: {
  encode(message: GenerativeSearch_Grouped, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeSearch_Grouped;
  fromJSON(object: any): GenerativeSearch_Grouped;
  toJSON(message: GenerativeSearch_Grouped): unknown;
  create(base?: DeepPartial<GenerativeSearch_Grouped>): GenerativeSearch_Grouped;
  fromPartial(object: DeepPartial<GenerativeSearch_Grouped>): GenerativeSearch_Grouped;
};
export declare const GenerativeProvider: {
  encode(message: GenerativeProvider, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeProvider;
  fromJSON(object: any): GenerativeProvider;
  toJSON(message: GenerativeProvider): unknown;
  create(base?: DeepPartial<GenerativeProvider>): GenerativeProvider;
  fromPartial(object: DeepPartial<GenerativeProvider>): GenerativeProvider;
};
export declare const GenerativeAnthropic: {
  encode(message: GenerativeAnthropic, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAnthropic;
  fromJSON(object: any): GenerativeAnthropic;
  toJSON(message: GenerativeAnthropic): unknown;
  create(base?: DeepPartial<GenerativeAnthropic>): GenerativeAnthropic;
  fromPartial(object: DeepPartial<GenerativeAnthropic>): GenerativeAnthropic;
};
export declare const GenerativeAnyscale: {
  encode(message: GenerativeAnyscale, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAnyscale;
  fromJSON(object: any): GenerativeAnyscale;
  toJSON(message: GenerativeAnyscale): unknown;
  create(base?: DeepPartial<GenerativeAnyscale>): GenerativeAnyscale;
  fromPartial(object: DeepPartial<GenerativeAnyscale>): GenerativeAnyscale;
};
export declare const GenerativeAWS: {
  encode(message: GenerativeAWS, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAWS;
  fromJSON(object: any): GenerativeAWS;
  toJSON(message: GenerativeAWS): unknown;
  create(base?: DeepPartial<GenerativeAWS>): GenerativeAWS;
  fromPartial(object: DeepPartial<GenerativeAWS>): GenerativeAWS;
};
export declare const GenerativeCohere: {
  encode(message: GenerativeCohere, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeCohere;
  fromJSON(object: any): GenerativeCohere;
  toJSON(message: GenerativeCohere): unknown;
  create(base?: DeepPartial<GenerativeCohere>): GenerativeCohere;
  fromPartial(object: DeepPartial<GenerativeCohere>): GenerativeCohere;
};
export declare const GenerativeDummy: {
  encode(_: GenerativeDummy, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeDummy;
  fromJSON(_: any): GenerativeDummy;
  toJSON(_: GenerativeDummy): unknown;
  create(base?: DeepPartial<GenerativeDummy>): GenerativeDummy;
  fromPartial(_: DeepPartial<GenerativeDummy>): GenerativeDummy;
};
export declare const GenerativeMistral: {
  encode(message: GenerativeMistral, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeMistral;
  fromJSON(object: any): GenerativeMistral;
  toJSON(message: GenerativeMistral): unknown;
  create(base?: DeepPartial<GenerativeMistral>): GenerativeMistral;
  fromPartial(object: DeepPartial<GenerativeMistral>): GenerativeMistral;
};
export declare const GenerativeOctoAI: {
  encode(message: GenerativeOctoAI, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOctoAI;
  fromJSON(object: any): GenerativeOctoAI;
  toJSON(message: GenerativeOctoAI): unknown;
  create(base?: DeepPartial<GenerativeOctoAI>): GenerativeOctoAI;
  fromPartial(object: DeepPartial<GenerativeOctoAI>): GenerativeOctoAI;
};
export declare const GenerativeOllama: {
  encode(message: GenerativeOllama, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOllama;
  fromJSON(object: any): GenerativeOllama;
  toJSON(message: GenerativeOllama): unknown;
  create(base?: DeepPartial<GenerativeOllama>): GenerativeOllama;
  fromPartial(object: DeepPartial<GenerativeOllama>): GenerativeOllama;
};
export declare const GenerativeOpenAI: {
  encode(message: GenerativeOpenAI, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOpenAI;
  fromJSON(object: any): GenerativeOpenAI;
  toJSON(message: GenerativeOpenAI): unknown;
  create(base?: DeepPartial<GenerativeOpenAI>): GenerativeOpenAI;
  fromPartial(object: DeepPartial<GenerativeOpenAI>): GenerativeOpenAI;
};
export declare const GenerativeGoogle: {
  encode(message: GenerativeGoogle, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogle;
  fromJSON(object: any): GenerativeGoogle;
  toJSON(message: GenerativeGoogle): unknown;
  create(base?: DeepPartial<GenerativeGoogle>): GenerativeGoogle;
  fromPartial(object: DeepPartial<GenerativeGoogle>): GenerativeGoogle;
};
export declare const GenerativeAnthropicMetadata: {
  encode(message: GenerativeAnthropicMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAnthropicMetadata;
  fromJSON(object: any): GenerativeAnthropicMetadata;
  toJSON(message: GenerativeAnthropicMetadata): unknown;
  create(base?: DeepPartial<GenerativeAnthropicMetadata>): GenerativeAnthropicMetadata;
  fromPartial(object: DeepPartial<GenerativeAnthropicMetadata>): GenerativeAnthropicMetadata;
};
export declare const GenerativeAnthropicMetadata_Usage: {
  encode(message: GenerativeAnthropicMetadata_Usage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAnthropicMetadata_Usage;
  fromJSON(object: any): GenerativeAnthropicMetadata_Usage;
  toJSON(message: GenerativeAnthropicMetadata_Usage): unknown;
  create(base?: DeepPartial<GenerativeAnthropicMetadata_Usage>): GenerativeAnthropicMetadata_Usage;
  fromPartial(object: DeepPartial<GenerativeAnthropicMetadata_Usage>): GenerativeAnthropicMetadata_Usage;
};
export declare const GenerativeAnyscaleMetadata: {
  encode(_: GenerativeAnyscaleMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAnyscaleMetadata;
  fromJSON(_: any): GenerativeAnyscaleMetadata;
  toJSON(_: GenerativeAnyscaleMetadata): unknown;
  create(base?: DeepPartial<GenerativeAnyscaleMetadata>): GenerativeAnyscaleMetadata;
  fromPartial(_: DeepPartial<GenerativeAnyscaleMetadata>): GenerativeAnyscaleMetadata;
};
export declare const GenerativeAWSMetadata: {
  encode(_: GenerativeAWSMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeAWSMetadata;
  fromJSON(_: any): GenerativeAWSMetadata;
  toJSON(_: GenerativeAWSMetadata): unknown;
  create(base?: DeepPartial<GenerativeAWSMetadata>): GenerativeAWSMetadata;
  fromPartial(_: DeepPartial<GenerativeAWSMetadata>): GenerativeAWSMetadata;
};
export declare const GenerativeCohereMetadata: {
  encode(message: GenerativeCohereMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeCohereMetadata;
  fromJSON(object: any): GenerativeCohereMetadata;
  toJSON(message: GenerativeCohereMetadata): unknown;
  create(base?: DeepPartial<GenerativeCohereMetadata>): GenerativeCohereMetadata;
  fromPartial(object: DeepPartial<GenerativeCohereMetadata>): GenerativeCohereMetadata;
};
export declare const GenerativeCohereMetadata_ApiVersion: {
  encode(message: GenerativeCohereMetadata_ApiVersion, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeCohereMetadata_ApiVersion;
  fromJSON(object: any): GenerativeCohereMetadata_ApiVersion;
  toJSON(message: GenerativeCohereMetadata_ApiVersion): unknown;
  create(base?: DeepPartial<GenerativeCohereMetadata_ApiVersion>): GenerativeCohereMetadata_ApiVersion;
  fromPartial(object: DeepPartial<GenerativeCohereMetadata_ApiVersion>): GenerativeCohereMetadata_ApiVersion;
};
export declare const GenerativeCohereMetadata_BilledUnits: {
  encode(message: GenerativeCohereMetadata_BilledUnits, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeCohereMetadata_BilledUnits;
  fromJSON(object: any): GenerativeCohereMetadata_BilledUnits;
  toJSON(message: GenerativeCohereMetadata_BilledUnits): unknown;
  create(base?: DeepPartial<GenerativeCohereMetadata_BilledUnits>): GenerativeCohereMetadata_BilledUnits;
  fromPartial(
    object: DeepPartial<GenerativeCohereMetadata_BilledUnits>
  ): GenerativeCohereMetadata_BilledUnits;
};
export declare const GenerativeCohereMetadata_Tokens: {
  encode(message: GenerativeCohereMetadata_Tokens, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeCohereMetadata_Tokens;
  fromJSON(object: any): GenerativeCohereMetadata_Tokens;
  toJSON(message: GenerativeCohereMetadata_Tokens): unknown;
  create(base?: DeepPartial<GenerativeCohereMetadata_Tokens>): GenerativeCohereMetadata_Tokens;
  fromPartial(object: DeepPartial<GenerativeCohereMetadata_Tokens>): GenerativeCohereMetadata_Tokens;
};
export declare const GenerativeDummyMetadata: {
  encode(_: GenerativeDummyMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeDummyMetadata;
  fromJSON(_: any): GenerativeDummyMetadata;
  toJSON(_: GenerativeDummyMetadata): unknown;
  create(base?: DeepPartial<GenerativeDummyMetadata>): GenerativeDummyMetadata;
  fromPartial(_: DeepPartial<GenerativeDummyMetadata>): GenerativeDummyMetadata;
};
export declare const GenerativeMistralMetadata: {
  encode(message: GenerativeMistralMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeMistralMetadata;
  fromJSON(object: any): GenerativeMistralMetadata;
  toJSON(message: GenerativeMistralMetadata): unknown;
  create(base?: DeepPartial<GenerativeMistralMetadata>): GenerativeMistralMetadata;
  fromPartial(object: DeepPartial<GenerativeMistralMetadata>): GenerativeMistralMetadata;
};
export declare const GenerativeMistralMetadata_Usage: {
  encode(message: GenerativeMistralMetadata_Usage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeMistralMetadata_Usage;
  fromJSON(object: any): GenerativeMistralMetadata_Usage;
  toJSON(message: GenerativeMistralMetadata_Usage): unknown;
  create(base?: DeepPartial<GenerativeMistralMetadata_Usage>): GenerativeMistralMetadata_Usage;
  fromPartial(object: DeepPartial<GenerativeMistralMetadata_Usage>): GenerativeMistralMetadata_Usage;
};
export declare const GenerativeOctoAIMetadata: {
  encode(message: GenerativeOctoAIMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOctoAIMetadata;
  fromJSON(object: any): GenerativeOctoAIMetadata;
  toJSON(message: GenerativeOctoAIMetadata): unknown;
  create(base?: DeepPartial<GenerativeOctoAIMetadata>): GenerativeOctoAIMetadata;
  fromPartial(object: DeepPartial<GenerativeOctoAIMetadata>): GenerativeOctoAIMetadata;
};
export declare const GenerativeOctoAIMetadata_Usage: {
  encode(message: GenerativeOctoAIMetadata_Usage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOctoAIMetadata_Usage;
  fromJSON(object: any): GenerativeOctoAIMetadata_Usage;
  toJSON(message: GenerativeOctoAIMetadata_Usage): unknown;
  create(base?: DeepPartial<GenerativeOctoAIMetadata_Usage>): GenerativeOctoAIMetadata_Usage;
  fromPartial(object: DeepPartial<GenerativeOctoAIMetadata_Usage>): GenerativeOctoAIMetadata_Usage;
};
export declare const GenerativeOllamaMetadata: {
  encode(_: GenerativeOllamaMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOllamaMetadata;
  fromJSON(_: any): GenerativeOllamaMetadata;
  toJSON(_: GenerativeOllamaMetadata): unknown;
  create(base?: DeepPartial<GenerativeOllamaMetadata>): GenerativeOllamaMetadata;
  fromPartial(_: DeepPartial<GenerativeOllamaMetadata>): GenerativeOllamaMetadata;
};
export declare const GenerativeOpenAIMetadata: {
  encode(message: GenerativeOpenAIMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOpenAIMetadata;
  fromJSON(object: any): GenerativeOpenAIMetadata;
  toJSON(message: GenerativeOpenAIMetadata): unknown;
  create(base?: DeepPartial<GenerativeOpenAIMetadata>): GenerativeOpenAIMetadata;
  fromPartial(object: DeepPartial<GenerativeOpenAIMetadata>): GenerativeOpenAIMetadata;
};
export declare const GenerativeOpenAIMetadata_Usage: {
  encode(message: GenerativeOpenAIMetadata_Usage, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeOpenAIMetadata_Usage;
  fromJSON(object: any): GenerativeOpenAIMetadata_Usage;
  toJSON(message: GenerativeOpenAIMetadata_Usage): unknown;
  create(base?: DeepPartial<GenerativeOpenAIMetadata_Usage>): GenerativeOpenAIMetadata_Usage;
  fromPartial(object: DeepPartial<GenerativeOpenAIMetadata_Usage>): GenerativeOpenAIMetadata_Usage;
};
export declare const GenerativeGoogleMetadata: {
  encode(message: GenerativeGoogleMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogleMetadata;
  fromJSON(object: any): GenerativeGoogleMetadata;
  toJSON(message: GenerativeGoogleMetadata): unknown;
  create(base?: DeepPartial<GenerativeGoogleMetadata>): GenerativeGoogleMetadata;
  fromPartial(object: DeepPartial<GenerativeGoogleMetadata>): GenerativeGoogleMetadata;
};
export declare const GenerativeGoogleMetadata_TokenCount: {
  encode(message: GenerativeGoogleMetadata_TokenCount, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogleMetadata_TokenCount;
  fromJSON(object: any): GenerativeGoogleMetadata_TokenCount;
  toJSON(message: GenerativeGoogleMetadata_TokenCount): unknown;
  create(base?: DeepPartial<GenerativeGoogleMetadata_TokenCount>): GenerativeGoogleMetadata_TokenCount;
  fromPartial(object: DeepPartial<GenerativeGoogleMetadata_TokenCount>): GenerativeGoogleMetadata_TokenCount;
};
export declare const GenerativeGoogleMetadata_TokenMetadata: {
  encode(message: GenerativeGoogleMetadata_TokenMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogleMetadata_TokenMetadata;
  fromJSON(object: any): GenerativeGoogleMetadata_TokenMetadata;
  toJSON(message: GenerativeGoogleMetadata_TokenMetadata): unknown;
  create(base?: DeepPartial<GenerativeGoogleMetadata_TokenMetadata>): GenerativeGoogleMetadata_TokenMetadata;
  fromPartial(
    object: DeepPartial<GenerativeGoogleMetadata_TokenMetadata>
  ): GenerativeGoogleMetadata_TokenMetadata;
};
export declare const GenerativeGoogleMetadata_Metadata: {
  encode(message: GenerativeGoogleMetadata_Metadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogleMetadata_Metadata;
  fromJSON(object: any): GenerativeGoogleMetadata_Metadata;
  toJSON(message: GenerativeGoogleMetadata_Metadata): unknown;
  create(base?: DeepPartial<GenerativeGoogleMetadata_Metadata>): GenerativeGoogleMetadata_Metadata;
  fromPartial(object: DeepPartial<GenerativeGoogleMetadata_Metadata>): GenerativeGoogleMetadata_Metadata;
};
export declare const GenerativeGoogleMetadata_UsageMetadata: {
  encode(message: GenerativeGoogleMetadata_UsageMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeGoogleMetadata_UsageMetadata;
  fromJSON(object: any): GenerativeGoogleMetadata_UsageMetadata;
  toJSON(message: GenerativeGoogleMetadata_UsageMetadata): unknown;
  create(base?: DeepPartial<GenerativeGoogleMetadata_UsageMetadata>): GenerativeGoogleMetadata_UsageMetadata;
  fromPartial(
    object: DeepPartial<GenerativeGoogleMetadata_UsageMetadata>
  ): GenerativeGoogleMetadata_UsageMetadata;
};
export declare const GenerativeMetadata: {
  encode(message: GenerativeMetadata, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeMetadata;
  fromJSON(object: any): GenerativeMetadata;
  toJSON(message: GenerativeMetadata): unknown;
  create(base?: DeepPartial<GenerativeMetadata>): GenerativeMetadata;
  fromPartial(object: DeepPartial<GenerativeMetadata>): GenerativeMetadata;
};
export declare const GenerativeReply: {
  encode(message: GenerativeReply, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeReply;
  fromJSON(object: any): GenerativeReply;
  toJSON(message: GenerativeReply): unknown;
  create(base?: DeepPartial<GenerativeReply>): GenerativeReply;
  fromPartial(object: DeepPartial<GenerativeReply>): GenerativeReply;
};
export declare const GenerativeResult: {
  encode(message: GenerativeResult, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeResult;
  fromJSON(object: any): GenerativeResult;
  toJSON(message: GenerativeResult): unknown;
  create(base?: DeepPartial<GenerativeResult>): GenerativeResult;
  fromPartial(object: DeepPartial<GenerativeResult>): GenerativeResult;
};
export declare const GenerativeDebug: {
  encode(message: GenerativeDebug, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): GenerativeDebug;
  fromJSON(object: any): GenerativeDebug;
  toJSON(message: GenerativeDebug): unknown;
  create(base?: DeepPartial<GenerativeDebug>): GenerativeDebug;
  fromPartial(object: DeepPartial<GenerativeDebug>): GenerativeDebug;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
  ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : Partial<T>;
export {};
