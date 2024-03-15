import Connection from '../connection/grpc';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema';
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
  PhoneNumber,
} from './types';
import ClassExists from '../schema/classExists';
import { classToCollection, resolveProperty, resolveReference } from './config';
import { ConsistencyLevel } from '../data';
import { WeaviateClass } from '../openapi/types';
import { QuantizerGuards } from './configure';
import { PrimitiveKeys } from './types/internal';

export interface IBuilder {
  withConsistencyLevel(consistencyLevel: ConsistencyLevel): this;
  withTenant(tenant: string): this;
}

export type CollectionConfigCreate<TProperties = Properties, N = string> = {
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

export const addContext = <B extends IBuilder>(
  builder: B,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): B => {
  if (consistencyLevel) {
    builder = builder.withConsistencyLevel(consistencyLevel);
  }
  if (tenant) {
    builder = builder.withTenant(tenant);
  }
  return builder;
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
    create: async function <TProperties = any, TName = string>(
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
    get: <TProperties extends Properties = any, TName extends string = string>(name: TName) =>
      collection<TProperties, TName>(connection, name, dbVersionSupport),
    listAll: listAll,
  };
};

export interface Collections {
  create<TProperties = any, TName = string>(
    config: CollectionConfigCreate<TProperties, TName>
  ): Promise<Collection<TProperties, TName>>;
  createFromSchema(config: WeaviateClass): Promise<WeaviateClass>;
  delete(collection: string): Promise<void>;
  deleteAll(): Promise<void[]>;
  exists(name: string): Promise<boolean>;
  export<TProperties>(name: string): Promise<CollectionConfig<TProperties>>;
  get<TProperties extends Properties = any, TName extends string = string>(
    name: TName
  ): Collection<TProperties, TName>;
  listAll(): Promise<CollectionConfig<any>[]>;
}

export default collections;
export * from './aggregate';
export * from './backup';
export * from './cluster';
export * from './collection';
export * from './config';
export * from './configure';
export * from './data';
export * from './filters';
export * from './generate';
export * from './iterator';
export * from './query';
export * from './references';
export * from './sort';
export * from './tenants';
export * from './types';
