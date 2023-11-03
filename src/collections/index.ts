import Connection from '../connection';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { WeaviateClass } from '../openapi/types';
import { CollectionConfig } from './types';

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
      return connection.postReturn<any, WeaviateClass>('/schema', schema);
    },
    get: <TProperties extends Record<string, any>>(name: string) =>
      collection<TProperties>(connection, name, dbVersionSupport),
  };
};

export interface Collections {
  create(class_: CollectionConfig): Promise<WeaviateClass>;
  get<TProperties extends Record<string, any>>(name: string): Collection<TProperties>;
}

export default collections;
