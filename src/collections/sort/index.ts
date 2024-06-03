export type { Sort } from './types.js';

import { NonRefKeys } from '../types/internal.js';
import { Sorting } from './classes.js';
import { Sort } from './types.js';

const sort = <T>(): Sort<T> => {
  return {
    byProperty<T, K extends NonRefKeys<T>>(property: K, ascending = true) {
      return new Sorting<T>().byProperty(property, ascending);
    },
    byId<T>(ascending = true) {
      return new Sorting<T>().byId(ascending);
    },
    byCreationTime<T>(ascending = true) {
      return new Sorting<T>().byCreationTime(ascending);
    },
    byUpdateTime<T>(ascending = true) {
      return new Sorting<T>().byUpdateTime(ascending);
    },
  };
};

export default sort;

export { Sorting };
