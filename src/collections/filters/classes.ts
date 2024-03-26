import {
  FilterTarget,
  FilterReferenceCount,
  FilterReferenceMultiTarget,
  FilterReferenceSingleTarget,
} from '../../proto/v1/base.js';
import { ExtractCrossReferenceType, NonRefKeys, RefKeys } from '../types/internal.js';
import {
  ContainsValue,
  FilterValue,
  CountRef,
  FilterTargetInternal,
  TargetRefs,
  Filter,
  GeoRangeFilter,
  FilterByProperty,
} from './types.js';
import { TargetGuards } from './utils.js';

/**
 * Use this class when you want to chain filters together using logical operators.
 *
 * Since JS/TS has no native support for & and | as logical operators, you must use these methods and nest
 * the filters you want to combine.
 *
 * ANDs and ORs can be nested an arbitrary number of times.
 *
 * @example
 * ```ts
 * const filter = Filters.and(
 *   collection.filter.byProperty('name').equal('John'),
 *   collection.filter.byProperty('age').greaterThan(18),
 * );
 * ```
 */
export class Filters {
  /**
   * Combine filters using the logical AND operator.
   *
   * @param {FilterValue[]} filters The filters to combine.
   */
  static and(...filters: FilterValue[]): FilterValue<null> {
    return {
      operator: 'And',
      filters: filters,
      value: null,
    };
  }
  /**
   * Combine filters using the logical OR operator.
   *
   * @param {FilterValue[]} filters The filters to combine.
   */
  static or(...filters: FilterValue[]): FilterValue<null> {
    return {
      operator: 'Or',
      filters: filters,
      value: null,
    };
  }
}

export class FilterBase {
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

export class FilterProperty<V> extends FilterBase implements FilterByProperty<V> {
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

  public containsAny<U extends ContainsValue<V>>(value: U[]): FilterValue<U[]> {
    return {
      operator: 'ContainsAny',
      target: this.targetPath(),
      value: value,
    };
  }

  public containsAll<U extends ContainsValue<V>>(value: U[]): FilterValue<U[]> {
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

  public withinGeoRange(value: GeoRangeFilter): FilterValue<GeoRangeFilter> {
    return {
      operator: 'WithinGeoRange',
      target: this.targetPath(),
      value: value,
    };
  }
}

export class FilterRef<T> implements Filter<T> {
  private target: TargetRefs;

  constructor(target: TargetRefs) {
    this.target = target;
  }

  public byRef<K extends RefKeys<T> & string>(linkOn: K): Filter<ExtractCrossReferenceType<T[K]>> {
    this.target.target = { type_: 'single', linkOn: linkOn };
    return new FilterRef<ExtractCrossReferenceType<T[K]>>(this.target);
  }

  public byRefMultiTarget<K extends RefKeys<T> & string>(linkOn: K, targetCollection: string) {
    this.target.target = { type_: 'multi', linkOn: linkOn, targetCollection: targetCollection };
    return new FilterRef<ExtractCrossReferenceType<T[K]>>(this.target);
  }

  public byProperty<K extends NonRefKeys<T> & string>(name: K, length = false) {
    return new FilterProperty<T[K]>(name, length, this.target);
  }

  public byRefCount<K extends RefKeys<T> & string>(linkOn: K) {
    return new FilterCount(linkOn, this.target);
  }

  public byId() {
    return new FilterId(this.target);
  }

  public byCreationTime() {
    return new FilterCreationTime(this.target);
  }

  public byUpdateTime() {
    return new FilterUpdateTime(this.target);
  }
}

export class FilterCount extends FilterBase {
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

export class FilterId extends FilterBase {
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

export class FilterTime extends FilterBase {
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

export class FilterCreationTime extends FilterTime {
  constructor(target?: TargetRefs) {
    super('_creationTimeUnix', target);
  }
}

export class FilterUpdateTime extends FilterTime {
  constructor(target?: TargetRefs) {
    super('_lastUpdateTimeUnix', target);
  }
}
