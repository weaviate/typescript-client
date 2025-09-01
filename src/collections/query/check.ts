import Connection from '../../connection/grpc.js';
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { ConsistencyLevel } from '../../index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { GenerativeConfigRuntime } from '../index.js';
import { Serialize } from '../serialize/index.js';
import {
  BaseHybridOptions,
  BaseNearOptions,
  HybridNearTextSubSearch,
  HybridNearVectorSubSearch,
  NearVectorInputType,
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

  public nearSearch = () => this.getSearcher().then((search) => ({ search }));

  public nearVector = (vec: NearVectorInputType, opts?: BaseNearOptions<any, any, any>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForVectors(vec)]).then(
      ([search, supportsVectors]) => {
        const is129 = supportsVectors;
        return {
          search,
          supportsVectors: is129,
        };
      }
    );
  };

  public hybridSearch = (opts?: BaseHybridOptions<any, any, any>) => {
    return Promise.all([this.getSearcher(), this.checkSupportForVectors(opts?.vector)]).then(
      ([search, supportsVectors]) => {
        const is129 = supportsVectors;
        return {
          search,
          supportsVectors: is129,
        };
      }
    );
  };

  public fetchObjects = () => this.getSearcher().then((search) => ({ search }));

  public fetchObjectById = () => this.getSearcher().then((search) => ({ search }));

  public bm25 = () => this.getSearcher().then((search) => ({ search }));
}
