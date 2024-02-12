import Connection from '../connection';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { WeaviateClass } from '../openapi/types';
import { ClassCreator, ClassDeleter } from '../schema';
import {
  CollectionConfigCreate,
  GenerativeSearches,
  GenerativeSearchesOptions,
  Properties,
  ReferenceConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
  Rerankers,
  RerankersOptions,
  VectorIndexType,
  VectorIndicesOptions,
  Vectorizers,
  VectorizersOptions,
} from './types';

class ReferenceTypeGuards {
  static isSingleTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceSingleTargetConfigCreate<T> {
    return (ref as ReferenceSingleTargetConfigCreate<T>).targetCollection !== undefined;
  }
  static isMultiTarget<T>(ref: ReferenceConfigCreate<T>): ref is ReferenceMultiTargetConfigCreate<T> {
    return (ref as ReferenceMultiTargetConfigCreate<T>).targetCollections !== undefined;
  }
}

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
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
      return new ClassCreator(connection).withClass(schema).do();
    },
    delete: (name: string) => new ClassDeleter(connection).withClassName(name).do(),
    get: <TProperties extends Properties>(name: string) =>
      collection<TProperties>(connection, name, dbVersionSupport),
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
  ): Promise<WeaviateClass>;
  delete(class_: string): Promise<void>;
  get<TProperties extends Properties = any>(name: string): Collection<TProperties>;
}

export default collections;
