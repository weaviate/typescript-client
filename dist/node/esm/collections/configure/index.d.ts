import {
  InvertedIndexConfigCreate,
  InvertedIndexConfigUpdate,
  MultiTenancyConfigCreate,
  ReplicationConfigCreate,
  ReplicationConfigUpdate,
  ReplicationDeletionStrategy,
  ShardingConfigCreate,
  VectorConfigUpdate,
  VectorizerUpdateOptions,
} from '../types/index.js';
import generative from './generative.js';
import reranker from './reranker.js';
import { configure as configureVectorIndex } from './vectorIndex.js';
import { vectorizer } from './vectorizer.js';
declare const dataType: {
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
declare const tokenization: {
  WORD: 'word';
  LOWERCASE: 'lowercase';
  WHITESPACE: 'whitespace';
  FIELD: 'field';
  TRIGRAM: 'trigram';
  GSE: 'gse';
  KAGOME_KR: 'kagome_kr';
};
declare const vectorDistances: {
  COSINE: 'cosine';
  DOT: 'dot';
  HAMMING: 'hamming';
  L2_SQUARED: 'l2-squared';
};
declare const configure: {
  generative: {
    anthropic(
      config?: import('../types/index.js').GenerativeAnthropicConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-anthropic',
      import('../types/index.js').GenerativeAnthropicConfig | undefined
    >;
    anyscale(
      config?: import('../types/index.js').GenerativeAnyscaleConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-anyscale',
      import('../types/index.js').GenerativeAnyscaleConfig | undefined
    >;
    aws(
      config: import('../types/index.js').GenerativeAWSConfig
    ): import('../types/index.js').ModuleConfig<
      'generative-aws',
      import('../types/index.js').GenerativeAWSConfig
    >;
    azureOpenAI: (
      config: import('./types/generative.js').GenerativeAzureOpenAIConfigCreate
    ) => import('../types/index.js').ModuleConfig<
      'generative-openai',
      import('../types/index.js').GenerativeAzureOpenAIConfig
    >;
    cohere: (
      config?: import('./types/generative.js').GenerativeCohereConfigCreate | undefined
    ) => import('../types/index.js').ModuleConfig<
      'generative-cohere',
      import('../types/index.js').GenerativeCohereConfig | undefined
    >;
    databricks: (
      config: import('../types/index.js').GenerativeDatabricksConfig
    ) => import('../types/index.js').ModuleConfig<
      'generative-databricks',
      import('../types/index.js').GenerativeDatabricksConfig
    >;
    friendliai(
      config?: import('../types/index.js').GenerativeFriendliAIConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-friendliai',
      import('../types/index.js').GenerativeFriendliAIConfig | undefined
    >;
    mistral(
      config?: import('../types/index.js').GenerativeMistralConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-mistral',
      import('../types/index.js').GenerativeMistralConfig | undefined
    >;
    octoai(
      config?: import('../types/index.js').GenerativeOctoAIConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-octoai',
      import('../types/index.js').GenerativeOctoAIConfig | undefined
    >;
    ollama(
      config?: import('../types/index.js').GenerativeOllamaConfig | undefined
    ): import('../types/index.js').ModuleConfig<
      'generative-ollama',
      import('../types/index.js').GenerativeOllamaConfig | undefined
    >;
    openAI: (
      config?: import('./types/generative.js').GenerativeOpenAIConfigCreate | undefined
    ) => import('../types/index.js').ModuleConfig<
      'generative-openai',
      import('../types/index.js').GenerativeOpenAIConfig | undefined
    >;
    palm: (
      config?: import('../types/index.js').GenerativeGoogleConfig | undefined
    ) => import('../types/index.js').ModuleConfig<
      'generative-palm',
      import('../types/index.js').GenerativeGoogleConfig | undefined
    >;
    google: (
      config?: import('../types/index.js').GenerativeGoogleConfig | undefined
    ) => import('../types/index.js').ModuleConfig<
      'generative-google',
      import('../types/index.js').GenerativeGoogleConfig | undefined
    >;
  };
  reranker: {
    cohere: (
      config?: import('../types/index.js').RerankerCohereConfig | undefined
    ) => import('../types/index.js').ModuleConfig<
      'reranker-cohere',
      import('../types/index.js').RerankerCohereConfig | undefined
    >;
    jinaai: (
      config?: import('../types/index.js').RerankerJinaAIConfig | undefined
    ) => import('../types/index.js').ModuleConfig<
      'reranker-jinaai',
      import('../types/index.js').RerankerJinaAIConfig | undefined
    >;
    transformers: () => import('../types/index.js').ModuleConfig<
      'reranker-transformers',
      Record<string, never>
    >;
    voyageAI: (
      config?: import('../types/index.js').RerankerVoyageAIConfig | undefined
    ) => import('../types/index.js').ModuleConfig<
      'reranker-voyageai',
      import('../types/index.js').RerankerVoyageAIConfig | undefined
    >;
  };
  vectorizer: {
    none: <N extends string | undefined = undefined, I extends string = 'hnsw'>(
      opts?:
        | {
            name?: N | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I>
                >
              | undefined;
          }
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N, I, 'none'>;
    img2VecNeural: <N_1 extends string | undefined = undefined, I_1 extends string = 'hnsw'>(
      opts: import('../types/index.js').Img2VecNeuralConfig & {
        name?: N_1 | undefined;
        vectorIndexConfig?:
          | import('../types/index.js').ModuleConfig<
              I_1,
              import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_1>
            >
          | undefined;
      }
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_1, I_1, 'img2vec-neural'>;
    multi2VecBind: <N_2 extends string | undefined = undefined, I_2 extends string = 'hnsw'>(
      opts?:
        | (import('./types/vectorizer.js').Multi2VecBindConfigCreate & {
            name?: N_2 | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_2,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_2>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_2, I_2, 'multi2vec-bind'>;
    multi2VecClip: <N_3 extends string | undefined = undefined, I_3 extends string = 'hnsw'>(
      opts?:
        | (import('./types/vectorizer.js').Multi2VecClipConfigCreate & {
            name?: N_3 | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_3,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_3>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_3, I_3, 'multi2vec-clip'>;
    multi2VecPalm: <N_4 extends string | undefined = undefined, I_4 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureNonTextVectorizerOptions<N_4, I_4, 'multi2vec-palm'>
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_4, I_4, 'multi2vec-palm'>;
    multi2VecGoogle: <N_5 extends string | undefined = undefined, I_5 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureNonTextVectorizerOptions<N_5, I_5, 'multi2vec-google'>
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_5, I_5, 'multi2vec-google'>;
    ref2VecCentroid: <N_6 extends string | undefined = undefined, I_6 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureNonTextVectorizerOptions<N_6, I_6, 'ref2vec-centroid'>
    ) => import('./types/vectorizer.js').VectorConfigCreate<never, N_6, I_6, 'ref2vec-centroid'>;
    text2VecAWS: <T, N_7 extends string | undefined = undefined, I_7 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureTextVectorizerOptions<T, N_7, I_7, 'text2vec-aws'>
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T>,
      N_7,
      I_7,
      'text2vec-aws'
    >;
    text2VecAzureOpenAI: <T_1, N_8 extends string | undefined = undefined, I_8 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureTextVectorizerOptions<
        T_1,
        N_8,
        I_8,
        'text2vec-azure-openai'
      >
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_1>,
      N_8,
      I_8,
      'text2vec-azure-openai'
    >;
    text2VecCohere: <T_2, N_9 extends string | undefined = undefined, I_9 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecCohereConfig & {
            name?: N_9 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_2>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_9,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_9>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_2>,
      N_9,
      I_9,
      'text2vec-cohere'
    >;
    text2VecContextionary: <T_3, N_10 extends string | undefined = undefined, I_10 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecContextionaryConfig & {
            name?: N_10 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_3>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_10,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_10>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_3>,
      N_10,
      I_10,
      'text2vec-contextionary'
    >;
    text2VecDatabricks: <T_4, N_11 extends string | undefined = undefined, I_11 extends string = 'hnsw'>(
      opts: import('./types/vectorizer.js').ConfigureTextVectorizerOptions<
        T_4,
        N_11,
        I_11,
        'text2vec-databricks'
      >
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_4>,
      N_11,
      I_11,
      'text2vec-databricks'
    >;
    text2VecGPT4All: <T_5, N_12 extends string | undefined = undefined, I_12 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecGPT4AllConfig & {
            name?: N_12 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_5>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_12,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_12>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_5>,
      N_12,
      I_12,
      'text2vec-gpt4all'
    >;
    text2VecHuggingFace: <T_6, N_13 extends string | undefined = undefined, I_13 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecHuggingFaceConfig & {
            name?: N_13 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_6>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_13,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_13>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_6>,
      N_13,
      I_13,
      'text2vec-huggingface'
    >;
    text2VecJina: <T_7, N_14 extends string | undefined = undefined, I_14 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecJinaConfig & {
            name?: N_14 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_7>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_14,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_14>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_7>,
      N_14,
      I_14,
      'text2vec-jina'
    >;
    text2VecMistral: <T_8, N_15 extends string | undefined = undefined, I_15 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecMistralConfig & {
            name?: N_15 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_8>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_15,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_15>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_8>,
      N_15,
      I_15,
      'text2vec-mistral'
    >;
    text2VecOctoAI: <T_9, N_16 extends string | undefined = undefined, I_16 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecOctoAIConfig & {
            name?: N_16 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_9>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_16,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_16>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_9>,
      N_16,
      I_16,
      'text2vec-octoai'
    >;
    text2VecOpenAI: <T_10, N_17 extends string | undefined = undefined, I_17 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecOpenAIConfig & {
            name?: N_17 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_10>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_17,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_17>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_10>,
      N_17,
      I_17,
      'text2vec-openai'
    >;
    text2VecOllama: <T_11, N_18 extends string | undefined = undefined, I_18 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecOllamaConfig & {
            name?: N_18 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_11>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_18,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_18>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_11>,
      N_18,
      I_18,
      'text2vec-ollama'
    >;
    text2VecPalm: <T_12, N_19 extends string | undefined = undefined, I_19 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecGoogleConfig & {
            name?: N_19 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_12>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_19,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_19>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_12>,
      N_19,
      I_19,
      'text2vec-palm'
    >;
    text2VecGoogle: <T_13, N_20 extends string | undefined = undefined, I_20 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecGoogleConfig & {
            name?: N_20 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_13>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_20,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_20>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_13>,
      N_20,
      I_20,
      'text2vec-google'
    >;
    text2VecTransformers: <T_14, N_21 extends string | undefined = undefined, I_21 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecTransformersConfig & {
            name?: N_21 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_14>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_21,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_21>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_14>,
      N_21,
      I_21,
      'text2vec-transformers'
    >;
    text2VecVoyageAI: <T_15, N_22 extends string | undefined = undefined, I_22 extends string = 'hnsw'>(
      opts?:
        | (import('../types/index.js').Text2VecVoyageAIConfig & {
            name?: N_22 | undefined;
            sourceProperties?: import('../types/internal.js').PrimitiveKeys<T_15>[] | undefined;
            vectorIndexConfig?:
              | import('../types/index.js').ModuleConfig<
                  I_22,
                  import('./types/vectorIndex.js').VectorIndexConfigCreateType<I_22>
                >
              | undefined;
          })
        | undefined
    ) => import('./types/vectorizer.js').VectorConfigCreate<
      import('../types/internal.js').PrimitiveKeys<T_15>,
      N_22,
      I_22,
      'text2vec-voyageai'
    >;
  };
  vectorIndex: {
    flat: (
      opts?: import('./types/vectorIndex.js').VectorIndexConfigFlatCreateOptions | undefined
    ) => import('../types/index.js').ModuleConfig<
      'flat',
      | {
          distance?: import('../types/index.js').VectorDistance | undefined;
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
      opts?: import('./types/vectorIndex.js').VectorIndexConfigHNSWCreateOptions | undefined
    ) => import('../types/index.js').ModuleConfig<
      'hnsw',
      | {
          cleanupIntervalSeconds?: number | undefined;
          distance?: import('../types/index.js').VectorDistance | undefined;
          dynamicEfMin?: number | undefined;
          dynamicEfMax?: number | undefined;
          dynamicEfFactor?: number | undefined;
          efConstruction?: number | undefined;
          ef?: number | undefined;
          filterStrategy?: import('../types/index.js').VectorIndexFilterStrategy | undefined;
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
                      type?: import('../types/index.js').PQEncoderType | undefined;
                      distribution?: import('../types/index.js').PQEncoderDistribution | undefined;
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
      opts?: import('./types/vectorIndex.js').VectorIndexConfigDynamicCreateOptions | undefined
    ) => import('../types/index.js').ModuleConfig<
      'dynamic',
      | {
          distance?: import('../types/index.js').VectorDistance | undefined;
          threshold?: number | undefined;
          hnsw?:
            | {
                cleanupIntervalSeconds?: number | undefined;
                distance?: import('../types/index.js').VectorDistance | undefined;
                dynamicEfMin?: number | undefined;
                dynamicEfMax?: number | undefined;
                dynamicEfFactor?: number | undefined;
                efConstruction?: number | undefined;
                ef?: number | undefined;
                filterStrategy?: import('../types/index.js').VectorIndexFilterStrategy | undefined;
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
                            type?: import('../types/index.js').PQEncoderType | undefined;
                            distribution?: import('../types/index.js').PQEncoderDistribution | undefined;
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
                distance?: import('../types/index.js').VectorDistance | undefined;
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
      ) => import('./types/vectorIndex.js').QuantizerRecursivePartial<import('../types/index.js').BQConfig>;
      pq: (
        options?:
          | {
              bitCompression?: boolean | undefined;
              centroids?: number | undefined;
              encoder?:
                | {
                    distribution?: import('../types/index.js').PQEncoderDistribution | undefined;
                    type?: import('../types/index.js').PQEncoderType | undefined;
                  }
                | undefined;
              segments?: number | undefined;
              trainingLimit?: number | undefined;
            }
          | undefined
      ) => import('./types/vectorIndex.js').QuantizerRecursivePartial<import('../types/index.js').PQConfig>;
      sq: (
        options?:
          | {
              rescoreLimit?: number | undefined;
              trainingLimit?: number | undefined;
            }
          | undefined
      ) => import('./types/vectorIndex.js').QuantizerRecursivePartial<import('../types/index.js').SQConfig>;
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
  /**
   * Create an `InvertedIndexConfigCreate` object to be used when defining the configuration of the keyword searching algorithm of your collection.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} [options.bm25b] The BM25 b parameter.
   * @param {number} [options.bm25k1] The BM25 k1 parameter.
   * @param {number} [options.cleanupIntervalSeconds] The interval in seconds at which the inverted index is cleaned up.
   * @param {boolean} [options.indexTimestamps] Whether to index timestamps.
   * @param {boolean} [options.indexPropertyLength] Whether to index the length of properties.
   * @param {boolean} [options.indexNullState] Whether to index the null state of properties.
   * @param {'en' | 'none'} [options.stopwordsPreset] The stopwords preset to use.
   * @param {string[]} [options.stopwordsAdditions] Additional stopwords to add.
   * @param {string[]} [options.stopwordsRemovals] Stopwords to remove.
   */
  invertedIndex: (options: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    indexTimestamps?: boolean;
    indexPropertyLength?: boolean;
    indexNullState?: boolean;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }) => InvertedIndexConfigCreate;
  /**
   * Create a `MultiTenancyConfigCreate` object to be used when defining the multi-tenancy configuration of your collection.
   *
   * @param {boolean} [options.autoTenantActivation] Whether auto-tenant activation is enabled. Default is false.
   * @param {boolean} [options.autoTenantCreation] Whether auto-tenant creation is enabled. Default is false.
   * @param {boolean} [options.enabled] Whether multi-tenancy is enabled. Default is true.
   */
  multiTenancy: (options?: {
    autoTenantActivation?: boolean;
    autoTenantCreation?: boolean;
    enabled?: boolean;
  }) => MultiTenancyConfigCreate;
  /**
   * Create a `ReplicationConfigCreate` object to be used when defining the replication configuration of your collection.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {boolean} [options.asyncEnabled] Whether asynchronous replication is enabled. Default is false.
   * @param {ReplicationDeletionStrategy} [options.deletionStrategy] The deletion strategy when replication conflicts are detected between deletes and reads.
   * @param {number} [options.factor] The replication factor. Default is 1.
   */
  replication: (options: {
    asyncEnabled?: boolean;
    deletionStrategy?: ReplicationDeletionStrategy;
    factor?: number;
  }) => ReplicationConfigCreate;
  /**
   * Create a `ShardingConfigCreate` object to be used when defining the sharding configuration of your collection.
   *
   * NOTE: You can only use one of Sharding or Replication, not both.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {number} [options.virtualPerPhysical] The number of virtual shards per physical shard.
   * @param {number} [options.desiredCount] The desired number of physical shards.
   * @param {number} [options.desiredVirtualCount] The desired number of virtual shards.
   */
  sharding: (options: {
    virtualPerPhysical?: number;
    desiredCount?: number;
    desiredVirtualCount?: number;
  }) => ShardingConfigCreate;
};
declare const reconfigure: {
  vectorIndex: {
    flat: (options: {
      vectorCacheMaxObjects?: number | undefined;
      quantizer?: import('./types/vectorIndex.js').BQConfigUpdate | undefined;
    }) => import('../types/index.js').ModuleConfig<
      'flat',
      import('./types/vectorIndex.js').VectorIndexConfigFlatUpdate
    >;
    hnsw: (options: {
      dynamicEfFactor?: number | undefined;
      dynamicEfMax?: number | undefined;
      dynamicEfMin?: number | undefined;
      ef?: number | undefined;
      flatSearchCutoff?: number | undefined;
      quantizer?:
        | import('./types/vectorIndex.js').PQConfigUpdate
        | import('./types/vectorIndex.js').BQConfigUpdate
        | import('./types/vectorIndex.js').SQConfigUpdate
        | undefined;
      vectorCacheMaxObjects?: number | undefined;
      /**
       * Create a `ReplicationConfigUpdate` object to be used when defining the replication configuration of Weaviate.
       *
       * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
       *
       * @param {boolean} [options.asyncEnabled] Whether asynchronous replication is enabled.
       * @param {ReplicationDeletionStrategy} [options.deletionStrategy] The deletion strategy when replication conflicts are detected between deletes and reads.
       * @param {number} [options.factor] The replication factor.
       */
    }) => import('../types/index.js').ModuleConfig<
      'hnsw',
      import('./types/vectorIndex.js').VectorIndexConfigHNSWUpdate
    >;
    quantizer: {
      bq: (
        options?:
          | {
              cache?: boolean | undefined;
              rescoreLimit?: number | undefined;
            }
          | undefined
      ) => import('./types/vectorIndex.js').BQConfigUpdate;
      pq: (
        options?:
          | {
              centroids?: number | undefined;
              pqEncoderDistribution?: import('../types/index.js').PQEncoderDistribution | undefined;
              pqEncoderType?: import('../types/index.js').PQEncoderType | undefined;
              segments?: number | undefined;
              trainingLimit?: number | undefined;
            }
          | undefined
      ) => import('./types/vectorIndex.js').PQConfigUpdate;
      sq: (
        options?:
          | {
              rescoreLimit?: number | undefined;
              trainingLimit?: number | undefined;
            }
          | undefined
      ) => import('./types/vectorIndex.js').SQConfigUpdate;
    };
  };
  /**
   * Create an `InvertedIndexConfigUpdate` object to be used when updating the configuration of the keyword searching algorithm of your collection.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/configuration/indexes#configure-the-inverted-index) for details!
   *
   * @param {number} [options.bm25b] The BM25 b parameter.
   * @param {number} [options.bm25k1] The BM25 k1 parameter.
   * @param {number} [options.cleanupIntervalSeconds] The interval in seconds at which the inverted index is cleaned up.
   * @param {'en' | 'none'} [options.stopwordsPreset] The stopwords preset to use.
   * @param {string[]} [options.stopwordsAdditions] Additional stopwords to add.
   * @param {string[]} [options.stopwordsRemovals] Stopwords to remove.
   */
  invertedIndex: (options: {
    bm25b?: number;
    bm25k1?: number;
    cleanupIntervalSeconds?: number;
    stopwordsPreset?: 'en' | 'none';
    stopwordsAdditions?: string[];
    stopwordsRemovals?: string[];
  }) => InvertedIndexConfigUpdate;
  vectorizer: {
    /**
     * Create a `VectorConfigUpdate` object to be used when updating the named vector configuration of Weaviate.
     *
     * @param {string} name The name of the vector.
     * @param {VectorizerOptions} options The options for the named vector.
     */
    update: <N extends string | undefined, I extends string>(
      options: VectorizerUpdateOptions<N, I>
    ) => VectorConfigUpdate<N, I>;
  };
  /**
   * Create a `ReplicationConfigUpdate` object to be used when defining the replication configuration of Weaviate.
   *
   * See [the docs](https://weaviate.io/developers/weaviate/concepts/replication-architecture#replication-vs-sharding) for more details.
   *
   * @param {boolean} [options.asyncEnabled] Whether asynchronous replication is enabled.
   * @param {ReplicationDeletionStrategy} [options.deletionStrategy] The deletion strategy when replication conflicts are detected between deletes and reads.
   * @param {number} [options.factor] The replication factor.
   */
  replication: (options: {
    asyncEnabled?: boolean;
    deletionStrategy?: ReplicationDeletionStrategy;
    factor?: number;
  }) => ReplicationConfigUpdate;
};
export {
  configure,
  dataType,
  generative,
  reconfigure,
  reranker,
  tokenization,
  vectorDistances,
  configureVectorIndex as vectorIndex,
  vectorizer,
};
