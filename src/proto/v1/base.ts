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
  /**
   * will be removed in the future, use vector_bytes
   *
   * @deprecated
   */
  values: number[];
  propName: string;
  valuesBytes: Uint8Array;
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
  emptyListProps: string[];
}

export interface ObjectArrayProperties {
  values: ObjectPropertiesValue[];
  propName: string;
}

export interface ObjectProperties {
  value: ObjectPropertiesValue | undefined;
  propName: string;
}

export interface TextArray {
  values: string[];
}

export interface IntArray {
  values: number[];
}

export interface NumberArray {
  values: number[];
}

export interface BooleanArray {
  values: boolean[];
}

export interface Filters {
  operator: Filters_Operator;
  /**
   * protolint:disable:next REPEATED_FIELD_NAMES_PLURALIZED
   *
   * @deprecated
   */
  on: string[];
  filters: Filters[];
  valueText?: string | undefined;
  valueInt?: number | undefined;
  valueBoolean?: boolean | undefined;
  valueNumber?: number | undefined;
  valueTextArray?: TextArray | undefined;
  valueIntArray?: IntArray | undefined;
  valueBooleanArray?: BooleanArray | undefined;
  valueNumberArray?: NumberArray | undefined;
  valueGeo?:
    | GeoCoordinatesFilter
    | undefined;
  /** leave space for more filter values */
  target: FilterTarget | undefined;
}

export enum Filters_Operator {
  OPERATOR_UNSPECIFIED = 0,
  OPERATOR_EQUAL = 1,
  OPERATOR_NOT_EQUAL = 2,
  OPERATOR_GREATER_THAN = 3,
  OPERATOR_GREATER_THAN_EQUAL = 4,
  OPERATOR_LESS_THAN = 5,
  OPERATOR_LESS_THAN_EQUAL = 6,
  OPERATOR_AND = 7,
  OPERATOR_OR = 8,
  OPERATOR_WITHIN_GEO_RANGE = 9,
  OPERATOR_LIKE = 10,
  OPERATOR_IS_NULL = 11,
  OPERATOR_CONTAINS_ANY = 12,
  OPERATOR_CONTAINS_ALL = 13,
  UNRECOGNIZED = -1,
}

export function filters_OperatorFromJSON(object: any): Filters_Operator {
  switch (object) {
    case 0:
    case "OPERATOR_UNSPECIFIED":
      return Filters_Operator.OPERATOR_UNSPECIFIED;
    case 1:
    case "OPERATOR_EQUAL":
      return Filters_Operator.OPERATOR_EQUAL;
    case 2:
    case "OPERATOR_NOT_EQUAL":
      return Filters_Operator.OPERATOR_NOT_EQUAL;
    case 3:
    case "OPERATOR_GREATER_THAN":
      return Filters_Operator.OPERATOR_GREATER_THAN;
    case 4:
    case "OPERATOR_GREATER_THAN_EQUAL":
      return Filters_Operator.OPERATOR_GREATER_THAN_EQUAL;
    case 5:
    case "OPERATOR_LESS_THAN":
      return Filters_Operator.OPERATOR_LESS_THAN;
    case 6:
    case "OPERATOR_LESS_THAN_EQUAL":
      return Filters_Operator.OPERATOR_LESS_THAN_EQUAL;
    case 7:
    case "OPERATOR_AND":
      return Filters_Operator.OPERATOR_AND;
    case 8:
    case "OPERATOR_OR":
      return Filters_Operator.OPERATOR_OR;
    case 9:
    case "OPERATOR_WITHIN_GEO_RANGE":
      return Filters_Operator.OPERATOR_WITHIN_GEO_RANGE;
    case 10:
    case "OPERATOR_LIKE":
      return Filters_Operator.OPERATOR_LIKE;
    case 11:
    case "OPERATOR_IS_NULL":
      return Filters_Operator.OPERATOR_IS_NULL;
    case 12:
    case "OPERATOR_CONTAINS_ANY":
      return Filters_Operator.OPERATOR_CONTAINS_ANY;
    case 13:
    case "OPERATOR_CONTAINS_ALL":
      return Filters_Operator.OPERATOR_CONTAINS_ALL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Filters_Operator.UNRECOGNIZED;
  }
}

