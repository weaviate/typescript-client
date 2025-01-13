import { v4 as uuidv4 } from 'uuid';
import { WhereFilter } from '../../openapi/types.js';
import {
  BatchObject as BatchObjectGRPC,
  BatchObject_MultiTargetRefProps,
  BatchObject_Properties,
  BatchObject_SingleTargetRefProps,
} from '../../proto/v1/batch.js';
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
  ObjectPropertiesRequest,
  PropertiesRequest,
  Rerank,
  SortBy as SortByGrpc,
  Targets,
  VectorForTarget,
  WeightsForTarget,
} from '../../proto/v1/search_get.js';

import {
  WeaviateInvalidInputError,
  WeaviateSerializationError,
  WeaviateUnsupportedFeatureError,
} from '../../errors.js';
import {
  BaseSearchArgs,
  SearchBm25Args,
  SearchFetchArgs,
  SearchHybridArgs,
  SearchNearAudioArgs,
  SearchNearDepthArgs,
  SearchNearIMUArgs,
  SearchNearImageArgs,
  SearchNearObjectArgs,
  SearchNearTextArgs,
  SearchNearThermalArgs,
  SearchNearVectorArgs,
  SearchNearVideoArgs,
} from '../../grpc/searcher.js';
import {
  BooleanArrayProperties,
  FilterTarget,
  Filters as FiltersGRPC,
  Filters_Operator,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  ObjectPropertiesValue,
  TextArrayProperties,
  Vectors as VectorsGrpc,
} from '../../proto/v1/base.js';
import { FilterId } from '../filters/classes.js';
import { FilterValue, Filters } from '../filters/index.js';
import {
  FilterValueType,
  GeoRangeFilter,
  PrimitiveFilterValueType,
  PrimitiveListFilterValueType,
} from '../filters/types.js';
import { MultiTargetVectorJoin, PrimitiveKeys } from '../index.js';
import {
  BaseHybridOptions,
  BaseNearOptions,
  Bm25Options,
  Bm25QueryProperty,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  HybridNearTextSubSearch,
  HybridNearVectorSubSearch,
  HybridOptions,
  NearOptions,
  NearTextOptions,
  NearVectorInputType,
  SearchOptions,
  TargetVectorInputType,
} from '../query/types.js';
import { ArrayInputGuards, NearVectorInputGuards, TargetVectorInputGuards } from '../query/utils.js';
import { ReferenceGuards } from '../references/classes.js';
import { Beacon } from '../references/index.js';
import { uuidToBeacon } from '../references/utils.js';
import { TenantBC, TenantCreate, TenantUpdate } from '../tenants/types.js';
import {
  BatchObject,
  BatchObjects,
  DataObject,
  GenerateOptions,
  GeoCoordinate,
  GroupByOptions,
  MetadataKeys,
  NestedProperties,
  NonReferenceInputs,
  PhoneNumberInput,
  QueryMetadata,
  QueryNested,
  QueryProperty,
  QueryReference,
  ReferenceInput,
  RerankOptions,
  SortBy,
  WeaviateField,
} from '../types/index.js';

class FilterGuards {
  static isFilters = (
    argument?: Filters | PrimitiveFilterValueType | PrimitiveListFilterValueType
  ): argument is Filters => {
    return argument instanceof Filters;
  };

  static isText = (argument?: FilterValueType): argument is string => {
    return typeof argument === 'string';
  };

  static isTextArray = (argument?: FilterValueType): argument is string[] => {
    return (
      argument instanceof Array &&
      (argument as Array<FilterValueType>).every((arg) => typeof arg === 'string')
    );
  };

  static isInt = (argument?: FilterValueType): argument is number => {
    return typeof argument === 'number' && Number.isInteger(argument);
  };

  static isIntArray = (argument?: FilterValueType): argument is number[] => {
    return (
      argument instanceof Array &&
      (argument as Array<FilterValueType>).every((arg) => typeof arg === 'number' && Number.isInteger(arg))
    );
  };

  static isFloat = (argument?: FilterValueType): argument is number => {
    return typeof argument === 'number' && !Number.isInteger(argument);
  };

