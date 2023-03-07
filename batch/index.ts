import ObjectsBatcher from "./objectsBatcher";
import ObjectsBatchDeleter from "./objectsBatchDeleter";
import ReferencesBatcher from "./referencesBatcher";
import ReferencePayloadBuilder from "./referencePayloadBuilder";
import {BeaconPath} from "../utils/beaconPath";
import {DbVersionSupport} from "../utils/dbVersion";
import Connection from "../connection";

export interface IWeaviateClientBatch {
  objectsBatcher: () => ObjectsBatcher
  objectsBatchDeleter: () => ObjectsBatchDeleter
  referencesBatcher: () => ReferencesBatcher
  referencePayloadBuilder: () => ReferencePayloadBuilder
}

const batch = (client: Connection, dbVersionSupport: DbVersionSupport): IWeaviateClientBatch => {
  const beaconPath = new BeaconPath(dbVersionSupport);

  return {
    objectsBatcher: () => new ObjectsBatcher(client),
    objectsBatchDeleter: () => new ObjectsBatchDeleter(client),
    referencesBatcher: () => new ReferencesBatcher(client, beaconPath),
    referencePayloadBuilder: () => new ReferencePayloadBuilder(client),
  };
};

export default batch;
