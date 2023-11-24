import Connection from '../connection';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { WeaviateClass } from '../openapi/types';
import { ClassCreator, ClassDeleter } from '../schema';
import { CollectionConfig, Properties } from './types';

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  return {
    create: (config: CollectionConfig) => {
      const { name, invertedIndex, multiTenancy, replication, sharding, vectorIndex, ...rest } = config;
      const vectorizer = config.vectorizer ? Object.keys(config.vectorizer)[0] : undefined;

      let moduleConfig: any;
      if (config.vectorizer) {
        moduleConfig = config.vectorizer;
      }
      if (config.generative) {
        moduleConfig = { ...moduleConfig, ...config.generative };
      }

      const schema = {
        ...rest,
        class: name,
        vectorizer: vectorizer || 'none',
        invertedIndexConfig: invertedIndex,
        moduleConfig: moduleConfig,
        multiTenancyConfig: multiTenancy,
        properties: config.properties?.map((prop) => {
          const { skipVectorisation, vectorizePropertyName, ...rest } = prop;
          const moduleConfig: any = {};
          if (vectorizer) {
            moduleConfig[vectorizer] = {
              skip: skipVectorisation,
              vectorizePropertyName,
            };
          }
          return {
            ...rest,
            moduleConfig,
          };
        }),
        replicationConfig: replication,
        shardingConfig: sharding,
        vectorIndexConfig: vectorIndex,
      };
      return new ClassCreator(connection).withClass(schema).do();
    },
    delete: (name: string) => new ClassDeleter(connection).withClassName(name).do(),
    get: <TProperties extends Properties>(name: string) =>
      collection<TProperties>(connection, name, dbVersionSupport),
  };
};

export interface Collections {
  create(class_: CollectionConfig): Promise<WeaviateClass>;
  delete(class_: string): Promise<void>;
  get<TProperties extends Properties>(name: string): Collection<TProperties>;
}

export default collections;
