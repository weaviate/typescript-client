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
  addProperty: (property: PropertyConfigCreate<any>) => Promise<void>;
  addReference: (
    reference: ReferenceSingleTargetConfigCreate<T> | ReferenceMultiTargetConfigCreate<T>
  ) => Promise<void>;
  get: () => Promise<CollectionConfig<T>>;
  getShards: () => Promise<Required<WeaviateShardStatus>[]>;
  updateShards: (
    status: 'READY' | 'READONLY',
    names?: string | string[]
  ) => Promise<Required<WeaviateShardStatus>[]>;
}
