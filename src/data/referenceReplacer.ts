import Connection from '../connection';
import { BeaconPath } from '../utils/beaconPath';
import { ReferencesPath } from './path';
import { CommandBase } from '../validation/commandBase';

export default class ReferenceReplacer extends CommandBase {
  private beaconPath: BeaconPath;
  private className?: string;
  private consistencyLevel?: string;
  private id?: string;
  private references?: any[];
  private referencesPath: ReferencesPath;
  private refProp?: string;

  constructor(
    client: Connection,
    referencesPath: ReferencesPath,
    beaconPath: BeaconPath
  ) {
    super(client);
    this.beaconPath = beaconPath;
    this.referencesPath = referencesPath;
  }

  withId = (id: string) => {
    this.id = id;
    return this;
  };

  withClassName(className: string) {
    this.className = className;
    return this;
  }

  withReferences = (refs: any) => {
    this.references = refs;
    return this;
  };

  withReferenceProperty = (refProp: string) => {
    this.refProp = refProp;
    return this;
  };

  withConsistencyLevel = (cl: string) => {
    this.consistencyLevel = cl;
    return this;
  };

  validateIsSet = (
    prop: string | undefined | null,
    name: string,
    setter: string
  ) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = () => {
    this.validateIsSet(this.id, 'id', '.withId(id)');
    this.validateIsSet(
      this.refProp,
      'referenceProperty',
      '.withReferenceProperty(refProp)'
    );
  };

  payload = () => this.references;

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }

    const payloadPromise = Array.isArray(this.references)
      ? Promise.all(
          this.references.map((ref) => this.rebuildReferencePromise(ref))
        )
      : Promise.resolve([]);

    return Promise.all([
      this.referencesPath.build(
        this.id!,
        this.className!,
        this.refProp!,
        this.consistencyLevel!
      ),
      payloadPromise,
    ]).then((results) => {
      const path = results[0];
      const payload = results[1];
      return this.client.put(path, payload, false);
    });
  };

  rebuildReferencePromise(reference: any) {
    return this.beaconPath
      .rebuild(reference.beacon)
      .then((beacon: any) => ({ beacon }));
  }
}
