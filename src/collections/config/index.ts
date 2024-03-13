import Connection from '../../connection';
import {
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateBM25Config,
  WeaviateStopwordConfig,
  WeaviateModuleConfig,
  WeaviateMultiTenancyConfig,
  WeaviateReplicationConfig,
  WeaviateShardingConfig,
  WeaviateShardStatus,
  WeaviateVectorIndexConfig,
  WeaviateProperty,
  WeaviateVectorConfig,
  WeaviateNestedProperty,
} from '../../openapi/types';
import { ClassGetter, PropertyCreator, ShardUpdater, ShardsUpdater } from '../../schema';
import ShardsGetter from '../../schema/shardsGetter';
import {
  BQConfig,
  CollectionConfig,
  GenerativeConfig,
  InvertedIndexConfig,
  MultiTenancyConfig,
  PQConfig,
  PQEncoderConfig,
  PQEncoderDistribution,
  PQEncoderType,
  PropertyConfig,
  PropertyVectorizerConfig,
  ReferenceConfig,
  ReplicationConfig,
  RerankerConfig,
  ShardingConfig,
  VectorConfig,
  VectorDistance,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
  VectorIndexConfigType,
  VectorizerConfig,
} from './types';
import {
  NestedPropertyConfigCreate,
  PropertyConfigCreate,
  ReferenceConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
} from '../configure/types';

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
  static generative<G>(v?: WeaviateModuleConfig): GenerativeConfig | undefined {
    if (!populated(v)) return undefined;
    const generativeKey = Object.keys(v).find((k) => k.includes('generative'));
    if (generativeKey === undefined) return undefined;
    if (!generativeKey) throw new Error('Generative config was not returned by Weaviate');
    return v[generativeKey] as GenerativeConfig;
  }
  static reranker(v?: WeaviateModuleConfig): RerankerConfig | undefined {
    if (!populated(v)) return undefined;
    const rerankerKey = Object.keys(v).find((k) => k.includes('reranker'));
    if (rerankerKey === undefined) return undefined;
    return v[rerankerKey] as RerankerConfig;
  }
  private static namedVectors(v: WeaviateVectorConfig): VectorConfig {
    if (!populated(v)) throw new Error('Vector config was not returned by Weaviate');
    const out: VectorConfig = {};
    Object.keys(v).forEach((key) => {
      const vectorizer = v[key].vectorizer;
      if (!populated(vectorizer))
        throw new Error(`Vectorizer was not returned by Weaviate for ${key} named vector`);
      const vectorizerNames = Object.keys(vectorizer);
      if (vectorizerNames.length !== 1)
        throw new Error(
          `Expected exactly one vectorizer for ${key} named vector, got ${vectorizerNames.length}`
        );
      const vectorizerName = vectorizerNames[0];
      const { properties, ...rest } = vectorizer[vectorizerName] as any;
      out[key] = {
        vectorizer: {
          name: vectorizerName,
          config: rest,
        },
        properties: properties,
        indexConfig: ConfigGuards.vectorIndex(v[key].vectorIndexConfig, v[key].vectorIndexType),
        indexType: ConfigGuards.vectorIndexType(v[key].vectorIndexType),
      };
    });
    return out;
  }
  static vectorizer(v?: WeaviateClass): VectorConfig {
    if (!populated(v)) throw new Error('Schema was not returned by Weaviate');
    if (populated(v.vectorConfig)) {
      return ConfigGuards.namedVectors(v.vectorConfig);
    }
    if (!populated(v.vectorizer)) throw new Error('Vectorizer was not returned by Weaviate');
    return {
      default: {
        vectorizer:
          v.vectorizer === 'none'
            ? {
                name: 'none',
                config: undefined,
              }
            : {
                name: v.vectorizer,
                config: v.moduleConfig ? (v.moduleConfig[v.vectorizer] as VectorizerConfig) : undefined,
              },
        indexConfig: ConfigGuards.vectorIndex(v.vectorIndexConfig, v.vectorIndexType),
        indexType: ConfigGuards.vectorIndexType(v.vectorIndexType),
      },
    };
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
  static pq(v?: Record<string, unknown>): PQConfig | undefined {
    if (v === undefined) throw new Error('PQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled)) throw new Error('PQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    if (!exists<boolean>(v.bitCompression))
      throw new Error('PQ bit compression was not returned by Weaviate');
    if (!exists<number>(v.segments)) throw new Error('PQ segments was not returned by Weaviate');
    if (!exists<number>(v.trainingLimit)) throw new Error('PQ training limit was not returned by Weaviate');
    if (!exists<number>(v.centroids)) throw new Error('PQ centroids was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.encoder))
      throw new Error('PQ encoder was not returned by Weaviate');
    return {
      bitCompression: v.bitCompression,
      segments: v.segments,
      centroids: v.centroids,
      trainingLimit: v.trainingLimit,
      encoder: ConfigGuards.pqEncoder(v.encoder),
      type: 'pq',
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
    let quantizer: PQConfig | BQConfig | undefined;
    if (exists<Record<string, any>>(v.pq) && v.pq.enabled === true) {
      quantizer = ConfigGuards.pq(v.pq);
    } else if (exists<Record<string, any>>(v.bq) && v.bq.enabled === true) {
      quantizer = ConfigGuards.bq(v.bq);
    } else {
      quantizer = undefined;
    }
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
      quantizer: quantizer,
      skip: v.skip,
      vectorCacheMaxObjects: v.vectorCacheMaxObjects,
    };
  }
  static bq(v?: Record<string, unknown>): BQConfig | undefined {
    if (v === undefined) throw new Error('BQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled)) throw new Error('BQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    const cache = v.cache === undefined ? false : (v.cache as boolean);
    const rescoreLimit = v.rescoreLimit === undefined ? 1000 : (v.rescoreLimit as number);
    return {
      cache,
      rescoreLimit,
      type: 'bq',
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
      quantizer: ConfigGuards.bq(v.bq),
    };
  }
  static vectorIndex<I>(v: WeaviateVectorIndexConfig, t?: string): VectorIndexConfigType<I> {
    if (t === 'hnsw') {
      return ConfigGuards.vectorIndexHNSW(v) as VectorIndexConfigType<I>;
    } else if (t === 'flat') {
      return ConfigGuards.vectorIndexFlat(v) as VectorIndexConfigType<I>;
    } else {
      return v as VectorIndexConfigType<I>;
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
          vectorizerConfig: prop.moduleConfig
            ? 'none' in prop.moduleConfig
              ? undefined
              : (prop.moduleConfig as PropertyVectorizerConfig)
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

export const classToCollection = <T>(cls: WeaviateClass): CollectionConfig<T> => {
  return {
    name: ConfigGuards._name(cls.class),
    description: cls.description,
    generative: ConfigGuards.generative(cls.moduleConfig),
    invertedIndex: ConfigGuards.invertedIndex(cls.invertedIndexConfig),
    multiTenancy: ConfigGuards.multiTenancy(cls.multiTenancyConfig),
    properties: ConfigGuards.properties(cls.properties),
    references: ConfigGuards.references(cls.properties),
    replication: ConfigGuards.replication(cls.replicationConfig),
    reranker: ConfigGuards.reranker(cls.moduleConfig),
    sharding: ConfigGuards.sharding(cls.shardingConfig),
    vectorizer: ConfigGuards.vectorizer(cls),
  };
};

export class ReferenceTypeGuards {
  static isSingleTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceSingleTargetConfigCreate<T> {
    return (ref as ReferenceSingleTargetConfigCreate<T>).targetCollection !== undefined;
  }
  static isMultiTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceMultiTargetConfigCreate<T> {
    return (ref as ReferenceMultiTargetConfigCreate<T>).targetCollections !== undefined;
  }
}

export const resolveProperty = <T>(
  prop: PropertyConfigCreate<T>,
  vectorizers?: string[]
): WeaviateProperty => {
  const { dataType, nestedProperties, skipVectorisation, vectorizePropertyName, ...rest } = prop;
  const moduleConfig: any = {};
  vectorizers?.forEach((vectorizer) => {
    moduleConfig[vectorizer] = {
      skip: skipVectorisation === undefined ? false : skipVectorisation,
      vectorizePropertyName: vectorizePropertyName === undefined ? true : vectorizePropertyName,
    };
  });
  return {
    ...rest,
    dataType: [dataType],
    nestedProperties: nestedProperties
      ? nestedProperties.map((prop) => resolveNestedProperty(prop))
      : undefined,
    moduleConfig: Object.keys(moduleConfig).length > 0 ? moduleConfig : undefined,
  };
};

const resolveNestedProperty = <T, D>(prop: NestedPropertyConfigCreate<T, D>): WeaviateNestedProperty => {
  const { dataType, nestedProperties, ...rest } = prop;
  return {
    ...rest,
    dataType: [dataType],
    nestedProperties: nestedProperties ? nestedProperties.map(resolveNestedProperty) : undefined,
  };
};

export const resolveReference = <T>(
  ref: ReferenceSingleTargetConfigCreate<T> | ReferenceMultiTargetConfigCreate<T>
): WeaviateProperty => {
  if (ReferenceTypeGuards.isSingleTarget(ref)) {
    const { targetCollection, ...rest } = ref;
    return {
      ...rest,
      dataType: [targetCollection],
    };
  } else {
    const { targetCollections, ...rest } = ref;
    return {
      ...rest,
      dataType: targetCollections,
    };
  }
};

const config = <T>(connection: Connection, name: string, tenant?: string): Config<T> => {
  return {
    addProperty: (property: PropertyConfigCreate<T>) =>
      new PropertyCreator(connection)
        .withClassName(name)
        .withProperty(resolveProperty<T>(property, []))
        .do()
        .then(() => {}),
    addReference: (reference: ReferenceSingleTargetConfigCreate<T> | ReferenceMultiTargetConfigCreate<T>) =>
      new PropertyCreator(connection)
        .withClassName(name)
        .withProperty(resolveReference<T>(reference))
        .do()
        .then(() => {}),
    get: () =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<T>),
    getShards: () => {
      let builder = new ShardsGetter(connection).withClassName(name);
      if (tenant) {
        builder = builder.withTenant(tenant);
      }
      return builder.do().then((shards) =>
        shards.map((shard) => {
          if (shard.name === undefined) throw new Error('Shard name was not returned by Weaviate');
          if (shard.status === undefined) throw new Error('Shard status was not returned by Weaviate');
          if (shard.vectorQueueSize === undefined)
            throw new Error('Shard vector queue size was not returned by Weaviate');
          return { name: shard.name, status: shard.status, vectorQueueSize: shard.vectorQueueSize };
        })
      );
    },
    updateShards: async function (status: 'READY' | 'READONLY', names?: string | string[]) {
      let shardNames: string[];
      if (names === undefined) {
        shardNames = await this.getShards().then((shards) => shards.map((s) => s.name));
      } else if (typeof names === 'string') {
        shardNames = [names];
      } else {
        shardNames = names;
      }
      return Promise.all(
        shardNames.map((shardName) =>
          new ShardUpdater(connection).withClassName(name).withShardName(shardName).withStatus(status).do()
        )
      ).then(() => this.getShards());
    },
  };
};

export default config;

export interface Config<T> {
  addProperty: (property: PropertyConfigCreate<T>) => Promise<void>;
  addReference: (
    reference: ReferenceSingleTargetConfigCreate<T> | ReferenceMultiTargetConfigCreate<T>
  ) => Promise<void>;
  get: () => Promise<CollectionConfig<T>>;
  getShards: () => Promise<Required<WeaviateShardStatus>[]>;
  updateShards: (
    status: 'READY' | 'READONLY',
    names?: string | string[]
  ) => Promise<Required<WeaviateShardStatus>[]>;
}
