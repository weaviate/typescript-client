import { buildRefsPath } from "./path"

export default class ReferencesBatcher {
  constructor(client, beaconPath) {
    this.client = client;
    this.beaconPath = beaconPath;
    this.references = [];
    this.errors = [];
  }

  /**
   * can be called as:
   *  - withReferences([ref1, ref2, ref3])
   *  - withReferences(ref1, ref2, ref3)
   *  - withReferences(ref1)
   * @param  {...any} references
   */
  withReferences(...references) {
    let refs = references;
    if (references.length && Array.isArray(references[0])) {
      refs = references[0];
    }
    this.references = [...this.references, ...refs];
    return this;
  }

  withReference(reference) {
    return this.withReferences(reference);
  }

  withConsistencyLevel = (cl) => {
    this.consistencyLevel = cl;
    return this;
  };

  payload = () => this.references;

  validateReferenceCount = () => {
    if (this.references.length == 0) {
      this.errors = [
        ...this.errors,
        "need at least one reference to send a request, " +
          "add one with .withReference(obj)",
      ];
    }
  };

  validate = () => {
    this.validateReferenceCount();
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }
    let params = new URLSearchParams()
    if (this.consistencyLevel) {
      params.set("consistency_level", this.consistencyLevel)
    }
    const path = buildRefsPath(params);
    const payloadPromise = Promise.all(this.references.map(ref => this.rebuildReferencePromise(ref)));

    return payloadPromise.then(payload => this.client.post(path, payload));
  };

  rebuildReferencePromise(reference) {
    return this.beaconPath.rebuild(reference.to)
      .then(beaconTo => ({
        from: reference.from,
        to: beaconTo
      }));
  }
}
