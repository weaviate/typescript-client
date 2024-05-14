import { ConsistencyLevel } from '../data/index.js';

import { WeaviateClient } from '../proto/v1/weaviate.js';
import { ConsistencyLevel as ConsistencyLevelGRPC } from '../proto/v1/base.js';
import { Metadata } from 'nice-grpc';

export default class Base {
  protected connection: WeaviateClient;
  protected collection: string;
  protected consistencyLevel?: ConsistencyLevelGRPC;
  protected tenant?: string;
  protected metadata?: Metadata;

  protected constructor(
    connection: WeaviateClient,
    collection: string,
    metadata: Metadata,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.collection = collection;
    this.consistencyLevel = this.mapConsistencyLevel(consistencyLevel);
    this.tenant = tenant;
    this.metadata = metadata;
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
}
