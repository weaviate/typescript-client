/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Struct } from "../google/protobuf/struct";

export const protobufPackage = "weaviate.v1";

export enum ConsistencyLevel {
  CONSISTENCY_LEVEL_UNSPECIFIED = 0,
  CONSISTENCY_LEVEL_ONE = 1,
  CONSISTENCY_LEVEL_QUORUM = 2,
  CONSISTENCY_LEVEL_ALL = 3,
  UNRECOGNIZED = -1,
}

export function consistencyLevelFromJSON(object: any): ConsistencyLevel {
  switch (object) {
    case 0:
    case "CONSISTENCY_LEVEL_UNSPECIFIED":
      return ConsistencyLevel.CONSISTENCY_LEVEL_UNSPECIFIED;
    case 1:
    case "CONSISTENCY_LEVEL_ONE":
      return ConsistencyLevel.CONSISTENCY_LEVEL_ONE;
    case 2:
    case "CONSISTENCY_LEVEL_QUORUM":
      return ConsistencyLevel.CONSISTENCY_LEVEL_QUORUM;
    case 3:
    case "CONSISTENCY_LEVEL_ALL":
      return ConsistencyLevel.CONSISTENCY_LEVEL_ALL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ConsistencyLevel.UNRECOGNIZED;
  }
}

