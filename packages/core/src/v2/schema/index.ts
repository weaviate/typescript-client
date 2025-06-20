import Connection from '../../connection/index.js';
import { Tenant } from '../../openapi/types.js';
import ClassCreator from './classCreator.js';
import ClassDeleter from './classDeleter.js';
import ClassExists from './classExists.js';
import ClassGetter from './classGetter.js';
import ClassUpdater from './classUpdater.js';
import deleteAll from './deleteAll.js';
import SchemaGetter from './getter.js';
import PropertyCreator from './propertyCreator.js';
import ShardUpdater from './shardUpdater.js';
import ShardsGetter from './shardsGetter.js';
import ShardsUpdater from './shardsUpdater.js';
import TenantsCreator from './tenantsCreator.js';
import TenantsDeleter from './tenantsDeleter.js';
import TenantsExists from './tenantsExists.js';
import TenantsGetter from './tenantsGetter.js';
import TenantsUpdater from './tenantsUpdater.js';

export interface Schema {
  classCreator: () => ClassCreator;
  classDeleter: () => ClassDeleter;
  classGetter: () => ClassGetter;
  classUpdater: () => ClassUpdater;
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
  tenantsExists: (className: string, tenant: string) => TenantsExists;
}

const schema = (client: Connection): Schema => {
  return {
    classCreator: () => new ClassCreator(client),
    classDeleter: () => new ClassDeleter(client),
    classGetter: () => new ClassGetter(client),
    classUpdater: () => new ClassUpdater(client),
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
    tenantsExists: (className: string, tenant: string) => new TenantsExists(client, className, tenant),
  };
};

export default schema;
export { default as ClassCreator } from './classCreator.js';
export { default as ClassDeleter } from './classDeleter.js';
export { default as ClassGetter } from './classGetter.js';
export { default as SchemaGetter } from './getter.js';
export { default as PropertyCreator } from './propertyCreator.js';
export { default as ShardUpdater } from './shardUpdater.js';
export { default as ShardsUpdater } from './shardsUpdater.js';
export { default as TenantsCreator } from './tenantsCreator.js';
export { default as TenantsDeleter } from './tenantsDeleter.js';
export { default as TenantsExists } from './tenantsExists.js';
export { default as TenantsGetter } from './tenantsGetter.js';
export { default as TenantsUpdater } from './tenantsUpdater.js';
