import Getter from './getter';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { Classification } from '../types';

export default class Scheduler extends CommandBase {
  private basedOnProperties?: string[];
  private classifyProperties?: string[];
  private className?: string;
  private settings?: any;
  private type?: string;
  private waitForCompletion: boolean;
  private waitTimeout: number;

  constructor(client: Connection) {
    super(client);
    this.waitTimeout = 10 * 60 * 1000; // 10 minutes
    this.waitForCompletion = false;
  }

  withType = (type: string) => {
    this.type = type;
    return this;
  };

  withSettings = (settings: any) => {
    this.settings = settings;
    return this;
  };

  withClassName = (className: string) => {
    this.className = className;
    return this;
  };

  withClassifyProperties = (props: string[]) => {
    this.classifyProperties = props;
    return this;
  };

  withBasedOnProperties = (props: string[]) => {
    this.basedOnProperties = props;
    return this;
  };

  withWaitForCompletion = () => {
    this.waitForCompletion = true;
    return this;
  };

  withWaitTimeout = (timeout: number) => {
    this.waitTimeout = timeout;
    return this;
  };

  validateIsSet = (prop: string | undefined | null | any[], name: string, setter: string): void => {
    if (prop == undefined || prop == null || prop.length == 0) {
      this.addError(`${name} must be set - set with ${setter}`);
    }
  };

  validateClassName = (): void => {
    this.validateIsSet(this.className, 'className', '.withClassName(className)');
  };

  validateBasedOnProperties = (): void => {
    this.validateIsSet(
      this.basedOnProperties,
      'basedOnProperties',
      '.withBasedOnProperties(basedOnProperties)'
    );
  };

  validateClassifyProperties = (): void => {
    this.validateIsSet(
      this.classifyProperties,
      'classifyProperties',
      '.withClassifyProperties(classifyProperties)'
    );
  };

  validate = (): void => {
    this.validateClassName();
    this.validateClassifyProperties();
    this.validateBasedOnProperties();
  };

  payload = (): Classification => ({
    type: this.type,
    settings: this.settings,
    class: this.className,
    classifyProperties: this.classifyProperties,
    basedOnProperties: this.basedOnProperties,
  });

  pollForCompletion = (id: any): Promise<Classification> => {
    return new Promise((resolve, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              "classification didn't finish within configured timeout, " +
                'set larger timeout with .withWaitTimeout(timeout)'
            )
          ),
        this.waitTimeout
      );

      setInterval(() => {
        new Getter(this.client)
          .withId(id)
          .do()
          .then((res: Classification) => {
            if (res.status === 'completed') resolve(res);
          });
      }, 500);
    });
  };

  do = (): Promise<Classification> => {
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }
    this.validate();

    const path = `/classifications`;
    return this.client.post(path, this.payload()).then((res: any) => {
      if (!this.waitForCompletion) {
        return Promise.resolve(res);
      }

      return this.pollForCompletion(res.id);
    });
  };
}
