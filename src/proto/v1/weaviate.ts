/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import { BatchObjectsReply, BatchObjectsRequest } from "./batch.js";
import { BatchDeleteReply, BatchDeleteRequest } from "./batch_delete.js";
import { SearchReply, SearchRequest } from "./search_get.js";
import { TenantsGetReply, TenantsGetRequest } from "./tenants";

export const protobufPackage = "weaviate.v1";

export type WeaviateDefinition = typeof WeaviateDefinition;
export const WeaviateDefinition = {
  name: "Weaviate",
  fullName: "weaviate.v1.Weaviate",
  methods: {
    search: {
      name: "Search",
      requestType: SearchRequest,
      requestStream: false,
      responseType: SearchReply,
      responseStream: false,
      options: {},
    },
    batchObjects: {
      name: "BatchObjects",
      requestType: BatchObjectsRequest,
      requestStream: false,
      responseType: BatchObjectsReply,
      responseStream: false,
      options: {},
    },
    batchDelete: {
      name: "BatchDelete",
      requestType: BatchDeleteRequest,
      requestStream: false,
      responseType: BatchDeleteReply,
      responseStream: false,
      options: {},
    },
    tenantsGet: {
      name: "TenantsGet",
      requestType: TenantsGetRequest,
      requestStream: false,
      responseType: TenantsGetReply,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface WeaviateServiceImplementation<CallContextExt = {}> {
  search(request: SearchRequest, context: CallContext & CallContextExt): Promise<DeepPartial<SearchReply>>;
  batchObjects(
    request: BatchObjectsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<BatchObjectsReply>>;
  batchDelete(
    request: BatchDeleteRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<BatchDeleteReply>>;
  tenantsGet(request: TenantsGetRequest, context: CallContext & CallContextExt): Promise<DeepPartial<TenantsGetReply>>;
}

export interface WeaviateClient<CallOptionsExt = {}> {
  search(request: DeepPartial<SearchRequest>, options?: CallOptions & CallOptionsExt): Promise<SearchReply>;
  batchObjects(
    request: DeepPartial<BatchObjectsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<BatchObjectsReply>;
  batchDelete(
    request: DeepPartial<BatchDeleteRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<BatchDeleteReply>;
  tenantsGet(request: DeepPartial<TenantsGetRequest>, options?: CallOptions & CallOptionsExt): Promise<TenantsGetReply>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;
