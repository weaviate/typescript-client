import { VectorIndexConfigCreateType } from './vectorIndex.js';
import { ModuleConfig, VectorIndexType, Vectorizer, VectorizerConfigType } from '../../config/types/index.js';

export type NamedVectorizerOptions<P, I, V> = {
  properties?: P;
  vectorIndexConfig?: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
  vectorizerConfig?: ModuleConfig<V, VectorizerConfigType<V>>;
};

export type NamedVectorConfigCreate<P, N extends string, I extends VectorIndexType, V extends Vectorizer> = {
  vectorName: N;
  properties?: P;
  vectorizer: ModuleConfig<V, VectorizerConfigType<V> | undefined>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
};
