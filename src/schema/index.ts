import Connection from '../connection';
import { Tenant, TenantCreate, TenantUpdate } from '../openapi/types';
import ClassCreator from './classCreator';
import ClassDeleter from './classDeleter';
import ClassExists from './classExists';
import ClassGetter from './classGetter';
import deleteAll from './deleteAll';
import SchemaGetter from './getter';
import PropertyCreator from './propertyCreator';
import ShardUpdater from './shardUpdater';
import ShardsGetter from './shardsGetter';
import ShardsUpdater from './shardsUpdater';
import TenantsCreator from './tenantsCreator';
import TenantsDeleter from './tenantsDeleter';
import TenantsExists from './tenantsExists';
import TenantsGetter from './tenantsGetter';
import TenantsUpdater from './tenantsUpdater';

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
  tenantsCreator: (className: string, tenants: Array<Tenant | TenantCreate>) => TenantsCreator;
  tenantsGetter: (className: string) => TenantsGetter;
  tenantsUpdater: (className: string, tenants: Array<Tenant | TenantUpdate>) => TenantsUpdater;
  tenantsDeleter: (className: string, tenants: Array<string>) => TenantsDeleter;
  tenantsExists: (className: string, tenant: string) => TenantsExists;
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
    tenantsCreator: (className: string, tenants: Array<Tenant | TenantCreate>) =>
      new TenantsCreator(client, className, tenants),
    tenantsGetter: (className: string) => new TenantsGetter(client, className),
    tenantsUpdater: (className: string, tenants: Array<Tenant | TenantUpdate>) =>
      new TenantsUpdater(client, className, tenants),
    tenantsDeleter: (className: string, tenants: Array<string>) =>
      new TenantsDeleter(client, className, tenants),
    tenantsExists: (className: string, tenant: string) => new TenantsExists(client, className, tenant),
  };
};

export default schema;
export { default as ClassCreator } from './classCreator';
export { default as ClassDeleter } from './classDeleter';
export { default as ClassGetter } from './classGetter';
export { default as SchemaGetter } from './getter';
export { default as PropertyCreator } from './propertyCreator';
export { default as ShardUpdater } from './shardUpdater';
export { default as ShardsUpdater } from './shardsUpdater';
export { default as TenantsCreator } from './tenantsCreator';
export { default as TenantsDeleter } from './tenantsDeleter';
export { default as TenantsExists } from './tenantsExists';
export { default as TenantsGetter } from './tenantsGetter';
export { default as TenantsUpdater } from './tenantsUpdater';
