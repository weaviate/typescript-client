import Connection from '../../connection/index.js';
import { BeaconPath } from '../../utils/beaconPath.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import ObjectsBatchDeleter from './objectsBatchDeleter.js';
import ObjectsBatcher from './objectsBatcher.js';
import ReferencePayloadBuilder from './referencePayloadBuilder.js';
import ReferencesBatcher from './referencesBatcher.js';

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
export { default as ObjectsBatchDeleter } from './objectsBatchDeleter.js';
export { default as ObjectsBatcher } from './objectsBatcher.js';
export { default as ReferencesBatcher } from './referencesBatcher.js';
