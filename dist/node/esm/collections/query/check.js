var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { WeaviateUnsupportedFeatureError } from '../../errors.js';
import { Serialize } from '../serialize/index.js';
export class Check {
  constructor(connection, name, dbVersionSupport, consistencyLevel, tenant) {
    this.getSearcher = () => this.connection.search(this.name, this.consistencyLevel, this.tenant);
    this.checkSupportForNamedVectors = (opts) =>
      __awaiter(this, void 0, void 0, function* () {
        if (!Serialize.isNamedVectors(opts)) return;
        const check = yield this.dbVersionSupport.supportsNamedVectors();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
      });
    this.checkSupportForBm25AndHybridGroupByQueries = (query, opts) =>
      __awaiter(this, void 0, void 0, function* () {
        if (!Serialize.isGroupBy(opts)) return;
        const check = yield this.dbVersionSupport.supportsBm25AndHybridGroupByQueries();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message(query));
      });
    this.checkSupportForHybridNearTextAndNearVectorSubSearches = (opts) =>
      __awaiter(this, void 0, void 0, function* () {
        if (
          (opts === null || opts === void 0 ? void 0 : opts.vector) === undefined ||
          Array.isArray(opts.vector)
        )
          return;
        const check = yield this.dbVersionSupport.supportsHybridNearTextAndNearVectorSubsearchQueries();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
      });
    this.checkSupportForMultiTargetSearch = (opts) =>
      __awaiter(this, void 0, void 0, function* () {
        if (!Serialize.isMultiTarget(opts)) return false;
        const check = yield this.dbVersionSupport.supportsMultiTargetVectorSearch();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
        return check.supports;
      });
    this.checkSupportForMultiVectorSearch = (vec) =>
      __awaiter(this, void 0, void 0, function* () {
        if (vec === undefined || Serialize.isHybridNearTextSearch(vec)) return false;
        if (Serialize.isHybridNearVectorSearch(vec) && !Serialize.isMultiVector(vec.vector)) return false;
        if (Serialize.isHybridVectorSearch(vec) && !Serialize.isMultiVector(vec)) return false;
        const check = yield this.dbVersionSupport.supportsMultiVectorSearch();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
        return check.supports;
      });
    this.checkSupportForMultiWeightPerTargetSearch = (opts) =>
      __awaiter(this, void 0, void 0, function* () {
        if (!Serialize.isMultiWeightPerTarget(opts)) return false;
        const check = yield this.dbVersionSupport.supportsMultiWeightsPerTargetSearch();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
        return check.supports;
      });
    this.checkSupportForMultiVectorPerTargetSearch = (vec) =>
      __awaiter(this, void 0, void 0, function* () {
        if (vec === undefined || Serialize.isHybridNearTextSearch(vec)) return false;
        if (Serialize.isHybridNearVectorSearch(vec) && !Serialize.isMultiVectorPerTarget(vec.vector))
          return false;
        if (Serialize.isHybridVectorSearch(vec) && !Serialize.isMultiVectorPerTarget(vec)) return false;
        const check = yield this.dbVersionSupport.supportsMultiVectorPerTargetSearch();
        if (!check.supports) throw new WeaviateUnsupportedFeatureError(check.message);
        return check.supports;
      });
    this.nearSearch = (opts) => {
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
    this.nearVector = (vec, opts) => {
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
          supportsMultiVector,
          supportsVectorsForTargets,
          supportsWeightsForTargets,
        ]) => {
          const is126 = supportsMultiTarget || supportsMultiVector;
          const is127 = supportsVectorsForTargets || supportsWeightsForTargets;
          return {
            search,
            supportsTargets: is126 || is127,
            supportsVectorsForTargets: is127,
            supportsWeightsForTargets: is127,
          };
        }
      );
    };
    this.hybridSearch = (opts) => {
      return Promise.all([
        this.getSearcher(),
        this.checkSupportForMultiTargetSearch(opts),
        this.checkSupportForMultiVectorSearch(opts === null || opts === void 0 ? void 0 : opts.vector),
        this.checkSupportForMultiVectorPerTargetSearch(
          opts === null || opts === void 0 ? void 0 : opts.vector
        ),
        this.checkSupportForMultiWeightPerTargetSearch(opts),
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
        ]) => {
          const is126 = supportsMultiTarget || supportsMultiVector;
          const is127 = supportsVectorsForTargets || supportsWeightsForTargets;
          return {
            search,
            supportsTargets: is126 || is127,
            supportsWeightsForTargets: is127,
            supportsVectorsForTargets: is127,
          };
        }
      );
    };
    this.fetchObjects = (opts) => {
      return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
        return { search };
      });
    };
    this.fetchObjectById = (opts) => {
      return Promise.all([this.getSearcher(), this.checkSupportForNamedVectors(opts)]).then(([search]) => {
        return { search };
      });
    };
    this.bm25 = (opts) => {
      return Promise.all([
        this.getSearcher(),
        this.checkSupportForNamedVectors(opts),
        this.checkSupportForBm25AndHybridGroupByQueries('Bm25', opts),
      ]).then(([search]) => {
        return { search };
      });
    };
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }
}
