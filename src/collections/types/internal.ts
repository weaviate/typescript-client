import { CrossReference, ReferenceManager } from '../references';
import {
  NestedProperties,
  PrimitiveField,
  RefProperty,
  ReferenceToMultiTarget,
  PhoneNumber,
  PhoneNumberInput,
  WeaviateField,
} from '.';

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

export type QueryProperty<T> = PrimitiveKeys<T> | QueryNested<T>;
export type QueryReference<T> = RefProperty<T>;
export type NonRefProperty<T> = keyof T | QueryNested<T>;
export type NonPrimitiveProperty<T> = RefProperty<T> | QueryNested<T>;

export type PrimitiveKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends PrimitiveField | undefined ? Key : never;
}[keyof Obj] &
  string;

// export type NestedKeys<Obj> = {
//   [Key in keyof Obj]: Obj[Key] extends NestedProperties | NestedProperties[] ? Key : never;
// }[keyof Obj] &
//   string;

export type RefKeys<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends CrossReference<any> | undefined ? Key : never;
}[keyof Obj] &
  string;

// export type NonRefKeys<Obj> = {
//   [Key in keyof Obj]: Obj[Key] extends WeaviateField ? Key : never;
// }[keyof Obj] &
//   string;

export type NonRefs<Obj> = {
  [Key in NonRefKeys<Obj>]: Obj[Key];
};

export type Refs<Obj> = {
  [Key in RefKeys<Obj>]: Obj[Key];
};

export type IsEmptyType<T> = keyof T extends never ? true : false;

export type ReferenceInput<T> =
  | string
  | ReferenceToMultiTarget
  | ReferenceManager<T>
  | (string | ReferenceToMultiTarget | ReferenceManager<T>)[];

export type ReferenceInputs<Obj> = {
  [Key in RefKeys<Obj>]: ReferenceInput<ExtractCrossReferenceType<Obj[Key]>>;
};

// Helper type to determine if a type is a WeaviateField excluding undefined
type IsWeaviateField<T> = T extends WeaviateField ? T : never;

type IsNestedField<T> = T extends NestedProperties | NestedProperties[] ? T : never;

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
