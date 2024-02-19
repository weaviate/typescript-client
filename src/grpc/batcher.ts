import { Metadata } from 'nice-grpc';

import { ConsistencyLevel } from '../data';

import { BatchObjectsRequest, BatchObjectsReply, BatchObject } from '../proto/v1/batch';
import { WeaviateClient } from '../proto/v1/weaviate';

import Base from './base';
import { BatchDeleteReply, BatchDeleteRequest } from '../proto/v1/batch_delete';
import { Filters } from '../proto/v1/base';

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
    name: string,
    metadata: Metadata,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Batch {
    return new Batcher(connection, name, metadata, consistencyLevel, tenant);
  }

  public withDelete = (args: BatchDeleteArgs) => this.callDelete(BatchDeleteRequest.fromPartial(args));
  public withObjects = (args: BatchObjectsArgs) => this.callObjects(BatchObjectsRequest.fromPartial(args));

  private callDelete(message: BatchDeleteRequest) {
    return this.connection.batchDelete(
      {
        ...message,
        collection: this.name,
        consistencyLevel: this.consistencyLevel,
        tenant: this.tenant,
      },
      {
        metadata: this.metadata,
      }
    );
  }

  private callObjects(message: BatchObjectsRequest) {
    return this.connection.batchObjects(
      {
        ...message,
        consistencyLevel: this.consistencyLevel,
      },
      {
        metadata: this.metadata,
      }
    );
  }
}
