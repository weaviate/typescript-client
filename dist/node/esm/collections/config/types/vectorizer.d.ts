import { ModuleConfig } from './index.js';
import { VectorIndexConfig, VectorIndexType } from './vectorIndex.js';
export type VectorConfig = Record<
  string,
  {
    properties?: string[];
    vectorizer: ModuleConfig<Vectorizer, VectorizerConfig> | ModuleConfig<string, any>;
    indexConfig: VectorIndexConfig;
    indexType: VectorIndexType;
  }
>;
/** @deprecated Use `multi2vec-google` instead. */
type Multi2VecPalmVectorizer = 'multi2vec-palm';
/** @deprecated Use `text2vec-google` instead. */
type Text2VecPalmVectorizer = 'text2vec-palm';
export type Vectorizer =
  | 'img2vec-neural'
  | 'multi2vec-clip'
  | 'multi2vec-bind'
  | Multi2VecPalmVectorizer
  | 'multi2vec-google'
  | 'ref2vec-centroid'
  | 'text2vec-aws'
  | 'text2vec-azure-openai'
  | 'text2vec-cohere'
  | 'text2vec-contextionary'
  | 'text2vec-databricks'
  | 'text2vec-gpt4all'
  | 'text2vec-huggingface'
  | 'text2vec-jina'
  | 'text2vec-mistral'
  | 'text2vec-octoai'
  | 'text2vec-ollama'
  | 'text2vec-openai'
  | Text2VecPalmVectorizer
  | 'text2vec-google'
  | 'text2vec-transformers'
  | 'text2vec-voyageai'
  | 'none';
/** The configuration for image vectorization using a neural network module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/modules/img2vec-neural) for detailed usage.
 */
export type Img2VecNeuralConfig = {
  /** The image fields used when vectorizing. This is a required field and must match the property fields of the collection that are defined as `DataType.BLOB`. */
  imageFields: string[];
};
/** The field configuration for multi-media vectorization. */
export type Multi2VecField = {
  /** The name of the field to be used when performing multi-media vectorization. */
  name: string;
  /** The weight of the field when performing multi-media vectorization. */
  weight?: number;
};
/** The configuration for multi-media vectorization using the CLIP module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings-multimodal) for detailed usage.
 */
export type Multi2VecClipConfig = {
  /** The image fields used when vectorizing. */
  imageFields?: string[];
  /** The URL where inference requests are sent. */
  inferenceUrl?: string;
  /** The text fields used when vectorizing. */
  textFields?: string[];
  /** Whether the collection name is vectorized. */
  vectorizeCollectionName?: boolean;
  /** The weights of the fields used for vectorization. */
  weights?: {
    /** The weights of the image fields. */
    imageFields?: number[];
    /** The weights of the text fields. */
    textFields?: number[];
  };
};
/** The configuration for multi-media vectorization using the Bind module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/imagebind/embeddings-multimodal) for detailed usage.
 */
export type Multi2VecBindConfig = {
  /** The audio fields used when vectorizing. */
  audioFields?: string[];
  /** The depth fields used when vectorizing. */
  depthFields?: string[];
  /** The image fields used when vectorizing. */
  imageFields?: string[];
  /** The IMU fields used when vectorizing. */
  IMUFields?: string[];
  /** The text fields used when vectorizing. */
  textFields?: string[];
  /** The thermal fields used when vectorizing. */
  thermalFields?: string[];
  /** The video fields used when vectorizing. */
  videoFields?: string[];
  /** Whether the collection name is vectorized. */
  vectorizeCollectionName?: boolean;
  /** The weights of the fields used for vectorization. */
  weights?: {
    /** The weights of the audio fields. */
    audioFields?: number[];
    /** The weights of the depth fields. */
    depthFields?: number[];
    /** The weights of the image fields. */
    imageFields?: number[];
    /** The weights of the IMU fields. */
    IMUFields?: number[];
    /** The weights of the text fields. */
    textFields?: number[];
    /** The weights of the thermal fields. */
    thermalFields?: number[];
    /** The weights of the video fields. */
    videoFields?: number[];
  };
};
/** @deprecated Use `Multi2VecGoogleConfig` instead. */
export type Multi2VecPalmConfig = Multi2VecGoogleConfig;
/** The configuration for multi-media vectorization using the Google module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
 */
