import _m0 from 'protobufjs/minimal.js';
import {
  BooleanArrayProperties,
  ConsistencyLevel,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  TextArrayProperties,
  Vectors,
} from './base.js';
export declare const protobufPackage = 'weaviate.v1';
export interface BatchObjectsRequest {
  objects: BatchObject[];
  consistencyLevel?: ConsistencyLevel | undefined;
}
export interface BatchObject {
  uuid: string;
  /**
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   *
   * @deprecated
   */
  vector: number[];
  properties: BatchObject_Properties | undefined;
  collection: string;
  tenant: string;
  vectorBytes: Uint8Array;
  /** protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED */
  vectors: Vectors[];
}
export interface BatchObject_Properties {
  nonRefProperties:
    | {
        [key: string]: any;
      }
    | undefined;
  singleTargetRefProps: BatchObject_SingleTargetRefProps[];
  multiTargetRefProps: BatchObject_MultiTargetRefProps[];
  numberArrayProperties: NumberArrayProperties[];
  intArrayProperties: IntArrayProperties[];
  textArrayProperties: TextArrayProperties[];
  booleanArrayProperties: BooleanArrayProperties[];
  objectProperties: ObjectProperties[];
  objectArrayProperties: ObjectArrayProperties[];
  /**
   * empty lists do not have a type in many languages and clients do not know which datatype the property has.
   * Weaviate can get the datatype from its schema
   */
  emptyListProps: string[];
}
export interface BatchObject_SingleTargetRefProps {
  uuids: string[];
  propName: string;
}
export interface BatchObject_MultiTargetRefProps {
  uuids: string[];
  propName: string;
  targetCollection: string;
}
export interface BatchObjectsReply {
  took: number;
  errors: BatchObjectsReply_BatchError[];
}
export interface BatchObjectsReply_BatchError {
  index: number;
  error: string;
}
export declare const BatchObjectsRequest: {
  encode(message: BatchObjectsRequest, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsRequest;
  fromJSON(object: any): BatchObjectsRequest;
  toJSON(message: BatchObjectsRequest): unknown;
  create(base?: DeepPartial<BatchObjectsRequest>): BatchObjectsRequest;
  fromPartial(object: DeepPartial<BatchObjectsRequest>): BatchObjectsRequest;
};
export declare const BatchObject: {
  encode(message: BatchObject, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject;
  fromJSON(object: any): BatchObject;
  toJSON(message: BatchObject): unknown;
  create(base?: DeepPartial<BatchObject>): BatchObject;
  fromPartial(object: DeepPartial<BatchObject>): BatchObject;
};
export declare const BatchObject_Properties: {
  encode(message: BatchObject_Properties, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_Properties;
  fromJSON(object: any): BatchObject_Properties;
  toJSON(message: BatchObject_Properties): unknown;
  create(base?: DeepPartial<BatchObject_Properties>): BatchObject_Properties;
  fromPartial(object: DeepPartial<BatchObject_Properties>): BatchObject_Properties;
};
export declare const BatchObject_SingleTargetRefProps: {
  encode(message: BatchObject_SingleTargetRefProps, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_SingleTargetRefProps;
  fromJSON(object: any): BatchObject_SingleTargetRefProps;
  toJSON(message: BatchObject_SingleTargetRefProps): unknown;
  create(base?: DeepPartial<BatchObject_SingleTargetRefProps>): BatchObject_SingleTargetRefProps;
  fromPartial(object: DeepPartial<BatchObject_SingleTargetRefProps>): BatchObject_SingleTargetRefProps;
};
export declare const BatchObject_MultiTargetRefProps: {
  encode(message: BatchObject_MultiTargetRefProps, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_MultiTargetRefProps;
  fromJSON(object: any): BatchObject_MultiTargetRefProps;
  toJSON(message: BatchObject_MultiTargetRefProps): unknown;
  create(base?: DeepPartial<BatchObject_MultiTargetRefProps>): BatchObject_MultiTargetRefProps;
  fromPartial(object: DeepPartial<BatchObject_MultiTargetRefProps>): BatchObject_MultiTargetRefProps;
};
export declare const BatchObjectsReply: {
  encode(message: BatchObjectsReply, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsReply;
  fromJSON(object: any): BatchObjectsReply;
  toJSON(message: BatchObjectsReply): unknown;
  create(base?: DeepPartial<BatchObjectsReply>): BatchObjectsReply;
  fromPartial(object: DeepPartial<BatchObjectsReply>): BatchObjectsReply;
};
export declare const BatchObjectsReply_BatchError: {
  encode(message: BatchObjectsReply_BatchError, writer?: _m0.Writer): _m0.Writer;
  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsReply_BatchError;
  fromJSON(object: any): BatchObjectsReply_BatchError;
  toJSON(message: BatchObjectsReply_BatchError): unknown;
  create(base?: DeepPartial<BatchObjectsReply_BatchError>): BatchObjectsReply_BatchError;
  fromPartial(object: DeepPartial<BatchObjectsReply_BatchError>): BatchObjectsReply_BatchError;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
  ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : Partial<T>;
export {};
