// import { Property, WeaviateClass } from '../openapi/types';
// import {
//   CollectionConfig,
//   InvertedIndexConfig,
//   MultiTenancyConfig,
//   PropertyConfig,
//   ReferencePropertyConfig,
//   ReplicationConfig,
//   ShardingConfig,
//   VectorIndexConfig,
//   Vectorizer
// } from './types';

// interface IConfigurer {
//   withDescription (description: string): IConfigurer;
//   withInvertedIndex (config: InvertedIndexConfig): IConfigurer;
//   withMultiTenancy (config: MultiTenancyConfig): IConfigurer;
//   withReplication (config: ReplicationConfig): IConfigurer;
//   withSharding (config: ShardingConfig): IConfigurer;
//   withProperty (config: PropertyConfig): IConfigurer;
//   withVectorIndex (config: VectorIndexConfig): IConfigurer;
//   make (): WeaviateClass;
// }

// class Configurer implements IConfigurer {
//   private config: CollectionConfig

//   private constructor (className: string) {
//     this.config = {
//       class: className,
//       vectorIndexType: 'hnsw',
//     };
//   }

//   static use(className: string): IConfigurer {
//     const builder = new Configurer(className);
//     // return new Proxy(builder, {
//     //   get(target: any, prop: string | symbol, receiver) {
//     //     if (typeof prop === "symbol") {
//     //       return Reflect.get(target, prop);
//     //     }

//     //     if (prop in target && typeof target[prop] === 'function') {
//     //       // Return function if it exists on target
//     //       return target[prop].bind(target);
//     //     } else {
//     //       // Return the built config if accessed property is not a function
//     //       return target.return_();
//     //     }
//     //   }
//     // });
//     return builder;
//   }

//   public withDescription(description: string): IConfigurer {
//     this.config.description = description;
//     return this;
//   }

//   public withInvertedIndex = (config: InvertedIndexConfig): IConfigurer => {
//     this.config.invertedIndexConfig = config;
//     return this;
//   }

//   public withMultiTenancy = (config: MultiTenancyConfig): IConfigurer => {
//     this.config.multiTenancyConfig = config;
//     return this;
//   }

//   public withReplication = (config: ReplicationConfig): IConfigurer => {
//     this.config.replicationConfig = config;
//     return this;
//   }

//   public withSharding = (config: ShardingConfig): IConfigurer => {
//     this.config.shardingConfig = config;
//     return this;
//   }

//   public withVectorIndex = (config: VectorIndexConfig): IConfigurer => {
//     this.config.vectorIndexConfig = config;
//     return this;
//   }

//   public withProperty = (config: PropertyConfig): IConfigurer => {
//     this.config.properties ? this.config.properties.push(config) : this.config.properties = [config];
//     return this;
//   }

//   public withReferenceProperty = (config: ReferencePropertyConfig): IConfigurer => {
//     this.config.referenceProperties ? this.config.referenceProperties.push(config) : this.config.referenceProperties = [config];
//     return this;
//   }

//   public make = (): WeaviateClass => {
//     const s = this.config.referenceProperties ? this.config.referenceProperties.map((property) => this.mapReferenceProperty(property)) : []
//     return {
//       ...this.config,
//       properties: this.config.properties?.map((property) => this.mapProperty(property)).concat(
//         this.config.referenceProperties ? this.config.referenceProperties.map((property) => this.mapReferenceProperty(property)) : []
//       )
//     };
//   }

//   private mapProperty = (property: PropertyConfig, vectorizer?: Vectorizer): Property => {
//     const { skipVectorisation, vectorizePropertyName, ...rest } = property;
//     return {
//       ...rest,
//       dataType: [property.dataType],
//       nestedProperties: property.nestedProperties?.map((nestedProperty) => {
//         return this.mapProperty(nestedProperty);
//       }),
//       moduleConfig: vectorizer ? {
//         vectorizer: {
//           skip: skipVectorisation,
//           vectorizePropertyName,
//         }
//       } : undefined,
//     }
//   }

//   private mapReferenceProperty = (property: ReferencePropertyConfig, vectorizer?: Vectorizer): Property => {
//     const { skipVectorisation, vectorizePropertyName, ...rest } = property;
//     return {
//       ...rest,
//       dataType: property.targetCollections,
//       moduleConfig: vectorizer ? {
//         vectorizer: {
//           skip: skipVectorisation,
//           vectorizePropertyName,
//         }
//       } : undefined,
//     }
//   }
// }

// const configure = (className: string) => Configurer.use(className);

// export default configure;

export {};