  static isFloatArray = (argument?: FilterValueType): argument is number[] => {
    return (
      argument instanceof Array &&
      (argument as Array<FilterValueType>).every((arg) => typeof arg === 'number' && !Number.isInteger(arg))
    );
  };

  static isBoolean = (argument?: FilterValueType): argument is boolean => {
    return typeof argument === 'boolean';
  };

  static isBooleanArray = (argument?: FilterValueType): argument is boolean[] => {
    return (
      argument instanceof Array &&
      (argument as Array<FilterValueType>).every((arg) => typeof arg === 'boolean')
    );
  };

  static isDate = (argument?: FilterValueType): argument is Date => {
    return argument instanceof Date;
  };

  static isDateArray = (argument?: FilterValueType): argument is Date[] => {
    return (
      argument instanceof Array && (argument as Array<FilterValueType>).every((arg) => arg instanceof Date)
    );
  };

  static isGeoRange = (argument?: FilterValueType): argument is GeoRangeFilter => {
    if (argument === undefined) {
      return false;
    }
    const arg = argument as GeoRangeFilter;
    return arg.latitude !== undefined && arg.longitude !== undefined && arg.distance !== undefined;
  };
}

export class DataGuards {
  static isText = (argument?: WeaviateField): argument is string => {
    return typeof argument === 'string';
  };

  static isTextArray = (argument?: WeaviateField): argument is string[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isText)
    );
  };

  static isInt = (argument?: WeaviateField): argument is number => {
    return (
      typeof argument === 'number' &&
      Number.isInteger(argument) &&
      !Number.isNaN(argument) &&
      Number.isFinite(argument)
    );
  };

  static isIntArray = (argument?: WeaviateField): argument is number[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isInt)
    );
  };

  static isFloat = (argument?: WeaviateField): argument is number => {
    return (
      typeof argument === 'number' &&
      !Number.isInteger(argument) &&
      !Number.isNaN(argument) &&
      Number.isFinite(argument)
    );
  };

  static isFloatArray = (argument?: WeaviateField): argument is number[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isFloat)
    );
  };

  static isBoolean = (argument?: WeaviateField): argument is boolean => {
    return typeof argument === 'boolean';
  };

  static isBooleanArray = (argument?: WeaviateField): argument is boolean[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isBoolean)
    );
  };

  static isDate = (argument?: WeaviateField): argument is Date => {
    return argument instanceof Date;
  };

  static isDateArray = (argument?: WeaviateField): argument is Date[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isDate)
    );
  };

  static isGeoCoordinate = (argument?: WeaviateField): argument is GeoCoordinate => {
    return (
      argument instanceof Object &&
      (argument as GeoCoordinate).latitude !== undefined &&
      (argument as GeoCoordinate).longitude !== undefined &&
      Object.keys(argument).length === 2
    );
  };

  static isPhoneNumber = (argument?: WeaviateField): argument is PhoneNumberInput => {
    return (
      argument instanceof Object &&
      (argument as PhoneNumberInput).number !== undefined &&
      (Object.keys(argument).length === 1 ||
        (Object.keys(argument).length === 2 && (argument as PhoneNumberInput).defaultCountry !== undefined))
    );
  };

  static isNested = (argument?: WeaviateField): argument is NestedProperties => {
    return (
      argument instanceof Object &&
      !(argument instanceof Array) &&
      !DataGuards.isDate(argument) &&
      !DataGuards.isGeoCoordinate(argument) &&
      !DataGuards.isPhoneNumber(argument)
    );
  };

  static isNestedArray = (argument?: WeaviateField): argument is NestedProperties[] => {
    return (
      argument instanceof Array &&
      argument.length > 0 &&
      (argument as Array<FilterValueType>).every(DataGuards.isNested)
    );
  };

  static isEmptyArray = (argument?: WeaviateField): argument is [] => {
    return argument instanceof Array && argument.length === 0;
  };

  static isDataObject = <T>(obj: DataObject<T> | NonReferenceInputs<T>): obj is DataObject<T> => {
    return (
      (obj as DataObject<T>).id !== undefined ||
      (obj as DataObject<T>).properties !== undefined ||
      (obj as DataObject<T>).references !== undefined ||
      (obj as DataObject<T>).vectors !== undefined
    );
  };
}

