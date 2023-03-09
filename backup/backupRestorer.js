import { RestoreStatus } from "./consts";
import { validateBackupId, validateExcludeClassNames, validateIncludeClassNames, validateBackend } from "./validation";

const WAIT_INTERVAL = 1000;

export default class BackupRestorer {

  includeClassNames;
  excludeClassNames;
  backend;
  backupId;
  waitForCompletion;
  errors;

  constructor(client, statusGetter) {
    this.client = client;
    this.statusGetter = statusGetter;
  }

  withIncludeClassNames(...classNames) {
    let cls = classNames;
    if (classNames.length && Array.isArray(classNames[0])) {
      cls = classNames[0];
    }
    this.includeClassNames = cls;
    return this;
  }

  withExcludeClassNames(...classNames) {
    let cls = classNames;
    if (classNames.length && Array.isArray(classNames[0])) {
      cls = classNames[0];
    }
    this.excludeClassNames = cls;
    return this;
  }

  withBackend(backend) {
    this.backend = backend;
    return this;
  }

  withBackupId(backupId) {
    this.backupId = backupId;
    return this;
  }

  withWaitForCompletion(waitForCompletion) {
    this.waitForCompletion = waitForCompletion;
    return this;
  }

  validate() {
    this.errors = [
      ...validateIncludeClassNames(this.includeClassNames),
      ...validateExcludeClassNames(this.excludeClassNames),
      ...validateBackend(this.backend),
      ...validateBackupId(this.backupId),
    ];
  }

  do() {
    this.validate();
    if (this.errors.length > 0) {
      return Promise.reject(
        new Error("invalid usage: " + this.errors.join(", "))
      );
    }

    const payload = {
      config: {},
      include: this.includeClassNames,
      exclude: this.excludeClassNames,
    };

    if (this.waitForCompletion) {
      return this._restoreAndWaitForCompletion(payload);
    }
    return this._restore(payload);
  }

  _restore(payload) {
    return this.client.post(this._path(), payload);
  }

  _restoreAndWaitForCompletion(payload) {
    return new Promise((resolve, reject) => {
      this._restore(payload)
        .then(restoreResponse => {
          this.statusGetter
            .withBackend(this.backend)
            .withBackupId(this.backupId);

          const loop = () => {
            this.statusGetter.do()
              .then(restoreStatusResponse => {
                if (restoreStatusResponse.status == RestoreStatus.SUCCESS
                    || restoreStatusResponse.status == RestoreStatus.FAILED
                ) {
                  resolve(this._merge(restoreStatusResponse, restoreResponse));
                } else {
                  setTimeout(loop, WAIT_INTERVAL);
                }
              })
              .catch(reject);
          };

          loop();
        })
        .catch(reject)
    });
  }

  _path() {
    return `/backups/${this.backend}/${this.backupId}/restore`;
  }

  _merge(restoreStatusResponse, restoreResponse) {
    const merged = {};
    if ('id' in restoreStatusResponse) {
      merged.id = restoreStatusResponse.id;
    }
    if ('path' in restoreStatusResponse) {
      merged.path = restoreStatusResponse.path
    }
    if ('backend' in restoreStatusResponse) {
      merged.backend = restoreStatusResponse.backend
    }
    if ('status' in restoreStatusResponse) {
      merged.status = restoreStatusResponse.status
    }
    if ('error' in restoreStatusResponse) {
      merged.error = restoreStatusResponse.error
    }
    if ('classes' in restoreResponse) {
      merged.classes = restoreResponse.classes
    }
    return merged;
  }
}
