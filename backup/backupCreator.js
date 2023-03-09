import { CreateStatus } from "./consts";
import { validateBackupId, validateExcludeClassNames, validateIncludeClassNames, validateBackend } from "./validation";

const WAIT_INTERVAL = 1000;

export default class BackupCreator {

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
      id: this.backupId,
      config: {},
      include: this.includeClassNames,
      exclude: this.excludeClassNames,
    };

    if (this.waitForCompletion) {
      return this._createAndWaitForCompletion(payload);
    }
    return this._create(payload);
  }

  _create(payload) {
    return this.client.post(this._path(), payload);
  }

  _createAndWaitForCompletion(payload) {
    return new Promise((resolve, reject) => {
      this._create(payload)
        .then(createResponse => {
          this.statusGetter
            .withBackend(this.backend)
            .withBackupId(this.backupId);

          const loop = () => {
            this.statusGetter.do()
              .then(createStatusResponse => {
                if (createStatusResponse.status == CreateStatus.SUCCESS
                    || createStatusResponse.status == CreateStatus.FAILED
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
        .catch(reject)
    });
  }

  _path() {
    return `/backups/${this.backend}`;
  }

  _merge(createStatusResponse, createResponse) {
    const merged = {};
    if ('id' in createStatusResponse) {
      merged.id = createStatusResponse.id;
    }
    if ('path' in createStatusResponse) {
      merged.path = createStatusResponse.path
    }
    if ('backend' in createStatusResponse) {
      merged.backend = createStatusResponse.backend
    }
    if ('status' in createStatusResponse) {
      merged.status = createStatusResponse.status
    }
    if ('error' in createStatusResponse) {
      merged.error = createStatusResponse.error
    }
    if ('classes' in createResponse) {
      merged.classes = createResponse.classes
    }
    return merged;
  }
}
