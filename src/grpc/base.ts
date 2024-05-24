import { isAbortError } from 'abort-controller-x';
import { ConsistencyLevel } from '../data/index.js';

import { WeaviateClient } from '../proto/v1/weaviate.js';
import { ConsistencyLevel as ConsistencyLevelGRPC } from '../proto/v1/base.js';
import { Metadata } from 'nice-grpc';
import { WeaviateRequestTimeoutError } from '../errors.js';

export default class Base {
  protected connection: WeaviateClient;
  protected collection: string;
  protected timeout: number;
  protected consistencyLevel?: ConsistencyLevelGRPC;
  protected tenant?: string;
  protected metadata?: Metadata;

  protected constructor(
    connection: WeaviateClient,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.collection = collection;
    this.metadata = metadata;
    this.timeout = timeout;
    this.consistencyLevel = this.mapConsistencyLevel(consistencyLevel);
    this.tenant = tenant;
  }

  private mapConsistencyLevel(consistencyLevel?: ConsistencyLevel): ConsistencyLevelGRPC {
    switch (consistencyLevel) {
      case 'ALL':
        return ConsistencyLevelGRPC.CONSISTENCY_LEVEL_ALL;
      case 'QUORUM':
        return ConsistencyLevelGRPC.CONSISTENCY_LEVEL_QUORUM;
      case 'ONE':
        return ConsistencyLevelGRPC.CONSISTENCY_LEVEL_ONE;
      default:
        return ConsistencyLevelGRPC.CONSISTENCY_LEVEL_UNSPECIFIED;
    }
  }

  protected sendWithTimeout = <T>(send: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);
    return send(controller.signal)
      .catch((error) => {
        if (isAbortError(error)) {
          throw new WeaviateRequestTimeoutError(`timed out after ${this.timeout}ms`);
        }
        throw error;
      })
      .finally(() => clearTimeout(timeoutId));
  };
}
