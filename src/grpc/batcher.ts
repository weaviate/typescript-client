import { isAbortError } from 'abort-controller-x';
import { Metadata } from 'nice-grpc';

import { ConsistencyLevel } from '../data/index.js';

import { BatchObjectsRequest, BatchObjectsReply, BatchObject } from '../proto/v1/batch.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

import Base from './base.js';
import { BatchDeleteReply, BatchDeleteRequest } from '../proto/v1/batch_delete.js';
import { Filters } from '../proto/v1/base.js';
import { WeaviateBatchError, WeaviateDeleteManyError, WeaviateRequestTimeoutError } from '../errors.js';

export interface Batch {
  withDelete: (args: BatchDeleteArgs) => Promise<BatchDeleteReply>;
  withObjects: (args: BatchObjectsArgs) => Promise<BatchObjectsReply>;
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
    connection: WeaviateClient,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Batch {
    return new Batcher(connection, collection, metadata, timeout, consistencyLevel, tenant);
  }

  public withDelete = (args: BatchDeleteArgs) => this.callDelete(BatchDeleteRequest.fromPartial(args));
  public withObjects = (args: BatchObjectsArgs) => this.callObjects(BatchObjectsRequest.fromPartial(args));

  private callDelete(message: BatchDeleteRequest) {
    return this.sendWithTimeout(() =>
      this.connection.batchDelete(
        {
          ...message,
          collection: this.collection,
          consistencyLevel: this.consistencyLevel,
          tenant: this.tenant,
        },
        {
          metadata: this.metadata,
        }
      )
    ).catch((err) => {
      throw new WeaviateDeleteManyError(err.message);
    });
  }

  private callObjects(message: BatchObjectsRequest) {
    return this.sendWithTimeout(() =>
      this.connection
        .batchObjects(
          {
            ...message,
            consistencyLevel: this.consistencyLevel,
          },
          {
            metadata: this.metadata,
          }
        )
        .catch((err) => {
          throw new WeaviateBatchError(err.message);
        })
    );
  }
}
