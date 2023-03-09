import Connection from "../connection";
import {CommandBase} from "../validation/commandBase";

export default class ConceptsGetter extends CommandBase {
  private concept?: string;

  constructor(client: Connection) {
    super(client)
  }

  validateIsSet = (prop: string | undefined | null, name: string, setter: string) => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`)
    }
  };

  withConcept = (concept: string) => {
    this.concept = concept;
    return this;
  };

  validate = () => {
    this.validateIsSet(this.concept, "concept", "withConcept(concept)");
  };

  do = () => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    const path = `/modules/text2vec-contextionary/concepts/${this.concept}`;
    return this.client.get(path);
  };
}
