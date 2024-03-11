import { VectorIndexConfigCreate, VectorIndexConfigCreateType } from './vectorIndex';
import { ModuleConfig, VectorIndexType, Vectorizer, VectorizerConfig } from '../../config/types';
import { PrimitiveKeys } from '../../types/internal';

export type NamedVectorizerOptionsCreate<C, I, T> = {
  properties?: PrimitiveKeys<T>[];
  vectorizerConfig?: C;
  vectorIndexConfig?: VectorIndexConfigCreateType<I>;
};

export interface NamedVectorConfigCreate<T, N extends string> {
  vectorName: N;
  properties?: PrimitiveKeys<T>[];
  vectorizer: ModuleConfig<Vectorizer, VectorizerConfig>;
  vectorIndex: ModuleConfig<VectorIndexType, VectorIndexConfigCreate>;
}
