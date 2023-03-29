import { BeaconPath } from '../utils/beaconPath';
import { ReferencesPath } from './path';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Reference } from '../openapi/types';
import { ConsistencyLevel } from './replication';

export default class ReferenceDeleter extends CommandBase {
  private beaconPath: BeaconPath;
  private className!: string;
  private consistencyLevel?: ConsistencyLevel;
  private id!: string;
  private reference!: Reference;
  private referencesPath: ReferencesPath;
  private refProp!: string;

  constructor(client: Connection, referencesPath: ReferencesPath, beaconPath: BeaconPath) {
    super(client);
    this.referencesPath = referencesPath;
    this.beaconPath = beaconPath;
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName(className: string) {
    this.className = className;
    return this;
  }

  withReference = (ref: Reference) => {
    this.reference = ref;
    return this;
  };

  withReferenceProperty = (refProp: string) => {
    this.refProp = refProp;
    return this;
  };

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(this.id, 'id', '.withId(id)');
    this.validateIsSet(this.refProp, 'referenceProperty', '.withReferenceProperty(refProp)');
  };

  payload = () => this.reference;

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    if (!this.reference.beacon) {
      throw new Error('reference beacon must be set');
    }

    return Promise.all([
      this.referencesPath.build(this.id, this.className, this.refProp, this.consistencyLevel),
      this.beaconPath.rebuild(this.reference.beacon),
    ]).then((results) => {
      const path = results[0];
      const beacon = results[1];
      return this.client.delete(path, { beacon }, false);
    });
  };
}
