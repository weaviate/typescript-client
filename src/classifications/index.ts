import Connection from '../connection';
import ClassificationsGetter from './getter';
import ClassificationsScheduler from './scheduler';

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
