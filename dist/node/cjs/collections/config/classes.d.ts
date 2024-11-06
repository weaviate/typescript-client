import {
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateReplicationConfig,
  WeaviateVectorIndexConfig,
  WeaviateVectorsConfig,
} from '../../openapi/types.js';
import {
  InvertedIndexConfigUpdate,
  ReplicationConfigUpdate,
  VectorConfigUpdate,
  VectorIndexConfigFlatUpdate,
  VectorIndexConfigHNSWUpdate,
} from '../configure/types/index.js';
import { CollectionConfigUpdate, VectorIndexType } from './types/index.js';
export declare class MergeWithExisting {
  static schema(
    current: WeaviateClass,
    supportsNamedVectors: boolean,
    update?: CollectionConfigUpdate
  ): WeaviateClass;
  static invertedIndex(
    current: WeaviateInvertedIndexConfig,
    update?: InvertedIndexConfigUpdate
  ): WeaviateInvertedIndexConfig;
  static replication(
    current: WeaviateReplicationConfig,
    update?: ReplicationConfigUpdate
  ): WeaviateReplicationConfig;
  static vectors(
    current: WeaviateVectorsConfig,
    update?: VectorConfigUpdate<string, VectorIndexType>[]
  ): WeaviateVectorsConfig;
  static flat(
    current: WeaviateVectorIndexConfig,
    update?: VectorIndexConfigFlatUpdate
  ): WeaviateVectorIndexConfig;
  static hnsw(
    current: WeaviateVectorIndexConfig,
    update?: VectorIndexConfigHNSWUpdate
  ): WeaviateVectorIndexConfig;
}
