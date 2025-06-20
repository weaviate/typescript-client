import { isAbortError } from 'abort-controller-x';
import { Metadata, ServerError, Status } from 'nice-grpc-common';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateRequestTimeoutError,
  WeaviateTenantsGetError,
} from '../errors.js';
import { TenantsGetReply, TenantsGetRequest } from '../proto/v1/tenants.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';
import Base from './base.js';
import { retryOptions } from './retry.js';

export type TenantsGetArgs = {
  names?: string[];
};

export interface Tenants {
  withGet: (args: TenantsGetArgs) => Promise<TenantsGetReply>;
}

export default class TenantsManager extends Base implements Tenants {
  public static use(
    connection: WeaviateClient<any>,
    collection: string,
    metadata: Metadata,
    timeout: number
  ): Tenants {
    return new TenantsManager(connection, collection, metadata, timeout);
  }

  public withGet = (args: TenantsGetArgs) =>
    this.call(TenantsGetRequest.fromPartial({ names: args.names ? { values: args.names } : undefined }));

  private call(message: TenantsGetRequest) {
    return this.sendWithTimeout((signal: AbortSignal) =>
      this.connection
        .tenantsGet(
          {
            ...message,
            collection: this.collection,
          },
          {
            metadata: this.metadata,
            signal,
            ...retryOptions,
          }
        )
        .catch((err) => {
          if (err instanceof ServerError && err.code === Status.PERMISSION_DENIED) {
            throw new WeaviateInsufficientPermissionsError(7, err.message);
          }
          if (isAbortError(err)) {
            throw new WeaviateRequestTimeoutError(`timed out after ${this.timeout}ms`);
          }
          throw new WeaviateTenantsGetError(err.message);
        })
    );
  }
}
