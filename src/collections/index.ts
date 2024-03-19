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
  NamedVectorConfigCreate,
  VectorIndexConfigCreate,
} from './types/index.js';
import ClassExists from '../schema/classExists.js';
import { classToCollection, resolveProperty, resolveReference } from './config/utils.js';
import { WeaviateClass } from '../openapi/types.js';
import { QuantizerGuards } from './configure/index.js';
import { PrimitiveKeys } from './types/internal.js';

export type CollectionConfigCreate<TProperties = undefined, N = string> = {
  name: N;
  description?: string;
  generative?: ModuleConfig<GenerativeSearch>;
  invertedIndex?: InvertedIndexConfigCreate;
  multiTenancy?: MultiTenancyConfigCreate;
  properties?: PropertyConfigCreate<TProperties>[];
  references?: ReferenceConfigCreate<TProperties>[];
  replication?: ReplicationConfigCreate;
  reranker?: ModuleConfig<Reranker>;
  sharding?: ShardingConfigCreate;
  vectorIndex?: ModuleConfig<VectorIndexType, VectorIndexConfigCreate>;
  vectorizer?:
    | ModuleConfig<Vectorizer, VectorizerConfig>
    | NamedVectorConfigCreate<PrimitiveKeys<TProperties>[], string, VectorIndexType, Vectorizer>[];
};

const parseVectorIndexConfig = (config?: VectorIndexConfigCreate) => {
  if (config === undefined) return undefined;
  const { quantizer, ...conf } = config;
  if (quantizer === undefined) return conf;
  if (QuantizerGuards.isBQ(quantizer)) {
    const { type, ...quant } = quantizer;
    return {
      ...conf,
      bq: {
        ...quant,
        enabled: true,
      },
    };
  }
  if (QuantizerGuards.isPQ(quantizer)) {
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

const isLegacyVectorizer = (
  argument: ModuleConfig<string, any> | NamedVectorConfigCreate<any, string, VectorIndexType, Vectorizer>[]
): argument is ModuleConfig<string, any> => {
  return !Array.isArray(argument);
};

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) => (schema.classes ? schema.classes.map(classToCollection<any>) : []));
  const deleteCollection = (name: string) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: async function <TProperties = undefined, TName = string>(
      config: CollectionConfigCreate<TProperties, TName>
    ) {
      const { name, invertedIndex, multiTenancy, replication, sharding, vectorIndex, ...rest } = config;

      const moduleConfig: any = {};
      if (config.generative) {
        moduleConfig[config.generative.name] = config.generative.config ? config.generative.config : {};
      }

      let defaultVectorizer: string | undefined;
      let vectorizers: string[] = [];
      let vectorsConfig: any | undefined;
      if (config.vectorizer === undefined) {
        defaultVectorizer = 'none';
        vectorsConfig = undefined;
      } else if (isLegacyVectorizer(config.vectorizer)) {
        defaultVectorizer = config.vectorizer.name;
        vectorizers = [config.vectorizer.name];
        vectorsConfig = undefined;
        moduleConfig[defaultVectorizer] = config.vectorizer.config ? config.vectorizer.config : {};
      } else {
        defaultVectorizer = undefined;
        vectorsConfig = {};
        config.vectorizer.forEach((v) => {
          const vectorConfig: any = {
            vectorIndexConfig: parseVectorIndexConfig(v.vectorIndex.config),
            vectorIndexType: v.vectorIndex.name,
            vectorizer: {},
          };
          vectorizers = [...vectorizers, v.vectorizer.name];
          vectorConfig.vectorizer[v.vectorizer.name] = {
            properties: v.properties,
            ...(v.vectorizer.config ? v.vectorizer.config : {}),
          };
          vectorsConfig![v.vectorName] = vectorConfig;
        });
      }

      const properties = config.properties
        ? config.properties.map((prop) => resolveProperty<TProperties>(prop, vectorizers))
        : [];
      const references = config.references ? config.references.map(resolveReference<TProperties>) : [];

      const schema = {
        ...rest,
        class: name,
        vectorizer: defaultVectorizer,
        invertedIndexConfig: invertedIndex,
        moduleConfig: moduleConfig,
        multiTenancyConfig: multiTenancy,
        properties: [...properties, ...references],
        replicationConfig: replication,
        shardingConfig: sharding,
        vectorConfig: vectorsConfig,
        vectorIndexConfig: vectorsConfig
          ? undefined
          : vectorIndex
          ? parseVectorIndexConfig(vectorIndex.config)
          : undefined,
        vectorIndexType: vectorsConfig ? undefined : vectorIndex ? vectorIndex.name : 'hnsw',
      };
      await new ClassCreator(connection).withClass(schema).do();
      return collection<TProperties, TName>(connection, name, dbVersionSupport);
    },
    createFromSchema: (config: WeaviateClass) => new ClassCreator(connection).withClass(config).do(),
    delete: deleteCollection,
    deleteAll: () => listAll().then((configs) => Promise.all(configs?.map((c) => deleteCollection(c.name)))),
    exists: (name: string) => new ClassExists(connection).withClassName(name).do(),
    export: <TProperties>(name: string) =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<TProperties>),
    get: <TProperties extends Properties | undefined = undefined, TName extends string = string>(
      name: TName
    ) => collection<TProperties, TName>(connection, name, dbVersionSupport),
    listAll: listAll,
  };
};

export interface Collections {
  create<TProperties extends Properties | undefined = undefined, TName = string>(
    config: CollectionConfigCreate<TProperties, TName>
  ): Promise<Collection<TProperties, TName>>;
  createFromSchema(config: WeaviateClass): Promise<WeaviateClass>;
  delete(collection: string): Promise<void>;
  deleteAll(): Promise<void[]>;
  exists(name: string): Promise<boolean>;
  export<TProperties>(name: string): Promise<CollectionConfig<TProperties>>;
  get<TProperties extends Properties | undefined = undefined, TName extends string = string>(
    name: TName
  ): Collection<TProperties, TName>;
  listAll(): Promise<CollectionConfig<any>[]>;
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
export * from './iterator/index.js';
export * from './query/index.js';
export * from './references/index.js';
export * from './sort/index.js';
export * from './tenants/index.js';
export * from './types/index.js';
