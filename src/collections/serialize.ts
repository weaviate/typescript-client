import { v4 as uuidv4 } from 'uuid';
import {
  BatchObject as BatchObjectGrpc,
  BatchObject_MultiTargetRefProps,
  BatchObject_Properties,
  BatchObject_SingleTargetRefProps,
  BatchObjectsRequest,
} from '../proto/v1/batch';
import {
  PropertiesRequest,
  ObjectPropertiesRequest,
  Filters as FiltersGRPC,
  Filters_Operator,
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
} from '../proto/v1/search_get';

import { Filters, FilterValueType, PrimitiveFilterValueType, PrimitiveListFilterValueType } from './filters';
import {
  BatchObject,
  DataObject,
  FiltersREST,
  MetadataQuery,
  MultiRefProperty,
  NestedProperty,
  NonPrimitiveProperty,
  Property,
  RefProperty,
  SortBy,
  Properties,
} from './types';
import {
  SearchNearAudioArgs,
  SearchBm25Args,
  SearchFetchArgs,
  SearchHybridArgs,
  SearchNearImageArgs,
  SearchNearObjectArgs,
  SearchNearTextArgs,
  SearchNearVectorArgs,
  SearchNearVideoArgs,
} from '../grpc/searcher';
import {
  QueryBm25Args,
  QueryFetchObjectsArgs,
  QueryHybridArgs,
  QueryNearAudioArgs,
  QueryNearImageArgs,
  QueryNearObjectArgs,
  QueryNearTextArgs,
  QueryNearVectorArgs,
  QueryNearVideoArgs,
  QueryArgs,
} from './query';
import { GenerateArgs } from './generate';
import { GroupByArgs } from './groupby';
import { Struct } from '../proto/google/protobuf/struct';
import {
  BooleanArrayProperties,
  IntArrayProperties,
  NumberArrayProperties,
  ObjectArrayProperties,
  ObjectProperties,
  ObjectPropertiesValue,
  TextArrayProperties,
} from '../proto/v1/base';
import { ReferenceManager } from './references';

const isNotPrimitive = <T extends Properties, P>(argument: P | keyof T): argument is P => {
  return typeof argument !== 'string';
};

const isNotNested = <T extends Properties, P extends NonPrimitiveProperty<T>>(
  argument: P | NestedProperty<T>
): argument is P => {
  return argument.type !== 'nested';
};

const isNotRef = <T extends Properties, P extends NonPrimitiveProperty<T>>(
  argument: P | RefProperty<T> | MultiRefProperty<T>
): argument is P => {
  return argument.type !== 'ref' && argument.type !== 'multi-ref';
};

const isFilters = <T extends FilterValueType>(
  argument?: Filters<T> | PrimitiveFilterValueType | PrimitiveListFilterValueType
): argument is Filters<T> => {
  return argument instanceof Filters;
};

const isText = (argument?: FilterValueType): argument is string => {
  return !isFilters(argument) && typeof argument === 'string';
};

const isTextArray = (argument?: FilterValueType): argument is string[] => {
  return !isFilters(argument) && argument instanceof Array && typeof argument[0] === 'string';
};

const isInt = (argument?: FilterValueType): argument is number => {
  return !isFilters(argument) && typeof argument === 'number' && Number.isInteger(argument);
};

const isIntArray = (argument?: FilterValueType): argument is number[] => {
  return !isFilters(argument) && argument instanceof Array && Number.isInteger(argument[0]);
};

const isFloat = (argument?: FilterValueType): argument is number => {
  return !isFilters(argument) && typeof argument === 'number';
};

const isFloatArray = (argument?: FilterValueType): argument is number[] => {
  return !isFilters(argument) && argument instanceof Array && typeof argument[0] === 'number';
};

const isBoolean = (argument?: FilterValueType): argument is boolean => {
  return !isFilters(argument) && typeof argument === 'boolean';
};

