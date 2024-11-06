import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  NearVectorInputType,
} from './types.js';
export declare class Check<T> {
  private connection;
  private name;
  dbVersionSupport: DbVersionSupport;
  private consistencyLevel?;
  private tenant?;
  constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  );
  private getSearcher;
  private checkSupportForNamedVectors;
  private checkSupportForBm25AndHybridGroupByQueries;
  private checkSupportForHybridNearTextAndNearVectorSubSearches;
  private checkSupportForMultiTargetSearch;
  private checkSupportForMultiVectorSearch;
  private checkSupportForMultiWeightPerTargetSearch;
  private checkSupportForMultiVectorPerTargetSearch;
  nearSearch: (opts?: BaseNearOptions<T>) => Promise<{
    search: import('../../grpc/searcher.js').Search;
    supportsTargets: boolean;
    supportsWeightsForTargets: boolean;
  }>;
  nearVector: (
    vec: NearVectorInputType,
    opts?: BaseNearOptions<T>
  ) => Promise<{
    search: import('../../grpc/searcher.js').Search;
    supportsTargets: boolean;
    supportsVectorsForTargets: boolean;
    supportsWeightsForTargets: boolean;
  }>;
  hybridSearch: (opts?: BaseHybridOptions<T>) => Promise<{
    search: import('../../grpc/searcher.js').Search;
    supportsTargets: boolean;
    supportsWeightsForTargets: boolean;
    supportsVectorsForTargets: boolean;
  }>;
  fetchObjects: (opts?: FetchObjectsOptions<T>) => Promise<{
    search: import('../../grpc/searcher.js').Search;
  }>;
  fetchObjectById: (opts?: FetchObjectByIdOptions<T>) => Promise<{
    search: import('../../grpc/searcher.js').Search;
  }>;
  bm25: (opts?: BaseBm25Options<T>) => Promise<{
    search: import('../../grpc/searcher.js').Search;
  }>;
}
