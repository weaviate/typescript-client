import { VectorIndexConfigCreateType, VectorIndexConfigUpdateType } from './vectorIndex.js';
import {
  Img2VecNeuralConfig,
  ModuleConfig,
  Multi2VecBindConfig,
  Multi2VecClipConfig,
  Multi2VecPalmConfig,
  Ref2VecCentroidConfig,
  Text2VecAWSConfig,
  Text2VecAzureOpenAIConfig,
  Text2VecCohereConfig,
  VectorIndexType,
  Vectorizer,
  VectorizerConfigType,
} from '../../config/types/index.js';
import { PrimitiveKeys } from '../../types/internal.js';

export type NamedVectorizerCreateOptions<P, I, V> = {
  sourceProperties?: P;
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
  vectorizerConfig?: ModuleConfig<V, VectorizerConfigType<V>>;
};

export type NamedVectorizerUpdateOptions<I> = {
  vectorIndexConfig: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type NamedVectorConfigCreate<P, N extends string, I extends VectorIndexType, V extends Vectorizer> = {
  vectorName: N;
  properties?: P[];
  vectorizer: ModuleConfig<V, VectorizerConfigType<V>>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};

export type NamedVectorConfigUpdate<N extends string, I extends VectorIndexType> = {
  vectorName: N;
  vectorIndex: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type VectorizersConfigCreate<T> =
  | NamedVectorConfigCreate<PrimitiveKeys<T>, string, VectorIndexType, Vectorizer>
  | NamedVectorConfigCreate<PrimitiveKeys<T>, string, VectorIndexType, Vectorizer>[];

export type ConfigureNonTextVectorizerOptions<
  I extends VectorIndexType,
  V extends Vectorizer
> = VectorizerConfigType<V> & {
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};

export type ConfigureTextVectorizerOptions<
  T,
  I extends VectorIndexType,
  V extends Vectorizer
> = VectorizerConfigType<V> & {
  sourceProperties?: PrimitiveKeys<T>[];
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};
