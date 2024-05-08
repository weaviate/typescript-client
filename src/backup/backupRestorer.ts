import {
  validateBackend,
  validateBackupId,
  validateExcludeClassNames,
  validateIncludeClassNames,
} from './validation.js';
import Connection from '../connection/index.js';
import BackupRestoreStatusGetter from './backupRestoreStatusGetter.js';
import { CommandBase } from '../validation/commandBase.js';
import {
  BackupRestoreRequest,
  BackupRestoreResponse,
  BackupRestoreStatusResponse,
  RestoreConfig,
} from '../openapi/types.js';
import { Backend } from './index.js';

const WAIT_INTERVAL = 1000;

export default class BackupRestorer extends CommandBase {
  private backend!: Backend;
  private backupId!: string;
  private excludeClassNames?: string[];
  private includeClassNames?: string[];
  private statusGetter: BackupRestoreStatusGetter;
  private waitForCompletion?: boolean;
  private config?: RestoreConfig;

  constructor(client: Connection, statusGetter: BackupRestoreStatusGetter) {
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

  withBackend(backend: Backend) {
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

  withConfig(cfg: RestoreConfig) {
    this.config = cfg;
    return this;
  }

  validate = (): void => {
    this.addErrors([
      ...validateIncludeClassNames(this.includeClassNames || []),
      ...validateExcludeClassNames(this.excludeClassNames || []),
      ...validateBackend(this.backend),
      ...validateBackupId(this.backupId),
    ]);
  };

  do = (): Promise<BackupRestoreResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
    }

    const payload = {
      config: this.config,
      include: this.includeClassNames,
      exclude: this.excludeClassNames,
    } as BackupRestoreRequest;

    if (this.waitForCompletion) {
      return this._restoreAndWaitForCompletion(payload);
    }
    return this._restore(payload);
  };

  _restore = (payload: BackupRestoreRequest): Promise<BackupRestoreResponse> => {
    return this.client.postReturn(this._path(), payload);
  };

  _restoreAndWaitForCompletion = (payload: BackupRestoreRequest): Promise<BackupRestoreResponse> => {
    return new Promise<BackupRestoreResponse>((resolve, reject) => {
      this._restore(payload)
        .then((restoreResponse: any) => {
          this.statusGetter.withBackend(this.backend).withBackupId(this.backupId);

          const loop = () => {
            this.statusGetter
              .do()
              .then((restoreStatusResponse: any) => {
                if (restoreStatusResponse.status == 'SUCCESS' || restoreStatusResponse.status == 'FAILED') {
                  resolve(this._merge(restoreStatusResponse, restoreResponse));
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
    return `/backups/${this.backend}/${this.backupId}/restore`;
  };

  _merge = (
    restoreStatusResponse: BackupRestoreStatusResponse,
    restoreResponse: BackupRestoreResponse
  ): BackupRestoreResponse => {
    const merged: BackupRestoreResponse = {};
    if ('id' in restoreStatusResponse) {
      merged.id = restoreStatusResponse.id;
    }
    if ('path' in restoreStatusResponse) {
      merged.path = restoreStatusResponse.path;
    }
    if ('backend' in restoreStatusResponse) {
      merged.backend = restoreStatusResponse.backend;
    }
    if ('status' in restoreStatusResponse) {
      merged.status = restoreStatusResponse.status;
    }
    if ('error' in restoreStatusResponse) {
      merged.error = restoreStatusResponse.error;
    }
    if ('classes' in restoreResponse) {
      merged.classes = restoreResponse.classes;
    }
    return merged;
  };
}
