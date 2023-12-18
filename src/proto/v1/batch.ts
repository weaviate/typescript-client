/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Struct } from "../google/protobuf/struct";
import {
  BooleanArrayProperties,
  ConsistencyLevel,
  consistencyLevelFromJSON,
  consistencyLevelToJSON,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  TextArrayProperties,
} from "./base";

export const protobufPackage = "weaviate.v1";

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
}

export interface BatchObject_Properties {
  nonRefProperties: { [key: string]: any } | undefined;
  singleTargetRefProps: BatchObject_SingleTargetRefProps[];
  multiTargetRefProps: BatchObject_MultiTargetRefProps[];
  numberArrayProperties: NumberArrayProperties[];
  intArrayProperties: IntArrayProperties[];
  textArrayProperties: TextArrayProperties[];
  booleanArrayProperties: BooleanArrayProperties[];
  objectProperties: ObjectProperties[];
  objectArrayProperties: ObjectArrayProperties[];
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

function createBaseBatchObjectsRequest(): BatchObjectsRequest {
  return { objects: [], consistencyLevel: undefined };
}

export const BatchObjectsRequest = {
  encode(message: BatchObjectsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.objects) {
      BatchObject.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.consistencyLevel !== undefined) {
      writer.uint32(16).int32(message.consistencyLevel);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObjectsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.objects.push(BatchObject.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.consistencyLevel = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObjectsRequest {
    return {
      objects: globalThis.Array.isArray(object?.objects) ? object.objects.map((e: any) => BatchObject.fromJSON(e)) : [],
      consistencyLevel: isSet(object.consistencyLevel) ? consistencyLevelFromJSON(object.consistencyLevel) : undefined,
    };
  },

  toJSON(message: BatchObjectsRequest): unknown {
    const obj: any = {};
    if (message.objects?.length) {
      obj.objects = message.objects.map((e) => BatchObject.toJSON(e));
    }
    if (message.consistencyLevel !== undefined) {
      obj.consistencyLevel = consistencyLevelToJSON(message.consistencyLevel);
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObjectsRequest>): BatchObjectsRequest {
    return BatchObjectsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObjectsRequest>): BatchObjectsRequest {
    const message = createBaseBatchObjectsRequest();
    message.objects = object.objects?.map((e) => BatchObject.fromPartial(e)) || [];
    message.consistencyLevel = object.consistencyLevel ?? undefined;
    return message;
  },
};

function createBaseBatchObject(): BatchObject {
  return { uuid: "", vector: [], properties: undefined, collection: "", tenant: "", vectorBytes: new Uint8Array(0) };
}

export const BatchObject = {
  encode(message: BatchObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    writer.uint32(18).fork();
    for (const v of message.vector) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.properties !== undefined) {
      BatchObject_Properties.encode(message.properties, writer.uint32(26).fork()).ldelim();
    }
    if (message.collection !== "") {
      writer.uint32(34).string(message.collection);
    }
    if (message.tenant !== "") {
      writer.uint32(42).string(message.tenant);
    }
    if (message.vectorBytes.length !== 0) {
      writer.uint32(50).bytes(message.vectorBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuid = reader.string();
          continue;
        case 2:
          if (tag === 21) {
            message.vector.push(reader.float());

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.vector.push(reader.float());
            }

            continue;
          }

          break;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.properties = BatchObject_Properties.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.collection = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.tenant = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.vectorBytes = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObject {
    return {
      uuid: isSet(object.uuid) ? globalThis.String(object.uuid) : "",
      vector: globalThis.Array.isArray(object?.vector) ? object.vector.map((e: any) => globalThis.Number(e)) : [],
      properties: isSet(object.properties) ? BatchObject_Properties.fromJSON(object.properties) : undefined,
      collection: isSet(object.collection) ? globalThis.String(object.collection) : "",
      tenant: isSet(object.tenant) ? globalThis.String(object.tenant) : "",
      vectorBytes: isSet(object.vectorBytes) ? bytesFromBase64(object.vectorBytes) : new Uint8Array(0),
    };
  },

  toJSON(message: BatchObject): unknown {
    const obj: any = {};
    if (message.uuid !== "") {
      obj.uuid = message.uuid;
    }
    if (message.vector?.length) {
      obj.vector = message.vector;
    }
    if (message.properties !== undefined) {
      obj.properties = BatchObject_Properties.toJSON(message.properties);
    }
    if (message.collection !== "") {
      obj.collection = message.collection;
    }
    if (message.tenant !== "") {
      obj.tenant = message.tenant;
    }
    if (message.vectorBytes.length !== 0) {
      obj.vectorBytes = base64FromBytes(message.vectorBytes);
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObject>): BatchObject {
    return BatchObject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObject>): BatchObject {
    const message = createBaseBatchObject();
    message.uuid = object.uuid ?? "";
    message.vector = object.vector?.map((e) => e) || [];
    message.properties = (object.properties !== undefined && object.properties !== null)
      ? BatchObject_Properties.fromPartial(object.properties)
      : undefined;
    message.collection = object.collection ?? "";
    message.tenant = object.tenant ?? "";
    message.vectorBytes = object.vectorBytes ?? new Uint8Array(0);
    return message;
  },
};

function createBaseBatchObject_Properties(): BatchObject_Properties {
  return {
    nonRefProperties: undefined,
    singleTargetRefProps: [],
    multiTargetRefProps: [],
    numberArrayProperties: [],
    intArrayProperties: [],
    textArrayProperties: [],
    booleanArrayProperties: [],
    objectProperties: [],
    objectArrayProperties: [],
  };
}

export const BatchObject_Properties = {
  encode(message: BatchObject_Properties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonRefProperties !== undefined) {
      Struct.encode(Struct.wrap(message.nonRefProperties), writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.singleTargetRefProps) {
      BatchObject_SingleTargetRefProps.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.multiTargetRefProps) {
      BatchObject_MultiTargetRefProps.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.numberArrayProperties) {
      NumberArrayProperties.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.intArrayProperties) {
      IntArrayProperties.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.textArrayProperties) {
      TextArrayProperties.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.booleanArrayProperties) {
      BooleanArrayProperties.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.objectProperties) {
      ObjectProperties.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.objectArrayProperties) {
      ObjectArrayProperties.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_Properties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObject_Properties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.nonRefProperties = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.singleTargetRefProps.push(BatchObject_SingleTargetRefProps.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.multiTargetRefProps.push(BatchObject_MultiTargetRefProps.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.numberArrayProperties.push(NumberArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.intArrayProperties.push(IntArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.textArrayProperties.push(TextArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.booleanArrayProperties.push(BooleanArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.objectProperties.push(ObjectProperties.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.objectArrayProperties.push(ObjectArrayProperties.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObject_Properties {
    return {
      nonRefProperties: isObject(object.nonRefProperties) ? object.nonRefProperties : undefined,
      singleTargetRefProps: globalThis.Array.isArray(object?.singleTargetRefProps)
        ? object.singleTargetRefProps.map((e: any) => BatchObject_SingleTargetRefProps.fromJSON(e))
        : [],
      multiTargetRefProps: globalThis.Array.isArray(object?.multiTargetRefProps)
        ? object.multiTargetRefProps.map((e: any) => BatchObject_MultiTargetRefProps.fromJSON(e))
        : [],
      numberArrayProperties: globalThis.Array.isArray(object?.numberArrayProperties)
        ? object.numberArrayProperties.map((e: any) => NumberArrayProperties.fromJSON(e))
        : [],
      intArrayProperties: globalThis.Array.isArray(object?.intArrayProperties)
        ? object.intArrayProperties.map((e: any) => IntArrayProperties.fromJSON(e))
        : [],
      textArrayProperties: globalThis.Array.isArray(object?.textArrayProperties)
        ? object.textArrayProperties.map((e: any) => TextArrayProperties.fromJSON(e))
        : [],
      booleanArrayProperties: globalThis.Array.isArray(object?.booleanArrayProperties)
        ? object.booleanArrayProperties.map((e: any) => BooleanArrayProperties.fromJSON(e))
        : [],
      objectProperties: globalThis.Array.isArray(object?.objectProperties)
        ? object.objectProperties.map((e: any) => ObjectProperties.fromJSON(e))
        : [],
      objectArrayProperties: globalThis.Array.isArray(object?.objectArrayProperties)
        ? object.objectArrayProperties.map((e: any) => ObjectArrayProperties.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchObject_Properties): unknown {
    const obj: any = {};
    if (message.nonRefProperties !== undefined) {
      obj.nonRefProperties = message.nonRefProperties;
    }
    if (message.singleTargetRefProps?.length) {
      obj.singleTargetRefProps = message.singleTargetRefProps.map((e) => BatchObject_SingleTargetRefProps.toJSON(e));
    }
    if (message.multiTargetRefProps?.length) {
      obj.multiTargetRefProps = message.multiTargetRefProps.map((e) => BatchObject_MultiTargetRefProps.toJSON(e));
    }
    if (message.numberArrayProperties?.length) {
      obj.numberArrayProperties = message.numberArrayProperties.map((e) => NumberArrayProperties.toJSON(e));
    }
    if (message.intArrayProperties?.length) {
      obj.intArrayProperties = message.intArrayProperties.map((e) => IntArrayProperties.toJSON(e));
    }
    if (message.textArrayProperties?.length) {
      obj.textArrayProperties = message.textArrayProperties.map((e) => TextArrayProperties.toJSON(e));
    }
    if (message.booleanArrayProperties?.length) {
      obj.booleanArrayProperties = message.booleanArrayProperties.map((e) => BooleanArrayProperties.toJSON(e));
    }
    if (message.objectProperties?.length) {
      obj.objectProperties = message.objectProperties.map((e) => ObjectProperties.toJSON(e));
    }
    if (message.objectArrayProperties?.length) {
      obj.objectArrayProperties = message.objectArrayProperties.map((e) => ObjectArrayProperties.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObject_Properties>): BatchObject_Properties {
    return BatchObject_Properties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObject_Properties>): BatchObject_Properties {
    const message = createBaseBatchObject_Properties();
    message.nonRefProperties = object.nonRefProperties ?? undefined;
    message.singleTargetRefProps =
      object.singleTargetRefProps?.map((e) => BatchObject_SingleTargetRefProps.fromPartial(e)) || [];
    message.multiTargetRefProps =
      object.multiTargetRefProps?.map((e) => BatchObject_MultiTargetRefProps.fromPartial(e)) || [];
    message.numberArrayProperties = object.numberArrayProperties?.map((e) => NumberArrayProperties.fromPartial(e)) ||
      [];
    message.intArrayProperties = object.intArrayProperties?.map((e) => IntArrayProperties.fromPartial(e)) || [];
    message.textArrayProperties = object.textArrayProperties?.map((e) => TextArrayProperties.fromPartial(e)) || [];
    message.booleanArrayProperties = object.booleanArrayProperties?.map((e) => BooleanArrayProperties.fromPartial(e)) ||
      [];
    message.objectProperties = object.objectProperties?.map((e) => ObjectProperties.fromPartial(e)) || [];
    message.objectArrayProperties = object.objectArrayProperties?.map((e) => ObjectArrayProperties.fromPartial(e)) ||
      [];
    return message;
  },
};

function createBaseBatchObject_SingleTargetRefProps(): BatchObject_SingleTargetRefProps {
  return { uuids: [], propName: "" };
}

export const BatchObject_SingleTargetRefProps = {
  encode(message: BatchObject_SingleTargetRefProps, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.uuids) {
      writer.uint32(10).string(v!);
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_SingleTargetRefProps {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObject_SingleTargetRefProps();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuids.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propName = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObject_SingleTargetRefProps {
    return {
      uuids: globalThis.Array.isArray(object?.uuids) ? object.uuids.map((e: any) => globalThis.String(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: BatchObject_SingleTargetRefProps): unknown {
    const obj: any = {};
    if (message.uuids?.length) {
      obj.uuids = message.uuids;
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObject_SingleTargetRefProps>): BatchObject_SingleTargetRefProps {
    return BatchObject_SingleTargetRefProps.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObject_SingleTargetRefProps>): BatchObject_SingleTargetRefProps {
    const message = createBaseBatchObject_SingleTargetRefProps();
    message.uuids = object.uuids?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseBatchObject_MultiTargetRefProps(): BatchObject_MultiTargetRefProps {
  return { uuids: [], propName: "", targetCollection: "" };
}

export const BatchObject_MultiTargetRefProps = {
  encode(message: BatchObject_MultiTargetRefProps, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.uuids) {
      writer.uint32(10).string(v!);
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    if (message.targetCollection !== "") {
      writer.uint32(26).string(message.targetCollection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObject_MultiTargetRefProps {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObject_MultiTargetRefProps();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuids.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.propName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.targetCollection = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObject_MultiTargetRefProps {
    return {
      uuids: globalThis.Array.isArray(object?.uuids) ? object.uuids.map((e: any) => globalThis.String(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
      targetCollection: isSet(object.targetCollection) ? globalThis.String(object.targetCollection) : "",
    };
  },

  toJSON(message: BatchObject_MultiTargetRefProps): unknown {
    const obj: any = {};
    if (message.uuids?.length) {
      obj.uuids = message.uuids;
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    if (message.targetCollection !== "") {
      obj.targetCollection = message.targetCollection;
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObject_MultiTargetRefProps>): BatchObject_MultiTargetRefProps {
    return BatchObject_MultiTargetRefProps.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObject_MultiTargetRefProps>): BatchObject_MultiTargetRefProps {
    const message = createBaseBatchObject_MultiTargetRefProps();
    message.uuids = object.uuids?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    message.targetCollection = object.targetCollection ?? "";
    return message;
  },
};

function createBaseBatchObjectsReply(): BatchObjectsReply {
  return { took: 0, errors: [] };
}

export const BatchObjectsReply = {
  encode(message: BatchObjectsReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.took !== 0) {
      writer.uint32(13).float(message.took);
    }
    for (const v of message.errors) {
      BatchObjectsReply_BatchError.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObjectsReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.took = reader.float();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.errors.push(BatchObjectsReply_BatchError.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObjectsReply {
    return {
      took: isSet(object.took) ? globalThis.Number(object.took) : 0,
      errors: globalThis.Array.isArray(object?.errors)
        ? object.errors.map((e: any) => BatchObjectsReply_BatchError.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchObjectsReply): unknown {
    const obj: any = {};
    if (message.took !== 0) {
      obj.took = message.took;
    }
    if (message.errors?.length) {
      obj.errors = message.errors.map((e) => BatchObjectsReply_BatchError.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObjectsReply>): BatchObjectsReply {
    return BatchObjectsReply.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObjectsReply>): BatchObjectsReply {
    const message = createBaseBatchObjectsReply();
    message.took = object.took ?? 0;
    message.errors = object.errors?.map((e) => BatchObjectsReply_BatchError.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBatchObjectsReply_BatchError(): BatchObjectsReply_BatchError {
  return { index: 0, error: "" };
}

export const BatchObjectsReply_BatchError = {
  encode(message: BatchObjectsReply_BatchError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.index !== 0) {
      writer.uint32(8).int32(message.index);
    }
    if (message.error !== "") {
      writer.uint32(18).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchObjectsReply_BatchError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchObjectsReply_BatchError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.index = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchObjectsReply_BatchError {
    return {
      index: isSet(object.index) ? globalThis.Number(object.index) : 0,
      error: isSet(object.error) ? globalThis.String(object.error) : "",
    };
  },

  toJSON(message: BatchObjectsReply_BatchError): unknown {
    const obj: any = {};
    if (message.index !== 0) {
      obj.index = Math.round(message.index);
    }
    if (message.error !== "") {
      obj.error = message.error;
    }
    return obj;
  },

  create(base?: DeepPartial<BatchObjectsReply_BatchError>): BatchObjectsReply_BatchError {
    return BatchObjectsReply_BatchError.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchObjectsReply_BatchError>): BatchObjectsReply_BatchError {
    const message = createBaseBatchObjectsReply_BatchError();
    message.index = object.index ?? 0;
    message.error = object.error ?? "";
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
