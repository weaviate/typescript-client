import Connection from '../connection';
import {
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateBM25Config,
  WeaviateStopwordConfig,
  WeaviateModuleConfig,
  WeaviateMultiTenancyConfig,
  WeaviateReplicationConfig,
  WeaviateShardingConfig,
  WeaviateVectorIndexConfig,
  WeaviateProperty,
} from '../openapi/types';
import { ClassDeleter, ClassGetter } from '../schema';
import {
  BQConfig,
  CollectionConfig,
  GenerativeConfig,
  GenerativeSearches,
  InvertedIndexConfig,
  MultiTenancyConfig,
  NonRefs,
  PQConfig,
  PQEncoderConfig,
  PQEncoderDistribution,
  PQEncoderType,
  Properties,
  PropertyConfig,
  ReferenceConfig,
  Refs,
  ReplicationConfig,
  RerankerConfig,
  Rerankers,
  ShardingConfig,
  VectorDistance,
  VectorIndexConfig,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
  VectorIndexType,
  VectorizerConfig,
  Vectorizers,
} from './types';

function populated<T>(v: T | null | undefined): v is T {
  return v !== undefined && v !== null;
}

function exists<T>(v: any): v is T {
  return v !== undefined && v !== null;
}

class ConfigGuards {
  static _name(v?: string): string {
    if (v === undefined) throw new Error('Collection name was not returned by Weaviate');
    return v;
  }
  static bm25(v?: WeaviateBM25Config): InvertedIndexConfig['bm25'] {
    if (v === undefined) throw new Error('BM25 was not returned by Weaviate');
    if (!populated(v.b)) throw new Error('BM25 b was not returned by Weaviate');
    if (!populated(v.k1)) throw new Error('BM25 k1 was not returned by Weaviate');
    return {
      b: v.b,
      k1: v.k1,
    };
  }
  static stopwords(v?: WeaviateStopwordConfig): InvertedIndexConfig['stopwords'] {
    if (v === undefined) throw new Error('Stopwords were not returned by Weaviate');
    return {
      additions: v.additions ? v.additions : [],
      preset: v.preset ? v.preset : 'none',
      removals: v.removals ? v.removals : [],
    };
  }
  static generative<G>(v?: WeaviateModuleConfig): GenerativeConfig<G> {
    if (!populated(v)) return undefined as GenerativeConfig<G>;
    const generativeKey = Object.keys(v).find((k) => k.includes('generative'));
    if (generativeKey === undefined) return undefined as GenerativeConfig<G>;
    if (!generativeKey) throw new Error('Generative config was not returned by Weaviate');
    return v[generativeKey] as GenerativeConfig<G>;
  }
  static reranker<R>(v?: WeaviateModuleConfig): RerankerConfig<R> {
    if (!populated(v)) return undefined as RerankerConfig<R>;
    const rerankerKey = Object.keys(v).find((k) => k.includes('reranker'));
    if (rerankerKey === undefined) return undefined as RerankerConfig<R>;
    if (!rerankerKey) throw new Error('Reranker config was not returned by Weaviate');
    return v[rerankerKey] as RerankerConfig<R>;
  }
  static vectorizer<V>(v?: WeaviateClass): VectorizerConfig<V> {
    if (!populated(v)) throw new Error('Vectorizers were not returned by Weaviate');
    if (!populated(v.vectorizer)) throw new Error('Vectorizer was not returned by Weaviate');
    if (v.vectorizer === 'none') {
      return undefined as VectorizerConfig<V>;
    } else {
      if (!populated(v.moduleConfig))
        throw new Error('Vectorizer module config was not returned by Weaviate');
      return v.moduleConfig[v.vectorizer] as VectorizerConfig<V>;
    }
  }
  static invertedIndex(v?: WeaviateInvertedIndexConfig): InvertedIndexConfig {
    if (v === undefined) throw new Error('Inverted index was not returned by Weaviate');
    if (!populated(v.cleanupIntervalSeconds))
      throw new Error('Inverted index cleanup interval was not returned by Weaviate');
    return {
      bm25: ConfigGuards.bm25(v.bm25),
      cleanupIntervalSeconds: v.cleanupIntervalSeconds,
      stopwords: ConfigGuards.stopwords(v.stopwords),
      indexNullState: v.indexNullState ? v.indexNullState : false,
      indexPropertyLength: v.indexPropertyLength ? v.indexPropertyLength : false,
      indexTimestamps: v.indexTimestamps ? v.indexTimestamps : false,
    };
  }
  static multiTenancy(v?: WeaviateMultiTenancyConfig): MultiTenancyConfig {
    if (v === undefined) throw new Error('Multi tenancy was not returned by Weaviate');
    return {
      enabled: v.enabled ? v.enabled : false,
    };
  }
  static replication(v?: WeaviateReplicationConfig): ReplicationConfig {
    if (v === undefined) throw new Error('Replication was not returned by Weaviate');
    if (!populated(v.factor)) throw new Error('Replication factor was not returned by Weaviate');
    return {
      factor: v.factor,
    };
  }
  static sharding(v?: WeaviateShardingConfig): ShardingConfig {
    if (v === undefined) throw new Error('Sharding was not returned by Weaviate');
    if (!exists<number>(v.virtualPerPhysical))
      throw new Error('Sharding enabled was not returned by Weaviate');
    if (!exists<number>(v.desiredCount))
      throw new Error('Sharding desired count was not returned by Weaviate');
    if (!exists<number>(v.actualCount)) throw new Error('Sharding actual count was not returned by Weaviate');
    if (!exists<number>(v.desiredVirtualCount))
      throw new Error('Sharding desired virtual count was not returned by Weaviate');
    if (!exists<number>(v.actualVirtualCount))
      throw new Error('Sharding actual virtual count was not returned by Weaviate');
    if (!exists<'_id'>(v.key)) throw new Error('Sharding key was not returned by Weaviate');
    if (!exists<'hash'>(v.strategy)) throw new Error('Sharding strategy was not returned by Weaviate');
    if (!exists<'murmur3'>(v.function)) throw new Error('Sharding function was not returned by Weaviate');
    return {
      virtualPerPhysical: v.virtualPerPhysical,
      desiredCount: v.desiredCount,
      actualCount: v.actualCount,
      desiredVirtualCount: v.desiredVirtualCount,
      actualVirtualCount: v.actualVirtualCount,
      key: v.key,
      strategy: v.strategy,
      function: v.function,
    };
  }
  static pqEncoder(v?: Record<string, unknown>): PQEncoderConfig {
    if (v === undefined) throw new Error('PQ encoder was not returned by Weaviate');
    if (!exists<PQEncoderType>(v.type)) throw new Error('PQ encoder name was not returned by Weaviate');
    if (!exists<PQEncoderDistribution>(v.distribution))
      throw new Error('PQ encoder distribution was not returned by Weaviate');
    return {
      type: v.type,
      distribution: v.distribution,
    };
  }
  static pq(v?: Record<string, unknown>): PQConfig {
    if (v === undefined) throw new Error('PQ was not returned by Weaviate');
    if (!exists<boolean>(v.bitCompression))
      throw new Error('PQ bit compression was not returned by Weaviate');
    if (!exists<boolean>(v.enabled)) throw new Error('PQ enabled was not returned by Weaviate');
    if (!exists<number>(v.segments)) throw new Error('PQ segments was not returned by Weaviate');
    if (!exists<number>(v.trainingLimit)) throw new Error('PQ training limit was not returned by Weaviate');
    if (!exists<number>(v.centroids)) throw new Error('PQ centroids was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.encoder))
      throw new Error('PQ encoder was not returned by Weaviate');
    return {
      bitCompression: v.bitCompression,
      enabled: v.enabled,
      segments: v.segments,
      centroids: v.centroids,
      trainingLimit: v.trainingLimit,
      encoder: ConfigGuards.pqEncoder(v.encoder),
    };
  }
  static vectorIndexHNSW(v: WeaviateVectorIndexConfig): VectorIndexConfigHNSW {
    if (v === undefined) throw new Error('Vector index was not returned by Weaviate');
    if (!exists<number>(v.cleanupIntervalSeconds))
      throw new Error('Vector index cleanup interval was not returned by Weaviate');
    if (!exists<VectorDistance>(v.distance))
      throw new Error('Vector index distance was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfMin))
      throw new Error('Vector index dynamic ef min was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfMax))
      throw new Error('Vector index dynamic ef max was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfFactor))
      throw new Error('Vector index dynamic ef factor was not returned by Weaviate');
    if (!exists<number>(v.ef)) throw new Error('Vector index ef was not returned by Weaviate');
    if (!exists<number>(v.efConstruction))
      throw new Error('Vector index ef construction was not returned by Weaviate');
    if (!exists<number>(v.flatSearchCutoff))
      throw new Error('Vector index flat search cut off was not returned by Weaviate');
    if (!exists<number>(v.maxConnections))
      throw new Error('Vector index max connections was not returned by Weaviate');
    if (!exists<boolean>(v.skip)) throw new Error('Vector index skip was not returned by Weaviate');
    if (!exists<number>(v.vectorCacheMaxObjects))
      throw new Error('Vector index vector cache max objects was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.pq))
      throw new Error('Vector index pq was not returned by Weaviate');
    return {
      cleanupIntervalSeconds: v.cleanupIntervalSeconds,
      distance: v.distance,
      dynamicEfMin: v.dynamicEfMin,
      dynamicEfMax: v.dynamicEfMax,
      dynamicEfFactor: v.dynamicEfFactor,
      ef: v.ef,
      efConstruction: v.efConstruction,
      flatSearchCutoff: v.flatSearchCutoff,
      maxConnections: v.maxConnections,
      pq: ConfigGuards.pq(v.pq),
      skip: v.skip,
      vectorCacheMaxObjects: v.vectorCacheMaxObjects,
    };
  }
  static bq(v?: Record<string, unknown>): BQConfig {
    if (v === undefined) throw new Error('BQ was not returned by Weaviate');
    if (!exists<boolean>(v.cache)) throw new Error('BQ cache was not returned by Weaviate');
    if (!exists<number>(v.rescoreLimit)) throw new Error('BQ rescore limit was not returned by Weaviate');
    return {
      cache: v.cache,
      rescoreLimit: v.rescoreLimit,
    };
  }
  static vectorIndexFlat(v: WeaviateVectorIndexConfig): VectorIndexConfigFlat {
    if (v === undefined) throw new Error('Vector index was not returned by Weaviate');
    if (!exists<number>(v.vectorCacheMaxObjects))
      throw new Error('Vector index vector cache max objects was not returned by Weaviate');
    if (!exists<VectorDistance>(v.distance))
      throw new Error('Vector index distance was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.bq))
      throw new Error('Vector index bq was not returned by Weaviate');
    return {
      vectorCacheMaxObjects: v.vectorCacheMaxObjects,
      distance: v.distance,
      bq: ConfigGuards.bq(v.bq),
    };
  }
  static vectorIndex<I>(v: WeaviateVectorIndexConfig, t?: string): VectorIndexConfig<I> {
    if (t === undefined) throw new Error('Vector index type was not returned by Weaviate');
    if (t === 'hnsw') {
      return ConfigGuards.vectorIndexHNSW(v) as VectorIndexConfig<I>;
    } else {
      return ConfigGuards.vectorIndexFlat(v) as VectorIndexConfig<I>;
    }
  }
  static vectorIndexType<I>(v?: string): I {
    if (!populated(v)) throw new Error('Vector index type was not returned by Weaviate');
    return v as I;
  }
  static properties(v?: WeaviateProperty[]): PropertyConfig[] {
    if (v === undefined) throw new Error('Properties were not returned by Weaviate');
    if (v === null) return [];
    return v
      .filter((prop) => {
        if (!populated(prop.dataType)) throw new Error('Property data type was not returned by Weaviate');
        return prop.dataType[0][0].toLowerCase() === prop.dataType[0][0]; // primitive property, e.g. text
      })
      .map((prop) => {
        if (!populated(prop.name)) throw new Error('Property name was not returned by Weaviate');
        if (!populated(prop.dataType)) throw new Error('Property data type was not returned by Weaviate');
        return {
          name: prop.name,
          dataType: prop.dataType[0],
          description: prop.description,
          indexFilterable: prop.indexFilterable ? prop.indexFilterable : false,
          indexInverted: prop.indexInverted ? prop.indexInverted : false,
          indexSearchable: prop.indexSearchable ? prop.indexSearchable : false,
          moduleConfig: prop.moduleConfig
            ? 'none' in prop.moduleConfig
              ? undefined
              : prop.moduleConfig
            : undefined,
          nestedProperties: prop.nestedProperties
            ? ConfigGuards.properties(prop.nestedProperties)
            : undefined,
          tokenization: prop.tokenization ? prop.tokenization : 'none',
        };
      });
  }
  static references(v?: WeaviateProperty[]): ReferenceConfig[] {
    if (v === undefined) throw new Error('Properties were not returned by Weaviate');
    if (v === null) return [];
    return v
      .filter((prop) => {
        if (!populated(prop.dataType)) throw new Error('Reference data type was not returned by Weaviate');
        return prop.dataType[0][0].toLowerCase() !== prop.dataType[0][0]; // reference property, e.g. Myclass
      })
      .map((prop) => {
        if (!populated(prop.name)) throw new Error('Reference name was not returned by Weaviate');
        if (!populated(prop.dataType)) throw new Error('Reference data type was not returned by Weaviate');
        return {
          name: prop.name,
          description: prop.description,
          targetCollections: prop.dataType,
        };
      });
  }
}

export const classToCollection = <T, I, G, R, V>(cls: WeaviateClass): CollectionConfig<T, I, G, R, V> => {
  return {
    name: ConfigGuards._name(cls.class),
    description: cls.description,
    generative: ConfigGuards.generative<G>(cls.moduleConfig),
    invertedIndex: ConfigGuards.invertedIndex(cls.invertedIndexConfig),
    multiTenancy: ConfigGuards.multiTenancy(cls.multiTenancyConfig),
    properties: ConfigGuards.properties(cls.properties),
    references: ConfigGuards.references(cls.properties),
    replication: ConfigGuards.replication(cls.replicationConfig),
    reranker: ConfigGuards.reranker<R>(cls.moduleConfig),
    sharding: ConfigGuards.sharding(cls.shardingConfig),
    vectorIndex: ConfigGuards.vectorIndex<I>(cls.vectorIndexConfig, cls.vectorIndexType),
    vectorIndexType: ConfigGuards.vectorIndexType<I>(cls.vectorIndexType),
    vectorizer: ConfigGuards.vectorizer<V>(cls),
  };
};

const config = <T extends Properties>(connection: Connection, name: string): Config<T> => {
  return {
    get: <
      VectorIndex extends VectorIndexType,
      GenerativeModule extends GenerativeSearches,
      RerankerModule extends Rerankers,
      VectorizerModule extends Vectorizers
    >() =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<T, VectorIndex, GenerativeModule, RerankerModule, VectorizerModule>),
  };
};

export default config;

export interface Config<T extends Properties> {
  get: <
    IndexType extends VectorIndexType = string,
    GenerativeModule extends GenerativeSearches = string,
    RerankerModule extends Rerankers = string,
    VectorizerModule extends Vectorizers = string
  >() => Promise<CollectionConfig<T, IndexType, GenerativeModule, RerankerModule, VectorizerModule>>;
}
