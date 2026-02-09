import Connection from '../connection/grpc.js';
import { WeaviateClass, WeaviateObjectTTLConfig } from '../openapi/types.js';
import ClassExists from '../schema/classExists.js';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema/index.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import collection, { Collection } from './collection/index.js';
import { classToCollection, makeVectorsConfig, resolveProperty, resolveReference } from './config/utils.js';
import {
  CollectionConfig,
  GenerativeConfig,
  GenerativeSearch,
  InvertedIndexConfigCreate,
  ModuleConfig,
  MultiTenancyConfigCreate,
  ObjectTTLConfigCreate,
  Properties,
  PropertyConfigCreate,
  ReferenceConfigCreate,
  ReplicationConfigCreate,
  Reranker,
  RerankerConfig,
  ShardingConfigCreate,
  VectorizersConfigCreate,
  Vectors,
} from './types/index.js';

/**
 * All the options available when creating a new collection.
 *
 * Inspect [the docs](https://weaviate.io/developers/weaviate/configuration) for more information on the
 * different configuration options and how they affect the behavior of your collection.
 */
export type CollectionConfigCreate<TProperties = undefined, N = string, TVectors = undefined> = {
  /** The name of the collection. */
  name: N;
  /** The description of the collection. */
  description?: string;
  /** The configuration for Weaviate's generative capabilities. */
  generative?: ModuleConfig<GenerativeSearch, GenerativeConfig>;
  /** The configuration for Weaviate's inverted index. */
  invertedIndex?: InvertedIndexConfigCreate;
  /** The configuration for object TTL. */
  objectTTL?: ObjectTTLConfigCreate;
  /** The configuration for Weaviate's multi-tenancy capabilities. */
  multiTenancy?: MultiTenancyConfigCreate;
  /** The properties of the objects in the collection. */
  properties?: PropertyConfigCreate<TProperties>[];
  /** The references of the objects in the collection. */
  references?: ReferenceConfigCreate<TProperties>[];
  /** The configuration for Weaviate's replication strategy. Is mutually exclusive with `sharding`. */
  replication?: ReplicationConfigCreate;
  /** The configuration for Weaviate's reranking capabilities. */
  reranker?: ModuleConfig<Reranker, RerankerConfig>;
  /** The configuration for Weaviate's sharding strategy. Is mutually exclusive with `replication`. */
  sharding?: ShardingConfigCreate;
  /** The configuration for Weaviate's vectorizer(s) capabilities. */
  vectorizers?: VectorizersConfigCreate<TProperties, TVectors>;
};

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) => (schema.classes ? schema.classes.map(classToCollection<any>) : []));
  const deleteCollection = (name: string) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: async function <
      TProperties extends Properties | undefined = undefined,
      TName = string,
      TVectors extends Vectors | undefined = undefined
    >(config: CollectionConfigCreate<TProperties, TName, TVectors>) {
      // Handle legacy schema format conversion
      const processedConfig: any = { ...config };
      // Convert 'class' to 'name' if needed (legacy format)
      if ('class' in processedConfig && !processedConfig.name) {
        processedConfig.name = processedConfig.class;
        delete processedConfig.class;
      }
      const { name, invertedIndex, multiTenancy, objectTTL, replication, sharding, ...rest } =
        processedConfig;

      const moduleConfig: any = {};
      if (processedConfig.generative) {
        const generative =
          processedConfig.generative.name === 'generative-azure-openai'
            ? 'generative-openai'
            : processedConfig.generative.name;
        moduleConfig[generative] = processedConfig.generative.config ? processedConfig.generative.config : {};
      }
      if (processedConfig.reranker) {
        moduleConfig[processedConfig.reranker.name] = processedConfig.reranker.config
          ? processedConfig.reranker.config
          : {};
      }

      let objectTtlConfig: WeaviateObjectTTLConfig | undefined;
      if (objectTTL) {
        objectTtlConfig = {
          enabled: objectTTL.enabled,
          deleteOn: objectTTL.deleteOn,
          defaultTtl: objectTTL.defaultTTLSeconds,
          filterExpiredObjects: objectTTL.filterExpiredObjects,
        };
      }

      const schema: any = {
        ...rest,
        class: name,
        invertedIndexConfig: invertedIndex,
        moduleConfig: moduleConfig,
        multiTenancyConfig: multiTenancy,
        objectTtlConfig: objectTtlConfig,
        replicationConfig: replication,
        shardingConfig: sharding,
      };

      const { vectorsConfig, vectorizers } = processedConfig.vectorizers
        ? makeVectorsConfig(processedConfig.vectorizers)
        : { vectorsConfig: undefined, vectorizers: [] };
      schema.vectorConfig = vectorsConfig;

      const properties = processedConfig.properties
        ? processedConfig.properties.map((prop: any) =>
            resolveProperty<TProperties>(prop as any, vectorizers)
          )
        : [];
      const references = processedConfig.references
        ? processedConfig.references.map(resolveReference<TProperties>)
        : [];
      schema.properties = [...properties, ...references];

      await new ClassCreator(connection).withClass(schema).do();
      return collection<TProperties, TName, TVectors>(connection, name, dbVersionSupport);
    },
    createFromSchema: async function (config: WeaviateClass & { name?: string }) {
      // Support both 'class' and 'name' properties for backwards compatibility
      let schemaWithClass = config.name && !config.class ? { ...config, class: config.name } : config;

      // Normalize dataType: convert string to array if necessary
      if (schemaWithClass.properties) {
        schemaWithClass = {
          ...schemaWithClass,
          properties: schemaWithClass.properties.map((prop: any) => {
            if (prop.dataType && typeof prop.dataType === 'string') {
              return { ...prop, dataType: [prop.dataType] };
            }
            return prop;
          }),
        };
      }

      const { class: name } = await new ClassCreator(connection).withClass(schemaWithClass).do();
      return collection<Properties, string, undefined>(connection, name as string, dbVersionSupport);
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
    ) => collection<TProperties, TName, undefined>(connection, name, dbVersionSupport),
    use: <
      TProperties extends Properties | undefined = undefined,
      TName extends string = string,
      TVectors extends Vectors | undefined = undefined
    >(
      name: TName
    ) => collection<TProperties, TName, TVectors>(connection, name, dbVersionSupport),
  };
};

export interface Collections {
  create<
    TProperties extends Properties | undefined = undefined,
    TName = string,
    TVectors extends Vectors | undefined = undefined
  >(
    config: CollectionConfigCreate<TProperties, TName, TVectors>
  ): Promise<Collection<TProperties, TName, TVectors>>;
  createFromSchema(config: WeaviateClass & { name?: string }): Promise<Collection<Properties, string>>;
  delete(collection: string): Promise<void>;
  deleteAll(): Promise<void[]>;
  exists(name: string): Promise<boolean>;
  export(name: string): Promise<CollectionConfig>;
  get<TProperties extends Properties | undefined = undefined, TName extends string = string>(
    name: TName
  ): Collection<TProperties, TName>;
  listAll(): Promise<CollectionConfig[]>;
  use<
    TName extends string = string,
    TProperties extends Properties | undefined = undefined,
    TVectors extends Vectors | undefined = undefined
  >(
    name: TName
  ): Collection<TProperties, TName, TVectors>;
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
export * from './vectors/multiTargetVector.js';
