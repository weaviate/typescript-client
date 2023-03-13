import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';

export default class RawGraphQL extends CommandBase {
  private query?: string;

  constructor(client: Connection) {
    super(client);
  }

  withQuery = (query: any) => {
    this.query = query;
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
    this.validateIsSet(this.query, 'query', '.raw().withQuery(query)');
  };

  do = (): Promise<any> => {
    const params = '';

    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error('invalid usage: ' + this.errors.join(', '))
      );
    }

    if (this.query) {
      return this.client.query(this.query);
    }

    return Promise.resolve(undefined);
  };
}
