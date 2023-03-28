import { CreateStatus } from './consts';
import {
  validateBackend,
  validateBackupId,
  validateExcludeClassNames,
  validateIncludeClassNames,
} from './validation';
import BackupCreateStatusGetter from './backupCreateStatusGetter';
import Connection from '../connection';
import { CommandBase } from '../validation/commandBase';
import { BackupCreateRequest, BackupCreateResponse, BackupCreateStatusResponse } from '../types';

const WAIT_INTERVAL = 1000;

export default class BackupCreator extends CommandBase {
  private backend!: string;
  private backupId!: string;
  private excludeClassNames?: string[];
  private includeClassNames?: string[];
  private statusGetter: BackupCreateStatusGetter;
  private waitForCompletion!: boolean;

  constructor(client: Connection, statusGetter: BackupCreateStatusGetter) {
    super(client);
    this.statusGetter = statusGetter;
  }

  withIncludeClassNames(...classNames: string[]) {
    let cls = classNames;
    if (classNames.length && Array.isArray(classNames[0])) {
      cls = classNames[0];
    }
    this.includeClassNames = cls;
    return this;
  }

  withExcludeClassNames(...classNames: string[]) {
    let cls = classNames;
    if (classNames.length && Array.isArray(classNames[0])) {
      cls = classNames[0];
    }
    this.excludeClassNames = cls;
    return this;
  }

  withBackend(backend: string) {
    this.backend = backend;
    return this;
  }

  withBackupId(backupId: string) {
    this.backupId = backupId;
    return this;
  }

  withWaitForCompletion(waitForCompletion: boolean) {
    this.waitForCompletion = waitForCompletion;
    return this;
  }

  validate = (): void => {
    this.addErrors([
      ...validateIncludeClassNames(this.includeClassNames),
      ...validateExcludeClassNames(this.excludeClassNames),
      ...validateBackend(this.backend),
      ...validateBackupId(this.backupId),
    ]);
  };

  do = (): Promise<BackupCreateResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    const payload = {
      id: this.backupId,
      config: {},
      include: this.includeClassNames,
      exclude: this.excludeClassNames,
    } as BackupCreateRequest;

    if (this.waitForCompletion) {
      return this._createAndWaitForCompletion(payload);
    }
    return this._create(payload);
  };

  _create = (payload: BackupCreateRequest): Promise<BackupCreateResponse> => {
    return this.client.post(this._path(), payload) as Promise<BackupCreateResponse>;
  };

  _createAndWaitForCompletion = (payload: BackupCreateRequest): Promise<BackupCreateResponse> => {
    return new Promise<BackupCreateResponse>((resolve, reject) => {
      this._create(payload)
        .then((createResponse: any) => {
          this.statusGetter.withBackend(this.backend).withBackupId(this.backupId);

          const loop = () => {
            this.statusGetter
              .do()
              .then((createStatusResponse: any) => {
                if (
                  createStatusResponse.status == CreateStatus.SUCCESS ||
                  createStatusResponse.status == CreateStatus.FAILED
                ) {
                  resolve(this._merge(createStatusResponse, createResponse));
                } else {
                  setTimeout(loop, WAIT_INTERVAL);
                }
              })
              .catch(reject);
          };

          loop();
        })
        .catch(reject);
    });
  };

  private _path = (): string => {
    return `/backups/${this.backend}`;
  };

  _merge = (
    createStatusResponse: BackupCreateStatusResponse,
    createResponse: BackupCreateResponse
  ): BackupCreateResponse => {
    const merged: BackupCreateResponse = {};
    if ('id' in createStatusResponse) {
      merged.id = createStatusResponse.id;
    }
    if ('path' in createStatusResponse) {
      merged.path = createStatusResponse.path;
    }
    if ('backend' in createStatusResponse) {
      merged.backend = createStatusResponse.backend;
    }
    if ('status' in createStatusResponse) {
      merged.status = createStatusResponse.status;
    }
    if ('error' in createStatusResponse) {
      merged.error = createStatusResponse.error;
    }
    if ('classes' in createResponse) {
      merged.classes = createResponse.classes;
    }
    return merged;
  };
}
