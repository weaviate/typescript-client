export default class ReferenceDeleter {
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

  withReference = (ref) => {
    this.reference = ref;
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
    this.validateIsSet(this.reference, "reference", ".withReference(ref)");
    this.validateIsSet(
      this.refProp,
      "referenceProperty",
      ".withReferenceProperty(refProp)"
    );
  };

  payload = () => this.reference;

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    return Promise.all([
      this.referencesPath.build(this.id, this.className, this.refProp, this.consistencyLevel),
      this.beaconPath.rebuild(this.reference.beacon)
    ]).then(results => {
      const path = results[0];
      const beacon = results[1];
      return this.client.delete(path, { beacon }, false);
    });
  };
}