export type Multi2VecGoogleConfig = {
  /** The project ID of the model in GCP. */
  projectId: string;
  /** The location where the model runs. */
  location: string;
  /** The image fields used when vectorizing. */
  imageFields?: string[];
  /** The text fields used when vectorizing. */
  textFields?: string[];
  /** The video fields used when vectorizing. */
  videoFields?: string[];
  /** The model ID in use. */
  modelId?: string;
  /** The number of dimensions in use. */
  dimensions?: number;
  /** Whether the collection name is vectorized. */
  vectorizeCollectionName?: boolean;
  /** The weights of the fields used for vectorization. */
  weights?: {
    /** The weights of the image fields. */
    imageFields?: number[];
    /** The weights of the text fields. */
    textFields?: number[];
    /** The weights of the video fields. */
    videoFields?: number[];
  };
};
/** The configuration for reference-based vectorization using the centroid method.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/modules/ref2vec-centroid) for detailed usage.
 */
export type Ref2VecCentroidConfig = {
  /** The properties used as reference points for vectorization. */
  referenceProperties: string[];
  /** The method used to calculate the centroid. */
  method: 'mean' | string;
};
/** The configuration for text vectorization using the AWS module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-aws) for detailed usage.
 */
export type Text2VecAWSConfig = {
  /** The model to use. REQUIRED for service `sagemaker`. */
  endpoint?: string;
  /** The model to use. REQUIRED for service `bedrock`. */
  model?: 'amazon.titan-embed-text-v1' | 'cohere.embed-english-v3' | 'cohere.embed-multilingual-v3' | string;
  /** The AWS region where the model runs. */
  region: string;
  /** The AWS service to use. */
  service: 'sagemaker' | 'bedrock' | string;
  /** Whether the collection name is vectorized. */
  vectorizeCollectionName?: boolean;
};
/** The configuration for text vectorization using the OpenAI module with Azure.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
 */
export type Text2VecAzureOpenAIConfig = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The deployment ID to use */
  deploymentId: string;
  /** The resource name to use. */
  resourceName: string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/** The configuration for text vectorization using the Cohere module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/cohere/embeddings) for detailed usage.
 */
export type Text2VecCohereConfig = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The model to use. */
  model?: string;
  /** The truncation strategy to use. */
  truncate?: boolean;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/** The configuration for text vectorization using the Contextionary module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/modules/text2vec-contextionary) for detailed usage.
 */
export type Text2VecContextionaryConfig = {
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/** The configuration for text vectorization using the Databricks module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/databricks/embeddings) for detailed usage.
 */
export type Text2VecDatabricksConfig = {
  endpoint: string;
  instruction?: string;
  vectorizeCollectionName?: boolean;
};
/** The configuration for text vectorization using the GPT-4-All module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/gpt4all/embeddings) for detailed usage.
 */
export type Text2VecGPT4AllConfig = {
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the HuggingFace module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/huggingface/embeddings) for detailed usage.
 */
export type Text2VecHuggingFaceConfig = {
  /** The endpoint URL to use. */
  endpointURL?: string;
  /** The model to use. */
  model?: string;
  /** The model to use for passage vectorization. */
  passageModel?: string;
  /** The model to use for query vectorization. */
  queryModel?: string;
  /** Whether to use the cache. */
  useCache?: boolean;
  /** Whether to use the GPU. */
  useGPU?: boolean;
  /** Whether to wait for the model. */
  waitForModel?: boolean;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the Jina module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/jinaai/embeddings) for detailed usage.
 */
export type Text2VecJinaConfig = {
  /** The model to use. */
  model?: 'jina-embeddings-v2-base-en' | 'jina-embeddings-v2-small-en' | string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the Mistral module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/mistral/embeddings) for detailed usage.
 */
export type Text2VecMistralConfig = {
  /** The model to use. */
  model?: 'mistral-embed' | string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the OctoAI module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/octoai/embeddings) for detailed usage.
 */
export type Text2VecOctoAIConfig = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The model to use. */
  model?: string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the Ollama module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/ollama/embeddings) for detailed usage.
 */
export type Text2VecOllamaConfig = {
  /** The base URL to use where API requests should go. */
  apiEndpoint?: string;
  /** The model to use. */
  model?: string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the OpenAI module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/openai/embeddings) for detailed usage.
 */
export type Text2VecOpenAIConfig = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The dimensions to use. */
  dimensions?: number;
  /** The model to use. */
  model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002' | string;
  /** The model version to use. */
  modelVersion?: string;
  /** The type of model to use. */
  type?: 'text' | 'code' | string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/** @deprecated Use `Text2VecGoogleConfig` instead. */
export type Text2VecPalmConfig = Text2VecGoogleConfig;
/**
 * The configuration for text vectorization using the Google module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/google/embeddings) for detailed usage.
 */
