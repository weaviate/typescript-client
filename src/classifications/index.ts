import ClassificationsScheduler from './scheduler';
import ClassificationsGetter from './getter';
import Connection from '../connection';

export interface Classifications {
  scheduler: () => ClassificationsScheduler;
  getter: () => ClassificationsGetter;
}

const data = (client: Connection): Classifications => {
  return {
    scheduler: () => new ClassificationsScheduler(client),
    getter: () => new ClassificationsGetter(client),
  };
};

export default data;
export { default as ClassificationsGetter } from './getter';
export { default as ClassificationsScheduler } from './scheduler';
