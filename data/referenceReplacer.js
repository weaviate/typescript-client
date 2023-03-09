export default class ReferenceReplacer {
  constructor(client, referencesPath, beaconPath) {
    this.client = client;
    this.referencesPath = referencesPath;
    this.beaconPath = beaconPath;
    this.errors = [];
  }

  withId = (id) => {
    this.id = id;
    return this;
  };

  withClassName(className) {
    this.className = className;
    return this;
  }

  withReferences = (refs) => {
    this.references = refs;
    return this;
  };

  withReferenceProperty = (refProp) => {
    this.refProp = refProp;
    return this;
  };

  withConsistencyLevel = (cl) => {
    this.consistencyLevel = cl;
    return this;
  };

  validateIsSet = (prop, name, setter) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.errors = [
        ...this.errors,
        `${name} must be set - set with ${setter}`,
      ];
    }
  };

  validate = () => {
    this.validateIsSet(this.id, "id", ".withId(id)");
    this.validateIsSet(
      this.refProp,
      "referenceProperty",
      ".withReferenceProperty(refProp)"
    );
  };

  payload = () => this.references;

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    var payloadPromise = Array.isArray(this.references)
      ? Promise.all(this.references.map(ref => this.rebuildReferencePromise(ref)))
      : Promise.resolve([]);

    return Promise.all([
      this.referencesPath.build(this.id, this.className, this.refProp, this.consistencyLevel),
      payloadPromise
    ]).then(results => {
      const path = results[0];
      const payload = results[1];
      return this.client.put(path, payload, false);
    });
  };

  rebuildReferencePromise(reference) {
    return this.beaconPath.rebuild(reference.beacon)
      .then(beacon => ({ beacon }));
  }
}
