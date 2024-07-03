import Connection from '../connection';
import { BeaconPath } from '../utils/beaconPath';
import { DbVersionSupport } from '../utils/dbVersion';
import ObjectsBatchDeleter from './objectsBatchDeleter';
import ObjectsBatcher from './objectsBatcher';
import ReferencePayloadBuilder from './referencePayloadBuilder';
import ReferencesBatcher from './referencesBatcher';

export type DeleteOutput = 'verbose' | 'minimal';
export type DeleteResultStatus = 'SUCCESS' | 'FAILED' | 'DRYRUN';

export interface Batch {
  objectsBatcher: () => ObjectsBatcher;
  objectsBatchDeleter: () => ObjectsBatchDeleter;
  referencesBatcher: () => ReferencesBatcher;
  referencePayloadBuilder: () => ReferencePayloadBuilder;
}

const batch = (client: Connection, dbVersionSupport: DbVersionSupport): Batch => {
  const beaconPath = new BeaconPath(dbVersionSupport);

  return {
    objectsBatcher: () => new ObjectsBatcher(client),
    objectsBatchDeleter: () => new ObjectsBatchDeleter(client),
    referencesBatcher: () => new ReferencesBatcher(client, beaconPath),
    referencePayloadBuilder: () => new ReferencePayloadBuilder(client),
  };
};

export default batch;
export { default as ObjectsBatchDeleter } from './objectsBatchDeleter';
export { default as ObjectsBatcher } from './objectsBatcher';
export { default as ReferencesBatcher } from './referencesBatcher';
