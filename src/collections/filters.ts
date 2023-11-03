export type Operator =
  | 'Equal'
  | 'NotEqual'
  | 'GreaterThan'
  | 'GreaterThanEqual'
  | 'LessThan'
  | 'LessThanEqual'
  | 'Like'
  | 'IsNull'
  | 'ContainsAny'
  | 'ContainsAll'
  | 'And'
  | 'Or';

export type FilterValue<T> = {
  path: string[];
  operator: Operator;
  value: T;
};

interface FiltersArgs<T> {
  path: string[];
  operator: Operator;
  filters?: T[];
  value?: T;
}

export class Filters<T extends FilterValueType> {
  public path: string[];
  public operator: Operator;
  public filters?: T[];
  public value?: T;

  constructor(args: FiltersArgs<T>) {
    this.path = args.path;
    this.filters = args.filters;
    this.operator = args.operator;
    this.value = args.value;
  }

  public and<R extends FilterValueType>(filter: Filters<R>): Filters<Filters<T> | Filters<R>> {
    return new Filters<Filters<T> | Filters<R>>({
      path: this.path,
      operator: 'And',
      filters: [this, filter],
    });
  }

  public or<R extends FilterValueType>(filter: Filters<R>): Filters<Filters<T> | Filters<R>> {
    return new Filters<Filters<T> | Filters<R>>({
      path: this.path,
      operator: 'Or',
      filters: [this, filter],
    });
  }
}

export type FilterValueType =
  | PrimitiveFilterValueType
  | PrimitiveListFilterValueType
  | Filters<FilterValueType>;

export type PrimitiveFilterValueType = number | string | boolean;
export type PrimitiveListFilterValueType = number[] | string[] | boolean[];

export class Filter {
  private path: string[];

  private constructor(path: string[]) {
    this.path = path instanceof Array ? path : [path];
  }

  static by(path: string | string[], length = false): Filter {
    const internalPath = path instanceof Array ? path : [path];
    if (length) {
      internalPath[-1] = `len(${internalPath[-1]})})`;
    }
    return new Filter(internalPath);
  }

  public isNone(value: boolean) {
    return new Filters<boolean>({
      path: this.path,
      operator: 'IsNull',
      value: value,
    });
  }

  public containsAny<T extends PrimitiveListFilterValueType>(value: T) {
    return new Filters<T>({
      path: this.path,
      operator: 'ContainsAny',
      value: value,
    });
  }

  public containsAll<T extends PrimitiveListFilterValueType>(value: T) {
    return new Filters<T>({
      path: this.path,
      operator: 'ContainsAll',
      value: value,
    });
  }

  public equal(value: string): Filters<string>;
  public equal(value: number): Filters<number>;
  public equal(value: boolean): Filters<boolean>;
  public equal(value: string[]): Filters<string[]>;
  public equal(value: number[]): Filters<number[]>;
  public equal(value: boolean[]): Filters<boolean[]>;
  public equal<T extends PrimitiveListFilterValueType>(value: T) {
    return new Filters<T>({
      path: this.path,
      operator: 'Equal',
      value: value as T,
    });
  }

  public notEqual(value: string): Filters<string>;
  public notEqual(value: number): Filters<number>;
  public notEqual(value: boolean): Filters<boolean>;
  public notEqual(value: string[]): Filters<string[]>;
  public notEqual(value: number[]): Filters<number[]>;
  public notEqual(value: boolean[]): Filters<boolean[]>;
  public notEqual<T extends PrimitiveListFilterValueType>(value: T) {
    return new Filters<T>({
      path: this.path,
      operator: 'NotEqual',
      value: value,
    });
  }

  public lessThan(value: number) {
    return new Filters({
      path: this.path,
      operator: 'LessThan',
      value: value,
    });
  }

  public lessOrEqual(value: number) {
    return new Filters({
      path: this.path,
      operator: 'LessThanEqual',
      value: value,
    });
  }

  public greaterThan(value: number) {
    return new Filters({
      path: this.path,
      operator: 'GreaterThan',
      value: value,
    });
  }

  public greaterOrEqual(value: number) {
    return new Filters({
      path: this.path,
      operator: 'GreaterThanEqual',
      value: value,
    });
  }

  public like(value: string) {
    return new Filters({
      path: this.path,
      operator: 'Like',
      value: value,
    });
  }
}
