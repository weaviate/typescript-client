import Connection from '../connection';
import { DbVersionProvider } from '../utils/dbVersion';
import LiveChecker from './liveChecker';
import MetaGetter from './metaGetter';
import OpenidConfigurationGetter from './openidConfigurationGetter';
import ReadyChecker from './readyChecker';

export interface Misc {
  liveChecker: () => LiveChecker;
  readyChecker: () => ReadyChecker;
  metaGetter: () => MetaGetter;
  openidConfigurationGetter: () => OpenidConfigurationGetter;
}

const misc = (client: Connection, dbVersionProvider: DbVersionProvider): Misc => {
  return {
    liveChecker: () => new LiveChecker(client, dbVersionProvider),
    readyChecker: () => new ReadyChecker(client, dbVersionProvider),
    metaGetter: () => new MetaGetter(client),
    openidConfigurationGetter: () => new OpenidConfigurationGetter(client.http),
  };
};

export default misc;
export { default as LiveChecker } from './liveChecker';
export { default as MetaGetter } from './metaGetter';
export { default as OpenidConfigurationGetter } from './openidConfigurationGetter';
export { default as ReadyChecker } from './readyChecker';
