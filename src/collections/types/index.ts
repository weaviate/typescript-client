export * from '../config/types/index.js';
export * from '../configure/types/index.js';
export * from './batch.js';
export * from './data.js';
export * from './generate.js';
export * from './query.js';
export type {
  QueryNested,
  QueryProperty,
  QueryReference,
  ReferenceInput,
  ReferenceInputs,
  NonReferenceInputs,
} from './internal.js';
export type { CollectionConfigCreate } from '../index.js';

import {
  GeoCoordinate as GeoCoordinateGRPC,
  PhoneNumber as PhoneNumberGRPC,
} from '../../proto/v1/properties.js';

import { CrossReference } from '../references/index.js';

// The order of type resolution is important here since object can be inferred as all other types
// hence it should be the last type in the union
export type DataType<T = any> = T extends infer U | undefined
  ? U extends string
    ? 'text' | 'blob'
    : U extends number
    ? 'number' | 'int'
    : U extends boolean
    ? 'boolean'
    : U extends Date
    ? 'date'
    : U extends string[]
    ? 'text[]'
    : U extends number[]
    ? 'number[]' | 'int[]'
    : U extends boolean[]
    ? 'boolean[]'
    : U extends Date[]
    ? 'date[]'
    : U extends GeoCoordinate
    ? 'geoCoordinates'
    : U extends PhoneNumber
    ? 'phoneNumber'
    : U extends object[]
    ? 'object[]'
    : U extends object
    ? 'object'
    : never
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

export type Property = WeaviateField | CrossReference<Properties> | undefined;

export interface Properties {
  [k: string]: Property;
}

export interface NestedProperties {
  [k: string]: WeaviateField;
}

export type PhoneNumberInput = {
  number: string;
  defaultCountry?: string;
};
