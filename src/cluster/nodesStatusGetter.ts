import Connection from '../connection';
import { NodesStatusResponse } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';

export default class NodesStatusGetter extends CommandBase {
  private className?: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  validate() {
    // nothing to validate
  }

  do = (): Promise<NodesStatusResponse> => {
    if (this.className) {
      return this.client.get(`/nodes/${this.className}`);
    }
    return this.client.get('/nodes');
  };
}
