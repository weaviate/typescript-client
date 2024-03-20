import { v4 as uuidv4 } from 'uuid';
import { WhereFilter } from '../../openapi/types.js';
import {
  BatchObject as BatchObjectGRPC,
  BatchObject_MultiTargetRefProps,
  BatchObject_Properties,
  BatchObject_SingleTargetRefProps,
} from '../../proto/v1/batch.js';
import {
  PropertiesRequest,
  ObjectPropertiesRequest,
  SortBy as SortByGrpc,
  MetadataRequest,
  NearAudioSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearVector,
  NearVideoSearch,
  Hybrid,
  Hybrid_FusionType,
  BM25,
  GenerativeSearch,
  GroupBy,
  NearThermalSearch,
  NearDepthSearch,
  NearIMUSearch,
  NearTextSearch_Move,
  Rerank,
} from '../../proto/v1/search_get.js';

import { Filters, FilterValue } from '../filters/index.js';
import { FilterId } from '../filters/classes.js';
import {
  FilterValueType,
  PrimitiveFilterValueType,
  PrimitiveListFilterValueType,
  GeoRangeFilter,
} from '../filters/types.js';
import {
  BatchObject,
  BatchObjects,
  DataObject,
  QueryReference,
  QueryNested,
  QueryProperty,
  SortBy,
  WeaviateField,
  NestedProperties,
  GroupByOptions,
  NonReferenceInputs,
  GeoCoordinate,
  PhoneNumberInput,
  ReferenceInput,
  QueryMetadata,
  RerankOptions,
} from '../types/index.js';
import {
  SearchBm25Args,
  SearchFetchArgs,
  SearchHybridArgs,
  SearchNearAudioArgs,
  SearchNearDepthArgs,
  SearchNearImageArgs,
  SearchNearIMUArgs,
  SearchNearObjectArgs,
  SearchNearTextArgs,
  SearchNearThermalArgs,
  SearchNearVectorArgs,
  SearchNearVideoArgs,
} from '../../grpc/searcher.js';
import {
  Bm25Options,
  FetchObjectByIdOptions,
  FetchObjectsOptions,
  HybridOptions,
  NearOptions,
  SearchOptions,
  NearTextOptions,
} from '../query/types.js';
import { GenerateOptions } from '../generate/index.js';
import {
  BooleanArrayProperties,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  ObjectPropertiesValue,
  TextArrayProperties,
  Filters as FiltersGRPC,
  Filters_Operator,
  FilterTarget,
} from '../../proto/v1/base.js';
import { Beacon } from '../references/index.js';
import { ReferenceGuards } from '../references/classes.js';
import { uuidToBeacon } from '../references/utils.js';

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
    return typeof argument === 'number';
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
      (obj as DataObject<T>).vector !== undefined
    );
  };
}

export class Serialize {
  private static common = <T>(args?: SearchOptions<T>) => {
    return {
      limit: args?.limit,
      offset: args?.offset,
      filters: args?.filters ? Serialize.filtersGRPC(args.filters) : undefined,
      rerank: args?.rerank ? Serialize.rerank(args.rerank) : undefined,
      properties:
        args?.returnProperties || args?.returnReferences
          ? Serialize.queryProperties(args.returnProperties, args.returnReferences)
          : undefined,
      metadata: Serialize.metadata(args?.includeVector, args?.returnMetadata),
    };
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

  public static bm25 = <T>(args: { query: string } & Bm25Options<T>): SearchBm25Args => {
    return {
      ...Serialize.common(args),
      bm25: BM25.fromPartial({
        query: args.query,
        properties: args.queryProperties,
      }),
      autocut: args.autoLimit,
    };
  };

  public static hybrid = <T>(args: { query: string } & HybridOptions<T>): SearchHybridArgs => {
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
    return {
      ...Serialize.common(args),
      hybrid: Hybrid.fromPartial({
        query: args.query,
        alpha: args.alpha ? args.alpha : 0.5,
        properties: args.queryProperties,
        vectorBytes: args.vector ? Serialize.vectorToBytes(args.vector) : undefined,
        fusionType: fusionType(args.fusionType),
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearAudio = <T>(args: { audio: string } & NearOptions<T>): SearchNearAudioArgs => {
    return {
      ...Serialize.common(args),
      nearAudio: NearAudioSearch.fromPartial({
        audio: args.audio,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearDepth = <T>(args: { depth: string } & NearOptions<T>): SearchNearDepthArgs => {
    return {
      ...Serialize.common(args),
      nearDepth: NearDepthSearch.fromPartial({
        depth: args.depth,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearImage = <T>(args: { image: string } & NearOptions<T>): SearchNearImageArgs => {
    return {
      ...Serialize.common(args),
      nearImage: NearImageSearch.fromPartial({
        image: args.image,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearIMU = <T>(args: { imu: string } & NearOptions<T>): SearchNearIMUArgs => {
    return {
      ...Serialize.common(args),
      nearIMU: NearIMUSearch.fromPartial({
        imu: args.imu,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearObject = <T>(args: { id: string } & NearOptions<T>): SearchNearObjectArgs => {
    return {
      ...Serialize.common(args),
      nearObject: NearObject.fromPartial({
        id: args.id,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearText = <T>(
    args: { query: string | string[] } & NearTextOptions<T>
  ): SearchNearTextArgs => {
    return {
      ...Serialize.common(args),
      nearText: NearTextSearch.fromPartial({
        query: typeof args.query === 'string' ? [args.query] : args.query,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
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
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearThermal = <T>(args: { thermal: string } & NearOptions<T>): SearchNearThermalArgs => {
    return {
      ...Serialize.common(args),
      nearThermal: NearThermalSearch.fromPartial({
        thermal: args.thermal,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  private static vectorToBytes = (vector: number[]): Uint8Array => {
    return new Uint8Array(new Float32Array(vector).buffer);
  };

  public static nearVector = <T>(args: { vector: number[] } & NearOptions<T>): SearchNearVectorArgs => {
    return {
      ...Serialize.common(args),
      nearVector: NearVector.fromPartial({
        vectorBytes: args.vector ? Serialize.vectorToBytes(args.vector) : undefined,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearVideo = <T>(args: { video: string } & NearOptions<T>): SearchNearVideoArgs => {
    return {
      ...Serialize.common(args),
      nearVideo: NearVideoSearch.fromPartial({
        video: args.video,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
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
          valueText: FilterGuards.isText(value) ? value : undefined,
          valueTextArray: FilterGuards.isTextArray(value) ? { values: value } : undefined,
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

  private static filterTargetToREST = (target: FilterTarget): string[] => {
    if (target.property) {
      return [target.property];
    } else if (target.singleTarget) {
      throw new Error(
        'Cannot use Filter.byRef() in the aggregate API currently. Instead use Filter.byRefMultiTarget() and specify the target collection explicitly.'
      );
    } else if (target.multiTarget) {
      if (target.multiTarget.target === undefined) {
        throw new Error(`target of multiTarget filter was unexpectedly undefined: ${target}`);
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
        throw new Error(`target of filter was unexpectedly undefined: ${filters}`);
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
        throw new Error('Invalid filter value type');
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
      vectors: Array.isArray(includeVector) ? includeVector : undefined,
    };
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
        : { id: undefined, properties: object, references: undefined, vector: undefined };

      objs.push(
        BatchObjectGRPC.fromPartial({
          collection: collection,
          properties: Serialize.batchProperties(obj.properties, obj.references),
          tenant: tenant,
          uuid: obj.id ? obj.id : uuidv4(),
          vector: obj.vector,
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
}