export function filters_OperatorToJSON(object: Filters_Operator): string {
  switch (object) {
    case Filters_Operator.OPERATOR_UNSPECIFIED:
      return "OPERATOR_UNSPECIFIED";
    case Filters_Operator.OPERATOR_EQUAL:
      return "OPERATOR_EQUAL";
    case Filters_Operator.OPERATOR_NOT_EQUAL:
      return "OPERATOR_NOT_EQUAL";
    case Filters_Operator.OPERATOR_GREATER_THAN:
      return "OPERATOR_GREATER_THAN";
    case Filters_Operator.OPERATOR_GREATER_THAN_EQUAL:
      return "OPERATOR_GREATER_THAN_EQUAL";
    case Filters_Operator.OPERATOR_LESS_THAN:
      return "OPERATOR_LESS_THAN";
    case Filters_Operator.OPERATOR_LESS_THAN_EQUAL:
      return "OPERATOR_LESS_THAN_EQUAL";
    case Filters_Operator.OPERATOR_AND:
      return "OPERATOR_AND";
    case Filters_Operator.OPERATOR_OR:
      return "OPERATOR_OR";
    case Filters_Operator.OPERATOR_WITHIN_GEO_RANGE:
      return "OPERATOR_WITHIN_GEO_RANGE";
    case Filters_Operator.OPERATOR_LIKE:
      return "OPERATOR_LIKE";
    case Filters_Operator.OPERATOR_IS_NULL:
      return "OPERATOR_IS_NULL";
    case Filters_Operator.OPERATOR_CONTAINS_ANY:
      return "OPERATOR_CONTAINS_ANY";
    case Filters_Operator.OPERATOR_CONTAINS_ALL:
      return "OPERATOR_CONTAINS_ALL";
    case Filters_Operator.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface FilterReferenceSingleTarget {
  on: string;
  target: FilterTarget | undefined;
}

export interface FilterReferenceMultiTarget {
  on: string;
  target: FilterTarget | undefined;
  targetCollection: string;
}

export interface FilterReferenceCount {
  on: string;
}

export interface FilterTarget {
  property?: string | undefined;
  singleTarget?: FilterReferenceSingleTarget | undefined;
  multiTarget?: FilterReferenceMultiTarget | undefined;
  count?: FilterReferenceCount | undefined;
}

export interface GeoCoordinatesFilter {
  latitude: number;
  longitude: number;
  distance: number;
}

function createBaseNumberArrayProperties(): NumberArrayProperties {
  return { values: [], propName: "", valuesBytes: new Uint8Array(0) };
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
    if (message.valuesBytes.length !== 0) {
      writer.uint32(26).bytes(message.valuesBytes);
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
        case 3:
          if (tag !== 26) {
            break;
          }

          message.valuesBytes = reader.bytes();
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
      valuesBytes: isSet(object.valuesBytes) ? bytesFromBase64(object.valuesBytes) : new Uint8Array(0),
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
    if (message.valuesBytes.length !== 0) {
      obj.valuesBytes = base64FromBytes(message.valuesBytes);
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
    message.valuesBytes = object.valuesBytes ?? new Uint8Array(0);
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
    emptyListProps: [],
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
    for (const v of message.emptyListProps) {
      writer.uint32(82).string(v!);
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
        case 10:
          if (tag !== 82) {
            break;
          }

          message.emptyListProps.push(reader.string());
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
      emptyListProps: globalThis.Array.isArray(object?.emptyListProps)
        ? object.emptyListProps.map((e: any) => globalThis.String(e))
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
    if (message.emptyListProps?.length) {
      obj.emptyListProps = message.emptyListProps;
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
    message.emptyListProps = object.emptyListProps?.map((e) => e) || [];
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

function createBaseTextArray(): TextArray {
  return { values: [] };
}

export const TextArray = {
  encode(message: TextArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TextArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTextArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.values.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TextArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: TextArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<TextArray>): TextArray {
    return TextArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TextArray>): TextArray {
    const message = createBaseTextArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseIntArray(): IntArray {
  return { values: [] };
}

export const IntArray = {
  encode(message: IntArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.int64(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IntArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIntArray();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): IntArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
    };
  },

  toJSON(message: IntArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values.map((e) => Math.round(e));
    }
    return obj;
  },

  create(base?: DeepPartial<IntArray>): IntArray {
    return IntArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IntArray>): IntArray {
    const message = createBaseIntArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseNumberArray(): NumberArray {
  return { values: [] };
}

export const NumberArray = {
  encode(message: NumberArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.double(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NumberArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNumberArray();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): NumberArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Number(e)) : [],
    };
  },

  toJSON(message: NumberArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<NumberArray>): NumberArray {
    return NumberArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NumberArray>): NumberArray {
    const message = createBaseNumberArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseBooleanArray(): BooleanArray {
  return { values: [] };
}

export const BooleanArray = {
  encode(message: BooleanArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.values) {
      writer.bool(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BooleanArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBooleanArray();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BooleanArray {
    return {
      values: globalThis.Array.isArray(object?.values) ? object.values.map((e: any) => globalThis.Boolean(e)) : [],
    };
  },

  toJSON(message: BooleanArray): unknown {
    const obj: any = {};
    if (message.values?.length) {
      obj.values = message.values;
    }
    return obj;
  },

  create(base?: DeepPartial<BooleanArray>): BooleanArray {
    return BooleanArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BooleanArray>): BooleanArray {
    const message = createBaseBooleanArray();
    message.values = object.values?.map((e) => e) || [];
    return message;
  },
};

function createBaseFilters(): Filters {
  return {
    operator: 0,
    on: [],
    filters: [],
    valueText: undefined,
    valueInt: undefined,
    valueBoolean: undefined,
    valueNumber: undefined,
    valueTextArray: undefined,
    valueIntArray: undefined,
    valueBooleanArray: undefined,
    valueNumberArray: undefined,
    valueGeo: undefined,
    target: undefined,
  };
}

export const Filters = {
  encode(message: Filters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.operator !== 0) {
      writer.uint32(8).int32(message.operator);
    }
    for (const v of message.on) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.filters) {
      Filters.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.valueText !== undefined) {
      writer.uint32(34).string(message.valueText);
    }
    if (message.valueInt !== undefined) {
      writer.uint32(40).int64(message.valueInt);
    }
    if (message.valueBoolean !== undefined) {
      writer.uint32(48).bool(message.valueBoolean);
    }
    if (message.valueNumber !== undefined) {
      writer.uint32(57).double(message.valueNumber);
    }
    if (message.valueTextArray !== undefined) {
      TextArray.encode(message.valueTextArray, writer.uint32(74).fork()).ldelim();
    }
    if (message.valueIntArray !== undefined) {
      IntArray.encode(message.valueIntArray, writer.uint32(82).fork()).ldelim();
    }
    if (message.valueBooleanArray !== undefined) {
      BooleanArray.encode(message.valueBooleanArray, writer.uint32(90).fork()).ldelim();
    }
    if (message.valueNumberArray !== undefined) {
      NumberArray.encode(message.valueNumberArray, writer.uint32(98).fork()).ldelim();
    }
    if (message.valueGeo !== undefined) {
      GeoCoordinatesFilter.encode(message.valueGeo, writer.uint32(106).fork()).ldelim();
    }
    if (message.target !== undefined) {
      FilterTarget.encode(message.target, writer.uint32(162).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Filters {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilters();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.on.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.filters.push(Filters.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.valueText = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.valueInt = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.valueBoolean = reader.bool();
          continue;
        case 7:
          if (tag !== 57) {
            break;
          }

          message.valueNumber = reader.double();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.valueTextArray = TextArray.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.valueIntArray = IntArray.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.valueBooleanArray = BooleanArray.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.valueNumberArray = NumberArray.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.valueGeo = GeoCoordinatesFilter.decode(reader, reader.uint32());
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.target = FilterTarget.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Filters {
    return {
      operator: isSet(object.operator) ? filters_OperatorFromJSON(object.operator) : 0,
      on: globalThis.Array.isArray(object?.on) ? object.on.map((e: any) => globalThis.String(e)) : [],
      filters: globalThis.Array.isArray(object?.filters) ? object.filters.map((e: any) => Filters.fromJSON(e)) : [],
      valueText: isSet(object.valueText) ? globalThis.String(object.valueText) : undefined,
      valueInt: isSet(object.valueInt) ? globalThis.Number(object.valueInt) : undefined,
      valueBoolean: isSet(object.valueBoolean) ? globalThis.Boolean(object.valueBoolean) : undefined,
      valueNumber: isSet(object.valueNumber) ? globalThis.Number(object.valueNumber) : undefined,
      valueTextArray: isSet(object.valueTextArray) ? TextArray.fromJSON(object.valueTextArray) : undefined,
      valueIntArray: isSet(object.valueIntArray) ? IntArray.fromJSON(object.valueIntArray) : undefined,
      valueBooleanArray: isSet(object.valueBooleanArray) ? BooleanArray.fromJSON(object.valueBooleanArray) : undefined,
      valueNumberArray: isSet(object.valueNumberArray) ? NumberArray.fromJSON(object.valueNumberArray) : undefined,
      valueGeo: isSet(object.valueGeo) ? GeoCoordinatesFilter.fromJSON(object.valueGeo) : undefined,
      target: isSet(object.target) ? FilterTarget.fromJSON(object.target) : undefined,
    };
  },

  toJSON(message: Filters): unknown {
    const obj: any = {};
    if (message.operator !== 0) {
      obj.operator = filters_OperatorToJSON(message.operator);
    }
    if (message.on?.length) {
      obj.on = message.on;
    }
    if (message.filters?.length) {
      obj.filters = message.filters.map((e) => Filters.toJSON(e));
    }
    if (message.valueText !== undefined) {
      obj.valueText = message.valueText;
    }
    if (message.valueInt !== undefined) {
      obj.valueInt = Math.round(message.valueInt);
    }
    if (message.valueBoolean !== undefined) {
      obj.valueBoolean = message.valueBoolean;
    }
    if (message.valueNumber !== undefined) {
      obj.valueNumber = message.valueNumber;
    }
    if (message.valueTextArray !== undefined) {
      obj.valueTextArray = TextArray.toJSON(message.valueTextArray);
    }
    if (message.valueIntArray !== undefined) {
      obj.valueIntArray = IntArray.toJSON(message.valueIntArray);
    }
    if (message.valueBooleanArray !== undefined) {
      obj.valueBooleanArray = BooleanArray.toJSON(message.valueBooleanArray);
    }
    if (message.valueNumberArray !== undefined) {
      obj.valueNumberArray = NumberArray.toJSON(message.valueNumberArray);
    }
    if (message.valueGeo !== undefined) {
      obj.valueGeo = GeoCoordinatesFilter.toJSON(message.valueGeo);
    }
    if (message.target !== undefined) {
      obj.target = FilterTarget.toJSON(message.target);
    }
    return obj;
  },

  create(base?: DeepPartial<Filters>): Filters {
    return Filters.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Filters>): Filters {
    const message = createBaseFilters();
    message.operator = object.operator ?? 0;
    message.on = object.on?.map((e) => e) || [];
    message.filters = object.filters?.map((e) => Filters.fromPartial(e)) || [];
    message.valueText = object.valueText ?? undefined;
    message.valueInt = object.valueInt ?? undefined;
    message.valueBoolean = object.valueBoolean ?? undefined;
    message.valueNumber = object.valueNumber ?? undefined;
    message.valueTextArray = (object.valueTextArray !== undefined && object.valueTextArray !== null)
      ? TextArray.fromPartial(object.valueTextArray)
      : undefined;
    message.valueIntArray = (object.valueIntArray !== undefined && object.valueIntArray !== null)
      ? IntArray.fromPartial(object.valueIntArray)
      : undefined;
    message.valueBooleanArray = (object.valueBooleanArray !== undefined && object.valueBooleanArray !== null)
      ? BooleanArray.fromPartial(object.valueBooleanArray)
      : undefined;
    message.valueNumberArray = (object.valueNumberArray !== undefined && object.valueNumberArray !== null)
      ? NumberArray.fromPartial(object.valueNumberArray)
      : undefined;
    message.valueGeo = (object.valueGeo !== undefined && object.valueGeo !== null)
      ? GeoCoordinatesFilter.fromPartial(object.valueGeo)
      : undefined;
    message.target = (object.target !== undefined && object.target !== null)
      ? FilterTarget.fromPartial(object.target)
      : undefined;
    return message;
  },
};

function createBaseFilterReferenceSingleTarget(): FilterReferenceSingleTarget {
  return { on: "", target: undefined };
}

export const FilterReferenceSingleTarget = {
  encode(message: FilterReferenceSingleTarget, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.on !== "") {
      writer.uint32(10).string(message.on);
    }
    if (message.target !== undefined) {
      FilterTarget.encode(message.target, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FilterReferenceSingleTarget {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilterReferenceSingleTarget();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.on = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target = FilterTarget.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FilterReferenceSingleTarget {
    return {
      on: isSet(object.on) ? globalThis.String(object.on) : "",
      target: isSet(object.target) ? FilterTarget.fromJSON(object.target) : undefined,
    };
  },

  toJSON(message: FilterReferenceSingleTarget): unknown {
    const obj: any = {};
    if (message.on !== "") {
      obj.on = message.on;
    }
    if (message.target !== undefined) {
      obj.target = FilterTarget.toJSON(message.target);
    }
    return obj;
  },

  create(base?: DeepPartial<FilterReferenceSingleTarget>): FilterReferenceSingleTarget {
    return FilterReferenceSingleTarget.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FilterReferenceSingleTarget>): FilterReferenceSingleTarget {
    const message = createBaseFilterReferenceSingleTarget();
    message.on = object.on ?? "";
    message.target = (object.target !== undefined && object.target !== null)
      ? FilterTarget.fromPartial(object.target)
      : undefined;
    return message;
  },
};

function createBaseFilterReferenceMultiTarget(): FilterReferenceMultiTarget {
  return { on: "", target: undefined, targetCollection: "" };
}

export const FilterReferenceMultiTarget = {
  encode(message: FilterReferenceMultiTarget, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.on !== "") {
      writer.uint32(10).string(message.on);
    }
    if (message.target !== undefined) {
      FilterTarget.encode(message.target, writer.uint32(18).fork()).ldelim();
    }
    if (message.targetCollection !== "") {
      writer.uint32(26).string(message.targetCollection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FilterReferenceMultiTarget {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilterReferenceMultiTarget();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.on = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.target = FilterTarget.decode(reader, reader.uint32());
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

  fromJSON(object: any): FilterReferenceMultiTarget {
    return {
      on: isSet(object.on) ? globalThis.String(object.on) : "",
      target: isSet(object.target) ? FilterTarget.fromJSON(object.target) : undefined,
      targetCollection: isSet(object.targetCollection) ? globalThis.String(object.targetCollection) : "",
    };
  },

  toJSON(message: FilterReferenceMultiTarget): unknown {
    const obj: any = {};
    if (message.on !== "") {
      obj.on = message.on;
    }
    if (message.target !== undefined) {
      obj.target = FilterTarget.toJSON(message.target);
    }
    if (message.targetCollection !== "") {
      obj.targetCollection = message.targetCollection;
    }
    return obj;
  },

  create(base?: DeepPartial<FilterReferenceMultiTarget>): FilterReferenceMultiTarget {
    return FilterReferenceMultiTarget.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FilterReferenceMultiTarget>): FilterReferenceMultiTarget {
    const message = createBaseFilterReferenceMultiTarget();
    message.on = object.on ?? "";
    message.target = (object.target !== undefined && object.target !== null)
      ? FilterTarget.fromPartial(object.target)
      : undefined;
    message.targetCollection = object.targetCollection ?? "";
    return message;
  },
};

function createBaseFilterReferenceCount(): FilterReferenceCount {
  return { on: "" };
}

export const FilterReferenceCount = {
  encode(message: FilterReferenceCount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.on !== "") {
      writer.uint32(10).string(message.on);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FilterReferenceCount {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilterReferenceCount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.on = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FilterReferenceCount {
    return { on: isSet(object.on) ? globalThis.String(object.on) : "" };
  },

  toJSON(message: FilterReferenceCount): unknown {
    const obj: any = {};
    if (message.on !== "") {
      obj.on = message.on;
    }
    return obj;
  },

  create(base?: DeepPartial<FilterReferenceCount>): FilterReferenceCount {
    return FilterReferenceCount.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FilterReferenceCount>): FilterReferenceCount {
    const message = createBaseFilterReferenceCount();
    message.on = object.on ?? "";
    return message;
  },
};

function createBaseFilterTarget(): FilterTarget {
  return { property: undefined, singleTarget: undefined, multiTarget: undefined, count: undefined };
}

export const FilterTarget = {
  encode(message: FilterTarget, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.property !== undefined) {
      writer.uint32(10).string(message.property);
    }
    if (message.singleTarget !== undefined) {
      FilterReferenceSingleTarget.encode(message.singleTarget, writer.uint32(18).fork()).ldelim();
    }
    if (message.multiTarget !== undefined) {
      FilterReferenceMultiTarget.encode(message.multiTarget, writer.uint32(26).fork()).ldelim();
    }
    if (message.count !== undefined) {
      FilterReferenceCount.encode(message.count, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FilterTarget {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFilterTarget();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.property = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.singleTarget = FilterReferenceSingleTarget.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.multiTarget = FilterReferenceMultiTarget.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.count = FilterReferenceCount.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FilterTarget {
    return {
      property: isSet(object.property) ? globalThis.String(object.property) : undefined,
      singleTarget: isSet(object.singleTarget) ? FilterReferenceSingleTarget.fromJSON(object.singleTarget) : undefined,
      multiTarget: isSet(object.multiTarget) ? FilterReferenceMultiTarget.fromJSON(object.multiTarget) : undefined,
      count: isSet(object.count) ? FilterReferenceCount.fromJSON(object.count) : undefined,
    };
  },

  toJSON(message: FilterTarget): unknown {
    const obj: any = {};
    if (message.property !== undefined) {
      obj.property = message.property;
    }
    if (message.singleTarget !== undefined) {
      obj.singleTarget = FilterReferenceSingleTarget.toJSON(message.singleTarget);
    }
    if (message.multiTarget !== undefined) {
      obj.multiTarget = FilterReferenceMultiTarget.toJSON(message.multiTarget);
    }
    if (message.count !== undefined) {
      obj.count = FilterReferenceCount.toJSON(message.count);
    }
    return obj;
  },

  create(base?: DeepPartial<FilterTarget>): FilterTarget {
    return FilterTarget.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FilterTarget>): FilterTarget {
    const message = createBaseFilterTarget();
    message.property = object.property ?? undefined;
    message.singleTarget = (object.singleTarget !== undefined && object.singleTarget !== null)
      ? FilterReferenceSingleTarget.fromPartial(object.singleTarget)
      : undefined;
    message.multiTarget = (object.multiTarget !== undefined && object.multiTarget !== null)
      ? FilterReferenceMultiTarget.fromPartial(object.multiTarget)
      : undefined;
    message.count = (object.count !== undefined && object.count !== null)
      ? FilterReferenceCount.fromPartial(object.count)
      : undefined;
    return message;
  },
};

function createBaseGeoCoordinatesFilter(): GeoCoordinatesFilter {
  return { latitude: 0, longitude: 0, distance: 0 };
}

export const GeoCoordinatesFilter = {
  encode(message: GeoCoordinatesFilter, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.latitude !== 0) {
      writer.uint32(13).float(message.latitude);
    }
    if (message.longitude !== 0) {
      writer.uint32(21).float(message.longitude);
    }
    if (message.distance !== 0) {
      writer.uint32(29).float(message.distance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GeoCoordinatesFilter {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeoCoordinatesFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 13) {
            break;
          }

          message.latitude = reader.float();
          continue;
        case 2:
          if (tag !== 21) {
            break;
          }

          message.longitude = reader.float();
          continue;
        case 3:
          if (tag !== 29) {
            break;
          }

          message.distance = reader.float();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GeoCoordinatesFilter {
    return {
      latitude: isSet(object.latitude) ? globalThis.Number(object.latitude) : 0,
      longitude: isSet(object.longitude) ? globalThis.Number(object.longitude) : 0,
      distance: isSet(object.distance) ? globalThis.Number(object.distance) : 0,
    };
  },

  toJSON(message: GeoCoordinatesFilter): unknown {
    const obj: any = {};
    if (message.latitude !== 0) {
      obj.latitude = message.latitude;
    }
    if (message.longitude !== 0) {
      obj.longitude = message.longitude;
    }
    if (message.distance !== 0) {
      obj.distance = message.distance;
    }
    return obj;
  },

  create(base?: DeepPartial<GeoCoordinatesFilter>): GeoCoordinatesFilter {
    return GeoCoordinatesFilter.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GeoCoordinatesFilter>): GeoCoordinatesFilter {
    const message = createBaseGeoCoordinatesFilter();
    message.latitude = object.latitude ?? 0;
    message.longitude = object.longitude ?? 0;
    message.distance = object.distance ?? 0;
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
