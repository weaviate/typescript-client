import { VectorIndexConfigCreate, VectorIndexConfigCreateType } from './vectorIndex';
import {
  ModuleConfig,
  VectorIndexType,
  Vectorizer,
  VectorizerConfig,
  VectorizerConfigType,
} from '../../config/types';
import { PrimitiveKeys } from '../../types/internal';

export type NamedVectorizerOptionsCreate<C, I, T> = {
  properties?: PrimitiveKeys<T>[];
  vectorizerConfig?: C;
  vectorIndexConfig?: VectorIndexConfigCreateType<I>;
};

export interface NamedVectorConfigCreate<
  T,
  N extends string,
  I extends VectorIndexType,
  V extends Vectorizer
> {
  vectorName: N;
  properties?: PrimitiveKeys<T>[];
  vectorizer: ModuleConfig<V, VectorizerConfigType<V>>;
  vectorIndex: ModuleConfig<I, VectorIndexConfigCreateType<I>>;
}
