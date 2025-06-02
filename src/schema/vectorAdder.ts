import Connection from '../connection/index.js';
import { VectorConfig } from '../index.js';
import { CommandBase } from '../validation/commandBase.js';
import { isValidStringProperty } from '../validation/string.js';
import ClassGetter from './classGetter.js';

export default class VectorAdder<T> extends CommandBase {
  private className!: string;
  private vectors!: Record<string, any>;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };
  withVectors = (vectors: Record<string, VectorConfig>) => {
    this.vectors = vectors;
    return this;
  };

  validateClassName = () => {
    if (!isValidStringProperty(this.className)) {
      this.addError('className must be set - set with .withClassName(className)');
    }
  };

  validate = () => {
    this.validateClassName();
  };

  do = (): Promise<void> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    return new ClassGetter(this.client)
      .withClassName(this.className)
      .do()
      .then(async (schema) => {
        if (schema.vectorConfig === undefined) {
          schema.vectorConfig = {};
        }

        for (const [key, value] of Object.entries(this.vectors)) {
          if (schema.vectorConfig[key] !== undefined) {
            continue;
          }
          schema.vectorConfig![key] = { ...value };
        }

        const path = `/schema/${this.className}`;
        await this.client.put(path, schema);
      });
  };
}
