import {
  FilterTarget,
  FilterReferenceCount,
  FilterReferenceMultiTarget,
  FilterReferenceSingleTarget,
} from '../../proto/v1/base';
import { ExtractCrossReferenceType, NonRefKeys, Properties, RefKeys } from '../types';

export type Operator =
  | 'Equal'
  | 'NotEqual'
  | 'GreaterThan'
  | 'GreaterThanEqual'
  | 'LessThan'
  | 'LessThanEqual'
  | 'Like'
  | 'IsNull'
  | 'WithinGeoRange'
  | 'ContainsAny'
  | 'ContainsAll'
  | 'And'
  | 'Or';

export type FilterValue<V = any> = {
  filters?: FilterValue[];
  operator: Operator;
  target?: FilterTarget;
  value: V;
};

type SingleTargetRef = {
  type_: 'single';
  linkOn: string;
  target?: FilterTargetInternal;
};

type MultiTargetRef = {
  type_: 'multi';
  linkOn: string;
  targetCollection: string;
  target?: FilterTargetInternal;
};

type CountRef = {
  type_: 'count';
  linkOn: string;
};

type FilterTargetInternal = SingleTargetRef | MultiTargetRef | CountRef | string;
type TargetRefs = SingleTargetRef | MultiTargetRef;

export class TargetGuards {
  public static isSingleTargetRef(target?: FilterTargetInternal): target is SingleTargetRef {
    if (!target) return false;
    return (target as SingleTargetRef).type_ === 'single';
  }

  public static isMultiTargetRef(target?: FilterTargetInternal): target is MultiTargetRef {
    if (!target) return false;
    return (target as MultiTargetRef).type_ === 'multi';
  }

  public static isCountRef(target?: FilterTargetInternal): target is CountRef {
    if (!target) return false;
    return (target as CountRef).type_ === 'count';
  }

  public static isProperty(target?: FilterTargetInternal): target is string {
    if (!target) return false;
    return typeof target === 'string';
  }

  public static isTargetRef(target?: FilterTargetInternal): target is SingleTargetRef | MultiTargetRef {
    if (!target) return false;
    return TargetGuards.isSingleTargetRef(target) || TargetGuards.isMultiTargetRef(target);
  }
}

export class Filters {
  static and(...filters: FilterValue[]): FilterValue<null> {
    return {
      operator: 'And',
      filters: filters,
      value: null,
    };
  }
  static or(...filters: FilterValue[]): FilterValue<null> {
    return {
      operator: 'Or',
      filters: filters,
      value: null,
    };
  }
}

export type GeoRangeFilter = {
  latitude: number;
  longitude: number;
  distance: number;
};

export type FilterValueType = PrimitiveFilterValueType | PrimitiveListFilterValueType;

export type PrimitiveFilterValueType = number | string | boolean | Date | GeoRangeFilter;
export type PrimitiveListFilterValueType = number[] | string[] | boolean[] | Date[];

const filter = <T>(): Filter<T> => {
  return {
    byProperty: <K extends NonRefKeys<T> & string>(name: K, length = false) => {
      return new FilterByProperty<T[K]>(name, length);
    },
    byRef: <K extends RefKeys<T> & string>(linkOn: K) => {
      return new FilterByRef<ExtractCrossReferenceType<T[K]>>({ type_: 'single', linkOn: linkOn });
    },
    byRefMultiTarget: <K extends RefKeys<T> & string>(linkOn: K, targetCollection: string) => {
      return new FilterByRef<ExtractCrossReferenceType<T[K]>>({
        type_: 'multi',
        linkOn: linkOn,
        targetCollection: targetCollection,
      });
    },
    byRefCount: <K extends RefKeys<T> & string>(linkOn: K) => {
      return new FilterByCount(linkOn);
    },
    byId: () => {
      return new FilterById();
    },
    byCreationTime: () => {
      return new FilterByCreationTime();
    },
    byUpdateTime: () => {
      return new FilterByUpdateTime();
    },
  };
};

export default filter;