export class MetadataGuards {
  static isKeys = (argument?: QueryMetadata): argument is MetadataKeys => {
    return argument instanceof Array && argument.length > 0;
  };

  static isAll = (argument?: QueryMetadata): argument is 'all' => {
    return argument === 'all';
  };

  static isUndefined = (argument?: QueryMetadata): argument is undefined => {
    return argument === undefined;
  };
}

export class Serialize {
  public static isNamedVectors = <T>(opts?: BaseNearOptions<T>): boolean => {
    return Array.isArray(opts?.includeVector) || opts?.targetVector !== undefined;
  };

  public static isMultiTarget = <T>(opts?: BaseNearOptions<T>): boolean => {
    return opts?.targetVector !== undefined && !TargetVectorInputGuards.isSingle(opts.targetVector);
  };

  public static isMultiWeightPerTarget = <T>(opts?: BaseNearOptions<T>): boolean => {
    return (
      opts?.targetVector !== undefined &&
      TargetVectorInputGuards.isMultiJoin(opts.targetVector) &&
      opts.targetVector.weights !== undefined &&
      Object.values(opts.targetVector.weights).some(ArrayInputGuards.is1DArray)
    );
  };

  public static isMultiVector = (vec?: NearVectorInputType): boolean => {
    return (
      vec !== undefined &&
      !Array.isArray(vec) &&
      Object.values(vec).some(ArrayInputGuards.is1DArray || ArrayInputGuards.is2DArray)
    );
  };

  public static isMultiVectorPerTarget = (vec?: NearVectorInputType): boolean => {
    return vec !== undefined && !Array.isArray(vec) && Object.values(vec).some(ArrayInputGuards.is2DArray);
  };

  private static common = <T>(args?: SearchOptions<T>): BaseSearchArgs => {
    const out: BaseSearchArgs = {
      limit: args?.limit,
      offset: args?.offset,
      filters: args?.filters ? Serialize.filtersGRPC(args.filters) : undefined,
      properties:
        args?.returnProperties || args?.returnReferences
          ? Serialize.queryProperties(args.returnProperties, args.returnReferences)
          : undefined,
      metadata: Serialize.metadata(args?.includeVector, args?.returnMetadata),
    };
    if (args?.rerank) {
      out.rerank = Serialize.rerank(args.rerank);
    }
    return out;
  };

  public static fetchObjects = <T>(args?: FetchObjectsOptions<T>): SearchFetchArgs => {
    return {
      ...Serialize.common(args),
      after: args?.after,
      sortBy: args?.sort ? Serialize.sortBy(args.sort.sorts) : undefined,
    };
  };

  public static fetchObjectById = <T>(args: { id: string } & FetchObjectByIdOptions<T>): SearchFetchArgs => {
    return {
      ...Serialize.common({
        filters: new FilterId().equal(args.id),
        includeVector: args.includeVector,
        returnMetadata: ['creationTime', 'updateTime', 'isConsistent'],
        returnProperties: args.returnProperties,
        returnReferences: args.returnReferences,
      }),
    };
  };

  private static bm25QueryProperties = <T>(
    properties?: (PrimitiveKeys<T> | Bm25QueryProperty<T>)[]
  ): string[] | undefined => {
    return properties?.map((property) => {
      if (typeof property === 'string') {
        return property;
      } else {
        return `${property.name}^${property.weight}`;
      }
    });
  };

  public static bm25 = <T>(args: { query: string } & Bm25Options<T>): SearchBm25Args => {
    return {
      ...Serialize.common(args),
      bm25Search: BM25.fromPartial({
        query: args.query,
        properties: this.bm25QueryProperties(args.queryProperties),
      }),
      autocut: args.autoLimit,
    };
  };

  public static isHybridVectorSearch = <T>(
    vector: BaseHybridOptions<T>['vector']
  ): vector is number[] | Record<string, number[] | number[][]> => {
    return (
      vector !== undefined &&
      !Serialize.isHybridNearTextSearch(vector) &&
      !Serialize.isHybridNearVectorSearch(vector)
    );
  };

