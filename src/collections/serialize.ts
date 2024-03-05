import { v4 as uuidv4 } from 'uuid';
import { WhereFilter } from '../openapi/types';
import {
  BatchObject as BatchObjectGrpc,
  BatchObject_MultiTargetRefProps,
  BatchObject_Properties,
  BatchObject_SingleTargetRefProps,
} from '../proto/v1/batch';
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
} from '../proto/v1/search_get';

import {
  Filters,
  FilterValueType,
  FilterValue,
  PrimitiveFilterValueType,
  PrimitiveListFilterValueType,
  FilterById,
  GeoRangeFilter,
} from './filters';
import {
  BatchObject,
  DataObject,
  MetadataQuery,
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
  ReferenceInputs,
} from './types';
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
} from '../grpc/searcher';
import {
  QueryBm25Options,
  QueryFetchObjectByIdOptions,
  QueryFetchObjectsOptions,
  QueryHybridOptions,
  QueryNearOptions,
  QueryOptions,
  QueryGroupByNearOptions,
} from './query';
import { GenerateGroupByNearOptions, GenerateOptions } from './generate';
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
} from '../proto/v1/base';
import { ReferenceManager, uuidToBeacon } from './references';

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
    return argument instanceof Array && typeof argument[0] === 'string';
  };

  static isInt = (argument?: FilterValueType): argument is number => {
    return typeof argument === 'number' && Number.isInteger(argument);
  };

  static isIntArray = (argument?: FilterValueType): argument is number[] => {
    return argument instanceof Array && Number.isInteger(argument[0]);
  };

  static isFloat = (argument?: FilterValueType): argument is number => {
    return typeof argument === 'number';
  };

  static isFloatArray = (argument?: FilterValueType): argument is number[] => {
    return argument instanceof Array && typeof argument[0] === 'number';
  };

  static isBoolean = (argument?: FilterValueType): argument is boolean => {
    return typeof argument === 'boolean';
  };

  static isBooleanArray = (argument?: FilterValueType): argument is boolean[] => {
    return argument instanceof Array && typeof argument[0] === 'boolean';
  };

  static isDate = (argument?: FilterValueType): argument is Date => {
    return argument instanceof Date;
  };

  static isDateArray = (argument?: FilterValueType): argument is Date[] => {
    return argument instanceof Array && argument[0] instanceof Date;
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
    return argument instanceof Array && typeof argument[0] === 'string';
  };

  static isInt = (argument?: WeaviateField): argument is number => {
    return typeof argument === 'number' && Number.isInteger(argument);
  };

  static isIntArray = (argument?: WeaviateField): argument is number[] => {
    return argument instanceof Array && Number.isInteger(argument[0]);
  };

  static isFloat = (argument?: WeaviateField): argument is number => {
    return typeof argument === 'number';
  };

  static isFloatArray = (argument?: WeaviateField): argument is number[] => {
    return argument instanceof Array && typeof argument[0] === 'number';
  };

  static isBoolean = (argument?: WeaviateField): argument is boolean => {
    return typeof argument === 'boolean';
  };

  static isBooleanArray = (argument?: WeaviateField): argument is boolean[] => {
    return argument instanceof Array && typeof argument[0] === 'boolean';
  };

  static isDate = (argument?: WeaviateField): argument is Date => {
    return argument instanceof Date;
  };

  static isDateArray = (argument?: WeaviateField): argument is Date[] => {
    return argument instanceof Array && argument[0] instanceof Date;
  };

  static isGeoCoordinate = <T>(argument?: GeoCoordinate | T): argument is GeoCoordinate => {
    return argument instanceof Object && argument.latitude !== undefined && argument.longitude !== undefined;
  };

  static isPhoneNumber = <T>(argument?: PhoneNumberInput | T): argument is PhoneNumberInput => {
    return argument instanceof Object && argument.number !== undefined;
  };

  static isNested = (argument?: WeaviateField): argument is NestedProperties => {
    return typeof argument === 'object';
  };

  static isNestedArray = (argument?: WeaviateField): argument is NestedProperties[] => {
    return argument instanceof Array && typeof argument[0] === 'object';
  };

  static isEmptyArray = (argument?: WeaviateField): argument is [] => {
    return argument instanceof Array && argument.length === 0;
  };

  static isDataObject = <T>(obj: DataObject<T> | NonReferenceInputs<T>): obj is DataObject<T> => {
    return (obj as DataObject<T>).properties !== undefined;
  };
}

