import { buildRefsPath } from './path';
import { BeaconPath } from '../utils/beaconPath';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { BatchReference, BatchReferenceResponse } from '../openapi/types';
import { ConsistencyLevel } from '../data/replication';

export default class ReferencesBatcher extends CommandBase {
  private beaconPath: BeaconPath;
  private consistencyLevel?: ConsistencyLevel;
  public references: BatchReference[];

  constructor(client: Connection, beaconPath: BeaconPath) {
    super(client);
    this.beaconPath = beaconPath;
    this.references = [];
  }

  /**
   * can be called as:
   *  - withReferences(...[ref1, ref2, ref3])
   *  - withReferences(ref1, ref2, ref3)
   *  - withReferences(ref1)
   * @param  {...BatchReference[]} references
   */
  withReferences(...references: BatchReference[]) {
    let refs = references;
    if (references.length && Array.isArray(references[0])) {
      refs = references[0];
    }
    this.references = [...this.references, ...refs];
    return this;
  }

  withReference(reference: BatchReference) {
    return this.withReferences(reference);
  }

  withConsistencyLevel = (cl: ConsistencyLevel) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload = (): BatchReference[] => this.references;

  validateReferenceCount = (): void => {
    if (this.references.length == 0) {
      this.addError('need at least one reference to send a request, add one with .withReference(obj)');
    }
  };

  validate = () => {
    this.validateReferenceCount();
  };

  do = (): Promise<BatchReferenceResponse[]> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    const params = new URLSearchParams();
    if (this.consistencyLevel) {
      params.set('consistency_level', this.consistencyLevel);
    }
    const path = buildRefsPath(params);
    const payloadPromise = Promise.all(this.references.map((ref) => this.rebuildReferencePromise(ref)));

    return payloadPromise.then((payload) => this.client.postReturn(path, payload));
  };

  rebuildReferencePromise = (reference: BatchReference): Promise<BatchReference> => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.beaconPath.rebuild(reference.to!).then((beaconTo: any) => ({
      from: reference.from,
      to: beaconTo,
      tenant: reference.tenant,
    }));
  };
}
