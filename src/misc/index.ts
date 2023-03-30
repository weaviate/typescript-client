import LiveChecker from './liveChecker';
import ReadyChecker from './readyChecker';
import MetaGetter from './metaGetter';
import OpenidConfigurationGetter from './openidConfigurationGetter';
import Connection from '../connection';
import { DbVersionProvider } from '../utils/dbVersion';

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
