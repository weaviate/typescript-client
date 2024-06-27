/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal.js";
import { ConsistencyLevel, consistencyLevelFromJSON, consistencyLevelToJSON, Filters } from "./base.js";

export const protobufPackage = "weaviate.v1";

export interface BatchDeleteRequest {
  collection: string;
  filters: Filters | undefined;
  verbose: boolean;
  dryRun: boolean;
  consistencyLevel?: ConsistencyLevel | undefined;
  tenant?: string | undefined;
}

export interface BatchDeleteReply {
  took: number;
  failed: number;
  matches: number;
  successful: number;
  objects: BatchDeleteObject[];
}

export interface BatchDeleteObject {
  uuid: Uint8Array;
  successful: boolean;
  /** empty string means no error */
  error?: string | undefined;
}

function createBaseBatchDeleteRequest(): BatchDeleteRequest {
  return {
    collection: "",
    filters: undefined,
    verbose: false,
    dryRun: false,
    consistencyLevel: undefined,
    tenant: undefined,
  };
}

export const BatchDeleteRequest = {
  encode(message: BatchDeleteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.collection !== "") {
      writer.uint32(10).string(message.collection);
    }
    if (message.filters !== undefined) {
      Filters.encode(message.filters, writer.uint32(18).fork()).ldelim();
    }
    if (message.verbose === true) {
      writer.uint32(24).bool(message.verbose);
    }
    if (message.dryRun === true) {
      writer.uint32(32).bool(message.dryRun);
    }
    if (message.consistencyLevel !== undefined) {
      writer.uint32(40).int32(message.consistencyLevel);
    }
    if (message.tenant !== undefined) {
      writer.uint32(50).string(message.tenant);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchDeleteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchDeleteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collection = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.filters = Filters.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.verbose = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.dryRun = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.consistencyLevel = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.tenant = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchDeleteRequest {
    return {
      collection: isSet(object.collection) ? globalThis.String(object.collection) : "",
      filters: isSet(object.filters) ? Filters.fromJSON(object.filters) : undefined,
      verbose: isSet(object.verbose) ? globalThis.Boolean(object.verbose) : false,
      dryRun: isSet(object.dryRun) ? globalThis.Boolean(object.dryRun) : false,
      consistencyLevel: isSet(object.consistencyLevel) ? consistencyLevelFromJSON(object.consistencyLevel) : undefined,
      tenant: isSet(object.tenant) ? globalThis.String(object.tenant) : undefined,
    };
  },

  toJSON(message: BatchDeleteRequest): unknown {
    const obj: any = {};
    if (message.collection !== "") {
      obj.collection = message.collection;
    }
    if (message.filters !== undefined) {
      obj.filters = Filters.toJSON(message.filters);
    }
    if (message.verbose === true) {
      obj.verbose = message.verbose;
    }
    if (message.dryRun === true) {
      obj.dryRun = message.dryRun;
    }
    if (message.consistencyLevel !== undefined) {
      obj.consistencyLevel = consistencyLevelToJSON(message.consistencyLevel);
    }
    if (message.tenant !== undefined) {
      obj.tenant = message.tenant;
    }
    return obj;
  },

  create(base?: DeepPartial<BatchDeleteRequest>): BatchDeleteRequest {
    return BatchDeleteRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchDeleteRequest>): BatchDeleteRequest {
    const message = createBaseBatchDeleteRequest();
    message.collection = object.collection ?? "";
    message.filters = (object.filters !== undefined && object.filters !== null)
      ? Filters.fromPartial(object.filters)
      : undefined;
    message.verbose = object.verbose ?? false;
    message.dryRun = object.dryRun ?? false;
    message.consistencyLevel = object.consistencyLevel ?? undefined;
    message.tenant = object.tenant ?? undefined;
    return message;
  },
};

function createBaseBatchDeleteReply(): BatchDeleteReply {
  return { took: 0, failed: 0, matches: 0, successful: 0, objects: [] };
}

export const BatchDeleteReply = {
  encode(message: BatchDeleteReply, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.took !== 0) {
      writer.uint32(13).float(message.took);
    }
    if (message.failed !== 0) {
      writer.uint32(16).int64(message.failed);
    }
    if (message.matches !== 0) {
      writer.uint32(24).int64(message.matches);
    }
    if (message.successful !== 0) {
      writer.uint32(32).int64(message.successful);
    }
    for (const v of message.objects) {
      BatchDeleteObject.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchDeleteReply {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchDeleteReply();
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
          if (tag !== 16) {
            break;
          }

          message.failed = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.matches = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.successful = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.objects.push(BatchDeleteObject.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BatchDeleteReply {
    return {
      took: isSet(object.took) ? globalThis.Number(object.took) : 0,
      failed: isSet(object.failed) ? globalThis.Number(object.failed) : 0,
      matches: isSet(object.matches) ? globalThis.Number(object.matches) : 0,
      successful: isSet(object.successful) ? globalThis.Number(object.successful) : 0,
      objects: globalThis.Array.isArray(object?.objects)
        ? object.objects.map((e: any) => BatchDeleteObject.fromJSON(e))
        : [],
    };
  },

  toJSON(message: BatchDeleteReply): unknown {
    const obj: any = {};
    if (message.took !== 0) {
      obj.took = message.took;
    }
    if (message.failed !== 0) {
      obj.failed = Math.round(message.failed);
    }
    if (message.matches !== 0) {
      obj.matches = Math.round(message.matches);
    }
    if (message.successful !== 0) {
      obj.successful = Math.round(message.successful);
    }
    if (message.objects?.length) {
      obj.objects = message.objects.map((e) => BatchDeleteObject.toJSON(e));
    }
    return obj;
  },

  create(base?: DeepPartial<BatchDeleteReply>): BatchDeleteReply {
    return BatchDeleteReply.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchDeleteReply>): BatchDeleteReply {
    const message = createBaseBatchDeleteReply();
    message.took = object.took ?? 0;
    message.failed = object.failed ?? 0;
    message.matches = object.matches ?? 0;
    message.successful = object.successful ?? 0;
    message.objects = object.objects?.map((e) => BatchDeleteObject.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBatchDeleteObject(): BatchDeleteObject {
  return { uuid: new Uint8Array(0), successful: false, error: undefined };
}

export const BatchDeleteObject = {
  encode(message: BatchDeleteObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.uuid.length !== 0) {
      writer.uint32(10).bytes(message.uuid);
    }
    if (message.successful === true) {
      writer.uint32(16).bool(message.successful);
    }
    if (message.error !== undefined) {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BatchDeleteObject {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchDeleteObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.uuid = reader.bytes();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.successful = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): BatchDeleteObject {
    return {
      uuid: isSet(object.uuid) ? bytesFromBase64(object.uuid) : new Uint8Array(0),
      successful: isSet(object.successful) ? globalThis.Boolean(object.successful) : false,
      error: isSet(object.error) ? globalThis.String(object.error) : undefined,
    };
  },

  toJSON(message: BatchDeleteObject): unknown {
    const obj: any = {};
    if (message.uuid.length !== 0) {
      obj.uuid = base64FromBytes(message.uuid);
    }
    if (message.successful === true) {
      obj.successful = message.successful;
    }
    if (message.error !== undefined) {
      obj.error = message.error;
    }
    return obj;
  },

  create(base?: DeepPartial<BatchDeleteObject>): BatchDeleteObject {
    return BatchDeleteObject.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<BatchDeleteObject>): BatchDeleteObject {
    const message = createBaseBatchDeleteObject();
    message.uuid = object.uuid ?? new Uint8Array(0);
    message.successful = object.successful ?? false;
    message.error = object.error ?? undefined;
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
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
  if ((globalThis as any).Buffer) {
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
