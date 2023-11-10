import { ConsistencyLevel } from '..';

import { WeaviateClient } from '../proto/v1/weaviate';
import { ConsistencyLevel as ConsistencyLevelGrpc } from '../proto/v1/base';
import { Metadata } from 'nice-grpc';

export default class Base {
  protected connection: WeaviateClient;
  protected name: string;
  protected consistencyLevel?: ConsistencyLevelGrpc;
  protected tenant?: string;
  protected metadata?: Metadata;

  protected constructor(
    connection: WeaviateClient,
    name: string,
    metadata: Metadata,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.consistencyLevel = this.mapConsistencyLevel(consistencyLevel);
    this.tenant = tenant;
    this.metadata = metadata;
  }

  private mapConsistencyLevel(consistencyLevel?: ConsistencyLevel): ConsistencyLevelGrpc {
    switch (consistencyLevel) {
      case 'ALL':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_ALL;
      case 'QUORUM':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_QUORUM;
      case 'ONE':
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_ONE;
      default:
        return ConsistencyLevelGrpc.CONSISTENCY_LEVEL_UNSPECIFIED;
    }
  }
}
