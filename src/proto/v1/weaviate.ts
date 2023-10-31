/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { BatchObjectsReply, BatchObjectsRequest } from "./batch";
import { SearchReply, SearchRequest } from "./search_get";

export const protobufPackage = "weaviate.v1";

export interface Weaviate {
  Search(request: SearchRequest): Promise<SearchReply>;
  BatchObjects(request: BatchObjectsRequest): Promise<BatchObjectsReply>;
}

export const WeaviateServiceName = "weaviate.v1.Weaviate";
export class WeaviateClientImpl implements Weaviate {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || WeaviateServiceName;
    this.rpc = rpc;
    this.Search = this.Search.bind(this);
    this.BatchObjects = this.BatchObjects.bind(this);
  }
  Search(request: SearchRequest): Promise<SearchReply> {
    const data = SearchRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "Search", data);
    return promise.then((data) => SearchReply.decode(_m0.Reader.create(data)));
  }

  BatchObjects(request: BatchObjectsRequest): Promise<BatchObjectsReply> {
    const data = BatchObjectsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "BatchObjects", data);
    return promise.then((data) => BatchObjectsReply.decode(_m0.Reader.create(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
