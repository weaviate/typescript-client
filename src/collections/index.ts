import Connection from '../connection/grpc.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import collection, { Collection } from './collection/index.js';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema/index.js';
import {
  CollectionConfig,
  GenerativeSearch,
  InvertedIndexConfigCreate,
  ModuleConfig,
  MultiTenancyConfigCreate,
  Properties,
  PropertyConfigCreate,
  ReferenceConfigCreate,
  ReplicationConfigCreate,
  Reranker,
  ShardingConfigCreate,
  VectorIndexType,
  Vectorizer,
  VectorizerConfig,
  VectorIndexConfigCreate,
  VectorizersConfigCreate,
  GenerativeConfig,
  RerankerConfig,
  VectorIndexConfigDynamicCreate,
  VectorIndexConfigFlatCreate,
  VectorIndexConfigHNSWCreate,
} from './types/index.js';
import ClassExists from '../schema/classExists.js';
import { classToCollection, resolveProperty, resolveReference } from './config/utils.js';
import { WeaviateClass } from '../openapi/types.js';
import { QuantizerGuards } from './configure/parsing.js';
import { WeaviateInvalidInputError, WeaviateUnsupportedFeatureError } from '../errors.js';

/**
 * All the options available when creating a new collection.
 *
 * Inspect [the docs](https://weaviate.io/developers/weaviate/configuration) for more information on the
 * different configuration options and how they affect the behavior of your collection.
 */
export type CollectionConfigCreate<TProperties = undefined, N = string> = {
  /** The name of the collection. */
  name: N;
  /** The description of the collection. */
  description?: string;
  /** The configuration for Weaviate's generative capabilities. */
  generative?: ModuleConfig<GenerativeSearch, GenerativeConfig>;
  /** The configuration for Weaviate's inverted index. */
  invertedIndex?: InvertedIndexConfigCreate;
  /** The configuration for Weaviate's multi-tenancy capabilities. */
  multiTenancy?: MultiTenancyConfigCreate;
  /** The references of the objects in the collection. */
  references?: ReferenceConfigCreate<TProperties>[];
  /** The configuration for Weaviate's replication strategy. Is mutually exclusive with `sharding`. */
  replication?: ReplicationConfigCreate;
  /** The configuration for Weaviate's reranking capabilities. */
  reranker?: ModuleConfig<Reranker, RerankerConfig>;
  /** The configuration for Weaviate's sharding strategy. Is mutually exclusive with `replication`. */
  sharding?: ShardingConfigCreate;
  /** The configuration for Weaviate's vectorizer(s) capabilities. */
  vectorizers?: VectorizersConfigCreate<TProperties>;
} & (TProperties extends undefined
  ? {
      /** The properties of the objects in the collection. */
      properties?: PropertyConfigCreate<TProperties>[];
    }
  : {
      /** The properties of the objects in the collection. */
      properties: PropertyConfigCreate<TProperties>[];
    });

const parseVectorIndex = (module: ModuleConfig<VectorIndexType, VectorIndexConfigCreate>): any => {
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
};

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) => (schema.classes ? schema.classes.map(classToCollection<any>) : []));
  const deleteCollection = (name: string) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: async function <TProperties extends Properties | undefined = undefined, TName = string>(
      config: CollectionConfigCreate<TProperties, TName>
    ) {
      const { name, invertedIndex, multiTenancy, replication, sharding, ...rest } = config;

      const supportsDynamicVectorIndex = await dbVersionSupport.supportsDynamicVectorIndex();

      const moduleConfig: any = {};
      if (config.generative) {
        moduleConfig[config.generative.name] = config.generative.config ? config.generative.config : {};
      }
      if (config.reranker) {
        moduleConfig[config.reranker.name] = config.reranker.config ? config.reranker.config : {};
      }

      const makeVectorsConfig = (configVectorizers: VectorizersConfigCreate<TProperties>) => {
        let vectorizers: string[] = [];
        const vectorsConfig: Record<string, any> = {};
        const vectorizersConfig = Array.isArray(configVectorizers)
          ? configVectorizers
          : [
              {
                ...configVectorizers,
                vectorName: 'default',
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
          vectorizers = [...vectorizers, v.vectorizer.name];
          const vectorizeClassName = (v.vectorizer.config as any)?.vectorizeCollectionName;
          delete (v.vectorizer.config as any)?.vectorizeCollectionName;
          vectorConfig.vectorizer[v.vectorizer.name] = {
            properties: v.properties,
            ...(v.vectorizer.config ? { ...v.vectorizer.config, vectorizeClassName } : {}),
          };
          if (v.vectorName === undefined) {
            throw new WeaviateInvalidInputError(
              'vectorName is required for each vectorizer when specifying more than one vectorizer'
            );
          }
          vectorsConfig[v.vectorName] = vectorConfig;
        });
        return { vectorsConfig, vectorizers };
      };

      const { vectorsConfig, vectorizers } = config.vectorizers
        ? makeVectorsConfig(config.vectorizers)
        : { vectorsConfig: undefined, vectorizers: [] };

      const properties = config.properties
        ? config.properties.map((prop) => resolveProperty<TProperties>(prop as any, vectorizers))
        : [];
      const references = config.references ? config.references.map(resolveReference<TProperties>) : [];

      const schema = {
        ...rest,
        class: name,
        invertedIndexConfig: invertedIndex,
        moduleConfig: moduleConfig,
        multiTenancyConfig: multiTenancy,
        properties: [...properties, ...references],
        replicationConfig: replication,
        shardingConfig: sharding,
        vectorConfig: vectorsConfig,
      };
      await new ClassCreator(connection).withClass(schema).do();
      return collection<TProperties, TName>(connection, name, dbVersionSupport);
    },
    createFromSchema: async function (config: WeaviateClass) {
      const { class: name } = await new ClassCreator(connection).withClass(config).do();
      return collection<Properties, string>(connection, name as string, dbVersionSupport);
    },
    delete: deleteCollection,
    deleteAll: () => listAll().then((configs) => Promise.all(configs?.map((c) => deleteCollection(c.name)))),
    exists: (name: string) => new ClassExists(connection).withClassName(name).do(),
    export: <TProperties>(name: string) =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<TProperties>),
    listAll: listAll,
    get: <TProperties extends Properties | undefined = undefined, TName extends string = string>(
      name: TName
    ) => collection<TProperties, TName>(connection, name, dbVersionSupport),
  };
};

export interface Collections {
  create<TProperties extends Properties | undefined = undefined, TName = string>(
    config: CollectionConfigCreate<TProperties, TName>
  ): Promise<Collection<TProperties, TName>>;
  createFromSchema(config: WeaviateClass): Promise<Collection<Properties, string>>;
  delete(collection: string): Promise<void>;
  deleteAll(): Promise<void[]>;
  exists(name: string): Promise<boolean>;
  export(name: string): Promise<CollectionConfig>;
  get<TProperties extends Properties | undefined = undefined, TName extends string = string>(
    name: TName
  ): Collection<TProperties, TName>;
  listAll(): Promise<CollectionConfig[]>;
  // use<TProperties extends Properties | undefined = undefined, TName extends string = string>(
  //   name: TName
  // ): Collection<TProperties, TName>;
}

export default collections;
export * from './aggregate/index.js';
export * from './backup/index.js';
export * from './cluster/index.js';
export * from './collection/index.js';
export * from './config/index.js';
export * from './configure/index.js';
export * from './data/index.js';
export * from './filters/index.js';
export * from './generate/index.js';
export * from './query/index.js';
export * from './references/index.js';
export * from './sort/index.js';
export * from './tenants/index.js';
export * from './types/index.js';
