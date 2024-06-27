import Connection from '../connection/index.js';
import { C11yExtension } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';

export default class ExtensionCreator extends CommandBase {
  private concept?: string;
  private definition?: string;
  private weight?: number;

  constructor(client: Connection) {
    super(client);
  }

  withConcept = (concept: string) => {
    this.concept = concept;
    return this;
  };

  withDefinition = (definition: string) => {
    this.definition = definition;
    return this;
  };

  withWeight = (weight: number) => {
    this.weight = weight;
    return this;
  };

  validateIsSet = (prop: string | undefined | null, name: string, setter: string): void => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validate = (): void => {
    this.validateIsSet(this.concept, 'concept', 'withConcept(concept)');
    this.validateIsSet(this.definition, 'definition', 'withDefinition(definition)');
    this.validateIsSet(this.weight?.toString() || '', 'weight', 'withWeight(weight)');
  };

  payload = (): C11yExtension => ({
    concept: this.concept,
    definition: this.definition,
    weight: this.weight,
  });

  do = (): Promise<C11yExtension> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    const path = `/modules/text2vec-contextionary/extensions`;
    return this.client.postReturn(path, this.payload());
  };
}
