import {
  WeaviateDeserializationError,
  WeaviateInvalidInputError,
  WeaviateUnsupportedFeatureError,
} from '../../errors.js';
import {
  Properties,
  WeaviateBM25Config,
  WeaviateClass,
  WeaviateInvertedIndexConfig,
  WeaviateModuleConfig,
  WeaviateMultiTenancyConfig,
  WeaviateNestedProperty,
  WeaviateProperty,
  WeaviateReplicationConfig,
  WeaviateShardingConfig,
  WeaviateStopwordConfig,
  WeaviateVectorIndexConfig,
  WeaviateVectorsConfig,
} from '../../openapi/types.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { QuantizerGuards } from '../configure/parsing.js';
import {
  PropertyConfigCreate,
  ReferenceConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
  VectorIndexConfigCreate,
  VectorIndexConfigDynamicCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
  VectorizersConfigAdd,
  VectorizersConfigCreate,
} from '../configure/types/index.js';
import {
  BQConfig,
  CollectionConfig,
  GenerativeConfig,
  GenerativeSearch,
  InvertedIndexConfig,
  ModuleConfig,
  MultiTenancyConfig,
  PQConfig,
  PQEncoderConfig,
  PQEncoderDistribution,
  PQEncoderType,
  PropertyConfig,
  PropertyVectorizerConfig,
  RQConfig,
  ReferenceConfig,
  ReplicationConfig,
  Reranker,
  RerankerConfig,
  SQConfig,
  ShardingConfig,
  VectorConfig,
  VectorDistance,
  VectorIndexConfigDynamic,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
  VectorIndexConfigType,
  VectorIndexFilterStrategy,
  VectorIndexType,
  VectorizerConfig,
} from './types/index.js';

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
  const { dataType, nestedProperties, skipVectorization, vectorizePropertyName, ...rest } = prop;
  const moduleConfig: any = {};
  vectorizers?.forEach((vectorizer) => {
    moduleConfig[vectorizer] = {
      skip: skipVectorization === undefined ? false : skipVectorization,
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

const resolveNestedProperty = <T, D>(prop: any): WeaviateNestedProperty => {
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

export const classToCollection = <T>(cls: WeaviateClass): CollectionConfig => {
  return {
    name: ConfigMapping._name(cls.class),
    description: cls.description,
    generative: ConfigMapping.generative(cls.moduleConfig),
    invertedIndex: ConfigMapping.invertedIndex(cls.invertedIndexConfig),
    multiTenancy: ConfigMapping.multiTenancy(cls.multiTenancyConfig),
    properties: ConfigMapping.properties(cls.properties),
    references: ConfigMapping.references(cls.properties),
    replication: ConfigMapping.replication(cls.replicationConfig),
    reranker: ConfigMapping.reranker(cls.moduleConfig),
    sharding: ConfigMapping.sharding(cls.shardingConfig),
    vectorizers: ConfigMapping.vectorizer(cls),
  };
};

export const parseVectorIndex = (module: ModuleConfig<VectorIndexType, VectorIndexConfigCreate>): any => {
  if (module.config === undefined) return undefined;
  if (module.name === 'dynamic') {
    const { hnsw, flat, ...conf } = module.config as VectorIndexConfigDynamicCreate;
    return {
      ...conf,
      hnsw: parseVectorIndex({ name: 'hnsw', config: hnsw }),
      flat: parseVectorIndex({ name: 'flat', config: flat }),
    };
  }
  const { quantizer, ...conf } = module.config as
    | VectorIndexConfigFlatCreate
    | VectorIndexConfigHNSWCreate
    | Record<string, any>;
  if (quantizer === undefined) return conf;
  if (QuantizerGuards.isBQCreate(quantizer)) {
    const { type, ...quant } = quantizer;
    return {
      ...conf,
      bq: {
        ...quant,
        enabled: true,
      },
    };
  }
  if (QuantizerGuards.isPQCreate(quantizer)) {
    const { type, ...quant } = quantizer;
    return {
      ...conf,
      pq: {
        ...quant,
        enabled: true,
      },
    };
  }
  if (QuantizerGuards.isSQCreate(quantizer)) {
    const { type, ...quant } = quantizer;
    return {
      ...conf,
      sq: {
        ...quant,
        enabled: true,
      },
    };
  }
  if (QuantizerGuards.isRQCreate(quantizer)) {
    const { type, ...quant } = quantizer;
    return {
      ...conf,
      rq: {
        ...quant,
        enabled: true,
      },
    };
  }
};

export const parseVectorizerConfig = (config?: VectorizerConfig): any => {
  if (config === undefined) return {};
  const { vectorizeCollectionName, ...rest } = config as any;
  return {
    ...rest,
    vectorizeClassName: vectorizeCollectionName,
  };
};

export const makeVectorsConfig = <TProperties extends Properties | undefined = undefined>(
  configVectorizers: VectorizersConfigCreate<TProperties> | VectorizersConfigAdd<TProperties>,
  supportsDynamicVectorIndex: Awaited<ReturnType<DbVersionSupport['supportsDynamicVectorIndex']>>
) => {
  let vectorizers: string[] = [];
  const vectorsConfig: Record<string, any> = {};
  const vectorizersConfig = Array.isArray(configVectorizers)
    ? configVectorizers
    : [
        {
          ...configVectorizers,
          name: configVectorizers.name || 'default',
        },
      ];
  vectorizersConfig.forEach((v) => {
    if (v.vectorIndex.name === 'dynamic' && !supportsDynamicVectorIndex.supports) {
      throw new WeaviateUnsupportedFeatureError(supportsDynamicVectorIndex.message);
    }
    const vectorConfig: any = {
      vectorIndexConfig: parseVectorIndex(v.vectorIndex),
      vectorIndexType: v.vectorIndex.name,
      vectorizer: {},
    };
    const vectorizer = v.vectorizer.name === 'text2vec-azure-openai' ? 'text2vec-openai' : v.vectorizer.name;
    vectorizers = [...vectorizers, vectorizer];
    vectorConfig.vectorizer[vectorizer] = {
      properties: v.properties,
      ...parseVectorizerConfig(v.vectorizer.config),
    };
    if (v.name === undefined) {
      throw new WeaviateInvalidInputError(
        'vectorName is required for each vectorizer when specifying more than one vectorizer'
      );
    }
    vectorsConfig[v.name] = vectorConfig;
  });
  return { vectorsConfig, vectorizers };
};

function populated<T>(v: T | null | undefined): v is T {
  return v !== undefined && v !== null;
}

function exists<T>(v: any): v is T {
  return v !== undefined && v !== null;
}

class ConfigMapping {
  static _name(v?: string): string {
    if (v === undefined)
      throw new WeaviateDeserializationError('Collection name was not returned by Weaviate');
    return v;
  }
  static bm25(v?: WeaviateBM25Config): InvertedIndexConfig['bm25'] {
    if (v === undefined) throw new WeaviateDeserializationError('BM25 was not returned by Weaviate');
    if (!populated(v.b)) throw new WeaviateDeserializationError('BM25 b was not returned by Weaviate');
    if (!populated(v.k1)) throw new WeaviateDeserializationError('BM25 k1 was not returned by Weaviate');
    return {
      b: v.b,
      k1: v.k1,
    };
  }
  static stopwords(v?: WeaviateStopwordConfig): InvertedIndexConfig['stopwords'] {
    if (v === undefined) throw new WeaviateDeserializationError('Stopwords were not returned by Weaviate');
    return {
      additions: v.additions ? v.additions : [],
      preset: v.preset ? v.preset : 'none',
      removals: v.removals ? v.removals : [],
    };
  }
  static generative<G>(
    v?: WeaviateModuleConfig
  ): ModuleConfig<GenerativeSearch, GenerativeConfig> | undefined {
    if (!populated(v)) return undefined;
    const generativeKey = Object.keys(v).find((k) => k.includes('generative'));
    if (generativeKey === undefined) return undefined;
    if (!generativeKey)
      throw new WeaviateDeserializationError('Generative config was not returned by Weaviate');
    return {
      name: generativeKey,
      config: v[generativeKey] as GenerativeConfig,
    };
  }
  static reranker(v?: WeaviateModuleConfig): ModuleConfig<Reranker, RerankerConfig> | undefined {
    if (!populated(v)) return undefined;
    const rerankerKey = Object.keys(v).find((k) => k.includes('reranker'));
    if (rerankerKey === undefined) return undefined;
    return {
      name: rerankerKey,
      config: v[rerankerKey] as RerankerConfig,
    };
  }
  private static namedVectors(v: WeaviateVectorsConfig): VectorConfig {
    if (!populated(v)) throw new WeaviateDeserializationError('Vector config was not returned by Weaviate');
    const out: VectorConfig = {};
    Object.keys(v).forEach((key) => {
      const vectorizer = v[key].vectorizer;
      if (!populated(vectorizer))
        throw new WeaviateDeserializationError(
          `Vectorizer was not returned by Weaviate for ${key} named vector`
        );
      const vectorizerNames = Object.keys(vectorizer);
      if (vectorizerNames.length !== 1)
        throw new WeaviateDeserializationError(
          `Expected exactly one vectorizer for ${key} named vector, got ${vectorizerNames.length}`
        );
      const vectorizerName = vectorizerNames[0];
      const { properties, ...restA } = vectorizer[vectorizerName] || ({} as any);
      const { vectorizeClassName, ...restB } = restA || {};
      out[key] = {
        vectorizer: {
          name: vectorizerName,
          config: {
            vectorizeCollectionName: vectorizeClassName,
            ...restB,
          },
        },
        properties: properties,
        indexConfig: ConfigMapping.vectorIndex(v[key].vectorIndexConfig, v[key].vectorIndexType),
        indexType: ConfigMapping.vectorIndexType(v[key].vectorIndexType),
      };
    });
    return out;
  }
  static vectorizer(v?: WeaviateClass): VectorConfig {
    if (!populated(v)) throw new WeaviateDeserializationError('Schema was not returned by Weaviate');
    if (populated(v.vectorConfig)) {
      return ConfigMapping.namedVectors(v.vectorConfig);
    }
    if (!populated(v.vectorizer))
      throw new WeaviateDeserializationError('Vectorizer was not returned by Weaviate');
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
                config: v.moduleConfig
                  ? ({
                      ...(v.moduleConfig[v.vectorizer] as any),
                      vectorizeCollectionName: (v.moduleConfig[v.vectorizer] as any).vectorizeClassName,
                    } as VectorizerConfig)
                  : undefined,
              },
        indexConfig: ConfigMapping.vectorIndex(v.vectorIndexConfig, v.vectorIndexType),
        indexType: ConfigMapping.vectorIndexType(v.vectorIndexType),
      },
    };
  }
  static invertedIndex(v?: WeaviateInvertedIndexConfig): InvertedIndexConfig {
    if (v === undefined)
      throw new WeaviateDeserializationError('Inverted index was not returned by Weaviate');
    if (!populated(v.cleanupIntervalSeconds))
      throw new WeaviateDeserializationError('Inverted index cleanup interval was not returned by Weaviate');
    return {
      bm25: ConfigMapping.bm25(v.bm25),
      cleanupIntervalSeconds: v.cleanupIntervalSeconds,
      stopwords: ConfigMapping.stopwords(v.stopwords),
      indexNullState: v.indexNullState ? v.indexNullState : false,
      indexPropertyLength: v.indexPropertyLength ? v.indexPropertyLength : false,
      indexTimestamps: v.indexTimestamps ? v.indexTimestamps : false,
    };
  }
  static multiTenancy(v?: WeaviateMultiTenancyConfig): MultiTenancyConfig {
    if (v === undefined) throw new WeaviateDeserializationError('Multi tenancy was not returned by Weaviate');
    return {
      autoTenantActivation: v.autoTenantActivation ? v.autoTenantActivation : false,
      autoTenantCreation: v.autoTenantCreation ? v.autoTenantCreation : false,
      enabled: v.enabled ? v.enabled : false,
    };
  }
  static replication(v?: WeaviateReplicationConfig): ReplicationConfig {
    if (v === undefined) throw new WeaviateDeserializationError('Replication was not returned by Weaviate');
    if (!populated(v.factor))
      throw new WeaviateDeserializationError('Replication factor was not returned by Weaviate');
    return {
      factor: v.factor,
      asyncEnabled: v.asyncEnabled ? v.asyncEnabled : false,
      deletionStrategy: v.deletionStrategy ? v.deletionStrategy : 'NoAutomatedResolution',
    };
  }
  static sharding(v?: WeaviateShardingConfig): ShardingConfig {
    if (v === undefined) throw new WeaviateDeserializationError('Sharding was not returned by Weaviate');
    if (!exists<number>(v.virtualPerPhysical))
      throw new WeaviateDeserializationError('Sharding enabled was not returned by Weaviate');
    if (!exists<number>(v.desiredCount))
      throw new WeaviateDeserializationError('Sharding desired count was not returned by Weaviate');
    if (!exists<number>(v.actualCount))
      throw new WeaviateDeserializationError('Sharding actual count was not returned by Weaviate');
    if (!exists<number>(v.desiredVirtualCount))
      throw new WeaviateDeserializationError('Sharding desired virtual count was not returned by Weaviate');
    if (!exists<number>(v.actualVirtualCount))
      throw new WeaviateDeserializationError('Sharding actual virtual count was not returned by Weaviate');
    if (!exists<'_id'>(v.key))
      throw new WeaviateDeserializationError('Sharding key was not returned by Weaviate');
    if (!exists<'hash'>(v.strategy))
      throw new WeaviateDeserializationError('Sharding strategy was not returned by Weaviate');
    if (!exists<'murmur3'>(v.function))
      throw new WeaviateDeserializationError('Sharding function was not returned by Weaviate');
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
    if (v === undefined) throw new WeaviateDeserializationError('PQ encoder was not returned by Weaviate');
    if (!exists<PQEncoderType>(v.type))
      throw new WeaviateDeserializationError('PQ encoder name was not returned by Weaviate');
    if (!exists<PQEncoderDistribution>(v.distribution))
      throw new WeaviateDeserializationError('PQ encoder distribution was not returned by Weaviate');
    return {
      type: v.type,
      distribution: v.distribution,
    };
  }
  static pq(v?: Record<string, unknown>): PQConfig | undefined {
    if (v === undefined) throw new WeaviateDeserializationError('PQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled))
      throw new WeaviateDeserializationError('PQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    if (!exists<boolean>(v.bitCompression))
      throw new WeaviateDeserializationError('PQ bit compression was not returned by Weaviate');
    if (!exists<number>(v.segments))
      throw new WeaviateDeserializationError('PQ segments was not returned by Weaviate');
    if (!exists<number>(v.trainingLimit))
      throw new WeaviateDeserializationError('PQ training limit was not returned by Weaviate');
    if (!exists<number>(v.centroids))
      throw new WeaviateDeserializationError('PQ centroids was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.encoder))
      throw new WeaviateDeserializationError('PQ encoder was not returned by Weaviate');
    return {
      bitCompression: v.bitCompression,
      segments: v.segments,
      centroids: v.centroids,
      trainingLimit: v.trainingLimit,
      encoder: ConfigMapping.pqEncoder(v.encoder),
      type: 'pq',
    };
  }
  static vectorIndexHNSW(v: WeaviateVectorIndexConfig): VectorIndexConfigHNSW {
    if (v === undefined) throw new WeaviateDeserializationError('Vector index was not returned by Weaviate');
    if (!exists<number>(v.cleanupIntervalSeconds))
      throw new WeaviateDeserializationError('Vector index cleanup interval was not returned by Weaviate');
    if (!exists<VectorDistance>(v.distance))
      throw new WeaviateDeserializationError('Vector index distance was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfMin))
      throw new WeaviateDeserializationError('Vector index dynamic ef min was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfMax))
      throw new WeaviateDeserializationError('Vector index dynamic ef max was not returned by Weaviate');
    if (!exists<number>(v.dynamicEfFactor))
      throw new WeaviateDeserializationError('Vector index dynamic ef factor was not returned by Weaviate');
    if (!exists<number>(v.ef))
      throw new WeaviateDeserializationError('Vector index ef was not returned by Weaviate');
    if (!exists<number>(v.efConstruction))
      throw new WeaviateDeserializationError('Vector index ef construction was not returned by Weaviate');
    if (!exists<number>(v.flatSearchCutoff))
      throw new WeaviateDeserializationError('Vector index flat search cut off was not returned by Weaviate');
    if (!exists<number>(v.maxConnections))
      throw new WeaviateDeserializationError('Vector index max connections was not returned by Weaviate');
    if (!exists<boolean>(v.skip))
      throw new WeaviateDeserializationError('Vector index skip was not returned by Weaviate');
    if (!exists<number>(v.vectorCacheMaxObjects))
      throw new WeaviateDeserializationError(
        'Vector index vector cache max objects was not returned by Weaviate'
      );
    let quantizer: PQConfig | BQConfig | SQConfig | RQConfig | undefined;
    if (exists<Record<string, any>>(v.pq) && v.pq.enabled === true) {
      quantizer = ConfigMapping.pq(v.pq);
    } else if (exists<Record<string, any>>(v.bq) && v.bq.enabled === true) {
      quantizer = ConfigMapping.bq(v.bq);
    } else if (exists<Record<string, any>>(v.rq) && v.rq.enabled === true) {
      quantizer = ConfigMapping.rq(v.rq);
    } else if (exists<Record<string, any>>(v.sq) && v.sq.enabled === true) {
      quantizer = ConfigMapping.sq(v.sq);
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
      filterStrategy: exists<VectorIndexFilterStrategy>(v.filterStrategy) ? v.filterStrategy : 'sweeping',
      flatSearchCutoff: v.flatSearchCutoff,
      maxConnections: v.maxConnections,
      quantizer: quantizer,
      skip: v.skip,
      vectorCacheMaxObjects: v.vectorCacheMaxObjects,
      type: 'hnsw',
    };
  }
  static bq(v?: Record<string, unknown>): BQConfig | undefined {
    if (v === undefined) throw new WeaviateDeserializationError('BQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled))
      throw new WeaviateDeserializationError('BQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    const cache = v.cache === undefined ? false : (v.cache as boolean);
    const rescoreLimit = v.rescoreLimit === undefined ? 1000 : (v.rescoreLimit as number);
    return {
      cache,
      rescoreLimit,
      type: 'bq',
    };
  }
  static rq(v?: Record<string, unknown>): RQConfig | undefined {
    if (v === undefined) throw new WeaviateDeserializationError('RQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled))
      throw new WeaviateDeserializationError('RQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    const bits = v.bits === undefined ? 6 : (v.bits as number);
    const rescoreLimit = v.rescoreLimit === undefined ? 20 : (v.rescoreLimit as number);
    return {
      bits,
      rescoreLimit,
      type: 'rq',
    };
  }
  static sq(v?: Record<string, unknown>): SQConfig | undefined {
    if (v === undefined) throw new WeaviateDeserializationError('SQ was not returned by Weaviate');
    if (!exists<boolean>(v.enabled))
      throw new WeaviateDeserializationError('SQ enabled was not returned by Weaviate');
    if (v.enabled === false) return undefined;
    const rescoreLimit = v.rescoreLimit === undefined ? 1000 : (v.rescoreLimit as number);
    const trainingLimit = v.trainingLimit === undefined ? 100000 : (v.trainingLimit as number);
    return {
      rescoreLimit,
      trainingLimit,
      type: 'sq',
    };
  }
  static vectorIndexFlat(v: WeaviateVectorIndexConfig): VectorIndexConfigFlat {
    if (v === undefined) throw new WeaviateDeserializationError('Vector index was not returned by Weaviate');
    if (!exists<number>(v.vectorCacheMaxObjects))
      throw new WeaviateDeserializationError(
        'Vector index vector cache max objects was not returned by Weaviate'
      );
    if (!exists<VectorDistance>(v.distance))
      throw new WeaviateDeserializationError('Vector index distance was not returned by Weaviate');
    if (!exists<Record<string, unknown>>(v.bq))
      throw new WeaviateDeserializationError('Vector index bq was not returned by Weaviate');
    return {
      vectorCacheMaxObjects: v.vectorCacheMaxObjects,
      distance: v.distance,
      quantizer: ConfigMapping.bq(v.bq),
      type: 'flat',
    };
  }
  static vectorIndexDynamic(v: WeaviateVectorIndexConfig): VectorIndexConfigDynamic {
    if (v === undefined) throw new WeaviateDeserializationError('Vector index was not returned by Weaviate');
    if (!exists<number>(v.threshold))
      throw new WeaviateDeserializationError('Vector index threshold was not returned by Weaviate');
    if (!exists<VectorDistance>(v.distance))
      throw new WeaviateDeserializationError('Vector index distance was not returned by Weaviate');
    if (!exists<WeaviateVectorIndexConfig>(v.hnsw))
      throw new WeaviateDeserializationError('Vector index hnsw was not returned by Weaviate');
    if (!exists<WeaviateVectorIndexConfig>(v.flat))
      throw new WeaviateDeserializationError('Vector index flat was not returned by Weaviate');
    return {
      distance: v.distance,
      hnsw: ConfigMapping.vectorIndexHNSW(v.hnsw),
      flat: ConfigMapping.vectorIndexFlat(v.flat),
      threshold: v.threshold,
      type: 'dynamic',
    };
  }
  static vectorIndex<I>(v: WeaviateVectorIndexConfig, t?: string): VectorIndexConfigType<I> {
    if (t === 'hnsw') {
      return ConfigMapping.vectorIndexHNSW(v) as VectorIndexConfigType<I>;
    } else if (t === 'flat') {
      return ConfigMapping.vectorIndexFlat(v) as VectorIndexConfigType<I>;
    } else if (t === 'dynamic') {
      return ConfigMapping.vectorIndexDynamic(v) as VectorIndexConfigType<I>;
    } else {
      return v as VectorIndexConfigType<I>;
    }
  }
  static vectorIndexType<I>(v?: string): I {
    if (!populated(v))
      throw new WeaviateDeserializationError('Vector index type was not returned by Weaviate');
    return v as I;
  }
  static properties(v?: WeaviateProperty[]): PropertyConfig[] {
    if (v === undefined) throw new WeaviateDeserializationError('Properties were not returned by Weaviate');
    if (v === null) return [];
    return v
      .filter((prop) => {
        if (!populated(prop.dataType))
          throw new WeaviateDeserializationError('Property data type was not returned by Weaviate');
        return prop.dataType[0][0].toLowerCase() === prop.dataType[0][0]; // primitive property, e.g. text
      })
      .map((prop) => {
        if (!populated(prop.name))
          throw new WeaviateDeserializationError('Property name was not returned by Weaviate');
        if (!populated(prop.dataType))
          throw new WeaviateDeserializationError('Property data type was not returned by Weaviate');
        return {
          name: prop.name,
          dataType: prop.dataType[0],
          description: prop.description,
          indexFilterable: prop.indexFilterable ? prop.indexFilterable : false,
          indexInverted: prop.indexInverted ? prop.indexInverted : false,
          indexRangeFilters: prop.indexRangeFilters ? prop.indexRangeFilters : false,
          indexSearchable: prop.indexSearchable ? prop.indexSearchable : false,
          vectorizerConfig: prop.moduleConfig
            ? 'none' in prop.moduleConfig
              ? undefined
              : (prop.moduleConfig as PropertyVectorizerConfig)
            : undefined,
          nestedProperties: prop.nestedProperties
            ? ConfigMapping.properties(prop.nestedProperties)
            : undefined,
          tokenization: prop.tokenization ? prop.tokenization : 'none',
        };
      });
  }
  static references(v?: WeaviateProperty[]): ReferenceConfig[] {
    if (v === undefined) throw new WeaviateDeserializationError('Properties were not returned by Weaviate');
    if (v === null) return [];
    return v
      .filter((prop) => {
        if (!populated(prop.dataType))
          throw new WeaviateDeserializationError('Reference data type was not returned by Weaviate');
        return prop.dataType[0][0].toLowerCase() !== prop.dataType[0][0]; // reference property, e.g. Myclass
      })
      .map((prop) => {
        if (!populated(prop.name))
          throw new WeaviateDeserializationError('Reference name was not returned by Weaviate');
        if (!populated(prop.dataType))
          throw new WeaviateDeserializationError('Reference data type was not returned by Weaviate');
        return {
          name: prop.name,
          description: prop.description,
          targetCollections: prop.dataType,
        };
      });
  }
}
