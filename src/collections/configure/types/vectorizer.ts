import { VectorIndexConfigCreateType } from './vectorIndex';
import { ModuleConfig, VectorIndexType, Vectorizer, VectorizerConfigType } from '../../config/types';

export type NamedVectorizerOptionsCreate<C, I, P> = {
  properties?: P;
  vectorizerConfig?: C;
  vectorIndexConfig?: VectorIndexConfigCreateType<I>;
};

export interface NamedVectorConfigCreate<
  P,
  N extends string,
  I extends VectorIndexType,
  V extends Vectorizer
> {
  vectorName: N;
  properties?: P;
  vectorizer: ModuleConfig<V, VectorizerConfigType<V>>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
}
