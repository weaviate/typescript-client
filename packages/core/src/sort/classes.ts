import { SortBy } from '../types/index.js';
import { NonRefKeys } from '../types/internal.js';

export class Sorting<T> {
  public sorts: SortBy[];

  constructor() {
    this.sorts = [];
  }

  /** Sort by the objects' property. */
  public byProperty<K extends NonRefKeys<T>>(property: K, ascending = true) {
    this.sorts.push({ property, ascending });
    return this;
  }

  /** Sort by the objects' ID. */
  public byId(ascending = true) {
    this.sorts.push({ property: '_id', ascending });
    return this;
  }

  /** Sort by the objects' creation time. */
  public byCreationTime(ascending = true) {
    this.sorts.push({ property: '_creationTimeUnix', ascending });
    return this;
  }

  /** Sort by the objects' last update time. */
  public byUpdateTime(ascending = true) {
    this.sorts.push({ property: '_lastUpdateTimeUnix', ascending });
    return this;
  }
}
