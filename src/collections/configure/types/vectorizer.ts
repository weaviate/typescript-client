import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecField,
  Ref2VecCentroidConfig,
  Text2MultiVecJinaAIConfig,
  Text2VecAWSConfig,
  Text2VecAzureOpenAIConfig,
  Text2VecCohereConfig,
  Text2VecContextionaryConfig,
  Text2VecDatabricksConfig,
  Text2VecGPT4AllConfig,
  Text2VecGoogleConfig,
  Text2VecHuggingFaceConfig,
  Text2VecJinaAIConfig,
  Text2VecMistralConfig,
  Text2VecNvidiaConfig,
  Text2VecOllamaConfig,
  Text2VecOpenAIConfig,
  Text2VecTransformersConfig,
  Text2VecVoyageAIConfig,
  Text2VecWeaviateConfig,
  VectorIndexType,
  Vectorizer,
  VectorizerConfigType,
} from '../../config/types/index.js';
import { PrimitiveKeys } from '../../types/internal.js';
import {
  MultiVectorEncodingConfigCreate,
  QuantizerConfigCreate,
  VectorIndexConfigCreateType,
  VectorIndexConfigUpdateType,
} from './vectorIndex.js';

export type VectorizerCreateOptions<P, I, V> = {
  encoding?: MultiVectorEncodingConfigCreate;
  quantizer?: QuantizerConfigCreate;
  sourceProperties?: P;
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
  vectorizerConfig?: ModuleConfig<V, VectorizerConfigType<V>>;
};

