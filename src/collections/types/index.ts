export * from '../config/types';
export * from '../configure/types';
export * from './batch';
export * from './data';
export * from './generate';
export * from './query';
export type {
  QueryNested,
  QueryProperty,
  QueryReference,
  ReferenceInput,
  ReferenceInputs,
  NonReferenceInputs,
} from './internal';
export type { CollectionConfigCreate } from '..';

import {
  GeoCoordinate as GeoCoordinateGRPC,
  PhoneNumber as PhoneNumberGRPC,
} from '../../proto/v1/properties';

import { CrossReference } from '../references';

// The order of type resolution is important here since object can be inferred as all other types
// hence it should be the last type in the union
export type DataType<T = any> = T extends string
  ? 'text' | 'blob'
  : T extends number
  ? 'number' | 'int'
  : T extends boolean
  ? 'boolean'
  : T extends Date
  ? 'date'
  : T extends string[]
  ? 'text[]'
  : T extends number[]
  ? 'number[]' | 'int[]'
  : T extends boolean[]
  ? 'boolean[]'
  : T extends Date[]
  ? 'date[]'
  : T extends GeoCoordinate
  ? 'geoCoordinates'
  : T extends PhoneNumber
  ? 'phoneNumber'
  : T extends object[]
  ? 'object[]'
  : T extends object
  ? 'object'
  : never;

export type GeoCoordinate = Required<GeoCoordinateGRPC>;

export type PhoneNumber = Required<PhoneNumberGRPC>;

export type PrimitiveField =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | Date
  | Date[]
  | Blob
  | GeoCoordinate
  | PhoneNumber
  | PhoneNumberInput
  | null;

export type NestedField = NestedProperties | NestedProperties[];

export type WeaviateField = PrimitiveField | NestedField;

export interface Properties {
  [k: string]: WeaviateField | CrossReference<Properties> | undefined;
}

export interface NestedProperties {
  [k: string]: WeaviateField;
}

export type PhoneNumberInput = {
  number: string;
  defaultCountry?: string;
};
