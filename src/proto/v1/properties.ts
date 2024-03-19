/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { NullValue, nullValueFromJSON, nullValueToJSON } from "../google/protobuf/struct.js";

export const protobufPackage = "weaviate.v1";

export interface Properties {
  fields: { [key: string]: Value };
}

export interface Properties_FieldsEntry {
  key: string;
  value: Value | undefined;
}

export interface Value {
  numberValue?: number | undefined;
  stringValue?: string | undefined;
  boolValue?: boolean | undefined;
  objectValue?: Properties | undefined;
  listValue?: ListValue | undefined;
  dateValue?: string | undefined;
  uuidValue?: string | undefined;
  intValue?: number | undefined;
  geoValue?: GeoCoordinate | undefined;
  blobValue?: string | undefined;
  phoneValue?: PhoneNumber | undefined;
  nullValue?: NullValue | undefined;
}

export interface ListValue {
  values: Value[];
}

export interface GeoCoordinate {
  longitude: number;
  latitude: number;
}

export interface PhoneNumber {
  countryCode: number;
  defaultCountry: string;
  input: string;
  internationalFormatted: string;
  national: number;
  nationalFormatted: string;
  valid: boolean;
}

function createBaseProperties(): Properties {
  return { fields: {} };
}

export const Properties = {
  encode(message: Properties, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.fields).forEach(([key, value]) => {
      Properties_FieldsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Properties {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProperties();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = Properties_FieldsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.fields[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Properties {
    return {
      fields: isObject(object.fields)
        ? Object.entries(object.fields).reduce<{ [key: string]: Value }>((acc, [key, value]) => {
          acc[key] = Value.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: Properties): unknown {
    const obj: any = {};
    if (message.fields) {
      const entries = Object.entries(message.fields);
      if (entries.length > 0) {
        obj.fields = {};
        entries.forEach(([k, v]) => {
          obj.fields[k] = Value.toJSON(v);
        });
      }
    }
    return obj;
  },

  create(base?: DeepPartial<Properties>): Properties {
    return Properties.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Properties>): Properties {
    const message = createBaseProperties();
    message.fields = Object.entries(object.fields ?? {}).reduce<{ [key: string]: Value }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Value.fromPartial(value);
      }
      return acc;
    }, {});
    return message;
  },
};

function createBaseProperties_FieldsEntry(): Properties_FieldsEntry {
  return { key: "", value: undefined };
}

export const Properties_FieldsEntry = {
  encode(message: Properties_FieldsEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      Value.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Properties_FieldsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProperties_FieldsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = Value.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Properties_FieldsEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? Value.fromJSON(object.value) : undefined,
    };
  },

  toJSON(message: Properties_FieldsEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = Value.toJSON(message.value);
    }
    return obj;
  },

  create(base?: DeepPartial<Properties_FieldsEntry>): Properties_FieldsEntry {
    return Properties_FieldsEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Properties_FieldsEntry>): Properties_FieldsEntry {
    const message = createBaseProperties_FieldsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null) ? Value.fromPartial(object.value) : undefined;
    return message;
  },
};

function createBaseValue(): Value {
  return {
    numberValue: undefined,
    stringValue: undefined,
    boolValue: undefined,
    objectValue: undefined,
    listValue: undefined,
    dateValue: undefined,
    uuidValue: undefined,
    intValue: undefined,
    geoValue: undefined,
    blobValue: undefined,
    phoneValue: undefined,
    nullValue: undefined,
  };
}

export const Value = {
  encode(message: Value, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.numberValue !== undefined) {
      writer.uint32(9).double(message.numberValue);
    }
    if (message.stringValue !== undefined) {
      writer.uint32(18).string(message.stringValue);
    }
    if (message.boolValue !== undefined) {
      writer.uint32(24).bool(message.boolValue);
    }
    if (message.objectValue !== undefined) {
      Properties.encode(message.objectValue, writer.uint32(34).fork()).ldelim();
    }
    if (message.listValue !== undefined) {
      ListValue.encode(message.listValue, writer.uint32(42).fork()).ldelim();
    }
    if (message.dateValue !== undefined) {
      writer.uint32(50).string(message.dateValue);
    }
    if (message.uuidValue !== undefined) {
      writer.uint32(58).string(message.uuidValue);
    }
    if (message.intValue !== undefined) {
      writer.uint32(64).int64(message.intValue);
    }
    if (message.geoValue !== undefined) {
      GeoCoordinate.encode(message.geoValue, writer.uint32(74).fork()).ldelim();
    }
    if (message.blobValue !== undefined) {
      writer.uint32(82).string(message.blobValue);
    }
    if (message.phoneValue !== undefined) {
      PhoneNumber.encode(message.phoneValue, writer.uint32(90).fork()).ldelim();
    }
    if (message.nullValue !== undefined) {
      writer.uint32(96).int32(message.nullValue);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Value {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.numberValue = reader.double();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.stringValue = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.boolValue = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.objectValue = Properties.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.listValue = ListValue.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.dateValue = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.uuidValue = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.intValue = longToNumber(reader.int64() as Long);
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.geoValue = GeoCoordinate.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.blobValue = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.phoneValue = PhoneNumber.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.nullValue = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Value {
    return {
      numberValue: isSet(object.numberValue) ? globalThis.Number(object.numberValue) : undefined,
      stringValue: isSet(object.stringValue) ? globalThis.String(object.stringValue) : undefined,
      boolValue: isSet(object.boolValue) ? globalThis.Boolean(object.boolValue) : undefined,
      objectValue: isSet(object.objectValue) ? Properties.fromJSON(object.objectValue) : undefined,
      listValue: isSet(object.listValue) ? ListValue.fromJSON(object.listValue) : undefined,
      dateValue: isSet(object.dateValue) ? globalThis.String(object.dateValue) : undefined,
      uuidValue: isSet(object.uuidValue) ? globalThis.String(object.uuidValue) : undefined,
      intValue: isSet(object.intValue) ? globalThis.Number(object.intValue) : undefined,
      geoValue: isSet(object.geoValue) ? GeoCoordinate.fromJSON(object.geoValue) : undefined,
      blobValue: isSet(object.blobValue) ? globalThis.String(object.blobValue) : undefined,
      phoneValue: isSet(object.phoneValue) ? PhoneNumber.fromJSON(object.phoneValue) : undefined,
      nullValue: isSet(object.nullValue) ? nullValueFromJSON(object.nullValue) : undefined,
    };
  },

  toJSON(message: Value): unknown {
    const obj: any = {};
    if (message.numberValue !== undefined) {
      obj.numberValue = message.numberValue;
    }
    if (message.stringValue !== undefined) {
      obj.stringValue = message.stringValue;
    }
    if (message.boolValue !== undefined) {
      obj.boolValue = message.boolValue;
    }
    if (message.objectValue !== undefined) {
      obj.objectValue = Properties.toJSON(message.objectValue);
    }
    if (message.listValue !== undefined) {
      obj.listValue = ListValue.toJSON(message.listValue);
    }
    if (message.dateValue !== undefined) {
      obj.dateValue = message.dateValue;
    }
    if (message.uuidValue !== undefined) {
      obj.uuidValue = message.uuidValue;
    }
    if (message.intValue !== undefined) {
      obj.intValue = Math.round(message.intValue);
    }
    if (message.geoValue !== undefined) {
      obj.geoValue = GeoCoordinate.toJSON(message.geoValue);
    }
    if (message.blobValue !== undefined) {
      obj.blobValue = message.blobValue;
    }
    if (message.phoneValue !== undefined) {
      obj.phoneValue = PhoneNumber.toJSON(message.phoneValue);
    }
    if (message.nullValue !== undefined) {
      obj.nullValue = nullValueToJSON(message.nullValue);
    }
    return obj;
  },

  create(base?: DeepPartial<Value>): Value {
    return Value.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Value>): Value {
    const message = createBaseValue();
    message.numberValue = object.numberValue ?? undefined;
    message.stringValue = object.stringValue ?? undefined;
    message.boolValue = object.boolValue ?? undefined;
    message.objectValue = (object.objectValue !== undefined && object.objectValue !== null)
      ? Properties.fromPartial(object.objectValue)
      : undefined;
    message.listValue = (object.listValue !== undefined && object.listValue !== null)
      ? ListValue.fromPartial(object.listValue)
      : undefined;
    message.dateValue = object.dateValue ?? undefined;
    message.uuidValue = object.uuidValue ?? undefined;
    message.intValue = object.intValue ?? undefined;
    message.geoValue = (object.geoValue !== undefined && object.geoValue !== null)
      ? GeoCoordinate.fromPartial(object.geoValue)
      : undefined;
    message.blobValue = object.blobValue ?? undefined;
    message.phoneValue = (object.phoneValue !== undefined && object.phoneValue !== null)
      ? PhoneNumber.fromPartial(object.phoneValue)
      : undefined;
    message.nullValue = object.nullValue ?? undefined;
    return message;
  },
};

function createBaseListValue(): ListValue {
  return { values: [] };
}

export const ListValue = {
  encode(message: ListValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      Value.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(Value.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListValue {
    return { values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => Value.fromJSON(e)) : [] };
  },

  toJSON(message: ListValue): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => Value.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<ListValue>): ListValue {
    return ListValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListValue>): ListValue {
    const message = createBaseListValue();
    message.values = object.values?.map((e) => Value.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGeoCoordinate(): GeoCoordinate {
  return { longitude: 0, latitude: 0 };
}

export const GeoCoordinate = {
  encode(message: GeoCoordinate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.longitude !== 0) {
      writer.uint32(13).float(message.longitude);
    }
    if (message.latitude !== 0) {
      writer.uint32(21).float(message.latitude);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GeoCoordinate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeoCoordinate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.longitude = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.latitude = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GeoCoordinate {
    return {
      longitude: isSet(object.longitude) ? globalThis.Number(object.longitude) : 0,
      latitude: isSet(object.latitude) ? globalThis.Number(object.latitude) : 0,
    };
  },

  toJSON(message: GeoCoordinate): unknown {
    const obj: any = {};
    if (message.longitude !== 0) {
      obj.longitude = message.longitude;
    }
    if (message.latitude !== 0) {
      obj.latitude = message.latitude;
    }
    return obj;
  },

  create(base?: DeepPartial<GeoCoordinate>): GeoCoordinate {
    return GeoCoordinate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GeoCoordinate>): GeoCoordinate {
    const message = createBaseGeoCoordinate();
    message.longitude = object.longitude ?? 0;
    message.latitude = object.latitude ?? 0;
    return message;
  },
};

function createBasePhoneNumber(): PhoneNumber {
  return {
    countryCode: 0,
    defaultCountry: "",
    input: "",
    internationalFormatted: "",
    national: 0,
    nationalFormatted: "",
    valid: false,
  };
}

export const PhoneNumber = {
  encode(message: PhoneNumber, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.countryCode !== 0) {
      writer.uint32(8).uint64(message.countryCode);
    }
    if (message.defaultCountry !== "") {
      writer.uint32(18).string(message.defaultCountry);
    }
    if (message.input !== "") {
      writer.uint32(26).string(message.input);
    }
    if (message.internationalFormatted !== "") {
      writer.uint32(34).string(message.internationalFormatted);
    }
    if (message.national !== 0) {
      writer.uint32(40).uint64(message.national);
    }
    if (message.nationalFormatted !== "") {
      writer.uint32(50).string(message.nationalFormatted);
    }
    if (message.valid === true) {
      writer.uint32(56).bool(message.valid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PhoneNumber {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePhoneNumber();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.countryCode = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.defaultCountry = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.input = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.internationalFormatted = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.national = longToNumber(reader.uint64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.nationalFormatted = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.valid = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PhoneNumber {
    return {
      countryCode: isSet(object.countryCode) ? globalThis.Number(object.countryCode) : 0,
      defaultCountry: isSet(object.defaultCountry) ? globalThis.String(object.defaultCountry) : "",
      input: isSet(object.input) ? globalThis.String(object.input) : "",
      internationalFormatted: isSet(object.internationalFormatted)
        ? globalThis.String(object.internationalFormatted)
        : "",
      national: isSet(object.national) ? globalThis.Number(object.national) : 0,
      nationalFormatted: isSet(object.nationalFormatted) ? globalThis.String(object.nationalFormatted) : "",
      valid: isSet(object.valid) ? globalThis.Boolean(object.valid) : false,
    };
  },

  toJSON(message: PhoneNumber): unknown {
    const obj: any = {};
    if (message.countryCode !== 0) {
      obj.countryCode = Math.round(message.countryCode);
    }
    if (message.defaultCountry !== "") {
      obj.defaultCountry = message.defaultCountry;
    }
    if (message.input !== "") {
      obj.input = message.input;
    }
    if (message.internationalFormatted !== "") {
      obj.internationalFormatted = message.internationalFormatted;
    }
    if (message.national !== 0) {
      obj.national = Math.round(message.national);
    }
    if (message.nationalFormatted !== "") {
      obj.nationalFormatted = message.nationalFormatted;
    }
    if (message.valid === true) {
      obj.valid = message.valid;
    }
    return obj;
  },

  create(base?: DeepPartial<PhoneNumber>): PhoneNumber {
    return PhoneNumber.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PhoneNumber>): PhoneNumber {
    const message = createBasePhoneNumber();
    message.countryCode = object.countryCode ?? 0;
    message.defaultCountry = object.defaultCountry ?? "";
    message.input = object.input ?? "";
    message.internationalFormatted = object.internationalFormatted ?? "";
    message.national = object.national ?? 0;
    message.nationalFormatted = object.nationalFormatted ?? "";
    message.valid = object.valid ?? false;
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
