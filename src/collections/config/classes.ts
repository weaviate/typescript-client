/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WeaviateInvalidInputError } from '../../errors.js';
import {
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateModuleConfig,
  WeaviateMultiTenancyConfig,
  WeaviateReplicationConfig,
  WeaviateVectorIndexConfig,
  WeaviateVectorsConfig,
} from '../../openapi/types.js';
import { QuantizerGuards } from '../configure/parsing.js';
import {
  InvertedIndexConfigUpdate,
  MultiTenancyConfigUpdate,
  ReplicationConfigUpdate,
  VectorConfigUpdate,
  VectorIndexConfigFlatUpdate,
  VectorIndexConfigHNSWUpdate,
} from '../configure/types/index.js';
import {
  CollectionConfigUpdate,
  GenerativeConfig,
  GenerativeSearch,
  ModuleConfig,
  PropertyDescriptionsUpdate,
  Reranker,
  RerankerConfig,
  VectorIndexType,
} from './types/index.js';

export class MergeWithExisting {
  static schema(
    current: WeaviateClass,
    supportsNamedVectors: boolean,
    update?: CollectionConfigUpdate<any>
  ): WeaviateClass {
    if (update === undefined) return current;
    if (update.description !== undefined) current.description = update.description;
    if (update.propertyDescriptions !== undefined)
      current.properties = MergeWithExisting.properties(current.properties, update.propertyDescriptions);
    if (update.generative !== undefined)
      current.moduleConfig = MergeWithExisting.generative(current.moduleConfig, update.generative);
    if (update.invertedIndex !== undefined)
      current.invertedIndexConfig = MergeWithExisting.invertedIndex(
        current.invertedIndexConfig,
        update.invertedIndex
      );
    if (update.multiTenancy !== undefined)
      current.multiTenancyConfig = MergeWithExisting.multiTenancy(
        current.multiTenancyConfig,
        update.multiTenancy
      );
    if (update.replication !== undefined)
      current.replicationConfig = MergeWithExisting.replication(
        current.replicationConfig!,
        update.replication
      );
    if (update.reranker !== undefined)
      current.moduleConfig = MergeWithExisting.reranker(current.moduleConfig, update.reranker);
    if (update.vectorizers !== undefined) {
      if (Array.isArray(update.vectorizers)) {
        current.vectorConfig = MergeWithExisting.vectors(current.vectorConfig, update.vectorizers);
      } else if (supportsNamedVectors && current.vectorConfig !== undefined) {
        const updateVectorizers = {
          ...update.vectorizers,
          name: 'default',
        };
        current.vectorConfig = MergeWithExisting.vectors(current.vectorConfig, [updateVectorizers]);
      } else {
        current.vectorIndexConfig =
          update.vectorizers?.vectorIndex.name === 'hnsw'
            ? MergeWithExisting.hnsw(current.vectorIndexConfig, update.vectorizers.vectorIndex.config)
            : MergeWithExisting.flat(current.vectorIndexConfig, update.vectorizers.vectorIndex.config);
      }
    }
    return current;
  }

  static properties(
    current: WeaviateClass['properties'],
    update: PropertyDescriptionsUpdate<any>
  ): WeaviateClass['properties'] {
    if (current === undefined) throw Error('Properties are missing from the class schema.');
    if (current.length === 0) return current;
    return current.map((property) => ({
      ...property,
      description: update[property.name!] ?? property.description,
    }));
  }

  static generative(
    current: WeaviateModuleConfig,
    update: ModuleConfig<GenerativeSearch, GenerativeConfig>
  ): WeaviateModuleConfig {
    if (current === undefined) throw Error('Module config is missing from the class schema.');
    if (update === undefined) return current;
    const generative = update.name === 'generative-azure-openai' ? 'generative-openai' : update.name;
    const currentGenerative = current[generative] as Record<string, any>;
    current[generative] = {
      ...currentGenerative,
      ...update.config,
    };
    return current;
  }

  static reranker(
    current: WeaviateModuleConfig,
    update: ModuleConfig<Reranker, RerankerConfig>
  ): WeaviateModuleConfig {
    if (current === undefined) throw Error('Module config is missing from the class schema.');
    if (update === undefined) return current;
    const reranker = current[update.name] as Record<string, any>;
    current[update.name] = {
      ...reranker,
      ...update.config,
    };
    return current;
  }

  static invertedIndex(
    current: WeaviateInvertedIndexConfig,
    update: InvertedIndexConfigUpdate
  ): WeaviateInvertedIndexConfig {
    if (current === undefined) throw Error('Inverted index config is missing from the class schema.');
    if (update === undefined) return current;
    const { bm25, stopwords, ...rest } = update;
    const merged = { ...current, ...rest };
    if (bm25 !== undefined) merged.bm25 = { ...current.bm25!, ...bm25 };
    if (stopwords !== undefined) merged.stopwords = { ...current.stopwords!, ...stopwords };
    return merged;
  }

  static multiTenancy(
    current: WeaviateMultiTenancyConfig,
    update: MultiTenancyConfigUpdate
  ): MultiTenancyConfigUpdate {
    if (current === undefined) throw Error('Multi-tenancy config is missing from the class schema.');
    return { ...current, ...update };
  }

  static replication(
    current: WeaviateReplicationConfig,
    update: ReplicationConfigUpdate
  ): WeaviateReplicationConfig {
    if (current === undefined) throw Error('Replication config is missing from the class schema.');
    return { ...current, ...update };
  }

  static vectors(
    current: WeaviateVectorsConfig,
    update: VectorConfigUpdate<string, VectorIndexType>[]
  ): WeaviateVectorsConfig {
    if (current === undefined) throw Error('Vector index config is missing from the class schema.');
    update.forEach((v) => {
      const existing = current[v.name];
      if (existing !== undefined) {
        current[v.name].vectorIndexConfig =
          v.vectorIndex.name === 'hnsw'
            ? MergeWithExisting.hnsw(existing.vectorIndexConfig, v.vectorIndex.config)
            : MergeWithExisting.flat(existing.vectorIndexConfig, v.vectorIndex.config);
      }
    });
    return current;
  }

  static flat(
    current: WeaviateVectorIndexConfig,
    update: VectorIndexConfigFlatUpdate
  ): WeaviateVectorIndexConfig {
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
    update: VectorIndexConfigHNSWUpdate
  ): WeaviateVectorIndexConfig {
    const hasOtherQuantizerAlready = (quantizer: string) =>
      ['pq', 'bq', 'sq', 'rq'].some(
        (q) => q !== quantizer && (current?.[q as keyof WeaviateVectorIndexConfig] as any)?.enabled
      );
    if (
      (QuantizerGuards.isBQUpdate(update.quantizer) && hasOtherQuantizerAlready('bq')) ||
      (QuantizerGuards.isPQUpdate(update.quantizer) && hasOtherQuantizerAlready('pq')) ||
      (QuantizerGuards.isSQUpdate(update.quantizer) && hasOtherQuantizerAlready('sq')) ||
      (QuantizerGuards.isRQUpdate(update.quantizer) && hasOtherQuantizerAlready('rq'))
    ) {
      throw new WeaviateInvalidInputError(`Cannot update the quantizer type of an enabled vector index.`);
    }
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
    if (QuantizerGuards.isSQUpdate(quantizer)) {
      const { type, ...quant } = quantizer;
      merged.sq = { ...current!.sq!, ...quant, enabled: true };
    }
    if (QuantizerGuards.isRQUpdate(quantizer)) {
      const { type, ...quant } = quantizer;
      merged.rq = { ...current!.rq!, ...quant, enabled: true };
    }
    return merged;
  }
}
