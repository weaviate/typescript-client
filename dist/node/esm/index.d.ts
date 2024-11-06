import { Backend, BackupCompressionLevel, BackupStatus } from './backup/index.js';
import { Backup } from './collections/backup/client.js';
import { Cluster } from './collections/cluster/index.js';
import { Collections } from './collections/index.js';
import {
  AccessTokenCredentialsInput,
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
  ClientCredentialsInput,
  OidcAuthenticator,
  UserPasswordCredentialsInput,
} from './connection/auth.js';
import {
  ConnectToCustomOptions,
  ConnectToLocalOptions,
  ConnectToWCDOptions,
  ConnectToWCSOptions,
  ConnectToWeaviateCloudOptions,
} from './connection/helpers.js';
import { ProxiesParams, TimeoutParams } from './connection/http.js';
import { ConsistencyLevel } from './data/replication.js';
import { Meta } from './openapi/types.js';
import { DbVersion } from './utils/dbVersion.js';
import weaviateV2 from './v2/index.js';
export type ProtocolParams = {
  /**
   * The host to connect to. E.g., `localhost` or `example.com`.
   */
  host: string;
  /**
   * The port to connect to. E.g., `8080` or `80`.
   */
  port: number;
  /**
   * Whether to use a secure connection (https).
   */
  secure: boolean;
  /**
   * An optional path in the case that you are using a forwarding proxy.
   *
   * E.g., http://localhost:8080/weaviate
   */
  path?: string;
};
export type ConnectionParams = {
  /**
   * The connection parameters for the REST and GraphQL APIs (http/1.1).
   */
  http: ProtocolParams;
  /**
   * The connection paramaters for the gRPC API (http/2).
   */
  grpc: ProtocolParams;
};
export type ClientParams = {
  /**
   * The connection parameters for Weaviate's public APIs.
   */
  connectionParams: ConnectionParams;
  /**
   * The credentials used to authenticate with Weaviate.
   *
   * Can be any of `AuthUserPasswordCredentials`, `AuthAccessTokenCredentials`, `AuthClientCredentials`, and `ApiKey`.
   */
  auth?: AuthCredentials;
  /**
   * Additional headers that should be passed to Weaviate in the underlying requests. E.g., X-OpenAI-Api-Key
   */
  headers?: HeadersInit;
  /**
   * The connection parameters for any tunnelling proxies that should be used.
   *
   * Note, if your proxy is a forwarding proxy then supply its configuration as if it were the Weaviate server itself using `rest` and `grpc`.
   */
  proxies?: ProxiesParams;
  /** The timeouts to use when making requests to Weaviate */
  timeout?: TimeoutParams;
  /** Whether to skip the initialization checks */
  skipInitChecks?: boolean;
};
export interface WeaviateClient {
  backup: Backup;
  cluster: Cluster;
  collections: Collections;
  oidcAuth?: OidcAuthenticator;
  close: () => Promise<void>;
  getMeta: () => Promise<Meta>;
  getOpenIDConfig?: () => Promise<any>;
  getWeaviateVersion: () => Promise<DbVersion>;
  isLive: () => Promise<boolean>;
  isReady: () => Promise<boolean>;
}
declare const app: {
  /**
   * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
   *
   * @param {ConnectToCustomOptions} options Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
   */
  connectToCustom: (options: ConnectToCustomOptions) => Promise<WeaviateClient>;
  /**
   * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
   *
   * @param {ConnectToLocalOptions} [options] Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
   */
  connectToLocal: (options?: ConnectToLocalOptions) => Promise<WeaviateClient>;
  /**
   * Connect to your own Weaviate Cloud (WCD) instance.
   *
   * @deprecated Use `connectToWeaviateCloud` instead.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCDOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
   */
  connectToWCD: (clusterURL: string, options?: ConnectToWCDOptions) => Promise<WeaviateClient>;
  /**
   * Connect to your own Weaviate Cloud Service (WCS) instance.
   *
   * @deprecated Use `connectToWeaviateCloud` instead.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCSOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCS instance.
   */
  connectToWCS: (clusterURL: string, options?: ConnectToWCSOptions) => Promise<WeaviateClient>;
  /**
   * Connect to your own Weaviate Cloud (WCD) instance.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWeaviateCloudOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
   */
  connectToWeaviateCloud: (
    clusterURL: string,
    options?: ConnectToWeaviateCloudOptions
  ) => Promise<WeaviateClient>;
  client: (params: ClientParams) => Promise<WeaviateClient>;
  ApiKey: typeof ApiKey;
  AuthUserPasswordCredentials: typeof AuthUserPasswordCredentials;
  AuthAccessTokenCredentials: typeof AuthAccessTokenCredentials;
  AuthClientCredentials: typeof AuthClientCredentials;
  configure: {
    generative: {
      anthropic(
        config?: import('./collections/index.js').GenerativeAnthropicConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-anthropic',
        import('./collections/index.js').GenerativeAnthropicConfig | undefined
      >;
      anyscale(
        config?: import('./collections/index.js').GenerativeAnyscaleConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-anyscale',
        import('./collections/index.js').GenerativeAnyscaleConfig | undefined
      >;
      aws(
        config: import('./collections/index.js').GenerativeAWSConfig
      ): import('./collections/index.js').ModuleConfig<
        'generative-aws',
        import('./collections/index.js').GenerativeAWSConfig
      >;
      azureOpenAI: (
        config: import('./collections/index.js').GenerativeAzureOpenAIConfigCreate
      ) => import('./collections/index.js').ModuleConfig<
        'generative-openai',
        import('./collections/index.js').GenerativeAzureOpenAIConfig
      >;
      cohere: (
        config?: import('./collections/index.js').GenerativeCohereConfigCreate | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'generative-cohere',
        import('./collections/index.js').GenerativeCohereConfig | undefined
      >;
      databricks: (
        config: import('./collections/index.js').GenerativeDatabricksConfig
      ) => import('./collections/index.js').ModuleConfig<
        'generative-databricks',
        import('./collections/index.js').GenerativeDatabricksConfig
      >;
      friendliai(
        config?: import('./collections/index.js').GenerativeFriendliAIConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-friendliai',
        import('./collections/index.js').GenerativeFriendliAIConfig | undefined
      >;
      mistral(
        config?: import('./collections/index.js').GenerativeMistralConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-mistral',
        import('./collections/index.js').GenerativeMistralConfig | undefined
      >;
      octoai(
        config?: import('./collections/index.js').GenerativeOctoAIConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-octoai',
        import('./collections/index.js').GenerativeOctoAIConfig | undefined
      >;
      ollama(
        config?: import('./collections/index.js').GenerativeOllamaConfig | undefined
      ): import('./collections/index.js').ModuleConfig<
        'generative-ollama',
        import('./collections/index.js').GenerativeOllamaConfig | undefined
      >;
      openAI: (
        config?: import('./collections/index.js').GenerativeOpenAIConfigCreate | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'generative-openai',
        import('./collections/index.js').GenerativeOpenAIConfig | undefined
      >;
      palm: (
        config?: import('./collections/index.js').GenerativeGoogleConfig | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'generative-palm',
        import('./collections/index.js').GenerativeGoogleConfig | undefined
      >;
      google: (
        config?: import('./collections/index.js').GenerativeGoogleConfig | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'generative-google',
        import('./collections/index.js').GenerativeGoogleConfig | undefined
      >;
    };
    reranker: {
      cohere: (
        config?: import('./collections/index.js').RerankerCohereConfig | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'reranker-cohere',
        import('./collections/index.js').RerankerCohereConfig | undefined
      >;
      jinaai: (
        config?: import('./collections/index.js').RerankerJinaAIConfig | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'reranker-jinaai',
        import('./collections/index.js').RerankerJinaAIConfig | undefined
      >;
      transformers: () => import('./collections/index.js').ModuleConfig<
        'reranker-transformers',
        Record<string, never>
      >;
      voyageAI: (
        config?: import('./collections/index.js').RerankerVoyageAIConfig | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'reranker-voyageai',
        import('./collections/index.js').RerankerVoyageAIConfig | undefined
      >;
    };
    vectorizer: {
      none: <N extends string | undefined = undefined, I extends string = 'hnsw'>(
        opts?:
          | {
              name?: N | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I,
                    import('./collections/index.js').VectorIndexConfigCreateType<I>
                  >
                | undefined;
            }
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<never, N, I, 'none'>;
      img2VecNeural: <N_1 extends string | undefined = undefined, I_1 extends string = 'hnsw'>(
        opts: import('./collections/index.js').Img2VecNeuralConfig & {
          name?: N_1 | undefined;
          vectorIndexConfig?:
            | import('./collections/index.js').ModuleConfig<
                I_1,
                import('./collections/index.js').VectorIndexConfigCreateType<I_1>
              >
            | undefined;
        }
      ) => import('./collections/index.js').VectorConfigCreate<never, N_1, I_1, 'img2vec-neural'>;
      multi2VecBind: <N_2 extends string | undefined = undefined, I_2 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Multi2VecBindConfigCreate & {
              name?: N_2 | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_2,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_2>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<never, N_2, I_2, 'multi2vec-bind'>;
      multi2VecClip: <N_3 extends string | undefined = undefined, I_3 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Multi2VecClipConfigCreate & {
              name?: N_3 | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_3,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_3>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<never, N_3, I_3, 'multi2vec-clip'>;
      multi2VecPalm: <N_4 extends string | undefined = undefined, I_4 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureNonTextVectorizerOptions<N_4, I_4, 'multi2vec-palm'>
      ) => import('./collections/index.js').VectorConfigCreate<never, N_4, I_4, 'multi2vec-palm'>;
      multi2VecGoogle: <N_5 extends string | undefined = undefined, I_5 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureNonTextVectorizerOptions<N_5, I_5, 'multi2vec-google'>
      ) => import('./collections/index.js').VectorConfigCreate<never, N_5, I_5, 'multi2vec-google'>;
      ref2VecCentroid: <N_6 extends string | undefined = undefined, I_6 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureNonTextVectorizerOptions<N_6, I_6, 'ref2vec-centroid'>
      ) => import('./collections/index.js').VectorConfigCreate<never, N_6, I_6, 'ref2vec-centroid'>;
      text2VecAWS: <T, N_7 extends string | undefined = undefined, I_7 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureTextVectorizerOptions<T, N_7, I_7, 'text2vec-aws'>
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T>,
        N_7,
        I_7,
        'text2vec-aws'
      >;
      text2VecAzureOpenAI: <T_1, N_8 extends string | undefined = undefined, I_8 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureTextVectorizerOptions<
          T_1,
          N_8,
          I_8,
          'text2vec-azure-openai'
        >
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_1>,
        N_8,
        I_8,
        'text2vec-azure-openai'
      >;
      text2VecCohere: <T_2, N_9 extends string | undefined = undefined, I_9 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecCohereConfig & {
              name?: N_9 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_2>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_9,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_9>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_2>,
        N_9,
        I_9,
        'text2vec-cohere'
      >;
      text2VecContextionary: <T_3, N_10 extends string | undefined = undefined, I_10 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecContextionaryConfig & {
              name?: N_10 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_3>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_10,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_10>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_3>,
        N_10,
        I_10,
        'text2vec-contextionary'
      >;
      text2VecDatabricks: <T_4, N_11 extends string | undefined = undefined, I_11 extends string = 'hnsw'>(
        opts: import('./collections/index.js').ConfigureTextVectorizerOptions<
          T_4,
          N_11,
          I_11,
          'text2vec-databricks'
        >
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_4>,
        N_11,
        I_11,
        'text2vec-databricks'
      >;
      text2VecGPT4All: <T_5, N_12 extends string | undefined = undefined, I_12 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecGPT4AllConfig & {
              name?: N_12 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_5>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_12,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_12>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_5>,
        N_12,
        I_12,
        'text2vec-gpt4all'
      >;
      text2VecHuggingFace: <T_6, N_13 extends string | undefined = undefined, I_13 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecHuggingFaceConfig & {
              name?: N_13 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_6>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_13,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_13>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_6>,
        N_13,
        I_13,
        'text2vec-huggingface'
      >;
      text2VecJina: <T_7, N_14 extends string | undefined = undefined, I_14 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecJinaConfig & {
              name?: N_14 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_7>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_14,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_14>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_7>,
        N_14,
        I_14,
        'text2vec-jina'
      >;
      text2VecMistral: <T_8, N_15 extends string | undefined = undefined, I_15 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecMistralConfig & {
              name?: N_15 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_8>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_15,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_15>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_8>,
        N_15,
        I_15,
        'text2vec-mistral'
      >;
      text2VecOctoAI: <T_9, N_16 extends string | undefined = undefined, I_16 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecOctoAIConfig & {
              name?: N_16 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_9>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_16,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_16>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_9>,
        N_16,
        I_16,
        'text2vec-octoai'
      >;
      text2VecOpenAI: <T_10, N_17 extends string | undefined = undefined, I_17 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecOpenAIConfig & {
              name?: N_17 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_10>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_17,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_17>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_10>,
        N_17,
        I_17,
        'text2vec-openai'
      >;
      text2VecOllama: <T_11, N_18 extends string | undefined = undefined, I_18 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecOllamaConfig & {
              name?: N_18 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_11>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_18,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_18>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_11>,
        N_18,
        I_18,
        'text2vec-ollama'
      >;
      text2VecPalm: <T_12, N_19 extends string | undefined = undefined, I_19 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecGoogleConfig & {
              name?: N_19 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_12>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_19,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_19>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_12>,
        N_19,
        I_19,
        'text2vec-palm'
      >;
      text2VecGoogle: <T_13, N_20 extends string | undefined = undefined, I_20 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecGoogleConfig & {
              name?: N_20 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_13>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_20,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_20>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_13>,
        N_20,
        I_20,
        'text2vec-google'
      >;
      text2VecTransformers: <T_14, N_21 extends string | undefined = undefined, I_21 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecTransformersConfig & {
              name?: N_21 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_14>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_21,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_21>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_14>,
        N_21,
        I_21,
        'text2vec-transformers'
      >;
      text2VecVoyageAI: <T_15, N_22 extends string | undefined = undefined, I_22 extends string = 'hnsw'>(
        opts?:
          | (import('./collections/index.js').Text2VecVoyageAIConfig & {
              name?: N_22 | undefined;
              sourceProperties?: import('./collections/index.js').PrimitiveKeys<T_15>[] | undefined;
              vectorIndexConfig?:
                | import('./collections/index.js').ModuleConfig<
                    I_22,
                    import('./collections/index.js').VectorIndexConfigCreateType<I_22>
                  >
                | undefined;
            })
          | undefined
      ) => import('./collections/index.js').VectorConfigCreate<
        import('./collections/index.js').PrimitiveKeys<T_15>,
        N_22,
        I_22,
        'text2vec-voyageai'
      >;
    };
    vectorIndex: {
      flat: (
        opts?: import('./collections/index.js').VectorIndexConfigFlatCreateOptions | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'flat',
        | {
            distance?: import('./collections/index.js').VectorDistance | undefined;
            vectorCacheMaxObjects?: number | undefined;
            quantizer?:
              | {
                  cache?: boolean | undefined;
                  rescoreLimit?: number | undefined;
                  type?: 'bq' | undefined;
                }
              | undefined;
            type?: 'flat' | undefined;
          }
        | undefined
      >;
      hnsw: (
        opts?: import('./collections/index.js').VectorIndexConfigHNSWCreateOptions | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'hnsw',
        | {
            cleanupIntervalSeconds?: number | undefined;
            distance?: import('./collections/index.js').VectorDistance | undefined;
            dynamicEfMin?: number | undefined;
            dynamicEfMax?: number | undefined;
            dynamicEfFactor?: number | undefined;
            efConstruction?: number | undefined;
            ef?: number | undefined;
            filterStrategy?: import('./collections/index.js').VectorIndexFilterStrategy | undefined;
            flatSearchCutoff?: number | undefined;
            maxConnections?: number | undefined;
            quantizer?:
              | {
                  cache?: boolean | undefined;
                  rescoreLimit?: number | undefined;
                  type?: 'bq' | undefined;
                }
              | {
                  bitCompression?: boolean | undefined;
                  centroids?: number | undefined;
                  encoder?:
                    | {
                        type?: import('./collections/index.js').PQEncoderType | undefined;
                        distribution?: import('./collections/index.js').PQEncoderDistribution | undefined;
                      }
                    | undefined;
                  segments?: number | undefined;
                  trainingLimit?: number | undefined;
                  type?: 'pq' | undefined;
                }
              | {
                  rescoreLimit?: number | undefined;
                  trainingLimit?: number | undefined;
                  type?: 'sq' | undefined;
                }
              | undefined;
            skip?: boolean | undefined;
            vectorCacheMaxObjects?: number | undefined;
            type?: 'hnsw' | undefined;
          }
        | undefined
      >;
      dynamic: (
        opts?: import('./collections/index.js').VectorIndexConfigDynamicCreateOptions | undefined
      ) => import('./collections/index.js').ModuleConfig<
        'dynamic',
        | {
            distance?: import('./collections/index.js').VectorDistance | undefined;
            threshold?: number | undefined;
            hnsw?:
              | {
                  cleanupIntervalSeconds?: number | undefined;
                  distance?: import('./collections/index.js').VectorDistance | undefined;
                  dynamicEfMin?: number | undefined;
                  dynamicEfMax?: number | undefined;
                  dynamicEfFactor?: number | undefined;
                  efConstruction?: number | undefined;
                  ef?: number | undefined;
                  filterStrategy?: import('./collections/index.js').VectorIndexFilterStrategy | undefined;
                  flatSearchCutoff?: number | undefined;
                  maxConnections?: number | undefined;
                  quantizer?:
                    | {
                        cache?: boolean | undefined;
                        rescoreLimit?: number | undefined;
                        type?: 'bq' | undefined;
                      }
                    | {
                        bitCompression?: boolean | undefined;
                        centroids?: number | undefined;
                        encoder?:
                          | {
                              type?: import('./collections/index.js').PQEncoderType | undefined;
                              distribution?:
                                | import('./collections/index.js').PQEncoderDistribution
                                | undefined;
                            }
                          | undefined;
                        segments?: number | undefined;
                        trainingLimit?: number | undefined;
                        type?: 'pq' | undefined;
                      }
                    | {
                        rescoreLimit?: number | undefined;
                        trainingLimit?: number | undefined;
                        type?: 'sq' | undefined;
                      }
                    | undefined;
                  skip?: boolean | undefined;
                  vectorCacheMaxObjects?: number | undefined;
                  type?: 'hnsw' | undefined;
                }
              | undefined;
            flat?:
              | {
                  distance?: import('./collections/index.js').VectorDistance | undefined;
                  vectorCacheMaxObjects?: number | undefined;
                  quantizer?:
                    | {
                        cache?: boolean | undefined;
                        rescoreLimit?: number | undefined;
                        type?: 'bq' | undefined;
                      }
                    | undefined;
                  type?: 'flat' | undefined;
                }
              | undefined;
            type?: 'dynamic' | undefined;
          }
        | undefined
      >;
      quantizer: {
        bq: (
          options?:
            | {
                cache?: boolean | undefined;
                rescoreLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').QuantizerRecursivePartial<
          import('./collections/index.js').BQConfig
        >;
        pq: (
          options?:
            | {
                bitCompression?: boolean | undefined;
                centroids?: number | undefined;
                encoder?:
                  | {
                      distribution?: import('./collections/index.js').PQEncoderDistribution | undefined;
                      type?: import('./collections/index.js').PQEncoderType | undefined;
                    }
                  | undefined;
                segments?: number | undefined;
                trainingLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').QuantizerRecursivePartial<
          import('./collections/index.js').PQConfig
        >;
        sq: (
          options?:
            | {
                rescoreLimit?: number | undefined;
                trainingLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').QuantizerRecursivePartial<
          import('./collections/index.js').SQConfig
        >;
      };
    };
    dataType: {
      INT: 'int';
      INT_ARRAY: 'int[]';
      NUMBER: 'number';
      NUMBER_ARRAY: 'number[]';
      TEXT: 'text';
      TEXT_ARRAY: 'text[]';
      UUID: 'uuid';
      UUID_ARRAY: 'uuid[]';
      BOOLEAN: 'boolean';
      BOOLEAN_ARRAY: 'boolean[]';
      DATE: 'date';
      DATE_ARRAY: 'date[]';
      OBJECT: 'object';
      OBJECT_ARRAY: 'object[]';
      BLOB: 'blob';
      GEO_COORDINATES: 'geoCoordinates';
      PHONE_NUMBER: 'phoneNumber';
    };
    tokenization: {
      WORD: 'word';
      LOWERCASE: 'lowercase';
      WHITESPACE: 'whitespace';
      FIELD: 'field';
      TRIGRAM: 'trigram';
      GSE: 'gse';
      KAGOME_KR: 'kagome_kr';
    };
    vectorDistances: {
      COSINE: 'cosine';
      DOT: 'dot';
      HAMMING: 'hamming';
      L2_SQUARED: 'l2-squared';
    };
    invertedIndex: (options: {
      bm25b?: number | undefined;
      bm25k1?: number | undefined;
      cleanupIntervalSeconds?: number | undefined;
      indexTimestamps?: boolean | undefined;
      indexPropertyLength?: boolean | undefined;
      indexNullState?: boolean | undefined;
      stopwordsPreset?: 'none' | 'en' | undefined;
      stopwordsAdditions?: string[] | undefined;
      stopwordsRemovals?: string[] | undefined;
    }) => {
      bm25?:
        | {
            k1?: number | undefined;
            b?: number | undefined;
          }
        | undefined;
      cleanupIntervalSeconds?: number | undefined;
      indexTimestamps?: boolean | undefined;
      indexPropertyLength?: boolean | undefined;
      indexNullState?: boolean | undefined;
      stopwords?:
        | {
            preset?: string | undefined;
            additions?: (string | undefined)[] | undefined;
            removals?: (string | undefined)[] | undefined;
          }
        | undefined;
    };
    multiTenancy: (
      options?:
        | {
            autoTenantActivation?: boolean | undefined;
            autoTenantCreation?: boolean | undefined;
            enabled?: boolean | undefined;
          }
        | undefined
    ) => {
      autoTenantActivation?: boolean | undefined;
      autoTenantCreation?: boolean | undefined;
      enabled?: boolean | undefined;
    };
    replication: (options: {
      asyncEnabled?: boolean | undefined;
      deletionStrategy?: import('./collections/index.js').ReplicationDeletionStrategy | undefined;
      factor?: number | undefined;
    }) => {
      asyncEnabled?: boolean | undefined;
      deletionStrategy?: import('./collections/index.js').ReplicationDeletionStrategy | undefined;
      factor?: number | undefined;
    };
    sharding: (options: {
      virtualPerPhysical?: number | undefined;
      desiredCount?: number | undefined;
      desiredVirtualCount?: number | undefined;
    }) => import('./collections/index.js').ShardingConfigCreate;
  };
  configGuards: {
    quantizer: typeof import('./collections/index.js').Quantizer;
    vectorIndex: typeof import('./collections/index.js').VectorIndex;
  };
  reconfigure: {
    vectorIndex: {
      flat: (options: {
        vectorCacheMaxObjects?: number | undefined;
        quantizer?: import('./collections/index.js').BQConfigUpdate | undefined;
      }) => import('./collections/index.js').ModuleConfig<
        'flat',
        import('./collections/index.js').VectorIndexConfigFlatUpdate
      >;
      hnsw: (options: {
        dynamicEfFactor?: number | undefined;
        dynamicEfMax?: number | undefined;
        dynamicEfMin?: number | undefined;
        ef?: number | undefined;
        flatSearchCutoff?: number | undefined;
        quantizer?:
          | import('./collections/index.js').PQConfigUpdate
          | import('./collections/index.js').BQConfigUpdate
          | import('./collections/index.js').SQConfigUpdate
          | undefined;
        vectorCacheMaxObjects?: number | undefined;
      }) => import('./collections/index.js').ModuleConfig<
        'hnsw',
        import('./collections/index.js').VectorIndexConfigHNSWUpdate
      >;
      quantizer: {
        bq: (
          options?:
            | {
                cache?: boolean | undefined;
                rescoreLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').BQConfigUpdate;
        pq: (
          options?:
            | {
                centroids?: number | undefined;
                pqEncoderDistribution?: import('./collections/index.js').PQEncoderDistribution | undefined;
                pqEncoderType?: import('./collections/index.js').PQEncoderType | undefined;
                segments?: number | undefined;
                trainingLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').PQConfigUpdate;
        sq: (
          options?:
            | {
                rescoreLimit?: number | undefined;
                trainingLimit?: number | undefined;
              }
            | undefined
        ) => import('./collections/index.js').SQConfigUpdate;
      };
    };
    invertedIndex: (options: {
      bm25b?: number | undefined;
      bm25k1?: number | undefined;
      cleanupIntervalSeconds?: number | undefined;
      stopwordsPreset?: 'none' | 'en' | undefined;
      stopwordsAdditions?: string[] | undefined;
      stopwordsRemovals?: string[] | undefined;
    }) => import('./collections/index.js').InvertedIndexConfigUpdate;
    vectorizer: {
      update: <N_23 extends string | undefined, I_23 extends string>(
        options: import('./collections/index.js').VectorizerUpdateOptions<N_23, I_23>
      ) => import('./collections/index.js').VectorConfigUpdate<N_23, I_23>;
    };
    replication: (options: {
      asyncEnabled?: boolean | undefined;
      deletionStrategy?: import('./collections/index.js').ReplicationDeletionStrategy | undefined;
      factor?: number | undefined;
    }) => import('./collections/index.js').ReplicationConfigUpdate;
  };
};
export default app;
export * from './collections/index.js';
export * from './connection/index.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
export {
  AccessTokenCredentialsInput,
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthCredentials,
  AuthUserPasswordCredentials,
  Backend,
  BackupCompressionLevel,
  BackupStatus,
  ClientCredentialsInput,
  ConsistencyLevel,
  ProxiesParams,
  TimeoutParams,
  UserPasswordCredentialsInput,
  weaviateV2,
};
