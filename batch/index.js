import ObjectsBatcher from "./objectsBatcher";
import ObjectsBatchDeleter from "./objectsBatchDeleter";
import ReferencesBatcher from "./referencesBatcher";
import ReferencePayloadBuilder from "./referencePayloadBuilder";
import { BeaconPath } from "../utils/beaconPath";

const batch = (client, dbVersionSupport) => {
  const beaconPath = new BeaconPath(dbVersionSupport);

  return {
    objectsBatcher: () => new ObjectsBatcher(client),
    objectsBatchDeleter: () => new ObjectsBatchDeleter(client),
    referencesBatcher: () => new ReferencesBatcher(client, beaconPath),
    referencePayloadBuilder: () => new ReferencePayloadBuilder(client),
  };
};

export default batch;
