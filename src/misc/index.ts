import LiveChecker from './liveChecker';
import ReadyChecker from './readyChecker';
import MetaGetter from './metaGetter';
import OpenidConfigurationGetter from './openidConfigurationGetter';
import Connection from '../connection';
import { DbVersionProvider } from '../utils/dbVersion';

export interface IWeaviateClientMisc {
  liveChecker: () => LiveChecker;
  readyChecker: () => ReadyChecker;
  metaGetter: () => MetaGetter;
  openidConfigurationGetter: () => OpenidConfigurationGetter;
}

const misc = (
  client: Connection,
  dbVersionProvider: DbVersionProvider
): IWeaviateClientMisc => {
  return {
    liveChecker: () => new LiveChecker(client, dbVersionProvider),
    readyChecker: () => new ReadyChecker(client, dbVersionProvider),
    metaGetter: () => new MetaGetter(client),
    openidConfigurationGetter: () => new OpenidConfigurationGetter(client.http),
  };
};

export default misc;
