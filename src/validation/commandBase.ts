import Connection from '../connection';

export interface ICommandBase {
  /**
   * The client's connection
   */
  client: Connection;
  /**
   * An array of validation errors
   */
  errors: string[];
  /**
   * Execute the command
   */
  do: () => Promise<any>;
  /**
   * Optional method to build the payload of an actual call
   */
  payload?: () => any;
  /**
   * validate that all the required parameters were feed to the builder
   */
  validate: () => void;
}

export abstract class CommandBase implements ICommandBase {
  private _errors: string[];
  public readonly client: Connection;

  protected constructor(client: Connection) {
    this.client = client;
    this._errors = [];
  }

  public get errors(): string[] {
    return this._errors;
  }

  addError(error: string) {
    this._errors = [...this.errors, error];
  }

  addErrors(errors: string[]) {
    this._errors = [...this.errors, ...errors];
  }

  abstract do(): Promise<any>;

  abstract validate(): void;
}
