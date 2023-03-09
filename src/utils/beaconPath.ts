import { isValidStringProperty } from '../validation/string';
import { DbVersionSupport } from './dbVersion';

const beaconPathPrefix = 'weaviate://localhost';

export class BeaconPath {
  private dbVersionSupport: DbVersionSupport;
  private beaconRegExp: RegExp;

  constructor(dbVersionSupport: DbVersionSupport) {
    this.dbVersionSupport = dbVersionSupport;
    // matches
    // weaviate://localhost/class/id    => match[2] = class, match[4] = id
    // weaviate://localhost/class/id/   => match[2] = class, match[4] = id
    // weaviate://localhost/id          => match[2] = id, match[4] = undefined
    // weaviate://localhost/id/         => match[2] = id, match[4] = undefined
    this.beaconRegExp =
      /^weaviate:\/\/localhost(\/([^\\/]+))?(\/([^\\/]+))?[\\/]?$/gi;
  }

  async rebuild(beacon: string) {
    const support =
      await this.dbVersionSupport.supportsClassNameNamespacedEndpointsPromise();
    const match = new RegExp(this.beaconRegExp).exec(beacon);
    if (!match) {
      return beacon;
    }
    let className;
    let id;
    if (match[4] !== undefined) {
      id = match[4];
      className = match[2];
    } else {
      id = match[2];
    }
    let beaconPath = beaconPathPrefix;
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
  }
}
