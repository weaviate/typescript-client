import Connection from '../connection/index.js';
import { WeaviateInvalidInputError, WeaviateUnsupportedFeatureError } from '../errors.js';
import {
  BackupConfig,
  BackupCreateRequest,
  BackupCreateResponse,
  BackupCreateStatusResponse,
} from '../openapi/types.js';
import { DbVersionSupport } from '../utils/dbVersion.js';
import { CommandBase } from '../validation/commandBase.js';
import BackupCreateStatusGetter from './backupCreateStatusGetter.js';
import { Backend } from './index.js';
import {
  validateBackend,
  validateBackupId,
  validateExcludeClassNames,
  validateIncludeClassNames,
  validateIncrementalBaseBackupId,
} from './validation.js';

const WAIT_INTERVAL = 1000;

export default class BackupCreator extends CommandBase {
  private backend!: Backend;
  private backupId!: string;
  private excludeClassNames?: string[];
  private includeClassNames?: string[];
  private statusGetter: BackupCreateStatusGetter;
  private waitForCompletion!: boolean;
  private config?: BackupConfig;
  private incrementalBaseBackupId?: string;
  private dbVersionSupport?: DbVersionSupport;

  constructor(
    client: Connection,
    statusGetter: BackupCreateStatusGetter,
    dbVersionSupport?: DbVersionSupport
  ) {
    super(client);
    this.statusGetter = statusGetter;
    this.dbVersionSupport = dbVersionSupport;
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

  withConfig(cfg: BackupConfig) {
    this.config = cfg;
    return this;
  }

  /**
   * The ID of an existing backup to use as the base for a file-based incremental backup. Files
   * that are identical to the base backup are not copied and are restored from the base instead,
   * so deleting a base backup breaks every incremental backup built on it.
   *
   * Requires Weaviate v1.37.0 or higher.
   */
  withIncrementalBaseBackupId(backupId: string) {
    // Weaviate lowercases backup IDs, so normalize here: the payload matches what the server
    // stores, and validate() compares like for like.
    this.incrementalBaseBackupId = typeof backupId === 'string' ? backupId.toLowerCase() : backupId;
    return this;
  }

  validate = (): void => {
    this.addErrors([
      ...validateIncludeClassNames(this.includeClassNames),
      ...validateExcludeClassNames(this.excludeClassNames),
      ...validateBackend(this.backend),
      ...validateBackupId(this.backupId),
      ...validateIncrementalBaseBackupId(this.incrementalBaseBackupId, this.backupId),
    ]);
  };

  do = (): Promise<BackupCreateResponse> => {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(new WeaviateInvalidInputError('invalid usage: ' + this.errors.join(', ')));
    }

    const payload = {
      id: this.backupId,
      config: this.config,
      include: this.includeClassNames,
      exclude: this.excludeClassNames,
      incremental_base_backup_id: this.incrementalBaseBackupId,
    } as BackupCreateRequest;

    return this.checkIncrementalSupport().then(() =>
      this.waitForCompletion ? this._createAndWaitForCompletion(payload) : this._create(payload)
    );
  };

  /**
   * Weaviate below v1.37.0 ignores `incremental_base_backup_id` and silently writes a full backup,
   * so fail loudly rather than hand back something other than what was asked for.
   *
   * No-op when the creator was built without a version provider, or for non-incremental backups.
   */
  private checkIncrementalSupport = (): Promise<void> => {
    if (this.incrementalBaseBackupId === undefined || this.dbVersionSupport === undefined) {
      return Promise.resolve();
    }
    return this.dbVersionSupport.supportsIncrementalBackups().then((check) => {
      if (!check.supports) {
        throw new WeaviateUnsupportedFeatureError(check.message);
      }
    });
  };

  _create = (payload: BackupCreateRequest): Promise<BackupCreateResponse> => {
    return this.client.postReturn(this._path(), payload) as Promise<BackupCreateResponse>;
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
                  createStatusResponse.status == 'SUCCESS' ||
                  createStatusResponse.status == 'FAILED' ||
                  createStatusResponse.status == 'CANCELED'
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
