import { ClientError, Metadata } from 'nice-grpc';

import { ConsistencyLevel } from '../data/index.js';

import {
  BatchObject,
  BatchObjectsReply,
  BatchObjectsRequest,
  BatchStreamReply,
  BatchStreamRequest,
} from '../proto/v1/batch.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

import { RetryOptions } from 'nice-grpc-client-middleware-retry';
import { WeaviateBatchError, WeaviateBatchStreamError, WeaviateDeleteManyError } from '../errors.js';
import { Filters } from '../proto/v1/base.js';
import { BatchDeleteReply, BatchDeleteRequest } from '../proto/v1/batch_delete.js';
import Base from './base.js';

import { retryOptions } from './retry.js';

export interface Batch {
  withDelete: (args: BatchDeleteArgs) => Promise<BatchDeleteReply>;
  withObjects: (args: BatchObjectsArgs) => Promise<BatchObjectsReply>;
  withStream: (reqs: AsyncGenerator<BatchStreamRequest>) => AsyncGenerator<BatchStreamReply>;
}

export interface BatchObjectsArgs {
  objects: BatchObject[];
}

export interface BatchDeleteArgs {
  filters: Filters | undefined;
  verbose?: boolean;
  dryRun?: boolean;
}

export default class Batcher extends Base implements Batch {
  public static use(
    connection: WeaviateClient<RetryOptions>,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Batch {
    return new Batcher(connection, collection, metadata, timeout, consistencyLevel, tenant);
  }

  public withStream = (reqs: AsyncGenerator<BatchStreamRequest>) => this.callStream(reqs);
  public withDelete = (args: BatchDeleteArgs) => this.callDelete(BatchDeleteRequest.fromPartial(args));
  public withObjects = (args: BatchObjectsArgs) => this.callObjects(BatchObjectsRequest.fromPartial(args));

  private async *callStream(reqs: AsyncGenerator<BatchStreamRequest>) {
    const consistencyLevel = this.consistencyLevel;
    async function* generate() {
      yield BatchStreamRequest.create({ start: { consistencyLevel } });
      for await (const req of reqs) {
        yield req;
      }
    }
    try {
      for await (const res of this.connection.batchStream(generate(), { metadata: this.metadata })) {
        yield res;
      }
    } catch (err) {
      if (err instanceof ClientError) {
        throw new WeaviateBatchStreamError(err.message);
      }
      throw err;
    }
  }

  private callDelete(message: BatchDeleteRequest) {
    return this.sendWithTimeout(
      (signal: AbortSignal) =>
        this.connection.batchDelete(
          {
            ...message,
            collection: this.collection,
            consistencyLevel: this.consistencyLevel,
            tenant: this.tenant,
          },
          {
            metadata: this.metadata,
            signal,
          }
        ),
      (err) => new WeaviateDeleteManyError(err.message)
    );
  }

  private callObjects(message: BatchObjectsRequest) {
    return this.sendWithTimeout(
      (signal: AbortSignal) =>
        this.connection.batchObjects(
          {
            ...message,
            consistencyLevel: this.consistencyLevel,
          },
          {
            metadata: this.metadata,
            signal,
            ...retryOptions,
          }
        ),
      (err) => new WeaviateBatchError(err.message)
    );
  }
}
