import Connection from '../connection/index.js';
import { BackupCreateResponse } from '../openapi/types.js';
import { CommandBase } from '../validation/commandBase.js';
import { Backend } from './index.js';
export default class BackupGetter extends CommandBase {
  private backend?;
  constructor(client: Connection);
  withBackend(backend: Backend): this;
  validate: () => void;
  do: () => Promise<BackupCreateResponse[]>;
  private _path;
}
