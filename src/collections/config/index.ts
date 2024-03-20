import Connection from '../../connection/index.js';
import { WeaviateShardStatus } from '../../openapi/types.js';
import { ClassGetter, PropertyCreator, ShardUpdater } from '../../schema/index.js';
import ShardsGetter from '../../schema/shardsGetter.js';
import { CollectionConfig } from './types/index.js';
import {
  PropertyConfigCreate,
  ReferenceMultiTargetConfigCreate,
  ReferenceSingleTargetConfigCreate,
} from '../configure/types/index.js';
import { classToCollection, resolveProperty, resolveReference } from './utils.js';

const config = <T>(connection: Connection, name: string, tenant?: string): Config<T> => {
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
    get: () =>
      new ClassGetter(connection)
        .withClassName(name)
        .do()
        .then(classToCollection<T>),
    getShards: () => {
      let builder = new ShardsGetter(connection).withClassName(name);
      if (tenant) {
        builder = builder.withTenant(tenant);
      }
      return builder.do().then((shards) =>
        shards.map((shard) => {
          if (shard.name === undefined) throw new Error('Shard name was not returned by Weaviate');
          if (shard.status === undefined) throw new Error('Shard status was not returned by Weaviate');
          if (shard.vectorQueueSize === undefined)
            throw new Error('Shard vector queue size was not returned by Weaviate');
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
   * Get the configuration for this collection from Weaviate.
   *
   * @returns {Promise<CollectionConfig<T>>} A promise that resolves with the collection configuration.
   */
  get: () => Promise<CollectionConfig<T>>;
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
}
