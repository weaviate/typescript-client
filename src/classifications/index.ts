import Scheduler from './scheduler';
import Getter from './getter';
import Connection from '../connection';

export interface Classifications {
  scheduler: () => Scheduler;
  getter: () => Getter;
}

const data = (client: Connection): Classifications => {
  return {
    scheduler: () => new Scheduler(client),
    getter: () => new Getter(client),
  };
};

export default data;