export type VectorizerUpdateOptions<N, I> = {
  name?: N;
  vectorIndexConfig: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type VectorConfigCreate<
  P,
  N extends string | undefined,
  I extends VectorIndexType,
  V extends Vectorizer
> = {
  name: N;
  properties?: P[];
  vectorizer: ModuleConfig<V, VectorizerConfigType<V>>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};

export type VectorConfigUpdate<N extends string | undefined, I extends VectorIndexType> = {
  name: N;
  vectorIndex: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type VectorizersConfigCreate<T, V> = V extends undefined
  ?
      | VectorConfigCreate<PrimitiveKeys<T>, string | undefined, VectorIndexType, Vectorizer>
      | VectorConfigCreate<PrimitiveKeys<T>, string, VectorIndexType, Vectorizer>[]
  :
      | VectorConfigCreate<PrimitiveKeys<T>, (keyof V & string) | undefined, VectorIndexType, Vectorizer>
      | VectorConfigCreate<PrimitiveKeys<T>, keyof V & string, VectorIndexType, Vectorizer>[];

export type VectorizersConfigAdd<T> =
  | VectorConfigCreate<PrimitiveKeys<T>, string, VectorIndexType, Vectorizer>
  | VectorConfigCreate<PrimitiveKeys<T>, string, VectorIndexType, Vectorizer>[];

export type ConfigureNonTextVectorizerOptions<
  N extends string | undefined,
  I extends VectorIndexType,
  V extends Vectorizer
> = VectorizerConfigCreateType<V> & {
  name?: N;
  quantizer?: QuantizerConfigCreate;
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};

export type ConfigureTextVectorizerOptions<
  T,
  N extends string | undefined,
  I extends VectorIndexType,
  V extends Vectorizer
> = ConfigureNonTextVectorizerOptions<N, I, V> & {
  sourceProperties?: PrimitiveKeys<T>[];
};

export type ConfigureNonTextMultiVectorizerOptions<
  N extends string | undefined,
  I extends VectorIndexType,
  V extends Vectorizer
> = ConfigureNonTextVectorizerOptions<N, I, V> & {
  encoding?: MultiVectorEncodingConfigCreate;
};

export type ConfigureTextMultiVectorizerOptions<
  T,
  N extends string | undefined,
  I extends VectorIndexType,
  V extends Vectorizer
> = ConfigureTextVectorizerOptions<T, N, I, V> & {
  encoding?: MultiVectorEncodingConfigCreate;
};

export type Img2VecNeuralConfigCreate = Img2VecNeuralConfig;

// model: Optional[str] = None,
// truncation: Optional[bool] = None,
// output_encoding: Optional[str],
// vectorize_collection_name: bool = True,
// base_url: Optional[AnyHttpUrl] = None,
// image_fields: Optional[Union[List[str], List[Multi2VecField]]] = None,
// text_fields: Optional[Union[List[str], List[Multi2VecField]]] = None,

// model: The model to use. Defaults to `None`, which uses the server-defined default.
// output_encoding: Format in which the embeddings are encoded. Defaults to `None`, so the embeddings are represented as a list of floating-point numbers.
// vectorize_collection_name: Whether to vectorize the collection name. Defaults to `True`.
// base_url: The base URL to use where API requests should go. Defaults to `None`, which uses the server-defined default.
// image_fields: The image fields to use in vectorization.
// text_fields: The text fields to use in vectorization.

/** The configuration for the `multi2vec-nvidia` vectorizer. */
export type Multi2VecNvidiaConfigCreate = {
  /** The model to use. Defaults to `None`, which uses the server-defined default. */
  model?: string;
  /** The base URL where API requests should go. */
  baseURL?: string;
  /** Whether to apply truncation. */
  truncation?: boolean;
  /** Format in which the embeddings are encoded. Defaults to `None`, so the embeddings are represented as a list of floating-point numbers. */
  outputEncoding?: string;
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
};

/** The configuration for the `multi2vec-clip` vectorizer. */
export type Multi2VecClipConfigCreate = {
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The inference url to use where API requests should go. */
  inferenceUrl?: string;
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

/** The configuration for the `multi2vec-bind` vectorizer. */
export type Multi2VecBindConfigCreate = {
  /** The audio fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  audioFields?: string[] | Multi2VecField[];
  /** The depth fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  depthFields?: string[] | Multi2VecField[];
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The IMU fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  IMUFields?: string[] | Multi2VecField[];
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** The thermal fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  thermalFields?: string[] | Multi2VecField[];
  /** The video fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  videoFields?: string[] | Multi2VecField[];
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

/** The configuration for the `multi2vec-cohere` vectorizer. */
export type Multi2VecCohereConfigCreate = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The specific model to use. */
  model?: string;
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** The truncation strategy to use. */
  truncate?: string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

export type Multi2MultivecJinaAIConfigCreate = {
  /** The image fields to use in vectorization. */
  imageFields?: string[];
  /** The text fields to use in vectorization. */
  textFields?: string[];
};

export type Multi2VecJinaAIConfigCreate = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The dimensionality of the vector once embedded. */
  dimensions?: number;
  /** The model to use. */
  model?: string;
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

/** @deprecated Use `Multi2VecGoogleConfigCreate` instead.*/
export type Multi2VecPalmConfigCreate = Multi2VecGoogleConfigCreate;

/** The configuration for the `multi2vec-google` vectorizer. */
export type Multi2VecGoogleConfigCreate = {
  /** The project id of the model in GCP. */
  projectId: string;
  /** Where the model runs */
  location: string;
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** The video fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  videoFields?: string[] | Multi2VecField[];
  /** The model ID to use. */
  modelId?: string;
  /** The dimensionality of the vector once embedded. */
  dimensions?: number;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

export type Multi2VecVoyageAIConfigCreate = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The image fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  imageFields?: string[] | Multi2VecField[];
  /** The model to use. */
  model?: string;
  /** The text fields to use in vectorization. Can be string of `Multi2VecField` type. If string, weight 0 will be assumed. */
  textFields?: string[] | Multi2VecField[];
  /** Whether the input should be truncated to fit the context window. */
  truncate?: boolean;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};

export type Ref2VecCentroidConfigCreate = Ref2VecCentroidConfig;

export type Text2VecAWSConfigCreate = Text2VecAWSConfig;

export type Text2VecAzureOpenAIConfigCreate = Text2VecAzureOpenAIConfig;

export type Text2VecCohereConfigCreate = Text2VecCohereConfig;

export type Text2VecContextionaryConfigCreate = Text2VecContextionaryConfig;

export type Text2VecDatabricksConfigCreate = Text2VecDatabricksConfig;

export type Text2VecGPT4AllConfigCreate = Text2VecGPT4AllConfig;

export type Text2VecHuggingFaceConfigCreate = Text2VecHuggingFaceConfig;

export type Text2VecJinaAIConfigCreate = Text2VecJinaAIConfig;

export type Text2VecNvidiaConfigCreate = Text2VecNvidiaConfig;

export type Text2VecMistralConfigCreate = Text2VecMistralConfig;

export type Text2VecOllamaConfigCreate = Text2VecOllamaConfig;

export type Text2VecOpenAIConfigCreate = Text2VecOpenAIConfig;

/** @deprecated Use `Text2VecGoogleConfigCreate` instead. */
export type Text2VecPalmConfigCreate = Text2VecGoogleConfig;

export type Text2VecGoogleConfigCreate = Text2VecGoogleConfig;

export type Text2VecTransformersConfigCreate = Text2VecTransformersConfig;

export type Text2VecVoyageAIConfigCreate = Text2VecVoyageAIConfig;

export type Text2VecWeaviateConfigCreate = Text2VecWeaviateConfig;

export type Text2MultiVecJinaAIConfigCreate = Text2MultiVecJinaAIConfig;

export type VectorizerConfigCreateType<V> = V extends 'img2vec-neural'
  ? Img2VecNeuralConfigCreate | undefined
  : V extends 'multi2vec-nvidia'
  ? Multi2VecNvidiaConfigCreate | undefined
  : V extends 'multi2vec-clip'
  ? Multi2VecClipConfigCreate | undefined
  : V extends 'multi2vec-cohere'
  ? Multi2VecCohereConfigCreate | undefined
  : V extends 'multi2vec-bind'
  ? Multi2VecBindConfigCreate | undefined
  : V extends 'multi2vec-jinaai'
  ? Multi2VecJinaAIConfigCreate | undefined
  : V extends 'multi2multivec-jinaai'
  ? Multi2MultivecJinaAIConfigCreate | undefined
  : V extends 'multi2vec-palm'
  ? Multi2VecPalmConfigCreate
  : V extends 'multi2vec-google'
  ? Multi2VecGoogleConfigCreate
  : V extends 'multi2vec-voyageai'
  ? Multi2VecVoyageAIConfigCreate | undefined
  : V extends 'ref2vec-centroid'
  ? Ref2VecCentroidConfigCreate
  : V extends 'text2vec-aws'
  ? Text2VecAWSConfigCreate
  : V extends 'text2vec-contextionary'
  ? Text2VecContextionaryConfigCreate | undefined
  : V extends 'text2vec-cohere'
  ? Text2VecCohereConfigCreate | undefined
  : V extends 'text2vec-databricks'
  ? Text2VecDatabricksConfigCreate
  : V extends 'text2vec-gpt4all'
  ? Text2VecGPT4AllConfigCreate | undefined
  : V extends 'text2vec-huggingface'
  ? Text2VecHuggingFaceConfigCreate | undefined
  : V extends 'text2vec-jinaai'
  ? Text2VecJinaAIConfigCreate | undefined
  : V extends 'text2vec-nvidia'
  ? Text2VecNvidiaConfigCreate | undefined
  : V extends 'text2vec-mistral'
  ? Text2VecMistralConfigCreate | undefined
  : V extends 'text2vec-ollama'
  ? Text2VecOllamaConfigCreate | undefined
  : V extends 'text2vec-openai'
  ? Text2VecOpenAIConfigCreate | undefined
  : V extends 'text2vec-azure-openai'
  ? Text2VecAzureOpenAIConfigCreate
  : V extends 'text2vec-palm'
  ? Text2VecPalmConfigCreate | undefined
  : V extends 'text2vec-google'
  ? Text2VecGoogleConfigCreate | undefined
  : V extends 'text2vec-transformers'
  ? Text2VecTransformersConfigCreate | undefined
  : V extends 'text2vec-voyageai'
  ? Text2VecVoyageAIConfigCreate | undefined
  : V extends 'text2vec-weaviate'
  ? Text2VecWeaviateConfigCreate | undefined
  : V extends 'text2multivec-jinaai'
  ? Text2MultiVecJinaAIConfigCreate | undefined
  : V extends 'none'
  ? {}
  : V extends undefined
  ? undefined
  : never;
