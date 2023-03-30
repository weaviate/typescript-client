import ClassCreator from './classCreator';
import ClassDeleter from './classDeleter';
import ClassGetter from './classGetter';
import PropertyCreator from './propertyCreator';
import SchemaGetter from './getter';
import ShardsGetter from './shardsGetter';
import ShardUpdater from './shardUpdater';
import ShardsUpdater from './shardsUpdater';
import Connection from '../connection';

export interface Schema {
  classCreator: () => ClassCreator;
  classDeleter: () => ClassDeleter;
  classGetter: () => ClassGetter;
  getter: () => SchemaGetter;
  propertyCreator: () => PropertyCreator;
  shardsGetter: () => ShardsGetter;
  shardUpdater: () => ShardUpdater;
  shardsUpdater: () => ShardsUpdater;
}

const schema = (client: Connection): Schema => {
  return {
    classCreator: () => new ClassCreator(client),
    classDeleter: () => new ClassDeleter(client),
    classGetter: () => new ClassGetter(client),
    getter: () => new SchemaGetter(client),
    propertyCreator: () => new PropertyCreator(client),
    shardsGetter: () => new ShardsGetter(client),
    shardUpdater: () => new ShardUpdater(client),
    shardsUpdater: () => new ShardsUpdater(client),
  };
};

export default schema;
export { default as ClassCreator } from './classCreator';
export { default as ClassDeleter } from './classDeleter';
export { default as ClassGetter } from './classGetter';
export { default as PropertyCreator } from './propertyCreator';
export { default as SchemaGetter } from './getter';
export { default as ShardUpdater } from './shardUpdater';
export { default as ShardsUpdater } from './shardsUpdater';
