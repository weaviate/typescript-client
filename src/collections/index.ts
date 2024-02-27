import Connection from '../connection/grpc';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema';
import {
  CollectionConfig,
  CollectionConfigCreate,
  GenerativeSearches,
  ModuleOptions,
  NamedVectorConfig,
  Properties,
  ReferenceConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
  Rerankers,
  VectorIndexType,
  Vectorizers,
  Vectors,
} from './types';
import ClassExists from '../schema/classExists';
import { classToCollection } from './config';
import { ConsistencyLevel } from '../data';
import { WeaviateClass } from '../index.node';

class ReferenceTypeGuards {
  static isSingleTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceSingleTargetConfigCreate<T> {
    return (ref as ReferenceSingleTargetConfigCreate<T>).targetCollection !== undefined;
  }
  static isMultiTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceMultiTargetConfigCreate<T> {
    return (ref as ReferenceMultiTargetConfigCreate<T>).targetCollections !== undefined;
  }
}

export interface IBuilder {
  withConsistencyLevel(consistencyLevel: ConsistencyLevel): this;
  withTenant(tenant: string): this;
}

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

const isLegacyVectorizer = (
  argument: ModuleOptions<string, any> | NamedVectorConfig<string, string, string, any>[]
): argument is ModuleOptions<string, any> => {
  return !Array.isArray(argument);
};

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) =>
        schema.classes ? schema.classes?.map(classToCollection<any, any, any, any, any>) : []
      );
  const deleteCollection = (name: string) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: async function <TProperties>(config: CollectionConfigCreate<TProperties>) {
      const { name, invertedIndex, multiTenancy, replication, sharding, vectorIndex, ...rest } = config;

      const moduleConfig: any = {};
      if (config.generative) {
        moduleConfig[config.generative.name] = config.generative.options ? config.generative.options : {};
      }

      let vectorizer: string | undefined;
      let vectorConfig: any | undefined;
      if (config.vectorizer === undefined) {
        vectorizer = 'none';
        vectorConfig = undefined;
      } else if (isLegacyVectorizer(config.vectorizer)) {
        vectorizer = config.vectorizer.name;
        vectorConfig = undefined;
        moduleConfig[vectorizer] = config.vectorizer.options ? config.vectorizer.options : {};
      } else {
        vectorizer = undefined;
        vectorConfig = {};
        config.vectorizer.forEach((v) => {
          const { name, ...rest } = v;
          vectorConfig[name] = rest;
        });
      }

      const properties: any[] = [];
      config.properties?.forEach((prop) => {
        const resolve = (prop: any) => {
          const { dataType, nestedProperties, skipVectorisation, vectorizePropertyName, ...rest } = prop;
          const moduleConfig: any = {};
          if (vectorizer) {
            moduleConfig[vectorizer] = {
              skip: skipVectorisation,
              vectorizePropertyName,
            };
          }
          return {
            ...rest,
            dataType: [dataType],
            nestedProperties: nestedProperties ? nestedProperties.map(resolve) : undefined,
            moduleConfig,
          };
        };
        properties.push(resolve(prop));
      });
      config.references?.forEach((ref) => {
        let dt: string[] = [];
        if (ReferenceTypeGuards.isSingleTarget(ref)) {
          dt = [ref.targetCollection];
        } else if (ReferenceTypeGuards.isMultiTarget(ref)) {
          dt = ref.targetCollections;
        }
        properties.push({
          ...ref,
          dataType: dt,
        });
      });

      const schema = {
        ...rest,
        class: name,
        vectorizer: vectorizer || 'none',
        invertedIndexConfig: invertedIndex,
        moduleConfig: moduleConfig,
        multiTenancyConfig: multiTenancy,
        properties: properties,
        replicationConfig: replication,
        shardingConfig: sharding,
        vectorIndexConfig: vectorIndex ? vectorIndex.options : undefined,
        vectorIndexType: vectorIndex ? vectorIndex.name : 'hnsw',
      };
      await new ClassCreator(connection).withClass(schema).do();
    },
    createFromSchema: (config: WeaviateClass) => new ClassCreator(connection).withClass(config).do(),
    delete: deleteCollection,
    deleteAll: () =>
      listAll().then((classes) =>
        classes ? Promise.all(classes?.map((c) => deleteCollection(c.name))) : Promise.resolve([])
      ),
    exists: (name: string) => new ClassExists(connection).withClassName(name).do(),
    export: <TProperties, IndexType, GenerativeModule, RerankerModule, VectorizerModule>(name: string) =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<TProperties, IndexType, GenerativeModule, RerankerModule, VectorizerModule>),
    get: <TProperties extends Properties, TVectors extends Vectors>(name: string) =>
      collection<TProperties, TVectors>(connection, name, dbVersionSupport),
    listAll: listAll,
  };
};

export interface Collections {
  create<TProperties = Properties, TVectors extends Vectors = undefined>(
    config: CollectionConfigCreate<TProperties, TVectors>
  ): Promise<void>;
  createFromSchema(config: WeaviateClass): Promise<WeaviateClass>;
  delete(collection: string): Promise<void>;
  deleteAll(): Promise<void[]>;
  exists(name: string): Promise<boolean>;
  export<
    TProperties,
    Index extends VectorIndexType = string,
    Generative extends GenerativeSearches = string,
    Reranker extends Rerankers = string,
    Vectorizer extends Vectorizers = string
  >(
    name: string
  ): Promise<CollectionConfig<TProperties, Index, Generative, Reranker, Vectorizer>>;
  get<TProperties extends Properties = any, TVectors extends Vectors = undefined>(
    name: string
  ): Collection<TProperties, TVectors>;
  listAll(): Promise<CollectionConfig<any, any, any, any, any>[]>;
}

export default collections;