export type Text2VecGoogleConfig = {
  /** The API endpoint to use without a leading scheme such as `http://`. */
  apiEndpoint?: string;
  /** The model ID to use. */
  modelId?: string;
  /** The project ID to use. */
  projectId?: string;
  /** The Weaviate property name for the `gecko-002` or `gecko-003` model to use as the title. */
  titleProperty?: string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the Transformers module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/transformers/embeddings) for detailed usage.
 */
export type Text2VecTransformersConfig = {
  /** The inference url to use where API requests should go. You can use either this OR (`passage_inference_url` & `query_inference_url`). */
  inferenceUrl?: string;
  /** The inference url to use where passage API requests should go. You can use either (this AND query_inference_url) OR `inference_url`. */
  passageInferenceUrl?: string;
  /** The inference url to use where query API requests should go. You can use either (this AND `passage_inference_url`) OR `inference_url`. */
  queryInferenceUrl?: string;
  /** The pooling strategy to use. */
  poolingStrategy?: 'masked_mean' | 'cls' | string;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
/**
 * The configuration for text vectorization using the VoyageAI module.
 *
 * See the [documentation](https://weaviate.io/developers/weaviate/model-providers/voyageai/embeddings) for detailed usage.
 */
export type Text2VecVoyageAIConfig = {
  /** The base URL to use where API requests should go. */
  baseURL?: string;
  /** The model to use. */
  model?: string;
  /** Whether to truncate the input texts to fit within the context length. */
  truncate?: boolean;
  /** Whether to vectorize the collection name. */
  vectorizeCollectionName?: boolean;
};
export type NoVectorizerConfig = {};
export type VectorizerConfig =
  | Img2VecNeuralConfig
  | Multi2VecClipConfig
  | Multi2VecBindConfig
  | Multi2VecGoogleConfig
  | Multi2VecPalmConfig
  | Ref2VecCentroidConfig
  | Text2VecAWSConfig
  | Text2VecAzureOpenAIConfig
  | Text2VecContextionaryConfig
  | Text2VecCohereConfig
  | Text2VecDatabricksConfig
  | Text2VecGoogleConfig
  | Text2VecGPT4AllConfig
  | Text2VecHuggingFaceConfig
  | Text2VecJinaConfig
  | Text2VecOpenAIConfig
  | Text2VecPalmConfig
  | Text2VecTransformersConfig
  | Text2VecVoyageAIConfig
  | NoVectorizerConfig;
export type VectorizerConfigType<V> = V extends 'img2vec-neural'
  ? Img2VecNeuralConfig | undefined
  : V extends 'multi2vec-clip'
  ? Multi2VecClipConfig | undefined
  : V extends 'multi2vec-bind'
  ? Multi2VecBindConfig | undefined
  : V extends 'multi2vec-google'
  ? Multi2VecGoogleConfig
  : V extends Multi2VecPalmVectorizer
  ? Multi2VecPalmConfig
  : V extends 'ref2vec-centroid'
  ? Ref2VecCentroidConfig
  : V extends 'text2vec-aws'
  ? Text2VecAWSConfig
  : V extends 'text2vec-contextionary'
  ? Text2VecContextionaryConfig | undefined
  : V extends 'text2vec-cohere'
  ? Text2VecCohereConfig | undefined
  : V extends 'text2vec-databricks'
  ? Text2VecDatabricksConfig
  : V extends 'text2vec-google'
  ? Text2VecGoogleConfig | undefined
  : V extends 'text2vec-gpt4all'
  ? Text2VecGPT4AllConfig | undefined
  : V extends 'text2vec-huggingface'
  ? Text2VecHuggingFaceConfig | undefined
  : V extends 'text2vec-jina'
  ? Text2VecJinaConfig | undefined
  : V extends 'text2vec-mistral'
  ? Text2VecMistralConfig | undefined
  : V extends 'text2vec-octoai'
  ? Text2VecOctoAIConfig | undefined
  : V extends 'text2vec-ollama'
  ? Text2VecOllamaConfig | undefined
  : V extends 'text2vec-openai'
  ? Text2VecOpenAIConfig | undefined
  : V extends 'text2vec-azure-openai'
  ? Text2VecAzureOpenAIConfig
  : V extends Text2VecPalmVectorizer
  ? Text2VecPalmConfig | undefined
  : V extends 'text2vec-transformers'
  ? Text2VecTransformersConfig | undefined
  : V extends 'text2vec-voyageai'
  ? Text2VecVoyageAIConfig | undefined
  : V extends 'none'
  ? {}
  : V extends undefined
  ? undefined
  : never;
export {};
