import Connection from '../connection';
import { BeaconPath } from '../utils/beaconPath';
import { DbVersionSupport } from '../utils/dbVersion';
import Checker from './checker';
import Creator from './creator';
import Deleter from './deleter';
import Getter from './getter';
import GetterById from './getterById';
import Merger from './merger';
import { ObjectsPath, ReferencesPath } from './path';
import ReferenceCreator from './referenceCreator';
import ReferenceDeleter from './referenceDeleter';
import ReferencePayloadBuilder from './referencePayloadBuilder';
import ReferenceReplacer from './referenceReplacer';
import Updater from './updater';
import Validator from './validator';

export interface Data {
  creator: () => Creator;
  validator: () => Validator;
  updater: () => Updater;
  merger: () => Merger;
  getter: () => Getter;
  getterById: () => GetterById;
  deleter: () => Deleter;
  checker: () => Checker;
  referenceCreator: () => ReferenceCreator;
  referenceReplacer: () => ReferenceReplacer;
  referenceDeleter: () => ReferenceDeleter;
  referencePayloadBuilder: () => ReferencePayloadBuilder;
}

const data = (client: Connection, dbVersionSupport: DbVersionSupport): Data => {
  const objectsPath = new ObjectsPath(dbVersionSupport);
  const referencesPath = new ReferencesPath(dbVersionSupport);
  const beaconPath = new BeaconPath(dbVersionSupport);

  return {
    creator: () => new Creator(client, objectsPath),
    validator: () => new Validator(client),
    updater: () => new Updater(client, objectsPath),
    merger: () => new Merger(client, objectsPath),
    getter: () => new Getter(client, objectsPath),
    getterById: () => new GetterById(client, objectsPath),
    deleter: () => new Deleter(client, objectsPath),
    checker: () => new Checker(client, objectsPath),
    referenceCreator: () => new ReferenceCreator(client, referencesPath, beaconPath),
    referenceReplacer: () => new ReferenceReplacer(client, referencesPath, beaconPath),
    referenceDeleter: () => new ReferenceDeleter(client, referencesPath, beaconPath),
    referencePayloadBuilder: () => new ReferencePayloadBuilder(client),
  };
};

export default data;
export { default as Checker } from './checker';
export { default as Creator } from './creator';
export { default as Deleter } from './deleter';
export { default as Getter } from './getter';
export { default as GetterById } from './getterById';
export { default as Merger } from './merger';
export { default as ReferenceCreator } from './referenceCreator';
export { default as ReferenceDeleter } from './referenceDeleter';
export { default as ReferencePayloadBuilder } from './referencePayloadBuilder';
export { default as ReferenceReplacer } from './referenceReplacer';
export { default as Updater } from './updater';
export { default as Validator } from './validator';

export type { ConsistencyLevel } from './replication';