  public static isHybridNearTextSearch = <T>(
    vector: BaseHybridOptions<T>['vector']
  ): vector is HybridNearTextSubSearch => {
    return (vector as HybridNearTextSubSearch)?.query !== undefined;
  };

  public static isHybridNearVectorSearch = <T>(
    vector: BaseHybridOptions<T>['vector']
  ): vector is HybridNearVectorSubSearch => {
    return (vector as HybridNearVectorSubSearch)?.vector !== undefined;
  };

  private static hybridVector = <T>(args: {
    supportsTargets: boolean;
    supportsVectorsForTargets: boolean;
    supportsWeightsForTargets: boolean;
    vector?: BaseHybridOptions<T>['vector'];
  }) => {
    const vector = args.vector;
    if (Serialize.isHybridVectorSearch(vector)) {
      const { targets, targetVectors, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors({
        ...args,
        argumentName: 'vector',
        vector: vector,
      });
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
      const { targetVectors, targets, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors({
        ...args,
        argumentName: 'vector',
        vector: vector.vector,
      });
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

  public static hybrid = <T>(
    args: {
      query: string;
      supportsTargets: boolean;
      supportsVectorsForTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & HybridOptions<T>
  ): SearchHybridArgs => {
    const fusionType = (fusionType?: string): Hybrid_FusionType => {
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
    return {
      ...Serialize.common(args),
      hybridSearch: Hybrid.fromPartial({
        query: args.query,
        alpha: args.alpha ? args.alpha : 0.5,
        properties: this.bm25QueryProperties(args.queryProperties),
        vectorBytes: vectorBytes,
        vectorDistance: args.maxVectorDistance,
        fusionType: fusionType(args.fusionType),
        targetVectors,
        targets,
        nearText,
        nearVector,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearAudio = <T>(
    args: { audio: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearAudioArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearAudio: NearAudioSearch.fromPartial({
        audio: args.audio,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearDepth = <T>(
    args: { depth: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearDepthArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearDepth: NearDepthSearch.fromPartial({
        depth: args.depth,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearImage = <T>(
    args: { image: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearImageArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearImage: NearImageSearch.fromPartial({
        image: args.image,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearIMU = <T>(
    args: { imu: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearIMUArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearIMU: NearIMUSearch.fromPartial({
        imu: args.imu,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearObject = <T>(
    args: { id: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearObjectArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearObject: NearObject.fromPartial({
        id: args.id,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  private static nearTextSearch = (args: {
    query: string | string[];
    supportsTargets: boolean;
    supportsWeightsForTargets: boolean;
    targetVector?: TargetVectorInputType;
    certainty?: number;
    distance?: number;
    moveAway?: { concepts?: string[]; force?: number; objects?: string[] };
    moveTo?: { concepts?: string[]; force?: number; objects?: string[] };
  }) => {
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

  public static nearText = <T>(
    args: {
      query: string | string[];
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearTextOptions<T>
  ): SearchNearTextArgs => {
    return {
      ...Serialize.common(args),
      nearText: this.nearTextSearch(args),
      autocut: args.autoLimit,
    };
  };

  public static nearThermal = <T>(
    args: { thermal: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearThermalArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearThermal: NearThermalSearch.fromPartial({
        thermal: args.thermal,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  private static vectorToBytes = (vector: number[]): Uint8Array => {
    return new Uint8Array(new Float32Array(vector).buffer);
  };

  private static nearVectorSearch = (args: {
    vector: NearVectorInputType;
    supportsTargets: boolean;
    supportsVectorsForTargets: boolean;
    supportsWeightsForTargets: boolean;
    certainty?: number;
    distance?: number;
    targetVector?: TargetVectorInputType;
  }) => {
    const { targetVectors, targets, vectorBytes, vectorPerTarget, vectorForTargets } = Serialize.vectors({
      ...args,
      argumentName: 'nearVector',
    });
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

  public static targetVector = (args: {
    supportsTargets: boolean;
    supportsWeightsForTargets: boolean;
    targetVector?: TargetVectorInputType;
  }): { targets?: Targets; targetVectors?: string[] } => {
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

  private static vectors = (args: {
    supportsTargets: boolean;
    supportsVectorsForTargets: boolean;
    supportsWeightsForTargets: boolean;
    argumentName: 'nearVector' | 'vector';
    targetVector?: TargetVectorInputType;
    vector?: NearVectorInputType;
  }): {
    targetVectors?: string[];
    targets?: Targets;
    vectorBytes?: Uint8Array;
    vectorPerTarget?: Record<string, Uint8Array>;
    vectorForTargets?: VectorForTarget[];
  } => {
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
        const vectorForTargets: VectorForTarget[] = Object.entries(args.vector)
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
          }, [] as VectorForTarget[]);
        return args.targetVector !== undefined
          ? {
              ...Serialize.targetVector(args),
              vectorForTargets,
            }
          : {
              targetVectors: undefined,
              targets: Targets.fromPartial({
                targetVectors: vectorForTargets.map((v) => v.name),
              }),
              vectorForTargets,
            };
      } else {
        const vectorPerTarget: Record<string, Uint8Array> = {};
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

  private static targets = (
    targets: MultiTargetVectorJoin,
    supportsWeightsForTargets: boolean
  ): {
    combination: CombinationMethod;
    targetVectors: string[];
    weights: Record<string, number>;
    weightsForTargets: WeightsForTarget[];
  } => {
    let combination: CombinationMethod;
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
      const weightsForTargets: WeightsForTarget[] = Object.entries(targets.weights)
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
        }, [] as WeightsForTarget[]);
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
        weights: targets.weights as Record<string, number>, // TS can't type narrow the complicated .some predicate above
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

  public static nearVector = <T>(
    args: {
      vector: NearVectorInputType;
      supportsTargets: boolean;
      supportsVectorsForTargets: boolean;
      supportsWeightsForTargets: boolean;
    } & NearOptions<T>
  ): SearchNearVectorArgs => {
    return {
      ...Serialize.common(args),
      nearVector: Serialize.nearVectorSearch(args),
      autocut: args.autoLimit,
    };
  };

  public static nearVideo = <T>(
    args: { video: string; supportsTargets: boolean; supportsWeightsForTargets: boolean } & NearOptions<T>
  ): SearchNearVideoArgs => {
    const { targets, targetVectors } = Serialize.targetVector(args);
    return {
      ...Serialize.common(args),
      nearVideo: NearVideoSearch.fromPartial({
        video: args.video,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors,
        targets,
      }),
      autocut: args.autoLimit,
    };
  };

  public static filtersGRPC = (filters: FilterValue): FiltersGRPC => {
    const resolveFilters = (filters: FilterValue): FiltersGRPC[] => {
      const out: FiltersGRPC[] = [];
      filters.filters?.forEach((val) => out.push(Serialize.filtersGRPC(val)));
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
          valueText: this.filtersGRPCValueText(value),
          valueTextArray: this.filtersGRPCValueTextArray(value),
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

  private static filtersGRPCValueText = (value: any) => {
    if (FilterGuards.isText(value)) {
      return value;
    } else if (FilterGuards.isDate(value)) {
      return value.toISOString();
    } else {
      return undefined;
    }
  };

  private static filtersGRPCValueTextArray = (value: any) => {
    if (FilterGuards.isTextArray(value)) {
      return { values: value };
    } else if (FilterGuards.isDateArray(value)) {
      return { values: value.map((v) => v.toISOString()) };
    } else {
      return undefined;
    }
  };

  private static filterTargetToREST = (target: FilterTarget): string[] => {
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

  public static filtersREST = (filters: FilterValue): WhereFilter => {
    const { value } = filters;
    if (filters.operator === 'And' || filters.operator === 'Or') {
      return {
        operator: filters.operator,
        operands: filters.filters?.map(Serialize.filtersREST),
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
        return {
          ...out,
          valueText: value,
        };
      } else if (FilterGuards.isTextArray(value)) {
        return {
          ...out,
          valueTextArray: value,
        };
      } else if (FilterGuards.isInt(value)) {
        return {
          ...out,
          valueInt: value,
        };
      } else if (FilterGuards.isIntArray(value)) {
        return {
          ...out,
          valueIntArray: value,
        };
      } else if (FilterGuards.isBoolean(value)) {
        return {
          ...out,
          valueBoolean: value,
        };
      } else if (FilterGuards.isBooleanArray(value)) {
        return {
          ...out,
          valueBooleanArray: value,
        };
      } else if (FilterGuards.isFloat(value)) {
        return {
          ...out,
          valueNumber: value,
        };
      } else if (FilterGuards.isFloatArray(value)) {
        return {
          ...out,
          valueNumberArray: value,
        };
      } else if (FilterGuards.isDate(value)) {
        return {
          ...out,
          valueDate: value.toISOString(),
        };
      } else if (FilterGuards.isDateArray(value)) {
        return {
          ...out,
          valueDateArray: value.map((v) => v.toISOString()),
        };
      } else if (FilterGuards.isGeoRange(value)) {
        return {
          ...out,
          valueGeoRange: {
            geoCoordinates: {
              latitude: value.latitude,
              longitude: value.longitude,
            },
            distance: {
              max: value.distance,
            },
          },
        };
      } else {
        throw new WeaviateInvalidInputError('Invalid filter value type');
      }
    }
  };

  private static operator = (operator: string): Filters_Operator => {
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

  private static queryProperties = <T>(
    properties?: QueryProperty<T>[],
    references?: QueryReference<T>[]
  ): PropertiesRequest => {
    const nonRefProperties = properties?.filter((property) => typeof property === 'string') as
      | string[]
      | undefined;
    const refProperties = references;
    const objectProperties = properties?.filter((property) => typeof property === 'object') as
      | QueryNested<T>[]
      | undefined;

    const resolveObjectProperty = (property: QueryNested<T>): ObjectPropertiesRequest => {
      const objProps = property.properties.filter((property) => typeof property !== 'string') as unknown; // cannot get types to work currently :(
      return {
        propName: property.name,
        primitiveProperties: property.properties.filter(
          (property) => typeof property === 'string'
        ) as string[],
        objectProperties: (objProps as QueryNested<T>[]).map(resolveObjectProperty),
      };
    };

    return {
      nonRefProperties: nonRefProperties === undefined ? [] : nonRefProperties,
      returnAllNonrefProperties: nonRefProperties === undefined,
      refProperties: refProperties
        ? refProperties.map((property) => {
            return {
              referenceProperty: property.linkOn,
              properties: Serialize.queryProperties(property.returnProperties as any),
              metadata: Serialize.metadata(property.includeVector, property.returnMetadata),
              targetCollection: property.targetCollection ? property.targetCollection : '',
            };
          })
        : [],
      objectProperties: objectProperties
        ? objectProperties.map((property) => {
            const objProps = property.properties.filter(
              (property) => typeof property !== 'string'
            ) as unknown; // cannot get types to work currently :(
            return {
              propName: property.name,
              primitiveProperties: property.properties.filter(
                (property) => typeof property === 'string'
              ) as string[],
              objectProperties: (objProps as QueryNested<T>[]).map(resolveObjectProperty),
            };
          })
        : [],
    };
  };

  private static metadata = (
    includeVector?: boolean | string[],
    metadata?: QueryMetadata
  ): MetadataRequest => {
    const out: any = {
      uuid: true,
      vector: typeof includeVector === 'boolean' ? includeVector : false,
      vectors: Array.isArray(includeVector) ? includeVector : [],
    };
    if (MetadataGuards.isAll(metadata)) {
      return {
        ...out,
        creationTimeUnix: true,
        lastUpdateTimeUnix: true,
        distance: true,
        certainty: true,
        score: true,
        explainScore: true,
        isConsistent: true,
      };
    }
    metadata?.forEach((key) => {
      let weaviateKey: string;
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

  private static sortBy = (sort: SortBy[]): SortByGrpc[] => {
    return sort.map((sort) => {
      return {
        ascending: !!sort.ascending,
        path: [sort.property],
      };
    });
  };

  public static rerank = <T>(rerank: RerankOptions<T>): Rerank => {
    return Rerank.fromPartial({
      property: rerank.property as string,
      query: rerank.query,
    });
  };

  public static generative = <T>(generative?: GenerateOptions<T>): GenerativeSearch => {
    return GenerativeSearch.fromPartial({
      singleResponsePrompt: generative?.singlePrompt,
      groupedResponseTask: generative?.groupedTask,
      groupedProperties: generative?.groupedProperties as string[],
    });
  };

  public static groupBy = <T>(groupBy?: GroupByOptions<T>): GroupBy => {
    return GroupBy.fromPartial({
      path: groupBy?.property ? [groupBy.property as string] : undefined,
      numberOfGroups: groupBy?.numberOfGroups,
      objectsPerGroup: groupBy?.objectsPerGroup,
    });
  };

  public static isGroupBy = <T>(args: any): args is T => {
    if (args === undefined) return false;
    return args.groupBy !== undefined;
  };

  public static restProperties = (
    properties: Record<string, WeaviateField>,
    references?: Record<string, ReferenceInput<any>>
  ): Record<string, any> => {
    const parsedProperties: any = {};
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
        let out: Beacon[] = [];
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

  private static batchProperties = (
    properties?: Record<string, any>,
    references?: Record<string, ReferenceInput<any>>
  ): BatchObject_Properties => {
    const multiTarget: BatchObject_MultiTargetRefProps[] = [];
    const singleTarget: BatchObject_SingleTargetRefProps[] = [];
    const nonRefProperties: Record<string, any> = {};
    const emptyArray: string[] = [];
    const boolArray: BooleanArrayProperties[] = [];
    const textArray: TextArrayProperties[] = [];
    const intArray: IntArrayProperties[] = [];
    const floatArray: NumberArrayProperties[] = [];
    const objectProperties: ObjectProperties[] = [];
    const objectArrayProperties: ObjectArrayProperties[] = [];

    const resolveProps = (key: string, value: any) => {
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

    const resolveRefs = (key: string, value: ReferenceInput<any>) => {
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

  public static batchObjects = <T>(
    collection: string,
    objects: (DataObject<T> | NonReferenceInputs<T>)[],
    requiresInsertFix: boolean,
    tenant?: string
  ): Promise<BatchObjects<T>> => {
    const objs: BatchObjectGRPC[] = [];
    const batch: BatchObject<T>[] = [];

    const iterate = (index: number) => {
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

      let vectorBytes: Uint8Array | undefined;
      let vectors: VectorsGrpc[] | undefined;
      if (obj.vectors !== undefined && !Array.isArray(obj.vectors)) {
        vectors = Object.entries(obj.vectors).map(([k, v]) =>
          VectorsGrpc.fromPartial({
            vectorBytes: Serialize.vectorToBytes(v),
            name: k,
          })
        );
      } else if (Array.isArray(obj.vectors) && requiresInsertFix) {
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

      batch.push({
        ...obj,
        collection: collection,
        tenant: tenant,
      });
    };

    const waitFor = () => {
      const poll = (resolve: (value: null) => void) => {
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

  public static tenants<T, M>(tenants: T[], mapper: (tenant: T) => M): M[][] {
    const mapped = [];
    const batches = Math.ceil(tenants.length / 100);
    for (let i = 0; i < batches; i++) {
      const batch = tenants.slice(i * 100, (i + 1) * 100);
      mapped.push(batch.map(mapper));
    }
    return mapped;
  }

  public static tenantCreate<T extends TenantBC | TenantCreate>(
    tenant: T
  ): {
    name: string;
    activityStatus?: 'HOT' | 'COLD';
  } {
    let activityStatus: 'HOT' | 'COLD' | undefined;
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

  public static tenantUpdate<T extends TenantBC | TenantUpdate>(
    tenant: T
  ): { name: string; activityStatus: 'HOT' | 'COLD' | 'FROZEN' } {
    let activityStatus: 'HOT' | 'COLD' | 'FROZEN';
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
