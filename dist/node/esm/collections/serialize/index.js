var _a;
import { v4 as uuidv4 } from 'uuid';
import {
  WeaviateInvalidInputError,
  WeaviateSerializationError,
  WeaviateUnsupportedFeatureError,
} from '../../errors.js';
import {
  Filters as FiltersGRPC,
  Filters_Operator,
  ObjectPropertiesValue,
  Vectors as VectorsGrpc,
} from '../../proto/v1/base.js';
import { BatchObject as BatchObjectGRPC } from '../../proto/v1/batch.js';
import { GenerativeSearch } from '../../proto/v1/generative.js';
import {
  BM25,
  CombinationMethod,
  GroupBy,
  Hybrid,
  Hybrid_FusionType,
  MetadataRequest,
  NearAudioSearch,
  NearDepthSearch,
  NearIMUSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearTextSearch_Move,
  NearThermalSearch,
  NearVector,
  NearVideoSearch,
  Rerank,
  Targets,
} from '../../proto/v1/search_get.js';
import { FilterId } from '../filters/classes.js';
import { Filters } from '../filters/index.js';
import { ArrayInputGuards, NearVectorInputGuards, TargetVectorInputGuards } from '../query/utils.js';
import { ReferenceGuards } from '../references/classes.js';
import { uuidToBeacon } from '../references/utils.js';
class FilterGuards {}
FilterGuards.isFilters = (argument) => {
  return argument instanceof Filters;
};
FilterGuards.isText = (argument) => {
  return typeof argument === 'string';
};
FilterGuards.isTextArray = (argument) => {
  return argument instanceof Array && argument.every((arg) => typeof arg === 'string');
};
FilterGuards.isInt = (argument) => {
  return typeof argument === 'number' && Number.isInteger(argument);
};
FilterGuards.isIntArray = (argument) => {
  return (
    argument instanceof Array && argument.every((arg) => typeof arg === 'number' && Number.isInteger(arg))
  );
};
FilterGuards.isFloat = (argument) => {
  return typeof argument === 'number' && !Number.isInteger(argument);
};
FilterGuards.isFloatArray = (argument) => {
  return (
    argument instanceof Array && argument.every((arg) => typeof arg === 'number' && !Number.isInteger(arg))
  );
};
FilterGuards.isBoolean = (argument) => {
  return typeof argument === 'boolean';
};
FilterGuards.isBooleanArray = (argument) => {
  return argument instanceof Array && argument.every((arg) => typeof arg === 'boolean');
};
FilterGuards.isDate = (argument) => {
  return argument instanceof Date;
};
FilterGuards.isDateArray = (argument) => {
  return argument instanceof Array && argument.every((arg) => arg instanceof Date);
};
FilterGuards.isGeoRange = (argument) => {
  const arg = argument;
  return arg.latitude !== undefined && arg.longitude !== undefined && arg.distance !== undefined;
};
export class DataGuards {}
DataGuards.isText = (argument) => {
  return typeof argument === 'string';
};
DataGuards.isTextArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isText);
};
DataGuards.isInt = (argument) => {
  return (
    typeof argument === 'number' &&
    Number.isInteger(argument) &&
    !Number.isNaN(argument) &&
    Number.isFinite(argument)
  );
};
DataGuards.isIntArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isInt);
};
DataGuards.isFloat = (argument) => {
  return (
    typeof argument === 'number' &&
    !Number.isInteger(argument) &&
    !Number.isNaN(argument) &&
    Number.isFinite(argument)
  );
};
DataGuards.isFloatArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isFloat);
};
DataGuards.isBoolean = (argument) => {
  return typeof argument === 'boolean';
};
DataGuards.isBooleanArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isBoolean);
};
DataGuards.isDate = (argument) => {
  return argument instanceof Date;
};
DataGuards.isDateArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isDate);
};
DataGuards.isGeoCoordinate = (argument) => {
  return (
    argument instanceof Object &&
    argument.latitude !== undefined &&
    argument.longitude !== undefined &&
    Object.keys(argument).length === 2
  );
};
DataGuards.isPhoneNumber = (argument) => {
  return (
    argument instanceof Object &&
    argument.number !== undefined &&
    (Object.keys(argument).length === 1 ||
      (Object.keys(argument).length === 2 && argument.defaultCountry !== undefined))
  );
};
DataGuards.isNested = (argument) => {
  return (
    argument instanceof Object &&
    !(argument instanceof Array) &&
    !DataGuards.isDate(argument) &&
    !DataGuards.isGeoCoordinate(argument) &&
    !DataGuards.isPhoneNumber(argument)
  );
};
DataGuards.isNestedArray = (argument) => {
  return argument instanceof Array && argument.length > 0 && argument.every(DataGuards.isNested);
};
DataGuards.isEmptyArray = (argument) => {
  return argument instanceof Array && argument.length === 0;
};
DataGuards.isDataObject = (obj) => {
  return (
    obj.id !== undefined ||
    obj.properties !== undefined ||
    obj.references !== undefined ||
    obj.vectors !== undefined
  );
};
export class MetadataGuards {}
MetadataGuards.isKeys = (argument) => {
  return argument instanceof Array && argument.length > 0;
};
MetadataGuards.isAll = (argument) => {
  return argument === 'all';
};
MetadataGuards.isUndefined = (argument) => {
  return argument === undefined;
};
export class Serialize {
  static tenants(tenants, mapper) {
    const mapped = [];
    const batches = Math.ceil(tenants.length / 100);
    for (let i = 0; i < batches; i++) {
      const batch = tenants.slice(i * 100, (i + 1) * 100);
      mapped.push(batch.map(mapper));
    }
    return mapped;
  }
  static tenantCreate(tenant) {
    let activityStatus;
    switch (tenant.activityStatus) {
      case 'ACTIVE':
        activityStatus = 'HOT';
        break;
      case 'INACTIVE':
        activityStatus = 'COLD';
        break;
      case 'HOT':
      case 'COLD':
      case undefined:
        activityStatus = tenant.activityStatus;
        break;
      case 'FROZEN':
        throw new WeaviateInvalidInputError(
          'Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD.'
        );
      default:
        throw new WeaviateInvalidInputError(
          'Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD.'
        );
    }
    return {
      name: tenant.name,
      activityStatus,
    };
  }
  static tenantUpdate(tenant) {
    let activityStatus;
    switch (tenant.activityStatus) {
      case 'ACTIVE':
        activityStatus = 'HOT';
        break;
      case 'INACTIVE':
        activityStatus = 'COLD';
        break;
      case 'OFFLOADED':
        activityStatus = 'FROZEN';
        break;
      case 'HOT':
      case 'COLD':
      case 'FROZEN':
        activityStatus = tenant.activityStatus;
        break;
      default:
        throw new WeaviateInvalidInputError(
          'Invalid activity status. Please provide one of the following: ACTIVE, INACTIVE, HOT, COLD, OFFLOADED.'
        );
    }
    return {
      name: tenant.name,
      activityStatus,
    };
  }
}
_a = Serialize;
Serialize.isNamedVectors = (opts) => {
  return (
    Array.isArray(opts === null || opts === void 0 ? void 0 : opts.includeVector) ||
    (opts === null || opts === void 0 ? void 0 : opts.targetVector) !== undefined
  );
};
Serialize.isMultiTarget = (opts) => {
  return (
    (opts === null || opts === void 0 ? void 0 : opts.targetVector) !== undefined &&
    !TargetVectorInputGuards.isSingle(opts.targetVector)
  );
};
Serialize.isMultiWeightPerTarget = (opts) => {
  return (
    (opts === null || opts === void 0 ? void 0 : opts.targetVector) !== undefined &&
    TargetVectorInputGuards.isMultiJoin(opts.targetVector) &&
    opts.targetVector.weights !== undefined &&
    Object.values(opts.targetVector.weights).some(ArrayInputGuards.is1DArray)
  );
};
Serialize.isMultiVector = (vec) => {
  return (
    vec !== undefined &&
    !Array.isArray(vec) &&
    Object.values(vec).some(ArrayInputGuards.is1DArray || ArrayInputGuards.is2DArray)
  );
};
Serialize.isMultiVectorPerTarget = (vec) => {
  return vec !== undefined && !Array.isArray(vec) && Object.values(vec).some(ArrayInputGuards.is2DArray);
};
Serialize.common = (args) => {
  const out = {
    limit: args === null || args === void 0 ? void 0 : args.limit,
    offset: args === null || args === void 0 ? void 0 : args.offset,
    filters: (args === null || args === void 0 ? void 0 : args.filters)
      ? Serialize.filtersGRPC(args.filters)
      : undefined,
    properties:
      (args === null || args === void 0 ? void 0 : args.returnProperties) ||
      (args === null || args === void 0 ? void 0 : args.returnReferences)
        ? Serialize.queryProperties(args.returnProperties, args.returnReferences)
        : undefined,
    metadata: Serialize.metadata(
      args === null || args === void 0 ? void 0 : args.includeVector,
      args === null || args === void 0 ? void 0 : args.returnMetadata
    ),
  };
  if (args === null || args === void 0 ? void 0 : args.rerank) {
    out.rerank = Serialize.rerank(args.rerank);
  }
  return out;
};
Serialize.fetchObjects = (args) => {
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    after: args === null || args === void 0 ? void 0 : args.after,
    sortBy: (args === null || args === void 0 ? void 0 : args.sort)
      ? Serialize.sortBy(args.sort.sorts)
      : undefined,
  });
};
Serialize.fetchObjectById = (args) => {
  return Object.assign(
    {},
    Serialize.common({
      filters: new FilterId().equal(args.id),
      includeVector: args.includeVector,
      returnMetadata: ['creationTime', 'updateTime', 'isConsistent'],
      returnProperties: args.returnProperties,
      returnReferences: args.returnReferences,
    })
  );
};
Serialize.bm25QueryProperties = (properties) => {
  return properties === null || properties === void 0
    ? void 0
    : properties.map((property) => {
        if (typeof property === 'string') {
          return property;
        } else {
          return `${property.name}^${property.weight}`;
        }
      });
};
Serialize.bm25 = (args) => {
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    bm25Search: BM25.fromPartial({
      query: args.query,
      properties: _a.bm25QueryProperties(args.queryProperties),
    }),
    autocut: args.autoLimit,
  });
};
Serialize.isHybridVectorSearch = (vector) => {
  return (
    vector !== undefined &&
    !Serialize.isHybridNearTextSearch(vector) &&
    !Serialize.isHybridNearVectorSearch(vector)
  );
};
Serialize.isHybridNearTextSearch = (vector) => {
  return (vector === null || vector === void 0 ? void 0 : vector.query) !== undefined;
};
Serialize.isHybridNearVectorSearch = (vector) => {
  return (vector === null || vector === void 0 ? void 0 : vector.vector) !== undefined;
};
Serialize.hybridVector = (args) => {
  const vector = args.vector;
  if (Serialize.isHybridVectorSearch(vector)) {
    const { targets, targetVectors, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors(
      Object.assign(Object.assign({}, args), { argumentName: 'vector', vector: vector })
    );
    return vectorBytes !== undefined
      ? { vectorBytes, targetVectors, targets }
      : {
          targetVectors,
          targets,
          nearVector: NearVector.fromPartial({
            vectorForTargets,
            vectorPerTarget,
          }),
        };
  } else if (Serialize.isHybridNearTextSearch(vector)) {
    const { targetVectors, targets } = Serialize.targetVector(args);
    return {
      targets,
      targetVectors,
      nearText: NearTextSearch.fromPartial({
        query: typeof vector.query === 'string' ? [vector.query] : vector.query,
        certainty: vector.certainty,
        distance: vector.distance,
        moveAway: vector.moveAway ? NearTextSearch_Move.fromPartial(vector.moveAway) : undefined,
        moveTo: vector.moveTo ? NearTextSearch_Move.fromPartial(vector.moveTo) : undefined,
      }),
    };
  } else if (Serialize.isHybridNearVectorSearch(vector)) {
    const { targetVectors, targets, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors(
      Object.assign(Object.assign({}, args), { argumentName: 'vector', vector: vector.vector })
    );
    return {
      targetVectors,
      targets,
      nearVector: NearVector.fromPartial({
        certainty: vector.certainty,
        distance: vector.distance,
        vectorBytes,
        vectorPerTarget,
        vectorForTargets,
      }),
    };
  } else {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return { targets, targetVectors };
  }
};
Serialize.hybrid = (args) => {
  const fusionType = (fusionType) => {
    switch (fusionType) {
      case 'Ranked':
        return Hybrid_FusionType.FUSION_TYPE_RANKED;
      case 'RelativeScore':
        return Hybrid_FusionType.FUSION_TYPE_RELATIVE_SCORE;
      default:
        return Hybrid_FusionType.FUSION_TYPE_UNSPECIFIED;
    }
  };
  const { targets, targetVectors, vectorBytes, nearText, nearVector } = Serialize.hybridVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    hybridSearch: Hybrid.fromPartial({
      query: args.query,
      alpha: args.alpha ? args.alpha : 0.5,
      properties: _a.bm25QueryProperties(args.queryProperties),
      vectorBytes: vectorBytes,
      fusionType: fusionType(args.fusionType),
      targetVectors,
      targets,
      nearText,
      nearVector,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearAudio = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearAudio: NearAudioSearch.fromPartial({
      audio: args.audio,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearDepth = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearDepth: NearDepthSearch.fromPartial({
      depth: args.depth,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearImage = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearImage: NearImageSearch.fromPartial({
      image: args.image,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearIMU = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearIMU: NearIMUSearch.fromPartial({
      imu: args.imu,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearObject = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearObject: NearObject.fromPartial({
      id: args.id,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.nearTextSearch = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return NearTextSearch.fromPartial({
    query: typeof args.query === 'string' ? [args.query] : args.query,
    certainty: args.certainty,
    distance: args.distance,
    targets,
    targetVectors,
    moveAway: args.moveAway
      ? NearTextSearch_Move.fromPartial({
          concepts: args.moveAway.concepts,
          force: args.moveAway.force,
          uuids: args.moveAway.objects,
        })
      : undefined,
    moveTo: args.moveTo
      ? NearTextSearch_Move.fromPartial({
          concepts: args.moveTo.concepts,
          force: args.moveTo.force,
          uuids: args.moveTo.objects,
        })
      : undefined,
  });
};
Serialize.nearText = (args) => {
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearText: _a.nearTextSearch(args),
    autocut: args.autoLimit,
  });
};
Serialize.nearThermal = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearThermal: NearThermalSearch.fromPartial({
      thermal: args.thermal,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.vectorToBytes = (vector) => {
  return new Uint8Array(new Float32Array(vector).buffer);
};
Serialize.nearVectorSearch = (args) => {
  const { targetVectors, targets, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors(
    Object.assign(Object.assign({}, args), { argumentName: 'nearVector' })
  );
  return NearVector.fromPartial({
    certainty: args.certainty,
    distance: args.distance,
    targetVectors,
    targets,
    vectorPerTarget,
    vectorBytes,
    vectorForTargets,
  });
};
Serialize.targetVector = (args) => {
  if (args.targetVector === undefined) {
    return {};
  } else if (TargetVectorInputGuards.isSingle(args.targetVector)) {
    return args.supportsTargets
      ? {
          targets: Targets.fromPartial({
            targetVectors: [args.targetVector],
          }),
        }
      : { targetVectors: [args.targetVector] };
  } else if (TargetVectorInputGuards.isMulti(args.targetVector)) {
    return args.supportsTargets
      ? {
          targets: Targets.fromPartial({
            targetVectors: args.targetVector,
          }),
        }
      : { targetVectors: args.targetVector };
  } else {
    return { targets: Serialize.targets(args.targetVector, args.supportsWeightsForTargets) };
  }
};
Serialize.vectors = (args) => {
  const invalidVectorError =
    new WeaviateInvalidInputError(`${args.argumentName} argument must be populated and:
            - an array of numbers (number[])
            - an object with target names as keys and 1D and/or 2D arrays of numbers (number[] or number[][]) as values
      received: ${args.vector} and ${args.targetVector}`);
  if (args.vector === undefined) {
    return Serialize.targetVector(args);
  }
  if (NearVectorInputGuards.isObject(args.vector)) {
    if (Object.keys(args.vector).length === 0) {
      throw invalidVectorError;
    }
    if (args.supportsVectorsForTargets) {
      const vectorForTargets = Object.entries(args.vector)
        .map(([target, vector]) => {
          return {
            target,
            vector: vector,
          };
        })
        .reduce((acc, { target, vector }) => {
          return ArrayInputGuards.is2DArray(vector)
            ? acc.concat(vector.map((v) => ({ name: target, vectorBytes: Serialize.vectorToBytes(v) })))
            : acc.concat([{ name: target, vectorBytes: Serialize.vectorToBytes(vector) }]);
        }, []);
      return args.targetVector !== undefined
        ? Object.assign(Object.assign({}, Serialize.targetVector(args)), { vectorForTargets })
        : {
            targetVectors: undefined,
            targets: Targets.fromPartial({
              targetVectors: vectorForTargets.map((v) => v.name),
            }),
            vectorForTargets,
          };
    } else {
      const vectorPerTarget = {};
      Object.entries(args.vector).forEach(([k, v]) => {
        if (ArrayInputGuards.is2DArray(v)) {
          return;
        }
        vectorPerTarget[k] = Serialize.vectorToBytes(v);
      });
      if (args.targetVector !== undefined) {
        const { targets, targetVectors } = Serialize.targetVector(args);
        return {
          targetVectors,
          targets,
          vectorPerTarget,
        };
      } else {
        return args.supportsTargets
          ? {
              targets: Targets.fromPartial({
                targetVectors: Object.keys(vectorPerTarget),
              }),
              vectorPerTarget,
            }
          : {
              targetVectors: Object.keys(vectorPerTarget),
              vectorPerTarget,
            };
      }
    }
  } else {
    if (args.vector.length === 0) {
      throw invalidVectorError;
    }
    if (NearVectorInputGuards.is1DArray(args.vector)) {
      const { targetVectors, targets } = Serialize.targetVector(args);
      const vectorBytes = Serialize.vectorToBytes(args.vector);
      return {
        targetVectors,
        targets,
        vectorBytes,
      };
    }
    throw invalidVectorError;
  }
};
Serialize.targets = (targets, supportsWeightsForTargets) => {
  let combination;
  switch (targets.combination) {
    case 'sum':
      combination = CombinationMethod.COMBINATION_METHOD_TYPE_SUM;
      break;
    case 'average':
      combination = CombinationMethod.COMBINATION_METHOD_TYPE_AVERAGE;
      break;
    case 'minimum':
      combination = CombinationMethod.COMBINATION_METHOD_TYPE_MIN;
      break;
    case 'relative-score':
      combination = CombinationMethod.COMBINATION_METHOD_TYPE_RELATIVE_SCORE;
      break;
    case 'manual-weights':
      combination = CombinationMethod.COMBINATION_METHOD_TYPE_MANUAL;
      break;
    default:
      throw new Error('Invalid combination method');
  }
  if (targets.weights !== undefined && supportsWeightsForTargets) {
    const weightsForTargets = Object.entries(targets.weights)
      .map(([target, weight]) => {
        return {
          target,
          weight,
        };
      })
      .reduce((acc, { target, weight }) => {
        return Array.isArray(weight)
          ? acc.concat(weight.map((w) => ({ target, weight: w })))
          : acc.concat([{ target, weight }]);
      }, []);
    return {
      combination,
      targetVectors: weightsForTargets.map((w) => w.target),
      weights: {},
      weightsForTargets,
    };
  } else if (targets.weights !== undefined && !supportsWeightsForTargets) {
    if (Object.values(targets.weights).some((v) => Array.isArray(v))) {
      throw new WeaviateUnsupportedFeatureError(
        'Multiple weights per target are not supported in this Weaviate version. Please upgrade to at least Weaviate 1.27.0.'
      );
    }
    return {
      combination,
      targetVectors: targets.targetVectors,
      weights: targets.weights,
      weightsForTargets: [],
    };
  } else {
    return {
      combination,
      targetVectors: targets.targetVectors,
      weights: {},
      weightsForTargets: [],
    };
  }
};
Serialize.nearVector = (args) => {
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearVector: Serialize.nearVectorSearch(args),
    autocut: args.autoLimit,
  });
};
Serialize.nearVideo = (args) => {
  const { targets, targetVectors } = Serialize.targetVector(args);
  return Object.assign(Object.assign({}, Serialize.common(args)), {
    nearVideo: NearVideoSearch.fromPartial({
      video: args.video,
      certainty: args.certainty,
      distance: args.distance,
      targetVectors,
      targets,
    }),
    autocut: args.autoLimit,
  });
};
Serialize.filtersGRPC = (filters) => {
  const resolveFilters = (filters) => {
    var _b;
    const out = [];
    (_b = filters.filters) === null || _b === void 0
      ? void 0
      : _b.forEach((val) => out.push(Serialize.filtersGRPC(val)));
    return out;
  };
  const { value } = filters;
  switch (filters.operator) {
    case 'And':
      return FiltersGRPC.fromPartial({
        operator: Filters_Operator.OPERATOR_AND,
        filters: resolveFilters(filters),
      });
    case 'Or':
      return FiltersGRPC.fromPartial({
        operator: Filters_Operator.OPERATOR_OR,
        filters: resolveFilters(filters),
      });
    default:
      return FiltersGRPC.fromPartial({
        operator: Serialize.operator(filters.operator),
        target: filters.target,
        valueText: _a.filtersGRPCValueText(value),
        valueTextArray: _a.filtersGRPCValueTextArray(value),
        valueInt: FilterGuards.isInt(value) ? value : undefined,
        valueIntArray: FilterGuards.isIntArray(value) ? { values: value } : undefined,
        valueNumber: FilterGuards.isFloat(value) ? value : undefined,
        valueNumberArray: FilterGuards.isFloatArray(value) ? { values: value } : undefined,
        valueBoolean: FilterGuards.isBoolean(value) ? value : undefined,
        valueBooleanArray: FilterGuards.isBooleanArray(value) ? { values: value } : undefined,
        valueGeo: FilterGuards.isGeoRange(value) ? value : undefined,
      });
  }
};
Serialize.filtersGRPCValueText = (value) => {
  if (FilterGuards.isText(value)) {
    return value;
  } else if (FilterGuards.isDate(value)) {
    return value.toISOString();
  } else {
    return undefined;
  }
};
Serialize.filtersGRPCValueTextArray = (value) => {
  if (FilterGuards.isTextArray(value)) {
    return { values: value };
  } else if (FilterGuards.isDateArray(value)) {
    return { values: value.map((v) => v.toISOString()) };
  } else {
    return undefined;
  }
};
Serialize.filterTargetToREST = (target) => {
  if (target.property) {
    return [target.property];
  } else if (target.singleTarget) {
    throw new WeaviateSerializationError(
      'Cannot use Filter.byRef() in the aggregate API currently. Instead use Filter.byRefMultiTarget() and specify the target collection explicitly.'
    );
  } else if (target.multiTarget) {
    if (target.multiTarget.target === undefined) {
      throw new WeaviateSerializationError(
        `target of multiTarget filter was unexpectedly undefined: ${target}`
      );
    }
    return [
      target.multiTarget.on,
      target.multiTarget.targetCollection,
      ...Serialize.filterTargetToREST(target.multiTarget.target),
    ];
  } else if (target.count) {
    return [target.count.on];
  } else {
    return [];
  }
};
Serialize.filtersREST = (filters) => {
  var _b;
  const { value } = filters;
  if (filters.operator === 'And' || filters.operator === 'Or') {
    return {
      operator: filters.operator,
      operands: (_b = filters.filters) === null || _b === void 0 ? void 0 : _b.map(Serialize.filtersREST),
    };
  } else {
    if (filters.target === undefined) {
      throw new WeaviateSerializationError(`target of filter was unexpectedly undefined: ${filters}`);
    }
    const out = {
      path: Serialize.filterTargetToREST(filters.target),
      operator: filters.operator,
    };
    if (FilterGuards.isText(value)) {
      return Object.assign(Object.assign({}, out), { valueText: value });
    } else if (FilterGuards.isTextArray(value)) {
      return Object.assign(Object.assign({}, out), { valueTextArray: value });
    } else if (FilterGuards.isInt(value)) {
      return Object.assign(Object.assign({}, out), { valueInt: value });
    } else if (FilterGuards.isIntArray(value)) {
      return Object.assign(Object.assign({}, out), { valueIntArray: value });
    } else if (FilterGuards.isBoolean(value)) {
      return Object.assign(Object.assign({}, out), { valueBoolean: value });
    } else if (FilterGuards.isBooleanArray(value)) {
      return Object.assign(Object.assign({}, out), { valueBooleanArray: value });
    } else if (FilterGuards.isFloat(value)) {
      return Object.assign(Object.assign({}, out), { valueNumber: value });
    } else if (FilterGuards.isFloatArray(value)) {
      return Object.assign(Object.assign({}, out), { valueNumberArray: value });
    } else if (FilterGuards.isDate(value)) {
      return Object.assign(Object.assign({}, out), { valueDate: value.toISOString() });
    } else if (FilterGuards.isDateArray(value)) {
      return Object.assign(Object.assign({}, out), { valueDateArray: value.map((v) => v.toISOString()) });
    } else if (FilterGuards.isGeoRange(value)) {
      return Object.assign(Object.assign({}, out), {
        valueGeoRange: {
          geoCoordinates: {
            latitude: value.latitude,
            longitude: value.longitude,
          },
          distance: {
            max: value.distance,
          },
        },
      });
    } else {
      throw new WeaviateInvalidInputError('Invalid filter value type');
    }
  }
};
Serialize.operator = (operator) => {
  switch (operator) {
    case 'Equal':
      return Filters_Operator.OPERATOR_EQUAL;
    case 'NotEqual':
      return Filters_Operator.OPERATOR_NOT_EQUAL;
    case 'ContainsAny':
      return Filters_Operator.OPERATOR_CONTAINS_ANY;
    case 'ContainsAll':
      return Filters_Operator.OPERATOR_CONTAINS_ALL;
    case 'GreaterThan':
      return Filters_Operator.OPERATOR_GREATER_THAN;
    case 'GreaterThanEqual':
      return Filters_Operator.OPERATOR_GREATER_THAN_EQUAL;
    case 'LessThan':
      return Filters_Operator.OPERATOR_LESS_THAN;
    case 'LessThanEqual':
      return Filters_Operator.OPERATOR_LESS_THAN_EQUAL;
    case 'Like':
      return Filters_Operator.OPERATOR_LIKE;
    case 'WithinGeoRange':
      return Filters_Operator.OPERATOR_WITHIN_GEO_RANGE;
    case 'IsNull':
      return Filters_Operator.OPERATOR_IS_NULL;
    default:
      return Filters_Operator.OPERATOR_UNSPECIFIED;
  }
};
Serialize.queryProperties = (properties, references) => {
  const nonRefProperties =
    properties === null || properties === void 0
      ? void 0
      : properties.filter((property) => typeof property === 'string');
  const refProperties = references;
  const objectProperties =
    properties === null || properties === void 0
      ? void 0
      : properties.filter((property) => typeof property === 'object');
  const resolveObjectProperty = (property) => {
    const objProps = property.properties.filter((property) => typeof property !== 'string'); // cannot get types to work currently :(
    return {
      propName: property.name,
      primitiveProperties: property.properties.filter((property) => typeof property === 'string'),
      objectProperties: objProps.map(resolveObjectProperty),
    };
  };
  return {
    nonRefProperties: nonRefProperties === undefined ? [] : nonRefProperties,
    returnAllNonrefProperties: nonRefProperties === undefined,
    refProperties: refProperties
      ? refProperties.map((property) => {
          return {
            referenceProperty: property.linkOn,
            properties: Serialize.queryProperties(property.returnProperties),
            metadata: Serialize.metadata(property.includeVector, property.returnMetadata),
            targetCollection: property.targetCollection ? property.targetCollection : '',
          };
        })
      : [],
    objectProperties: objectProperties
      ? objectProperties.map((property) => {
          const objProps = property.properties.filter((property) => typeof property !== 'string'); // cannot get types to work currently :(
          return {
            propName: property.name,
            primitiveProperties: property.properties.filter((property) => typeof property === 'string'),
            objectProperties: objProps.map(resolveObjectProperty),
          };
        })
      : [],
  };
};
Serialize.metadata = (includeVector, metadata) => {
  const out = {
    uuid: true,
    vector: typeof includeVector === 'boolean' ? includeVector : false,
    vectors: Array.isArray(includeVector) ? includeVector : [],
  };
  if (MetadataGuards.isAll(metadata)) {
    return Object.assign(Object.assign({}, out), {
      creationTimeUnix: true,
      lastUpdateTimeUnix: true,
      distance: true,
      certainty: true,
      score: true,
      explainScore: true,
      isConsistent: true,
    });
  }
  metadata === null || metadata === void 0
    ? void 0
    : metadata.forEach((key) => {
        let weaviateKey;
        if (key === 'creationTime') {
          weaviateKey = 'creationTimeUnix';
        } else if (key === 'updateTime') {
          weaviateKey = 'lastUpdateTimeUnix';
        } else {
          weaviateKey = key;
        }
        out[weaviateKey] = true;
      });
  return MetadataRequest.fromPartial(out);
};
Serialize.sortBy = (sort) => {
  return sort.map((sort) => {
    return {
      ascending: !!sort.ascending,
      path: [sort.property],
    };
  });
};
Serialize.rerank = (rerank) => {
  return Rerank.fromPartial({
    property: rerank.property,
    query: rerank.query,
  });
};
Serialize.generative = (generative) => {
  return GenerativeSearch.fromPartial({
    singleResponsePrompt: generative === null || generative === void 0 ? void 0 : generative.singlePrompt,
    groupedResponseTask: generative === null || generative === void 0 ? void 0 : generative.groupedTask,
    groupedProperties: generative === null || generative === void 0 ? void 0 : generative.groupedProperties,
  });
};
Serialize.groupBy = (groupBy) => {
  return GroupBy.fromPartial({
    path: (groupBy === null || groupBy === void 0 ? void 0 : groupBy.property)
      ? [groupBy.property]
      : undefined,
    numberOfGroups: groupBy === null || groupBy === void 0 ? void 0 : groupBy.numberOfGroups,
    objectsPerGroup: groupBy === null || groupBy === void 0 ? void 0 : groupBy.objectsPerGroup,
  });
};
Serialize.isGroupBy = (args) => {
  if (args === undefined) return false;
  return args.groupBy !== undefined;
};
Serialize.restProperties = (properties, references) => {
  const parsedProperties = {};
  Object.keys(properties).forEach((key) => {
    const value = properties[key];
    if (DataGuards.isDate(value)) {
      parsedProperties[key] = value.toISOString();
    } else if (DataGuards.isDateArray(value)) {
      parsedProperties[key] = value.map((v) => v.toISOString());
    } else if (DataGuards.isPhoneNumber(value)) {
      parsedProperties[key] = {
        input: value.number,
        defaultCountry: value.defaultCountry,
      };
    } else if (DataGuards.isNestedArray(value)) {
      parsedProperties[key] = value.map((v) => Serialize.restProperties(v));
    } else if (DataGuards.isNested(value)) {
      parsedProperties[key] = Serialize.restProperties(value);
    } else {
      parsedProperties[key] = value;
    }
  });
  if (!references) return parsedProperties;
  for (const [key, value] of Object.entries(references)) {
    if (ReferenceGuards.isReferenceManager(value)) {
      parsedProperties[key] = value.toBeaconObjs();
    } else if (ReferenceGuards.isUuid(value)) {
      parsedProperties[key] = [uuidToBeacon(value)];
    } else if (ReferenceGuards.isMultiTarget(value)) {
      parsedProperties[key] =
        typeof value.uuids === 'string'
          ? [uuidToBeacon(value.uuids, value.targetCollection)]
          : value.uuids.map((uuid) => uuidToBeacon(uuid, value.targetCollection));
    } else {
      let out = [];
      value.forEach((v) => {
        if (ReferenceGuards.isReferenceManager(v)) {
          out = out.concat(v.toBeaconObjs());
        } else if (ReferenceGuards.isUuid(v)) {
          out.push(uuidToBeacon(v));
        } else {
          out = out.concat(
            (ReferenceGuards.isUuid(v.uuids) ? [v.uuids] : v.uuids).map((uuid) =>
              uuidToBeacon(uuid, v.targetCollection)
            )
          );
        }
      });
      parsedProperties[key] = out;
    }
  }
  return parsedProperties;
};
Serialize.batchProperties = (properties, references) => {
  const multiTarget = [];
  const singleTarget = [];
  const nonRefProperties = {};
  const emptyArray = [];
  const boolArray = [];
  const textArray = [];
  const intArray = [];
  const floatArray = [];
  const objectProperties = [];
  const objectArrayProperties = [];
  const resolveProps = (key, value) => {
    if (DataGuards.isEmptyArray(value)) {
      emptyArray.push(key);
    } else if (DataGuards.isBooleanArray(value)) {
      boolArray.push({
        propName: key,
        values: value,
      });
    } else if (DataGuards.isDateArray(value)) {
      textArray.push({
        propName: key,
        values: value.map((v) => v.toISOString()),
      });
    } else if (DataGuards.isTextArray(value)) {
      textArray.push({
        propName: key,
        values: value,
      });
    } else if (DataGuards.isIntArray(value)) {
      intArray.push({
        propName: key,
        values: value,
      });
    } else if (DataGuards.isFloatArray(value)) {
      floatArray.push({
        propName: key,
        values: [],
        valuesBytes: new Uint8Array(new Float64Array(value).buffer), // is double in proto => f64 in go
      });
    } else if (DataGuards.isDate(value)) {
      nonRefProperties[key] = value.toISOString();
    } else if (DataGuards.isPhoneNumber(value)) {
      nonRefProperties[key] = {
        input: value.number,
        defaultCountry: value.defaultCountry,
      };
    } else if (DataGuards.isGeoCoordinate(value)) {
      nonRefProperties[key] = value;
    } else if (DataGuards.isNestedArray(value)) {
      objectArrayProperties.push({
        propName: key,
        values: value.map((v) => ObjectPropertiesValue.fromPartial(Serialize.batchProperties(v))),
      });
    } else if (DataGuards.isNested(value)) {
      const parsed = Serialize.batchProperties(value);
      objectProperties.push({
        propName: key,
        value: ObjectPropertiesValue.fromPartial(parsed),
      });
    } else {
      nonRefProperties[key] = value;
    }
  };
  const resolveRefs = (key, value) => {
    if (ReferenceGuards.isReferenceManager(value)) {
      if (value.isMultiTarget()) {
        multiTarget.push({
          propName: key,
          targetCollection: value.targetCollection,
          uuids: value.toBeaconStrings(),
        });
      } else {
        singleTarget.push({
          propName: key,
          uuids: value.toBeaconStrings(),
        });
      }
    } else if (ReferenceGuards.isUuid(value)) {
      singleTarget.push({
        propName: key,
        uuids: [value],
      });
    } else if (ReferenceGuards.isMultiTarget(value)) {
      multiTarget.push({
        propName: key,
        targetCollection: value.targetCollection,
        uuids: typeof value.uuids === 'string' ? [value.uuids] : value.uuids,
      });
    } else {
      value.forEach((v) => resolveRefs(key, v));
    }
  };
  if (properties) {
    Object.entries(properties).forEach(([key, value]) => resolveProps(key, value));
  }
  if (references) {
    Object.entries(references).forEach(([key, value]) => resolveRefs(key, value));
  }
  return {
    nonRefProperties: nonRefProperties,
    multiTargetRefProps: multiTarget,
    singleTargetRefProps: singleTarget,
    textArrayProperties: textArray,
    intArrayProperties: intArray,
    numberArrayProperties: floatArray,
    booleanArrayProperties: boolArray,
    objectProperties: objectProperties,
    objectArrayProperties: objectArrayProperties,
    emptyListProps: emptyArray,
  };
};
Serialize.batchObjects = (collection, objects, usesNamedVectors, tenant) => {
  const objs = [];
  const batch = [];
  const iterate = (index) => {
    // This allows the potentially CPU-intensive work to be done in chunks
    // releasing control to the event loop after every object so that other
    // events can be processed without blocking completely.
    if (index < objects.length) {
      setTimeout(() => iterate(index + 1));
    } else {
      return;
    }
    const object = objects[index];
    const obj = DataGuards.isDataObject(object)
      ? object
      : { id: undefined, properties: object, references: undefined, vectors: undefined };
    let vectorBytes;
    let vectors;
    if (obj.vectors !== undefined && !Array.isArray(obj.vectors)) {
      vectors = Object.entries(obj.vectors).map(([k, v]) =>
        VectorsGrpc.fromPartial({
          vectorBytes: Serialize.vectorToBytes(v),
          name: k,
        })
      );
    } else if (Array.isArray(obj.vectors) && usesNamedVectors) {
      vectors = [
        VectorsGrpc.fromPartial({
          vectorBytes: Serialize.vectorToBytes(obj.vectors),
          name: 'default',
        }),
      ];
      vectorBytes = Serialize.vectorToBytes(obj.vectors);
      // required in case collection was made with <1.24.0 and has since been migrated to >=1.24.0
    } else if (obj.vectors !== undefined) {
      vectorBytes = Serialize.vectorToBytes(obj.vectors);
    }
    objs.push(
      BatchObjectGRPC.fromPartial({
        collection: collection,
        properties: Serialize.batchProperties(obj.properties, obj.references),
        tenant: tenant,
        uuid: obj.id ? obj.id : uuidv4(),
        vectorBytes,
        vectors,
      })
    );
    batch.push(Object.assign(Object.assign({}, obj), { collection: collection, tenant: tenant }));
  };
  const waitFor = () => {
    const poll = (resolve) => {
      if (objs.length < objects.length) {
        setTimeout(() => poll(resolve), 500);
      } else {
        resolve(null);
      }
    };
    return new Promise(poll);
  };
  iterate(0);
  return waitFor().then(() => {
    return { batch: batch, mapped: objs };
  });
};