// Cannot do argument.every((arg) => typeof arg === type) in the above because of type erasure

export default class Serialize {
  private static common = <T>(args?: QueryOptions<T>) => {
    return {
      limit: args?.limit,
      filters: args?.filters ? Serialize.filtersGRPC(args.filters) : undefined,
      properties:
        args?.returnProperties || args?.returnReferences
          ? Serialize.properties(args.returnProperties, args.returnReferences)
          : undefined,
      metadata: Serialize.metadata(args?.includeVector, args?.returnMetadata),
    };
  };

  public static fetchObjects = <T>(args?: QueryFetchObjectsOptions<T>): SearchFetchArgs => {
    return {
      ...Serialize.common(args),
      offset: args?.offset,
      after: args?.after,
      sortBy: args?.sort ? Serialize.sortBy(args.sort.get()) : undefined,
    };
  };

  public static fetchObjectById = <T>(
    args: { id: string } & QueryFetchObjectByIdOptions<T>
  ): SearchFetchArgs => {
    return {
      ...Serialize.common({
        filters: new FilterById().equal(args.id),
        includeVector: args.includeVector,
        returnMetadata: ['creationTime', 'updateTime', 'isConsistent'],
        returnProperties: args.returnProperties,
        returnReferences: args.returnReferences,
      }),
    };
  };

  public static bm25 = <T>(args: { query: string } & QueryBm25Options<T>): SearchBm25Args => {
    return {
      ...Serialize.common(args),
      bm25: BM25.fromPartial({
        query: args.query,
        properties: args.queryProperties,
      }),
      autocut: args.autoLimit,
    };
  };

