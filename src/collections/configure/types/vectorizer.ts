import { VectorIndexConfigCreateType, VectorIndexConfigUpdateType } from './vectorIndex.js';
import { ModuleConfig, VectorIndexType, Vectorizer, VectorizerConfigType } from '../../config/types/index.js';
import { PrimitiveKeys } from '../../types/internal.js';

export type NamedVectorizerCreateOptions<P, I, V> = {
  properties?: P;
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
  vectorizerConfig?: ModuleConfig<V, VectorizerConfigType<V>>;
};

export type NamedVectorizerUpdateOptions<I> = {
  vectorIndexConfig: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type NamedVectorConfigCreate<P, N extends string, I extends VectorIndexType, V extends Vectorizer> = {
  vectorName: N;
  properties?: P;
  vectorizer: ModuleConfig<V, VectorizerConfigType<V> | undefined>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};

export type NamedVectorConfigUpdate<N extends string, I extends VectorIndexType> = {
  vectorName: N;
  vectorIndex: ModuleConfig<I, VectorIndexConfigUpdateType<I>>;
};

export type VectorizersConfigCreate<T> =
  | NamedVectorConfigCreate<PrimitiveKeys<T>[], 'default', VectorIndexType, Vectorizer>
  | NamedVectorConfigCreate<PrimitiveKeys<T>[], string, VectorIndexType, Vectorizer>[];
