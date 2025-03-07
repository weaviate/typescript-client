import {
  GenerativeAWS as GenerativeAWSGRPC,
  GenerativeAWSMetadata,
  GenerativeAnthropic as GenerativeAnthropicGRPC,
  GenerativeAnthropicMetadata,
  GenerativeAnyscale as GenerativeAnyscaleGRPC,
  GenerativeAnyscaleMetadata,
  GenerativeCohere as GenerativeCohereGRPC,
  GenerativeCohereMetadata,
  GenerativeDatabricks as GenerativeDatabricksGRPC,
  GenerativeDatabricksMetadata,
  GenerativeDebug,
  GenerativeDummy as GenerativeDummyGRPC,
  GenerativeDummyMetadata,
  GenerativeFriendliAI as GenerativeFriendliAIGRPC,
  GenerativeFriendliAIMetadata,
  GenerativeGoogle as GenerativeGoogleGRPC,
  GenerativeGoogleMetadata,
  GenerativeMistral as GenerativeMistralGRPC,
  GenerativeMistralMetadata,
  GenerativeNvidia as GenerativeNvidiaGRPC,
  GenerativeNvidiaMetadata,
  GenerativeOllama as GenerativeOllamaGRPC,
  GenerativeOllamaMetadata,
  GenerativeOpenAI as GenerativeOpenAIGRPC,
  GenerativeOpenAIMetadata,
} from '../../proto/v1/generative.js';
import { ModuleConfig } from '../index.js';
import { GroupByObject, GroupByResult, WeaviateGenericObject, WeaviateNonGenericObject } from './query.js';

export type GenerativeGenericObject<
  T,
  C extends GenerativeConfigRuntime | undefined
> = WeaviateGenericObject<T> & {
  /** @deprecated (use `generative.text` instead) The LLM-generated output applicable to this single object. */
  generated?: string;
  /** Generative data returned from the LLM inference on this object. */
  generative?: GenerativeSingle<C>;
};

export type GenerativeNonGenericObject<C extends GenerativeConfigRuntime | undefined> =
  WeaviateNonGenericObject & {
    /** @deprecated (use `generative.text` instead) The LLM-generated output applicable to this single object. */
    generated?: string;
    /** Generative data returned from the LLM inference on this object. */
    generative?: GenerativeSingle<C>;
  };

/** An object belonging to a collection as returned by the methods in the `collection.generate` namespace.
 *
 * Depending on the generic type `T`, the object will have subfields that map from `T`'s specific type definition.
 * If not, then the object will be non-generic and have a `properties` field that maps from a generic string to a `WeaviateField`.
 */
export type GenerativeObject<T, C extends GenerativeConfigRuntime | undefined> = T extends undefined
  ? GenerativeNonGenericObject<C>
  : GenerativeGenericObject<T, C>;

export type GenerativeSingle<C extends GenerativeConfigRuntime | undefined> = {
  debug?: GenerativeDebug;
  metadata?: GenerativeMetadata<C>;
  text?: string;
};

export type GenerativeGrouped<C extends GenerativeConfigRuntime | undefined> = {
  metadata?: GenerativeMetadata<C>;
  text?: string;
};

/** The return of a query method in the `collection.generate` namespace. */
export type GenerativeReturn<T, C extends GenerativeConfigRuntime | undefined> = {
  /** The objects that were found by the query. */
  objects: GenerativeObject<T, C>[];
  /** @deprecated (use `generative.text` instead) The LLM-generated output applicable to this query as a whole. */
  generated?: string;
  generative?: GenerativeGrouped<C>;
};

export type GenerativeGroupByResult<T, C extends GenerativeConfigRuntime | undefined> = GroupByResult<T> & {
  /** @deprecated (use `generative.text` instead) The LLM-generated output applicable to this query as a whole. */
  generated?: string;
  generative?: GenerativeSingle<C>;
};

/** The return of a query method in the `collection.generate` namespace where the `groupBy` argument was specified. */
export type GenerativeGroupByReturn<T, C extends GenerativeConfigRuntime | undefined> = {
  /** The objects that were found by the query. */
  objects: GroupByObject<T>[];
  /** The groups that were created by the query. */
  groups: Record<string, GenerativeGroupByResult<T, C>>;
  /** @deprecated (use `generative.text` instead) The LLM-generated output applicable to this query as a whole. */
  generated?: string;
  generative?: GenerativeGrouped<C>;
};

/** Options available when defining queries using methods in the `collection.generate` namespace. */
export type GenerateOptions<T, C> = {
  /** The prompt to use when generating content relevant to each object of the collection individually. */
  singlePrompt?: string | SinglePrompt;
  /** The prompt to use when generating content relevant to objects returned by the query as a whole. */
  groupedTask?: string | GroupedTask<T>;
  /** The properties to use as context to be injected into the `groupedTask` prompt when performing the grouped generation. */
  groupedProperties?: T extends undefined ? string[] : (keyof T)[];
  config?: C;
};

