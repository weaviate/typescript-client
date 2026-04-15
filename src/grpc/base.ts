import { ConsistencyLevel } from '../data/index.js';

import { isAbortError } from 'abort-controller-x';
import { Metadata, ServerError, Status } from 'nice-grpc';
import { RetryOptions } from 'nice-grpc-client-middleware-retry';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateQueryError,
  WeaviateRequestTimeoutError,
} from '../errors.js';
import { ConsistencyLevel as ConsistencyLevelGRPC } from '../proto/v1/base.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

export default class Base {
  protected connection: WeaviateClient<RetryOptions>;
  protected collection: string;
  protected timeout: number;
  protected consistencyLevel?: ConsistencyLevelGRPC;
  protected tenant?: string;
  protected metadata?: Metadata;
  protected abortSignal?: AbortSignal;

  protected constructor(
    connection: WeaviateClient<RetryOptions>,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string,
    abortSignal?: AbortSignal
  ) {
    this.connection = connection;
    this.collection = collection;
    this.metadata = metadata;
    this.timeout = timeout;
    this.consistencyLevel = this.mapConsistencyLevel(consistencyLevel);
    this.tenant = tenant;
    this.abortSignal = abortSignal;
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

    const signal = this.abortSignal
      ? AbortSignal.any([controller.signal, this.abortSignal])
      : controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);
    return send(signal)
      .catch((err) => {
        if (err instanceof ServerError && err.code === Status.PERMISSION_DENIED) {
          throw new WeaviateInsufficientPermissionsError(7, err.message);
        }
        if (isAbortError(err) && this.abortSignal === undefined) {
          throw new WeaviateRequestTimeoutError(`timed out after ${this.timeout * 1000}ms`);
        }
        if (isAbortError(err) && this.abortSignal !== undefined) {
          throw err; // if the error is an abort error caused by the caller's abort signal, we re-throw it so that the caller can handle it as they see fit
        }
        throw new WeaviateQueryError(err.message, 'gRPC');
      })
      .finally(() => clearTimeout(timeoutId));
  };
}
