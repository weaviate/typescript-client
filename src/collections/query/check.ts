import Connection from '../../connection/grpc.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { ConsistencyLevel } from '../../index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { GroupByOptions } from '../index.js';
import { Serialize } from '../serialize/index.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  HybridOptions,
  NearVectorInputType,
  SearchOptions,
} from './types.js';

export class Check<T> {
  private connection: Connection;
  private name: string;
  public dbVersionSupport: DbVersionSupport;
  private consistencyLevel?: ConsistencyLevel;
  private tenant?: string;

  public constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }

  private getSearcher = () => this.connection.search(this.name, this.consistencyLevel, this.tenant);

  private checkSupportForNamedVectors = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isNamedVectors(opts)) return;
    const check = await this.dbVersionSupport.supportsNamedVectors();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForBm25AndHybridGroupByQueries = async (
    query: 'Bm25' | 'Hybrid',
    opts?: SearchOptions<T> | GroupByOptions<T>
  ) => {
    if (!Serialize.isGroupBy(opts)) return;
    const check = await this.dbVersionSupport.supportsBm25AndHybridGroupByQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message(query));
  };

  private checkSupportForHybridNearTextAndNearVectorSubSearches = async (opts?: HybridOptions<T>) => {
    if (opts?.vector === undefined || Array.isArray(opts.vector)) return;
    const check = await this.dbVersionSupport.supportsHybridNearTextAndNearVectorSubsearchQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForMultiTargetSearch = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isMultiTarget(opts)) return false;
    const check = await this.dbVersionSupport.supportsMultiTargetVectorSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiVectorSearch = async (vec?: NearVectorInputType) => {
    if (!Serialize.isMultiVector(vec)) return false;
    const check = await this.dbVersionSupport.supportsMultiVectorSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiWeightPerTargetSearch = async (opts?: BaseNearOptions<T>) => {
    if (!Serialize.isMultiWeightPerTarget(opts)) return false;
    const check = await this.dbVersionSupport.supportsMultiWeightsPerTargetSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiVectorPerTargetSearch = async (vec?: NearVectorInputType) => {
    if (!Serialize.isMultiVectorPerTarget(vec)) return false;
    const check = await this.dbVersionSupport.supportsMultiVectorPerTargetSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  public nearSearch = (opts?: BaseNearOptions<T>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForNamedVectors(opts),
    ]).then(([search, supportsTargets, supportsWeightsForTargets]) => {
      return { search, supportsTargets, supportsWeightsForTargets };
    });
  };

  public nearVector = (vec: NearVectorInputType, opts?: BaseNearOptions<T>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiVectorSearch(vec),
      this.checkSupportForMultiVectorPerTargetSearch(vec),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForNamedVectors(opts),
    ]).then(
      ([
        search,
        supportsMultiTarget,
        supportMultiVector,
        supportsVectorsForTargets,
        supportsWeightsForTargets,
      ]) => {
        return {
          search,
          supportsTargets: supportsMultiTarget || supportMultiVector,
          supportsVectorsForTargets,
          supportsWeightsForTargets,
        };
      }
    );
  };

  public hybridSearch = (opts?: BaseHybridOptions<T>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiVectorSearch(
        Serialize.isHybridVectorSearch(opts?.vector) ? opts?.vector : undefined
      ),
      this.checkSupportForMultiVectorPerTargetSearch(
        Serialize.isHybridVectorSearch(opts?.vector) ? opts?.vector : undefined
      ),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Hybrid', opts),
      this.checkSupportForHybridNearTextAndNearVectorSubSearches(opts),
    ]).then(
      ([
        search,
        supportsMultiTarget,
        supportMultiVector,
        supportsWeightsForTargets,
        supportsVectorsForTargets,
      ]) => {
        return {
          search,
          supportsTargets: supportsMultiTarget || supportMultiVector,
          supportsWeightsForTargets,
          supportsVectorsForTargets,
        };
      }
    );
  };

  public fetchObjects = (opts?: FetchObjectsOptions<T>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
      return { search };
    });
  };

  public fetchObjectById = (opts?: FetchObjectByIdOptions<T>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
      return { search };
    });
  };

  public bm25 = (opts?: BaseBm25Options<T>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
    ]).then(([search]) => {
      return { search };
    });
  };
}