export interface Filter<T> {
  byProperty: <K extends NonRefKeys<T> & string>(name: K, length?: boolean) => FilterByProperty<T[K]>;
  byRef: <K extends RefKeys<T> & string>(linkOn: K) => FilterByRef<ExtractCrossReferenceType<T[K]>>;
  byRefMultiTarget: <K extends RefKeys<T> & string>(
    linkOn: K,
    targetCollection: string
  ) => FilterByRef<ExtractCrossReferenceType<T[K]>>;
  byRefCount: <K extends RefKeys<T> & string>(linkOn: K) => FilterByCount;
  byId: () => FilterById;
  byCreationTime: () => FilterByCreationTime;
  byUpdateTime: () => FilterByUpdateTime;
}

class FilterBase {
  protected target?: TargetRefs;
  protected property: string | CountRef;

  constructor(property: string | CountRef, target?: TargetRefs) {
    this.property = property;
    this.target = target;
  }

  protected targetPath(): FilterTarget {
    if (!this.target) {
      return FilterTarget.fromPartial({
        property: TargetGuards.isProperty(this.property) ? this.property : undefined,
        count: TargetGuards.isCountRef(this.property)
          ? FilterReferenceCount.fromPartial({
              on: this.property.linkOn,
            })
          : undefined,
      });
    }

    let target = this.target;
    while (target.target !== undefined) {
      if (TargetGuards.isTargetRef(target.target)) {
        target = target.target;
      } else {
        throw new Error('Invalid target reference');
      }
    }
    target.target = this.property;
    return this.resolveTargets(this.target);
  }

  private resolveTargets(internal?: FilterTargetInternal): FilterTarget {
    return FilterTarget.fromPartial({
      property: TargetGuards.isProperty(internal) ? internal : undefined,
      singleTarget: TargetGuards.isSingleTargetRef(internal)
        ? FilterReferenceSingleTarget.fromPartial({
            on: internal.linkOn,
            target: this.resolveTargets(internal.target),
          })
        : undefined,
      multiTarget: TargetGuards.isMultiTargetRef(internal)
        ? FilterReferenceMultiTarget.fromPartial({
            on: internal.linkOn,
            targetCollection: internal.targetCollection,
            target: this.resolveTargets(internal.target),
          })
        : undefined,
      count: TargetGuards.isCountRef(internal)
        ? FilterReferenceCount.fromPartial({
            on: internal.linkOn,
          })
        : undefined,
    });
  }
}

class FilterByProperty<V> extends FilterBase {
  constructor(property: string, length: boolean, target?: TargetRefs) {
    super(length ? `len(${property})` : property, target);
  }

  public isNull(value: boolean): FilterValue<boolean> {
    return {
      operator: 'IsNull',
      target: this.targetPath(),
      value: value,
    };
  }

  public containsAny(value: V[]): FilterValue<V[]> {
    return {
      operator: 'ContainsAny',
      target: this.targetPath(),
      value: value,
    };
  }

  public containsAll(value: V[]): FilterValue<V[]> {
    return {
      operator: 'ContainsAll',
      target: this.targetPath(),
      value: value,
    };
  }

  public equal(value: V): FilterValue<V> {
    return {
      operator: 'Equal',
      target: this.targetPath(),
      value: value,
    };
  }