export function consistencyLevelToJSON(object: ConsistencyLevel): string {
  switch (object) {
    case ConsistencyLevel.CONSISTENCY_LEVEL_UNSPECIFIED:
      return "CONSISTENCY_LEVEL_UNSPECIFIED";
    case ConsistencyLevel.CONSISTENCY_LEVEL_ONE:
      return "CONSISTENCY_LEVEL_ONE";
    case ConsistencyLevel.CONSISTENCY_LEVEL_QUORUM:
      return "CONSISTENCY_LEVEL_QUORUM";
    case ConsistencyLevel.CONSISTENCY_LEVEL_ALL:
      return "CONSISTENCY_LEVEL_ALL";
    case ConsistencyLevel.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface NumberArrayProperties {
  values: number[];
  propName: string;
}

export interface IntArrayProperties {
  values: number[];
  propName: string;
}

export interface TextArrayProperties {
  values: string[];
  propName: string;
}

export interface BooleanArrayProperties {
  values: boolean[];
  propName: string;
}

export interface ObjectPropertiesValue {
  nonRefProperties: { [key: string]: any } | undefined;
  numberArrayProperties: NumberArrayProperties[];
  intArrayProperties: IntArrayProperties[];
  textArrayProperties: TextArrayProperties[];
  booleanArrayProperties: BooleanArrayProperties[];
  objectProperties: ObjectProperties[];
  objectArrayProperties: ObjectArrayProperties[];
}

export interface ObjectArrayProperties {
  values: ObjectPropertiesValue[];
  propName: string;
}

export interface ObjectProperties {
  value: ObjectPropertiesValue | undefined;
  propName: string;
}

function createBaseNumberArrayProperties(): NumberArrayProperties {
  return { values: [], propName: "" };
}

export const NumberArrayProperties = {
  encode(message: NumberArrayProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.double(v);
    }
    writer.ldelim();
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NumberArrayProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNumberArrayProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 9) {
            message.values.push(reader.double());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(reader.double());
            }

            continue;
          }

          break;
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

  fromJSON(object: any): NumberArrayProperties {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: NumberArrayProperties): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<NumberArrayProperties>): NumberArrayProperties {
    return NumberArrayProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NumberArrayProperties>): NumberArrayProperties {
    const message = createBaseNumberArrayProperties();
    message.values = object.values?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseIntArrayProperties(): IntArrayProperties {
  return { values: [], propName: "" };
}

export const IntArrayProperties = {
  encode(message: IntArrayProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.int64(v);
    }
    writer.ldelim();
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IntArrayProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIntArrayProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.values.push(longToNumber(reader.int64() as Long));

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(longToNumber(reader.int64() as Long));
            }

            continue;
          }

          break;
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

  fromJSON(object: any): IntArrayProperties {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: IntArrayProperties): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => Math.round(e));
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<IntArrayProperties>): IntArrayProperties {
    return IntArrayProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IntArrayProperties>): IntArrayProperties {
    const message = createBaseIntArrayProperties();
    message.values = object.values?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseTextArrayProperties(): TextArrayProperties {
  return { values: [], propName: "" };
}

export const TextArrayProperties = {
  encode(message: TextArrayProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TextArrayProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTextArrayProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
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

  fromJSON(object: any): TextArrayProperties {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.String(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: TextArrayProperties): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<TextArrayProperties>): TextArrayProperties {
    return TextArrayProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TextArrayProperties>): TextArrayProperties {
    const message = createBaseTextArrayProperties();
    message.values = object.values?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseBooleanArrayProperties(): BooleanArrayProperties {
  return { values: [], propName: "" };
}

export const BooleanArrayProperties = {
  encode(message: BooleanArrayProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.bool(v);
    }
    writer.ldelim();
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BooleanArrayProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBooleanArrayProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.values.push(reader.bool());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.values.push(reader.bool());
            }

            continue;
          }

          break;
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

  fromJSON(object: any): BooleanArrayProperties {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Boolean(e)) : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: BooleanArrayProperties): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<BooleanArrayProperties>): BooleanArrayProperties {
    return BooleanArrayProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BooleanArrayProperties>): BooleanArrayProperties {
    const message = createBaseBooleanArrayProperties();
    message.values = object.values?.map((e) => e) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseObjectPropertiesValue(): ObjectPropertiesValue {
  return {
    nonRefProperties: undefined,
    numberArrayProperties: [],
    intArrayProperties: [],
    textArrayProperties: [],
    booleanArrayProperties: [],
    objectProperties: [],
    objectArrayProperties: [],
  };
}

export const ObjectPropertiesValue = {
  encode(message: ObjectPropertiesValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.nonRefProperties !== undefined) {
      Struct.encode(Struct.wrap(message.nonRefProperties), writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.numberArrayProperties) {
      NumberArrayProperties.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.intArrayProperties) {
      IntArrayProperties.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.textArrayProperties) {
      TextArrayProperties.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.booleanArrayProperties) {
      BooleanArrayProperties.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.objectProperties) {
      ObjectProperties.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.objectArrayProperties) {
      ObjectArrayProperties.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ObjectPropertiesValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseObjectPropertiesValue();
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

          message.numberArrayProperties.push(NumberArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.intArrayProperties.push(IntArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.textArrayProperties.push(TextArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.booleanArrayProperties.push(BooleanArrayProperties.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.objectProperties.push(ObjectProperties.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
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

  fromJSON(object: any): ObjectPropertiesValue {
    return {
      nonRefProperties: isObject(object.nonRefProperties) ? object.nonRefProperties : undefined,
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

  toJSON(message: ObjectPropertiesValue): unknown {
    const obj: any = {};
    if (message.nonRefProperties !== undefined) {
      obj.nonRefProperties = message.nonRefProperties;
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

  create(base?: DeepPartial<ObjectPropertiesValue>): ObjectPropertiesValue {
    return ObjectPropertiesValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ObjectPropertiesValue>): ObjectPropertiesValue {
    const message = createBaseObjectPropertiesValue();
    message.nonRefProperties = object.nonRefProperties ?? undefined;
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

function createBaseObjectArrayProperties(): ObjectArrayProperties {
  return { values: [], propName: "" };
}

export const ObjectArrayProperties = {
  encode(message: ObjectArrayProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      ObjectPropertiesValue.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ObjectArrayProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseObjectArrayProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(ObjectPropertiesValue.decode(reader, reader.uint32()));
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

  fromJSON(object: any): ObjectArrayProperties {
    return {
      values: globalThis.Array.isArray(object?.values)
        ? object.values.map((e: any) => ObjectPropertiesValue.fromJSON(e))
        : [],
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: ObjectArrayProperties): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => ObjectPropertiesValue.toJSON(e));
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<ObjectArrayProperties>): ObjectArrayProperties {
    return ObjectArrayProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ObjectArrayProperties>): ObjectArrayProperties {
    const message = createBaseObjectArrayProperties();
    message.values = object.values?.map((e) => ObjectPropertiesValue.fromPartial(e)) || [];
    message.propName = object.propName ?? "";
    return message;
  },
};

function createBaseObjectProperties(): ObjectProperties {
  return { value: undefined, propName: "" };
}

export const ObjectProperties = {
  encode(message: ObjectProperties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== undefined) {
      ObjectPropertiesValue.encode(message.value, writer.uint32(10).fork()).ldelim();
    }
    if (message.propName !== "") {
      writer.uint32(18).string(message.propName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ObjectProperties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseObjectProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = ObjectPropertiesValue.decode(reader, reader.uint32());
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

  fromJSON(object: any): ObjectProperties {
    return {
      value: isSet(object.value) ? ObjectPropertiesValue.fromJSON(object.value) : undefined,
      propName: isSet(object.propName) ? globalThis.String(object.propName) : "",
    };
  },

  toJSON(message: ObjectProperties): unknown {
    const obj: any = {};
    if (message.value !== undefined) {
      obj.value = ObjectPropertiesValue.toJSON(message.value);
    }
    if (message.propName !== "") {
      obj.propName = message.propName;
    }
    return obj;
  },

  create(base?: DeepPartial<ObjectProperties>): ObjectProperties {
    return ObjectProperties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ObjectProperties>): ObjectProperties {
    const message = createBaseObjectProperties();
    message.value = (object.value !== undefined && object.value !== null)
      ? ObjectPropertiesValue.fromPartial(object.value)
      : undefined;
    message.propName = object.propName ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
