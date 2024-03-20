export type {
  Filter,
  FilterByCount,
  FilterById,
  FilterByProperty,
  FilterByTime,
  FilterValue,
} from './types.js';
export { Filters } from './classes.js';

import { ExtractCrossReferenceType, NonRefKeys, RefKeys } from '../types/internal.js';

import {
  FilterCreationTime,
  FilterCount,
  FilterId,
  FilterProperty,
  FilterRef,
  FilterUpdateTime,
} from './classes.js';
import { Filter } from './types.js';

const filter = <T>(): Filter<T> => {
  return {
    byProperty: <K extends NonRefKeys<T> & string>(name: K, length = false) => {
      return new FilterProperty<T[K]>(name, length);
    },
    byRef: <K extends RefKeys<T> & string>(linkOn: K) => {
      return new FilterRef<ExtractCrossReferenceType<T[K]>>({ type_: 'single', linkOn: linkOn });
    },
    byRefMultiTarget: <K extends RefKeys<T> & string>(linkOn: K, targetCollection: string) => {
      return new FilterRef<ExtractCrossReferenceType<T[K]>>({
        type_: 'multi',
        linkOn: linkOn,
        targetCollection: targetCollection,
      });
    },
    byRefCount: <K extends RefKeys<T> & string>(linkOn: K) => {
      return new FilterCount(linkOn);
    },
    byId: () => {
      return new FilterId();
    },
    byCreationTime: () => {
      return new FilterCreationTime();
    },
    byUpdateTime: () => {
      return new FilterUpdateTime();
    },
  };
};

export default filter;
