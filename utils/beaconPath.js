import { isValidStringProperty } from "../validation/string";

const beaconPathPrefix = "weaviate://localhost";

export class BeaconPath {

  constructor(dbVersionSupport) {
    this.dbVersionSupport = dbVersionSupport;
    // matches
    // weaviate://localhost/class/id    => match[2] = class, match[4] = id
    // weaviate://localhost/class/id/   => match[2] = class, match[4] = id
    // weaviate://localhost/id          => match[2] = id, match[4] = undefined
    // weaviate://localhost/id/         => match[2] = id, match[4] = undefined
    this.beaconRegExp = /^weaviate:\/\/localhost(\/([^\/]+))?(\/([^\/]+))?[\/]?$/ig;
  }

  rebuild(beacon) {
    return this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise().then(support => {
      const match = new RegExp(this.beaconRegExp).exec(beacon);
      if (!match) {
        return beacon;
      }

      var className;
      var id;
      if (match[4] !== undefined) {
        id = match[4];
        className = match[2];
      } else {
        id = match[2];
      }

      var beaconPath = beaconPathPrefix;
      if (support.supports) {
        if (isValidStringProperty(className)) {
          beaconPath = `${beaconPath}/${className}`;
        } else {
          support.warns.deprecatedNonClassNameNamespacedEndpointsForBeacons();
        }
      } else {
        support.warns.notSupportedClassNamespacedEndpointsForBeacons();
      }
      if (isValidStringProperty(id)) {
        beaconPath = `${beaconPath}/${id}`;
      }

      return beaconPath;
    });
  }
}
