import Connection from '../connection/grpc';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { ClassCreator, ClassDeleter, ClassGetter, SchemaGetter } from '../schema';
import {
  CollectionConfig,
  CollectionConfigCreate,
  GenerativeSearches,
  Properties,
  ReferenceConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
  Rerankers,
  VectorIndexType,
  Vectorizers,
} from './types';
import ClassExists from '../schema/classExists';
import { classToCollection } from './config';
import { ConsistencyLevel } from '../data';

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

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  const listAll = () =>
    new SchemaGetter(connection)
      .do()
      .then((schema) =>
        schema.classes ? schema.classes?.map(classToCollection<any, any, any, any, any>) : []
      );
  const deleteCollection = (name: string) => new ClassDeleter(connection).withClassName(name).do();
  return {
    create: <TProperties, IndexType, GenerativeModule, RerankerModule, VectorizerModule>(
      config: CollectionConfigCreate<
        TProperties,
        IndexType,
        GenerativeModule,
        RerankerModule,
        VectorizerModule
      >
    ) => {
      const { name, invertedIndex, multiTenancy, replication, sharding, vectorIndex, ...rest } = config;
      const vectorizer = config.vectorizer ? config.vectorizer.name : undefined;

      const moduleConfig: any = {};
      if (config.vectorizer?.options) {
        moduleConfig[config.vectorizer.name] = config.vectorizer.options ? config.vectorizer.options : {};
      }
      if (config.generative) {
        moduleConfig[config.generative.name] = config.generative.options ? config.generative.options : {};
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
      return new ClassCreator(connection)
        .withClass(schema)
        .do()
        .then(classToCollection<TProperties, IndexType, GenerativeModule, RerankerModule, VectorizerModule>);
    },
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
    get: <TProperties extends Properties>(name: string) =>
      collection<TProperties>(connection, name, dbVersionSupport),
    listAll: listAll,
  };
};

export interface Collections {
  create<
    TProperties,
    Index extends VectorIndexType = 'hnsw',
    Generative extends GenerativeSearches = 'none',
    Reranker extends Rerankers = 'none',
    Vectorizer extends Vectorizers = 'none'
  >(
    class_: CollectionConfigCreate<TProperties, Index, Generative, Reranker, Vectorizer>
  ): Promise<CollectionConfig<TProperties, Index, Generative, Reranker, Vectorizer>>;
  delete(class_: string): Promise<void>;
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
  get<TProperties extends Properties = any>(name: string): Collection<TProperties>;
  listAll(): Promise<CollectionConfig<any, any, any, any, any>[]>;
}

export default collections;
