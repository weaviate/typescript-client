import ClassCreator from './classCreator';
import ClassDeleter from './classDeleter';
import ClassExists from './classExists';
import ClassGetter from './classGetter';
import PropertyCreator from './propertyCreator';
import SchemaGetter from './getter';
import ShardsGetter from './shardsGetter';
import ShardUpdater from './shardUpdater';
import ShardsUpdater from './shardsUpdater';
import TenantsCreator from './tenantsCreator';
import TenantsGetter from './tenantsGetter';
import TenantsUpdater from './tenantsUpdater';
import TenantsDeleter from './tenantsDeleter';
import Connection from '../connection';
import deleteAll from './deleteAll';
import { Tenant } from '../openapi/types';

export interface Schema {
  classCreator: () => ClassCreator;
  classDeleter: () => ClassDeleter;
  classGetter: () => ClassGetter;
  exists: (className: string) => Promise<boolean>;
  getter: () => SchemaGetter;
  propertyCreator: () => PropertyCreator;
  deleteAll: () => Promise<void>;
  shardsGetter: () => ShardsGetter;
  shardUpdater: () => ShardUpdater;
  shardsUpdater: () => ShardsUpdater;
  tenantsCreator: (className: string, tenants: Array<Tenant>) => TenantsCreator;
  tenantsGetter: (className: string) => TenantsGetter;
  tenantsUpdater: (className: string, tenants: Array<Tenant>) => TenantsUpdater;
  tenantsDeleter: (className: string, tenants: Array<string>) => TenantsDeleter;
}

const schema = (client: Connection): Schema => {
  return {
    classCreator: () => new ClassCreator(client),
    classDeleter: () => new ClassDeleter(client),
    classGetter: () => new ClassGetter(client),
    exists: (className: string) => new ClassExists(client).withClassName(className).do(),
    getter: () => new SchemaGetter(client),
    propertyCreator: () => new PropertyCreator(client),
    deleteAll: () => deleteAll(client),
    shardsGetter: () => new ShardsGetter(client),
    shardUpdater: () => new ShardUpdater(client),
    shardsUpdater: () => new ShardsUpdater(client),
    tenantsCreator: (className: string, tenants: Array<Tenant>) =>
      new TenantsCreator(client, className, tenants),
    tenantsGetter: (className: string) => new TenantsGetter(client, className),
    tenantsUpdater: (className: string, tenants: Array<Tenant>) =>
      new TenantsUpdater(client, className, tenants),
    tenantsDeleter: (className: string, tenants: Array<string>) =>
      new TenantsDeleter(client, className, tenants),
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
export { default as TenantsCreator } from './tenantsCreator';
export { default as TenantsUpdater } from './tenantsUpdater';
export { default as TenantsGetter } from './tenantsGetter';
export { default as TenantsDeleter } from './tenantsDeleter';