  public notEqual(value: V): FilterValue<V> {
    return {
      operator: 'NotEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public lessThan<U extends number | Date>(value: U): FilterValue<U> {
    return {
      operator: 'LessThan',
      target: this.targetPath(),
      value: value,
    };
  }

  public lessOrEqual<U extends number | Date>(value: U): FilterValue<U> {
    return {
      operator: 'LessThanEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public greaterThan<U extends number | Date>(value: U): FilterValue<U> {
    return {
      operator: 'GreaterThan',
      target: this.targetPath(),
      value: value,
    };
  }

  public greaterOrEqual<U extends number | Date>(value: U): FilterValue<U> {
    return {
      operator: 'GreaterThanEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public like(value: string): FilterValue<string> {
    return {
      operator: 'Like',
      target: this.targetPath(),
      value: value,
    };
  }

  public withinGeoRange<U extends GeoRangeFilter>(value: U): FilterValue<U> {
    return {
      operator: 'WithinGeoRange',
      target: this.targetPath(),
      value: value,
    };
  }
}

class FilterByRef<T> {
  private target: TargetRefs;

  constructor(target: TargetRefs) {
    this.target = target;
  }

  public byRef<K extends RefKeys<T> & string>(linkOn: K) {
    this.target.target = { type_: 'single', linkOn: linkOn };
    return new FilterByRef<ExtractCrossReferenceType<T[K]>>(this.target);
  }

  public byRefMultiTarget<K extends RefKeys<T> & string>(linkOn: K, targetCollection: string) {
    this.target.target = { type_: 'multi', linkOn: linkOn, targetCollection: targetCollection };
    return new FilterByRef<ExtractCrossReferenceType<T[K]>>(this.target);
  }

  public byProperty<K extends NonRefKeys<T> & string>(name: K, length = false) {
    return new FilterByProperty<T[K]>(name, length, this.target);
  }

  public byRefCount<K extends RefKeys<T> & string>(linkOn: K) {
    return new FilterByCount(linkOn, this.target);
  }

  public byId() {
    return new FilterById(this.target);
  }

  public byCreationTime() {
    return new FilterByCreationTime(this.target);
  }

  public byUpdateTime() {
    return new FilterByUpdateTime(this.target);
  }
}

class FilterByCount extends FilterBase {
  constructor(linkOn: string, target?: TargetRefs) {
    super({ type_: 'count', linkOn }, target);
  }

  public equal(value: number): FilterValue<number> {
    return {
      operator: 'Equal',
      target: this.targetPath(),
      value: value,
    };
  }

  public notEqual(value: number): FilterValue<number> {
    return {
      operator: 'NotEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public lessThan(value: number): FilterValue<number> {
    return {
      operator: 'LessThan',
      target: this.targetPath(),
      value: value,
    };
  }

  public lessOrEqual(value: number): FilterValue<number> {
    return {
      operator: 'LessThanEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public greaterThan(value: number): FilterValue<number> {
    return {
      operator: 'GreaterThan',
      target: this.targetPath(),
      value: value,
    };
  }

  public greaterOrEqual(value: number): FilterValue<number> {
    return {
      operator: 'GreaterThanEqual',
      target: this.targetPath(),
      value: value,
    };
  }
}

export class FilterById extends FilterBase {
  constructor(target?: TargetRefs) {
    super('_id', target);
  }

  public equal(value: string): FilterValue<string> {
    return {
      operator: 'Equal',
      target: this.targetPath(),
      value: value,
    };
  }

  public notEqual(value: string): FilterValue<string> {
    return {
      operator: 'NotEqual',
      target: this.targetPath(),
      value: value,
    };
  }

  public containsAny(value: string[]): FilterValue<string[]> {
    return {
      operator: 'ContainsAny',
      target: this.targetPath(),
      value: value,
    };
  }
}

class FilterByTime extends FilterBase {
  public containsAny(value: (string | Date)[]): FilterValue<string[]> {
    return {
      operator: 'ContainsAny',
      target: this.targetPath(),
      value: value.map(this.toValue),
    };
  }

  public equal(value: string | Date): FilterValue<string> {
    return {
      operator: 'Equal',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  public notEqual(value: string | Date): FilterValue<string> {
    return {
      operator: 'NotEqual',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  public lessThan(value: string | Date): FilterValue<string> {
    return {
      operator: 'LessThan',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  public lessOrEqual(value: string | Date): FilterValue<string> {
    return {
      operator: 'LessThanEqual',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  public greaterThan(value: string | Date): FilterValue<string> {
    return {
      operator: 'GreaterThan',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  public greaterOrEqual(value: string | Date): FilterValue<string> {
    return {
      operator: 'GreaterThanEqual',
      target: this.targetPath(),
      value: this.toValue(value),
    };
  }

  private toValue(value: string | Date): string {
    return value instanceof Date ? value.toISOString() : value;
  }
}

class FilterByCreationTime extends FilterByTime {
  constructor(target?: TargetRefs) {
    super('_creationTimeUnix', target);
  }
}

class FilterByUpdateTime extends FilterByTime {
  constructor(target?: TargetRefs) {
    super('_lastUpdateTimeUnix', target);
  }
}