const isBooleanArray = (argument?: FilterValueType): argument is boolean[] => {
  return !isFilters(argument) && argument instanceof Array && typeof argument[0] === 'boolean';
};

const isDate = (argument?: FilterValueType): argument is Date => {
  return !isFilters(argument) && argument instanceof Date;
};

const isDateArray = (argument?: FilterValueType): argument is Date[] => {
  return !isFilters(argument) && argument instanceof Array && argument[0] instanceof Date;
};

const isStringKey = <T extends Properties>(argument?: Property<T>): argument is string => {
  return typeof argument === 'string';
};

// Cannot do argument.every((arg) => typeof arg === type) in the above because of type erasure

export default class Serialize {
  private static common = <T extends Properties>(args?: QueryArgs<T>) => {
    return {
      limit: args?.limit,
      filters: args?.filters ? Serialize.filtersGRPC(args.filters) : undefined,
      properties: args?.returnProperties ? Serialize.properties(args.returnProperties) : undefined,
      metadata: args?.returnMetadata ? Serialize.metadata(args.returnMetadata) : undefined,
    };
  };

  public static fetchObjects = <T extends Properties>(args?: QueryFetchObjectsArgs<T>): SearchFetchArgs => {
    return {
      ...Serialize.common(args),
      offset: args?.offset,
      after: args?.after,
      sort: args?.sort ? Serialize.sortBy(args.sort) : undefined,
    };
  };

  public static bm25 = <T extends Properties>(args: QueryBm25Args<T>): SearchBm25Args => {
    return {
      ...Serialize.common(args),
      bm25: BM25.fromPartial({
        query: args.query,
        properties: args.queryProperties?.filter(isStringKey), // TS strangely can't infer that keyof T is a string here so type guard needed
      }),
      autocut: args.autoLimit,
    };
  };

