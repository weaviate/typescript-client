import { ConsistencyLevel } from '../replication.js';

import { Metadata, ServerError, Status } from 'nice-grpc-common';
import {
  AggregateReply,
  AggregateRequest,
  AggregateRequest_Aggregation,
  AggregateRequest_GroupBy,
} from '../proto/v1/aggregate.js';
import { Filters } from '../proto/v1/base.js';
import {
  Hybrid,
  NearAudioSearch,
  NearDepthSearch,
  NearIMUSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearThermalSearch,
  NearVector,
  NearVideoSearch,
} from '../proto/v1/base_search.js';
import { WeaviateClient } from '../proto/v1/weaviate.js';

import { isAbortError } from 'abort-controller-x';
import {
  WeaviateInsufficientPermissionsError,
  WeaviateQueryError,
  WeaviateRequestTimeoutError,
} from '../errors.js';
import Base from './base.js';
import { retryOptions } from './retry.js';

export type BaseAggregateArgs = {
  aggregations?: AggregateRequest_Aggregation[];
  filters?: Filters;
  groupBy?: AggregateRequest_GroupBy;
  limit?: number;
  objectLimit?: number;
};

export type AggregateFetchArgs = BaseAggregateArgs;

export type AggregateHybridArgs = BaseAggregateArgs & {
  hybrid: Hybrid;
};

export type AggregateNearAudioArgs = BaseAggregateArgs & {
  nearAudio: NearAudioSearch;
};

export type AggregateNearDepthArgs = BaseAggregateArgs & {
  nearDepth: NearDepthSearch;
};

export type AggregateNearImageArgs = BaseAggregateArgs & {
  nearImage: NearImageSearch;
};

export type AggregateNearIMUArgs = BaseAggregateArgs & {
  nearIMU: NearIMUSearch;
};

export type AggregateNearObjectArgs = BaseAggregateArgs & {
  nearObject: NearObject;
};

export type AggregateNearTextArgs = BaseAggregateArgs & {
  nearText: NearTextSearch;
};

export type AggregateNearThermalArgs = BaseAggregateArgs & {
  nearThermal: NearThermalSearch;
};

export type AggregateNearVectorArgs = BaseAggregateArgs & {
  nearVector: NearVector;
};

export type AggregateNearVideoArgs = BaseAggregateArgs & {
  nearVideo: NearVideoSearch;
};

export interface Aggregate {
  withFetch: (args: AggregateFetchArgs) => Promise<AggregateReply>;
  withHybrid: (args: AggregateHybridArgs) => Promise<AggregateReply>;
  withNearAudio: (args: AggregateNearAudioArgs) => Promise<AggregateReply>;
  withNearDepth: (args: AggregateNearDepthArgs) => Promise<AggregateReply>;
  withNearImage: (args: AggregateNearImageArgs) => Promise<AggregateReply>;
  withNearIMU: (args: AggregateNearIMUArgs) => Promise<AggregateReply>;
  withNearObject: (args: AggregateNearObjectArgs) => Promise<AggregateReply>;
  withNearText: (args: AggregateNearTextArgs) => Promise<AggregateReply>;
  withNearThermal: (args: AggregateNearThermalArgs) => Promise<AggregateReply>;
  withNearVector: (args: AggregateNearVectorArgs) => Promise<AggregateReply>;
  withNearVideo: (args: AggregateNearVideoArgs) => Promise<AggregateReply>;
}

export default class Aggregator extends Base implements Aggregate {
  public static use(
    connection: WeaviateClient<any>,
    collection: string,
    metadata: Metadata,
    timeout: number,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): Aggregate {
    return new Aggregator(connection, collection, metadata, timeout, consistencyLevel, tenant);
  }

  public withFetch = (args: AggregateFetchArgs) => this.call(AggregateRequest.fromPartial(args));
  public withHybrid = (args: AggregateHybridArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearAudio = (args: AggregateNearAudioArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearDepth = (args: AggregateNearDepthArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearImage = (args: AggregateNearImageArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearIMU = (args: AggregateNearIMUArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearObject = (args: AggregateNearObjectArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearText = (args: AggregateNearTextArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearThermal = (args: AggregateNearThermalArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearVector = (args: AggregateNearVectorArgs) => this.call(AggregateRequest.fromPartial(args));
  public withNearVideo = (args: AggregateNearVideoArgs) => this.call(AggregateRequest.fromPartial(args));

  private call = (message: AggregateRequest) =>
    this.sendWithTimeout((signal: AbortSignal) =>
      this.connection
        .aggregate(
          {
            ...message,
            collection: this.collection,
            tenant: this.tenant,
            objectsCount: true,
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
          throw new WeaviateQueryError(err.message, 'gRPC');
        })
    );
}
