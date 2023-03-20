import Creator from './creator';
import Validator from './validator';
import Updater from './updater';
import Merger from './merger';
import Getter from './getter';
import GetterById from './getterById';
import Deleter from './deleter';
import Checker from './checker';
import ReferenceCreator from './referenceCreator';
import ReferenceReplacer from './referenceReplacer';
import ReferenceDeleter from './referenceDeleter';
import ReferencePayloadBuilder from './referencePayloadBuilder';
import { ObjectsPath, ReferencesPath } from './path';
import { BeaconPath } from '../utils/beaconPath';
import { DbVersionSupport } from '../utils/dbVersion';
import Connection from '../connection';
import { WeaviateClient } from '../index';

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
    referenceCreator: () =>
      new ReferenceCreator(client, referencesPath, beaconPath),
    referenceReplacer: () =>
      new ReferenceReplacer(client, referencesPath, beaconPath),
    referenceDeleter: () =>
      new ReferenceDeleter(client, referencesPath, beaconPath),
    referencePayloadBuilder: () => new ReferencePayloadBuilder(client),
  };
};

export default data;
