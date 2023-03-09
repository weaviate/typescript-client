export default class ClassCreator {
  constructor(client) {
    this.client = client;
    this.errors = [];
  }

  withClass = (classObj) => {
    this.class = classObj;
    return this;
  };

  validateClass = () => {
    if (this.class == undefined || this.class == null) {
      this.errors = [
        ...this.errors,
        "class object must be set - set with .withClass(class)",
      ];
    }
  };

  do = () => {
    this.validateClass();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }
    const path = `/schema`;
    return this.client.post(path, this.class);
  };
}
