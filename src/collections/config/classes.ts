/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateReplicationConfig,
  WeaviateVectorsConfig,
  WeaviateVectorIndexConfig,
} from '../../openapi/types.js';
import { CollectionConfigUpdate, VectorIndexType } from './types/index.js';
import {
  InvertedIndexConfigUpdate,
  VectorConfigUpdate,
  ReplicationConfigUpdate,
  VectorIndexConfigFlatUpdate,
  VectorIndexConfigHNSWUpdate,
} from '../configure/types/index.js';
import { QuantizerGuards } from '../configure/parsing.js';

export class MergeWithExisting {
  static schema(current: WeaviateClass, update?: CollectionConfigUpdate): WeaviateClass {
    if (update === undefined) return current;
    if (update.description !== undefined) current.description = update.description;
    if (update.invertedIndex !== undefined)
      current.invertedIndexConfig = MergeWithExisting.invertedIndex(
        current.invertedIndexConfig,
        update.invertedIndex
      );
    if (update.replication !== undefined)
      current.replicationConfig = MergeWithExisting.replication(
        current.replicationConfig!,
        update.replication
      );
    if (update.vectorizer !== undefined) {
      if (Array.isArray(update.vectorizer)) {
        current.vectorConfig = MergeWithExisting.vectors(current.vectorConfig, update.vectorizer);
      } else if (update.vectorizer.name === 'hnsw') {
        current.vectorIndexConfig = MergeWithExisting.hnsw(
          current.vectorIndexConfig,
          update.vectorizer.config
        );
      } else if (update.vectorizer.name === 'flat') {
        current.vectorIndexConfig = MergeWithExisting.flat(
          current.vectorIndexConfig,
          update.vectorizer.config
        );
      } else {
        throw Error(`Cannot update vector index config with unknown type ${update.vectorizer.name}`);
      }
    }
    return current;
  }

  static invertedIndex(
    current: WeaviateInvertedIndexConfig,
    update?: InvertedIndexConfigUpdate
  ): WeaviateInvertedIndexConfig {
    if (current === undefined) throw Error('Inverted index config is missing from the class schema.');
    if (update === undefined) return current;
    const { bm25, stopwords, ...rest } = update;
    const merged = { ...current, ...rest };
    if (bm25 !== undefined) merged.bm25 = { ...current.bm25!, ...bm25 };
    if (stopwords !== undefined) merged.stopwords = { ...current.stopwords!, ...stopwords };
    return merged;
  }

  static replication(
    current: WeaviateReplicationConfig,
    update?: ReplicationConfigUpdate
  ): WeaviateReplicationConfig {
    if (current === undefined) throw Error('Replication config is missing from the class schema.');
    if (update === undefined) return current;
    return { ...current, ...update };
  }

  static vectors(
    current: WeaviateVectorsConfig,
    update?: VectorConfigUpdate<string, VectorIndexType>[]
  ): WeaviateVectorsConfig {
    if (current === undefined) throw Error('Vector index config is missing from the class schema.');
    if (update === undefined) return current;
    update.forEach((v) => {
      const existing = current[v.vectorName];
      if (existing !== undefined) {
        current[v.vectorName].vectorIndexConfig =
          v.vectorIndex.name === 'hnsw'
            ? MergeWithExisting.hnsw(existing.vectorIndexConfig, v.vectorIndex.config)
            : MergeWithExisting.flat(existing.vectorIndexConfig, v.vectorIndex.config);
      }
    });
    return current;
  }

  static flat(
    current: WeaviateVectorIndexConfig,
    update?: VectorIndexConfigFlatUpdate
  ): WeaviateVectorIndexConfig {
    if (update === undefined) return current;
    if (
      (QuantizerGuards.isPQUpdate(update.quantizer) && (current?.bq as any).enabled) ||
      (QuantizerGuards.isBQUpdate(update.quantizer) && (current?.pq as any).enabled)
    )
      throw Error(`Cannot update the quantizer type of an enabled vector index.`);
    const { quantizer, ...rest } = update;
    const merged: WeaviateVectorIndexConfig = { ...current, ...rest };
    if (QuantizerGuards.isBQUpdate(quantizer)) {
      const { type, ...quant } = quantizer;
      merged.bq = { ...current!.bq!, ...quant, enabled: true };
    }
    return merged;
  }

  static hnsw(
    current: WeaviateVectorIndexConfig,
    update?: VectorIndexConfigHNSWUpdate
  ): WeaviateVectorIndexConfig {
    if (update === undefined) return current;
    if (
      (QuantizerGuards.isBQUpdate(update.quantizer) && ((current?.bq as any) || {}).enabled) ||
      (QuantizerGuards.isPQUpdate(update.quantizer) && ((current?.pq as any) || {}).enabled)
    )
      throw Error(`Cannot update the quantizer type of an enabled vector index.`);
    const { quantizer, ...rest } = update;
    const merged: WeaviateVectorIndexConfig = { ...current, ...rest };
    if (QuantizerGuards.isBQUpdate(quantizer)) {
      const { type, ...quant } = quantizer;
      merged.bq = { ...current!.bq!, ...quant, enabled: true };
    }
    if (QuantizerGuards.isPQUpdate(quantizer)) {
      const { type, ...quant } = quantizer;
      merged.pq = { ...current!.pq!, ...quant, enabled: true };
    }
    return merged;
  }
}
