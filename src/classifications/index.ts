import Connection from '../connection/index.js';
import ClassificationsGetter from './getter.js';
import ClassificationsScheduler from './scheduler.js';

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
export { default as ClassificationsGetter } from './getter.js';
export { default as ClassificationsScheduler } from './scheduler.js';
