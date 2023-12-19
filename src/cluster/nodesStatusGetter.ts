import Connection from '../connection';
import { NodesStatusResponse } from '../openapi/types';
import { CommandBase } from '../validation/commandBase';

export default class NodesStatusGetter extends CommandBase {
  private className?: string;
  private output?: string;

  constructor(client: Connection) {
    super(client);
  }

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withOutput = (output: 'minimal' | 'verbose') => {
    this.output = output;
    return this;
  };

  validate() {
    // nothing to validate
  }

  do = (): Promise<NodesStatusResponse> => {
    let path = '/nodes';
    if (this.className) {
      path = `${path}/${this.className}`;
    }
    if (this.output) {
      path = `${path}?output=${this.output}`;
    } else {
      path = `${path}?output=verbose`;
    }
    return this.client.get(path);
  };
}
