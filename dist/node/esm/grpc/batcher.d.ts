import { Metadata } from 'nice-grpc';
import { RetryOptions } from 'nice-grpc-client-middleware-retry';
import { ConsistencyLevel } from '../data/index.js';
import { Filters } from '../proto/v1/base.js';
import { BatchObject, BatchObjectsReply } from '../proto/v1/batch.js';
import { BatchDeleteReply } from '../proto/v1/batch_delete.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';
import Base from './base.js';
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
  static use(
    connection: WeaviateClient<RetryOptions>,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Batch;
  withDelete: (args: BatchDeleteArgs) => Promise<BatchDeleteReply>;
  withObjects: (args: BatchObjectsArgs) => Promise<BatchObjectsReply>;
  private callDelete;
  private callObjects;
}
