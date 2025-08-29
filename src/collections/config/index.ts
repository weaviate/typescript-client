import Connection from '../../connection/index.js';
import { WeaviateDeserializationError } from '../../errors.js';
import { WeaviateShardStatus } from '../../openapi/types.js';
import ClassUpdater from '../../schema/classUpdater.js';
import { ClassGetter, PropertyCreator, ShardUpdater } from '../../schema/index.js';
import ShardsGetter from '../../schema/shardsGetter.js';
import VectorAdder from '../../schema/vectorAdder.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import {
  PropertyConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
  VectorizersConfigAdd,
} from '../configure/types/index.js';
import { MergeWithExisting } from './classes.js';
import {
  BQConfig,
  CollectionConfig,
  CollectionConfigUpdate,
  PQConfig,
  QuantizerConfig,
  RQConfig,
  SQConfig,
  VectorIndexConfig,
  VectorIndexConfigDynamic,
  VectorIndexConfigFlat,
  VectorIndexConfigHNSW,
} from './types/index.js';
import { classToCollection, makeVectorsConfig, resolveProperty, resolveReference } from './utils.js';

const config = <T>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport,
  tenant?: string
): Config<T> => {
  const getRaw = new ClassGetter(connection).withClassName(name).do;
  return {
    addProperty: (property: PropertyConfigCreate<any>) =>
      new PropertyCreator(connection)
        .withClassName(name)
        .withProperty(resolveProperty<any>(property, []))
        .do()
        .then(() => {}),
    addReference: (
      reference: ReferenceSingleTargetConfigCreate<any> | ReferenceMultiTargetConfigCreate<any>
    ) =>
      new PropertyCreator(connection)
        .withClassName(name)
        .withProperty(resolveReference<any>(reference))
        .do()
        .then(() => {}),
    addVector: (vectors: VectorizersConfigAdd<T>) => {
      const { vectorsConfig } = makeVectorsConfig(vectors);
      return new VectorAdder(connection).withClassName(name).withVectors(vectorsConfig).do();
    },
    get: () => getRaw().then(classToCollection<T>),
    getShards: () => {
      let builder = new ShardsGetter(connection).withClassName(name);
      if (tenant) {
        builder = builder.withTenant(tenant);
      }
      return builder.do().then((shards) =>
        shards.map((shard) => {
          if (shard.name === undefined)
            throw new WeaviateDeserializationError('Shard name was not returned by Weaviate');
          if (shard.status === undefined)
            throw new WeaviateDeserializationError('Shard status was not returned by Weaviate');
          if (shard.vectorQueueSize === undefined)
            throw new WeaviateDeserializationError('Shard vector queue size was not returned by Weaviate');
          return { name: shard.name, status: shard.status, vectorQueueSize: shard.vectorQueueSize };
        })
      );
    },
    updateShards: async function (status: 'READY' | 'READONLY', names?: string | string[]) {
      let shardNames: string[];
      if (names === undefined) {
        shardNames = await this.getShards().then((shards) => shards.map((s) => s.name));
      } else if (typeof names === 'string') {
        shardNames = [names];
      } else {
        shardNames = names;
      }
      return Promise.all(
        shardNames.map((shardName) =>
          new ShardUpdater(connection).withClassName(name).withShardName(shardName).withStatus(status).do()
        )
      ).then(() => this.getShards());
    },
    update: (config?: CollectionConfigUpdate<T>) => {
      return getRaw()
        .then((current) => MergeWithExisting.schema(current, config))
        .then((merged) => new ClassUpdater(connection).withClass(merged).do())
        .then(() => {});
    },
  };
};

export default config;

export interface Config<T> {
  /**
   * Add a property to the collection in Weaviate.
   *
   * @param {PropertyConfigCreate<any>} property The property configuration.
   * @returns {Promise<void>} A promise that resolves when the property has been added.
   */
  addProperty: (property: PropertyConfigCreate<any>) => Promise<void>;
  /**
   * Add a reference to the collection in Weaviate.
   *
   * @param {ReferenceSingleTargetConfigCreate<any> | ReferenceMultiTargetConfigCreate<any>} reference The reference configuration.
   * @returns {Promise<void>} A promise that resolves when the reference has been added.
   */
  addReference: (
    reference: ReferenceSingleTargetConfigCreate<T> | ReferenceMultiTargetConfigCreate<T>
  ) => Promise<void>;
  /**
   * Add one or more named vectors to the collection in Weaviate.
   * Named vectors can be added to collections with existing named vectors only.
   *
   * Existing named vectors are immutable in Weaviate. The client will not include
   * any of those in the request.
   *
   * @param {VectorizersConfigAdd<any>} vectors Vector configurations.
   * @returns {Promise<void>} A promise that resolves when the named vector has been created.
   */
  addVector: (vectors: VectorizersConfigAdd<T>) => Promise<void>;
  /**
   * Get the configuration for this collection from Weaviate.
   *
   * @returns {Promise<CollectionConfig<T>>} A promise that resolves with the collection configuration.
   */
  get: () => Promise<CollectionConfig>;
  /**
   * Get the statuses of the shards of this collection.
   *
   * If the collection is multi-tenancy and you did not call `.with_tenant` then you
   * will receive the statuses of all the tenants within the collection. Otherwise, call
   * `.with_tenant` on the collection first and you will receive only that single shard.
   *
   * @returns {Promise<Required<WeaviateShardStatus>[]>} A promise that resolves with the shard statuses.
   */
  getShards: () => Promise<Required<WeaviateShardStatus>[]>;
  /**
   * Update the status of one or all shards of this collection.
   *
   * @param {'READY' | 'READONLY'} status The new status of the shard(s).
   * @param {string | string[]} [names] The name(s) of the shard(s) to update. If not provided, all shards will be updated.
   * @returns {Promise<Required<WeaviateShardStatus>[]>} A promise that resolves with the updated shard statuses.
   */
  updateShards: (
    status: 'READY' | 'READONLY',
    names?: string | string[]
  ) => Promise<Required<WeaviateShardStatus>[]>;
  /**
   * Update the configuration for this collection in Weaviate.
   *
   * Use the `weaviate.classes.Reconfigure` class to generate the necessary configuration objects for this method.
   *
   * @param {CollectionConfigUpdate<T>} [config] The configuration to update. Only a subset of the actual collection configuration can be updated.
   * @returns {Promise<void>} A promise that resolves when the collection has been updated.
   */
  update: (config?: CollectionConfigUpdate<T>) => Promise<void>;
}

export class VectorIndex {
  static isHNSW(config?: VectorIndexConfig): config is VectorIndexConfigHNSW {
    return config?.type === 'hnsw';
  }
  static isFlat(config?: VectorIndexConfig): config is VectorIndexConfigFlat {
    return config?.type === 'flat';
  }
  static isDynamic(config?: VectorIndexConfig): config is VectorIndexConfigDynamic {
    return config?.type === 'dynamic';
  }
}

export class Quantizer {
  static isPQ(config?: QuantizerConfig): config is PQConfig {
    return config?.type === 'pq';
  }
  static isBQ(config?: QuantizerConfig): config is BQConfig {
    return config?.type === 'bq';
  }
  static isSQ(config?: QuantizerConfig): config is SQConfig {
    return config?.type === 'sq';
  }
  static isRQ(config?: QuantizerConfig): config is RQConfig {
    return config?.type === 'rq';
  }
}

export const configGuards = {
  quantizer: Quantizer,
  vectorIndex: VectorIndex,
};