  public static hybrid = <T>(args: { query: string } & QueryHybridOptions<T>): SearchHybridArgs => {
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
        vector: args.vector,
        fusionType: fusionType(args.fusionType),
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearAudio = <T>(args: { audio: string } & QueryNearOptions<T>): SearchNearAudioArgs => {
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

  public static nearDepth = <T>(args: { depth: string } & QueryNearOptions<T>): SearchNearDepthArgs => {
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

  public static nearImage = <T>(args: { image: string } & QueryNearOptions<T>): SearchNearImageArgs => {
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

  public static nearIMU = <T>(args: { imu: string } & QueryNearOptions<T>): SearchNearIMUArgs => {
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

  public static nearObject = <T>(args: { id: string } & QueryNearOptions<T>): SearchNearObjectArgs => {
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
    args: { query: string | string[] } & QueryNearOptions<T>
  ): SearchNearTextArgs => {
    return {
      ...Serialize.common(args),
      nearText: NearTextSearch.fromPartial({
        query: typeof args.query === 'string' ? [args.query] : args.query,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearThermal = <T>(args: { thermal: string } & QueryNearOptions<T>): SearchNearThermalArgs => {
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

  public static nearVector = <T>(args: { vector: number[] } & QueryNearOptions<T>): SearchNearVectorArgs => {
    return {
      ...Serialize.common(args),
      nearVector: NearVector.fromPartial({
        vector: args.vector,
        certainty: args.certainty,
        distance: args.distance,
        targetVectors: args.targetVector ? [args.targetVector] : undefined,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearVideo = <T>(args: { video: string } & QueryNearOptions<T>): SearchNearVideoArgs => {
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

  private static properties = <T>(
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
            const metadata: any = { uuid: true };
            if (property.returnMetadata) {
              property.returnMetadata.forEach((key) => {
                metadata[key] = true;
              });
            }
            return {
              referenceProperty: property.linkOn,
              properties: Serialize.properties(property.returnProperties),
              metadata: metadata,
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
    metadata?: MetadataQuery
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
    return out;
  };

  private static sortBy = (sort: SortBy[]): SortByGrpc[] => {
    return sort.map((sort) => {
      return {
        ascending: !!sort.ascending,
        path: [sort.property],
      };
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

  public static isGroupBy = <T>(args: any): args is QueryGroupByNearOptions<T> => {
    if (args === undefined) return false;
    return args.groupBy !== undefined;
  };

  public static isGenerateGroupBy = <T>(args: any): args is GenerateGroupByNearOptions<T> => {
    if (args === undefined) return false;
    return args.groupBy !== undefined;
  };

  public static restProperties = <T>(properties: Record<string, any>, references?: ReferenceInputs<T>): T => {
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
      } else if (DataGuards.isNested(value)) {
        parsedProperties[key] = Serialize.restProperties(value);
      } else if (DataGuards.isNestedArray(value)) {
        parsedProperties[key] = value.map((v) => Serialize.restProperties(v));
      } else {
        parsedProperties[key] = value;
      }
    });
    if (!references) return parsedProperties as T;
    Object.keys(references).forEach((key) => {
      const value = references[key as keyof ReferenceInputs<T>];
      if (value !== null && value instanceof ReferenceManager) {
        parsedProperties[key] = value.toBeaconObjs();
      } else if (typeof value === 'string') {
        parsedProperties[key] = [uuidToBeacon(value)];
      } else if (Array.isArray(value)) {
        parsedProperties[key] = value.map((uuid) => uuidToBeacon(uuid));
      } else {
        parsedProperties[key] =
          typeof value.uuids === 'string'
            ? [uuidToBeacon(value.uuids, value.targetCollection)]
            : value.uuids.map((uuid) => uuidToBeacon(uuid, value.targetCollection));
      }
    });
    return parsedProperties as T;
  };

  private static batchProperties = (
    properties?: Record<string, any>,
    references?: Record<string, any>
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

    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
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
            valuesBytes: new Uint8Array(new Float64Array(value).buffer),
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
        } else if (DataGuards.isNested(value)) {
          const parsed = Serialize.batchProperties(value);
          objectProperties.push({
            propName: key,
            value: ObjectPropertiesValue.fromPartial(parsed),
          });
        } else if (DataGuards.isNestedArray(value)) {
          objectArrayProperties.push({
            propName: key,
            values: value.map((v) => ObjectPropertiesValue.fromPartial(Serialize.batchProperties(v))),
          });
        } else {
          nonRefProperties[key] = value;
        }
      }
    }
    if (references) {
      for (const [key, value] of Object.entries(references)) {
        if (value instanceof ReferenceManager) {
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
        }
      }
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
  ): Promise<{
    batch: BatchObject<T>[];
    mapped: BatchObjectGrpc[];
  }> => {
    const objs: BatchObjectGrpc[] = [];
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
        BatchObjectGrpc.fromPartial({
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

  public static batchObjectsSimple = <T>(
    collection: string,
    objects: DataObject<T>[],
    tenant?: string
  ): {
    batch: BatchObject<T>[];
    mapped: BatchObjectGrpc[];
  } => {
    const objs: BatchObjectGrpc[] = [];
    const batch: BatchObject<T>[] = [];

    for (const object of objects) {
      objs.push(
        BatchObjectGrpc.fromPartial({
          collection: collection,
          properties: Serialize.batchProperties(object.properties),
          tenant: tenant,
          uuid: object.id ? object.id : uuidv4(),
          vector: object.vector,
        })
      );

      batch.push({
        ...object,
        collection: collection,
        tenant: tenant,
      });
    }
    return { batch, mapped: objs };
  };
}
