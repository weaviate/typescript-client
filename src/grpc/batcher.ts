import { Metadata } from 'nice-grpc';

import { ConsistencyLevel } from '..';

import { BatchObjectsRequest, BatchObjectsReply } from '../proto/v1/batch';
import { WeaviateClient } from '../proto/v1/weaviate';

import Base from './base';

export interface Batch {
  objects: (args: BatchObjectsRequest) => Promise<BatchObjectsReply>;
}

export default class Batcher extends Base implements Batch {
  public static use(
    connection: WeaviateClient,
    metadata: Metadata,
    consistencyLevel?: ConsistencyLevel
  ): Batch {
    return new Batcher(connection, '', metadata, consistencyLevel);
  }

  public objects = (args: BatchObjectsRequest) => this.call(args);

  private call(message: BatchObjectsRequest) {
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