export type SinglePrompt = {
  prompt: string;
  debug?: boolean;
  metadata?: boolean;
  images?: (string | Buffer)[];
  imageProperties?: string[];
};

export type GroupedTask<T> = {
  prompt: string;
  metadata?: boolean;
  nonBlobProperties?: T extends undefined ? string[] : (keyof T)[];
  images?: (string | Buffer)[];
  imageProperties?: string[];
};

export type GenerativeConfigRuntime =
  | ModuleConfig<'generative-anthropic', GenerativeAnthropicConfigRuntime>
  | ModuleConfig<'generative-anyscale', GenerativeAnyscaleConfigRuntime>
  | ModuleConfig<'generative-aws', GenerativeAWSConfigRuntime>
  | ModuleConfig<'generative-cohere', GenerativeCohereConfigRuntime>
  | ModuleConfig<'generative-databricks', GenerativeDatabricksConfigRuntime>
  | ModuleConfig<'generative-dummy', GenerativeDummyConfigRuntime>
  | ModuleConfig<'generative-friendliai', GenerativeFriendliAIConfigRuntime>
  | ModuleConfig<'generative-google', GenerativeGoogleConfigRuntime>
  | ModuleConfig<'generative-mistral', GenerativeMistralConfigRuntime>
  | ModuleConfig<'generative-nvidia', GenerativeNvidiaConfigRuntime>
  | ModuleConfig<'generative-ollama', GenerativeOllamaConfigRuntime>
  | ModuleConfig<'generative-openai', GenerativeOpenAIConfigRuntime>;

export type GenerativeMetadata<C extends GenerativeConfigRuntime | undefined> = C extends undefined
  ? never
  : C extends infer R extends GenerativeConfigRuntime
  ? R['name'] extends 'generative-anthropic'
    ? GenerativeAnthropicMetadata
    : R['name'] extends 'generative-anyscale'
    ? GenerativeAnyscaleMetadata
    : R['name'] extends 'generative-aws'
    ? GenerativeAWSMetadata
    : R['name'] extends 'generative-cohere'
    ? GenerativeCohereMetadata
    : R['name'] extends 'generative-databricks'
    ? GenerativeDatabricksMetadata
    : R['name'] extends 'generative-dummy'
    ? GenerativeDummyMetadata
    : R['name'] extends 'generative-friendliai'
    ? GenerativeFriendliAIMetadata
    : R['name'] extends 'generative-google'
    ? GenerativeGoogleMetadata
    : R['name'] extends 'generative-mistral'
    ? GenerativeMistralMetadata
    : R['name'] extends 'generative-nvidia'
    ? GenerativeNvidiaMetadata
    : R['name'] extends 'generative-ollama'
    ? GenerativeOllamaMetadata
    : R['name'] extends 'generative-openai'
    ? GenerativeOpenAIMetadata
    : never
  : never;

export type GenerateReturn<T, C extends GenerativeConfigRuntime | undefined> =
  | Promise<GenerativeReturn<T, C>>
  | Promise<GenerativeGroupByReturn<T, C>>;

type omitFields = 'images' | 'imageProperties';

export type GenerativeAnthropicConfigRuntime = Omit<GenerativeAnthropicGRPC, omitFields>;
export type GenerativeAnyscaleConfigRuntime = Omit<GenerativeAnyscaleGRPC, omitFields>;
export type GenerativeAWSConfigRuntime = Omit<GenerativeAWSGRPC, omitFields>;
export type GenerativeCohereConfigRuntime = Omit<GenerativeCohereGRPC, omitFields>;
export type GenerativeDatabricksConfigRuntime = Omit<GenerativeDatabricksGRPC, omitFields>;
export type GenerativeDummyConfigRuntime = Omit<GenerativeDummyGRPC, omitFields>;
export type GenerativeFriendliAIConfigRuntime = Omit<GenerativeFriendliAIGRPC, omitFields>;
export type GenerativeGoogleConfigRuntime = Omit<GenerativeGoogleGRPC, omitFields>;
export type GenerativeMistralConfigRuntime = Omit<GenerativeMistralGRPC, omitFields>;
export type GenerativeNvidiaConfigRuntime = Omit<GenerativeNvidiaGRPC, omitFields>;
export type GenerativeOllamaConfigRuntime = Omit<GenerativeOllamaGRPC, omitFields>;
export type GenerativeOpenAIConfigRuntime = Omit<GenerativeOpenAIGRPC, omitFields>;
