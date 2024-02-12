import { NonRefKeys, Properties, SortBy } from './types';

export class Sorting<T> {
  private sorts: SortBy[];

  constructor() {
    this.sorts = [];
  }

  public byProperty<K extends NonRefKeys<T>>(property: K, ascending = true) {
    this.sorts.push({ property, ascending });
    return this;
  }

  public byId(ascending = true) {
    this.sorts.push({ property: '_id', ascending });
    return this;
  }

  public byCreationTime(ascending = true) {
    this.sorts.push({ property: '_creationTimeUnix', ascending });
    return this;
  }

  public byUpdateTime(ascending = true) {
    this.sorts.push({ property: '_lastUpdateTimeUnix', ascending });
    return this;
  }

  public get(): SortBy[] {
    return this.sorts;
  }
}

const sort = <T extends Properties>(): Sort<T> => {
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

export interface Sort<T extends Properties> {
  byProperty<K extends NonRefKeys<T>>(property: K, ascending?: boolean): Sorting<T>;
  byId(ascending?: boolean): Sorting<T>;
  byCreationTime(ascending?: boolean): Sorting<T>;
  byUpdateTime(ascending?: boolean): Sorting<T>;
}
