import { CrossReference, ReferenceManager } from '../references/index.js';
import {
  NestedProperties,
  PrimitiveField,
  RefProperty,
  ReferenceToMultiTarget,
  PhoneNumber,
  PhoneNumberInput,
  WeaviateField,
  Properties,
  RefPropertyDefault,
} from '../index.js';

export type ExtractCrossReferenceType<T> = T extends CrossReference<infer U> ? U : never;

type ExtractNestedType<T> = T extends (infer U)[]
  ? U extends NestedProperties
    ? U
    : never
  : T extends NestedProperties
  ? T
  : never;

export type QueryNested<T> = {
  [K in NestedKeys<T>]: {
    name: K;
    properties: QueryProperty<ExtractNestedType<T[K]>>[];
  };
}[NestedKeys<T>];

export type QueryNestedDefault = {
  name: string;
  properties: (string | QueryNestedDefault)[];
};

export type QueryProperty<T> = T extends Properties
  ? PrimitiveKeys<T> | QueryNested<T>
  : string | QueryNestedDefault;
export type QueryReference<T> = T extends Properties ? RefProperty<T> : RefPropertyDefault;
export type NonRefProperty<T> = keyof T | QueryNested<T>;
export type NonPrimitiveProperty<T extends Properties> = RefProperty<T> | QueryNested<T>;

export type IsEmptyType<T> = keyof T extends never ? true : false;

export type ReferenceInput<T> =
  | string
  | ReferenceToMultiTarget
  | ReferenceManager<T>
  | (string | ReferenceToMultiTarget | ReferenceManager<T>)[];

export type ReferenceInputs<Obj> = {
  [Key in keyof Obj as Key extends RefKeys<Obj> ? Key : never]: ReferenceInput<
    ExtractCrossReferenceType<Obj[Key]>
  >;
};

type IsPrimitiveField<T> = T extends PrimitiveField ? T : never;

type IsCrossReference<T> = T extends CrossReference<any> ? T : never;

type IsWeaviateField<T> = T extends WeaviateField ? T : never;

type IsNestedField<T> = T extends NestedProperties | NestedProperties[] ? T : never;

export type PrimitiveKeys<Obj> = Obj extends undefined
  ? string
  : {
      [Key in keyof Obj]-?: undefined extends Obj[Key]
        ? IsPrimitiveField<Exclude<Obj[Key], undefined>> extends never
          ? never
          : Key
        : IsPrimitiveField<Obj[Key]> extends never
        ? never
        : Key;
    }[keyof Obj] &
      string;

// export type RefKeys<Obj> = Obj extends undefined ? string : {
//   [Key in keyof Obj]-?: undefined extends Obj[Key]
//     ? IsCrossReference<Exclude<Obj[Key], undefined>> extends never
//       ? never
//       : Key
//     : IsCrossReference<Obj[Key]> extends never
//     ? never
//     : Key;
// }[keyof Obj] &
//   string;

export type RefKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends CrossReference<any> | undefined ? Key : never;
}[keyof Obj] &
  string;

// Modified NonRefKey to differentiate optional from required keys
export type NonRefKeys<Obj> = {
  [Key in keyof Obj]-?: undefined extends Obj[Key]
    ? IsWeaviateField<Exclude<Obj[Key], undefined>> extends never
      ? never
      : Key
    : IsWeaviateField<Obj[Key]> extends never
    ? never
    : Key;
}[keyof Obj] &
  string;

export type NestedKeys<Obj> = {
  [Key in keyof Obj]-?: undefined extends Obj[Key]
    ? IsNestedField<Exclude<Obj[Key], undefined>> extends never
      ? never
      : Key
    : IsNestedField<Obj[Key]> extends never
    ? never
    : Key;
}[keyof Obj] &
  string;

// Adjusted NonRefs to correctly map over Obj and preserve optional types
export type NonReferenceInputs<Obj> = {
  [Key in keyof Obj as Key extends NonRefKeys<Obj> ? Key : never]: MapPhoneNumberType<Obj[Key]>;
};

export type MapPhoneNumberType<T> = T extends PhoneNumber ? PhoneNumberInput : T;
