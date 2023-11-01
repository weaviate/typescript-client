import Connection from '../connection';
import { DbVersionSupport } from '../utils/dbVersion';
import collection, { Collection } from './collection';
import { WeaviateClass } from '../openapi/types';
import { CollectionConfig } from './types';

const collections = (connection: Connection, dbVersionSupport: DbVersionSupport) => {
  return {
    create: (config: CollectionConfig) => {
      const vectorizer = config.vectorizerConfig ? Object.keys(config.vectorizerConfig)[0] : undefined;
      const schema = {
        ...config,
        vectorizer: vectorizer || 'none',
        moduleConfig: config.vectorizerConfig,
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