  public static hybrid = <T extends Properties>(args: QueryHybridArgs<T>): SearchHybridArgs => {
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
        alpha: args.alpha,
        properties: args.queryProperties?.filter(isStringKey), // TS strangely can't infer that keyof T is a string here so type guard needed
        vector: args.vector,
        fusionType: fusionType(args.fusionType),
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearAudio = <T extends Properties>(args: QueryNearAudioArgs<T>): SearchNearAudioArgs => {
    return {
      ...Serialize.common(args),
      nearAudio: NearAudioSearch.fromPartial({
        audio: args.nearAudio,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearImage = <T extends Properties>(args: QueryNearImageArgs<T>): SearchNearImageArgs => {
    return {
      ...Serialize.common(args),
      nearImage: NearImageSearch.fromPartial({
        image: args.nearImage,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearObject = <T extends Properties>(args: QueryNearObjectArgs<T>): SearchNearObjectArgs => {
    return {
      ...Serialize.common(args),
      nearObject: NearObject.fromPartial({
        id: args.nearObject,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearText = <T extends Properties>(args: QueryNearTextArgs<T>): SearchNearTextArgs => {
    return {
      ...Serialize.common(args),
      nearText: NearTextSearch.fromPartial({
        query: typeof args.query === 'string' ? [args.query] : args.query,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearVector = <T extends Properties>(args: QueryNearVectorArgs<T>): SearchNearVectorArgs => {
    return {
      ...Serialize.common(args),
      nearVector: NearVector.fromPartial({
        vector: args.nearVector,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearVideo = <T extends Properties>(args: QueryNearVideoArgs<T>): SearchNearVideoArgs => {
    return {
      ...Serialize.common(args),
      nearVideo: NearVideoSearch.fromPartial({
        video: args.nearVideo,
        certainty: args.certainty,
        distance: args.distance,
      }),
      autocut: args.autoLimit,
    };
  };

  private static filtersGRPC = <T extends FilterValueType>(filters: Filters<T>): FiltersGRPC => {
    const resolveFilters = (filters: Filters<T>): FiltersGRPC[] => {
      const out: FiltersGRPC[] = [];
      filters.filters?.forEach((val) => {
        if (isFilters(val)) {
          out.push(Serialize.filtersGRPC(val));
        }
      });
      return out;
    };
    const { value } = filters;
    switch (filters.operator) {
      case 'And':
        return {
          on: filters.path,
          operator: Filters_Operator.OPERATOR_AND,
          filters: resolveFilters(filters),
        };
      case 'Or':
        return {
          on: filters.path,
          operator: Filters_Operator.OPERATOR_OR,
          filters: resolveFilters(filters),
        };
      default:
        return {
          on: filters.path,
          operator: Serialize.operator(filters.operator),
          filters: [],
          valueText: isText(value) ? value : undefined,
          valueTextArray: isTextArray(value) ? { values: value } : undefined,
          valueInt: isInt(value) ? value : undefined,
          valueIntArray: isIntArray(value) ? { values: value } : undefined,
          valueNumber: isFloat(value) ? value : undefined,
          valueNumberArray: isFloatArray(value) ? { values: value } : undefined,
          valueBoolean: isBoolean(value) ? value : undefined,
          valueBooleanArray: isBooleanArray(value) ? { values: value } : undefined,
        };
    }
  };

  public static filtersREST = <T extends FilterValueType>(filters: Filters<T>): FiltersREST => {
    const resolveFilters = (filters: Filters<T>): FiltersREST[] => {
      const out: FiltersREST[] = [];
      filters.filters?.forEach((val) => {
        if (isFilters(val)) {
          out.push(Serialize.filtersREST(val));
        }
      });
      return out;
    };
    const { value } = filters;
    if (filters.operator === 'And' || filters.operator === 'Or') {
      return {
        path: filters.path,
        operator: filters.operator,
        operands: resolveFilters(filters),
      };
    } else {
      const out = {
        path: filters.path,
        operator: filters.operator,
      };
      if (isText(value) || isTextArray(value)) {
        return {
          ...out,
          valueText: value,
        };
      } else if (isInt(value) || isIntArray(value)) {
        return {
          ...out,
          valueInt: value,
        };
      } else if (isBoolean(value) || isBooleanArray(value)) {
        return {
          ...out,
          valueBoolean: value,
        };
      } else if (isFloat(value) || isFloatArray(value)) {
        return {
          ...out,
          valueNumber: value,
        };
      } else if (isDate(value) || isDateArray(value)) {
        return {
          ...out,
          valueDate: value.toString(),
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

  private static properties = <T extends Properties>(properties?: Property<T>[]): PropertiesRequest => {
    const nonRefProperties = properties?.filter((property) => typeof property === 'string') as
      | string[]
      | undefined;
    const refProperties = properties?.filter(isNotPrimitive)?.filter(isNotNested);
    const objectProperties = properties?.filter(isNotPrimitive)?.filter(isNotRef);

    const resolveObjectProperty = (property: NestedProperty<T>): ObjectPropertiesRequest => {
      return {
        propName: property.name,
        primitiveProperties: property.properties.filter(
          (property) => typeof property === 'string'
        ) as string[],
        objectProperties: property.properties.filter(isNotPrimitive).map(resolveObjectProperty),
      };
    };

    return {
      nonRefProperties: nonRefProperties ? nonRefProperties : [],
      refProperties: refProperties
        ? refProperties.map((property) => {
            const metadata: any = {};
            if (property.returnMetadata) {
              Object.entries(property.returnMetadata).forEach(([key, value]) => {
                metadata[key] = !!value;
              });
            }
            return {
              referenceProperty: property.linkOn,
              properties: Serialize.properties(property.returnProperties),
              metadata: metadata,
              targetCollection: property.type === 'multi-ref' ? property.targetCollection : '',
            };
          })
        : [],
      objectProperties: objectProperties
        ? objectProperties.map((property) => {
            return {
              propName: property.name,
              primitiveProperties: property.properties.filter(
                (property) => typeof property === 'string'
              ) as string[],
              objectProperties: property.properties.filter(isNotPrimitive).map(resolveObjectProperty),
            };
          })
        : [],
    };
  };

  // private static metadata = (metadata: MetadataQuery): MetadataRequest => {
  //   const out: any = {};
  //   Object.entries(metadata).forEach(([key, value]) => {
  //     out[key] = !!value;
  //   });
  //   return out;
  // };

  private static metadata = (metadata: MetadataQuery): MetadataRequest => {
    const out: any = {};
    metadata.forEach((key) => {
      out[key] = true;
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

  public static generative = <T extends Properties>(generative?: GenerateArgs<T>): GenerativeSearch => {
    return GenerativeSearch.fromPartial({
      singleResponsePrompt: generative?.singlePrompt,
      groupedResponseTask: generative?.groupedTask,
      groupedProperties: generative?.groupedProperties as string[],
    });
  };

  public static groupBy = <T extends Properties>(groupBy?: GroupByArgs<T>): GroupBy => {
    return GroupBy.fromPartial({
      path: groupBy?.groupByProperty ? [groupBy.groupByProperty as string] : undefined,
      numberOfGroups: groupBy?.numberOfGroups,
      objectsPerGroup: groupBy?.objectsPerGroup,
    });
  };

  private static batchProperties = <T extends Properties>(properties: T): BatchObject_Properties => {
    const multiTarget: BatchObject_MultiTargetRefProps[] = [];
    const singleTarget: BatchObject_SingleTargetRefProps[] = [];
    const nonRefProperties: Record<string, any> = {};
    const boolArray: BooleanArrayProperties[] = [];
    const textArray: TextArrayProperties[] = [];
    const intArray: IntArrayProperties[] = [];
    const floatArray: NumberArrayProperties[] = [];
    const objectProperties: ObjectProperties[] = [];
    const objectArrayProperties: ObjectArrayProperties[] = [];

    for (const [key, value] of Object.entries(properties)) {
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
      } else if (isBooleanArray(value)) {
        boolArray.push({
          propName: key,
          values: value,
        });
      } else if (isDateArray(value)) {
        textArray.push({
          propName: key,
          values: value.map((v) => v.toISOString()),
        });
      } else if (isTextArray(value)) {
        textArray.push({
          propName: key,
          values: value,
        });
      } else if (isIntArray(value)) {
        intArray.push({
          propName: key,
          values: value,
        });
      } else if (isFloatArray(value)) {
        floatArray.push({
          propName: key,
          values: value,
        });
      } else if (typeof value === 'object') {
        const parsed = Serialize.batchProperties(value);
        objectProperties.push({
          propName: key,
          value: ObjectPropertiesValue.fromPartial(parsed),
        });
      } else if (value instanceof Array && typeof value[0] === 'object') {
        objectArrayProperties.push({
          propName: key,
          values: value.map((v) => ObjectPropertiesValue.fromPartial(Serialize.batchProperties(v))),
        });
      } else {
        nonRefProperties[key] = value;
      }
    }
    return {
      nonRefProperties: Struct.fromPartial({ fields: nonRefProperties }),
      multiTargetRefProps: multiTarget,
      singleTargetRefProps: singleTarget,
      textArrayProperties: textArray,
      intArrayProperties: intArray,
      numberArrayProperties: floatArray,
      booleanArrayProperties: boolArray,
      objectProperties: objectProperties,
      objectArrayProperties: objectArrayProperties,
    };
  };

  public static batchObjects = <T extends Properties>(
    collection: string,
    objects: DataObject<T>[],
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

      objs.push(
        BatchObjectGrpc.fromPartial({
          collection: collection,
          properties: Serialize.batchProperties(object.properties),
          tenant: tenant,
          uuid: object.uuid ? object.uuid : uuidv4(),
          vector: object.vector,
        })
      );

      batch.push({
        ...object,
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
