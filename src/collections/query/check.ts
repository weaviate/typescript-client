import Connection from '../../connection/grpc.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { ConsistencyLevel } from '../../index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { GenerativeConfigRuntime, GroupByOptions } from '../index.js';
import { Serialize } from '../serialize/index.js';
import {
  BaseBm25Options,
  BaseHybridOptions,
  BaseNearOptions,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  HybridNearTextSubSearch,
  HybridNearVectorSubSearch,
  HybridOptions,
  NearVectorInputType,
  SearchOptions,
} from './types.js';

export class Check<T, V> {
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

  private checkSupportForNamedVectors = async (opts?: BaseNearOptions<any, any, any>) => {
    if (!Serialize.isNamedVectors(opts)) return;
    const check = await this.dbVersionSupport.supportsNamedVectors();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForBm25AndHybridGroupByQueries = async (
    query: 'Bm25' | 'Hybrid',
    opts?: SearchOptions<any, any> | GroupByOptions<any>
  ) => {
    if (!Serialize.search.isGroupBy(opts)) return;
    const check = await this.dbVersionSupport.supportsBm25AndHybridGroupByQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message(query));
  };

  private checkSupportForHybridNearTextAndNearVectorSubSearches = async (
    opts?: HybridOptions<any, any, any>
  ) => {
    if (opts?.vector === undefined || Array.isArray(opts.vector)) return;
    const check = await this.dbVersionSupport.supportsHybridNearTextAndNearVectorSubsearchQueries();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
  };

  private checkSupportForMultiTargetSearch = async (opts?: BaseNearOptions<any, any, any>) => {
    if (!Serialize.isMultiTarget(opts)) return false;
    const check = await this.dbVersionSupport.supportsMultiTargetVectorSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiVectorSearch = async (
    vec?: NearVectorInputType | HybridNearVectorSubSearch | HybridNearTextSubSearch
  ) => {
    if (vec === undefined || Serialize.isHybridNearTextSearch(vec)) return false;
    if (Serialize.isHybridNearVectorSearch(vec) && !Serialize.isMultiVector(vec.vector)) return false;
    if (Serialize.isHybridVectorSearch(vec) && !Serialize.isMultiVector(vec)) return false;
    const check = await this.dbVersionSupport.supportsMultiVectorSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiWeightPerTargetSearch = async (opts?: BaseNearOptions<any, any, any>) => {
    if (!Serialize.isMultiWeightPerTarget(opts)) return false;
    const check = await this.dbVersionSupport.supportsMultiWeightsPerTargetSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForMultiVectorPerTargetSearch = async (
    vec?: NearVectorInputType | HybridNearVectorSubSearch | HybridNearTextSubSearch
  ) => {
    if (vec === undefined || Serialize.isHybridNearTextSearch(vec)) return false;
    if (Serialize.isHybridNearVectorSearch(vec) && !Serialize.isMultiVectorPerTarget(vec.vector))
      return false;
    if (Serialize.isHybridVectorSearch(vec) && !Serialize.isMultiVectorPerTarget(vec)) return false;
    const check = await this.dbVersionSupport.supportsMultiVectorPerTargetSearch();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  private checkSupportForVectors = async (
    vec?: NearVectorInputType | HybridNearVectorSubSearch | HybridNearTextSubSearch
  ) => {
    if (vec === undefined || Serialize.isHybridNearTextSearch(vec)) return false;
    const check = await this.dbVersionSupport.supportsVectorsFieldInGRPC();
    return check.supports;
  };

  public supportForSingleGroupedGenerative = async () => {
    const check = await this.dbVersionSupport.supportsSingleGrouped();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  public supportForGenerativeConfigRuntime = async (generativeConfig?: GenerativeConfigRuntime) => {
    if (generativeConfig === undefined) return true;
    const check = await this.dbVersionSupport.supportsGenerativeConfigRuntime();
    if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
    return check.supports;
  };

  public nearSearch = (opts?: BaseNearOptions<any, any, any>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForNamedVectors(opts),
    ]).then(([search, supportsTargets, supportsWeightsForTargets]) => {
      const is126 = supportsTargets;
      const is127 = supportsWeightsForTargets;
      return { search, supportsTargets: is126 || is127, supportsWeightsForTargets: is127 };
    });
  };

  public nearVector = (vec: NearVectorInputType, opts?: BaseNearOptions<any, any, any>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiVectorSearch(vec),
      this.checkSupportForMultiVectorPerTargetSearch(vec),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForVectors(vec),
      this.checkSupportForNamedVectors(opts),
    ]).then(
      ([
        search,
        supportsMultiTarget,
        supportsMultiVector,
        supportsVectorsForTargets,
        supportsWeightsForTargets,
        supportsVectors,
      ]) => {
        const is126 = supportsMultiTarget || supportsMultiVector;
        const is127 = supportsVectorsForTargets || supportsWeightsForTargets;
        const is129 = supportsVectors;
        return {
          search,
          supportsTargets: is126 || is127,
          supportsVectorsForTargets: is127,
          supportsWeightsForTargets: is127,
          supportsVectors: is129,
        };
      }
    );
  };

  public hybridSearch = (opts?: BaseHybridOptions<any, any, any>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForMultiTargetSearch(opts),
      this.checkSupportForMultiVectorSearch(opts?.vector),
      this.checkSupportForMultiVectorPerTargetSearch(opts?.vector),
      this.checkSupportForMultiWeightPerTargetSearch(opts),
      this.checkSupportForVectors(opts?.vector),
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Hybrid', opts),
      this.checkSupportForHybridNearTextAndNearVectorSubSearches(opts),
    ]).then(
      ([
        search,
        supportsMultiTarget,
        supportsMultiVector,
        supportsWeightsForTargets,
        supportsVectorsForTargets,
        supportsVectors,
      ]) => {
        const is126 = supportsMultiTarget || supportsMultiVector;
        const is127 = supportsVectorsForTargets || supportsWeightsForTargets;
        const is129 = supportsVectors;
        return {
          search,
          supportsTargets: is126 || is127,
          supportsWeightsForTargets: is127,
          supportsVectorsForTargets: is127,
          supportsVectors: is129,
        };
      }
    );
  };

  public fetchObjects = (opts?: FetchObjectsOptions<any, any>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
      return { search };
    });
  };

  public fetchObjectById = (opts?: FetchObjectByIdOptions<any, any>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
      return { search };
    });
  };

  public bm25 = (opts?: BaseBm25Options<any, any>) => {
    return Promise.all([
      this.getSearcher(),
      this.checkSupportForNamedVectors(opts),
      this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
    ]).then(([search]) => {
      return { search };
    });
  };
}
