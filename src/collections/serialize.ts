import {
  PropertiesRequest,
  ObjectPropertiesRequest,
  Filters as FiltersGrpc,
  Filters_Operator,
  SortBy as SortByGrpc,
  MetadataRequest,
  NearAudioSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearTextSearch_Move,
  NearVector,
  NearVideoSearch,
  Hybrid,
  Hybrid_FusionType,
  BM25,
} from '../proto/v1/search_get';

import { Filters, FilterValueType, PrimitiveFilterValueType, PrimitiveListFilterValueType } from './filters';
import {
  MetadataQuery,
  MultiRefProperty,
  NestedProperty,
  NonPrimitiveProperty,
  Property,
  RefProperty,
  SortBy,
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
  Bm25Args,
  FetchObjectsArgs,
  HybridArgs,
  NearAudioArgs,
  NearImageArgs,
  NearObjectArgs,
  NearTextArgs,
  NearVectorArgs,
  NearVideoArgs,
  QueryArgs,
} from './query';

const isNotPrimitive = <T>(argument: T | string): argument is T => {
  return typeof argument !== 'string';
};

const isNotNested = <T extends NonPrimitiveProperty>(argument: T | NestedProperty): argument is T => {
  return argument.type !== 'nested';
};

const isNotRef = <T extends NonPrimitiveProperty>(
  argument: T | RefProperty | MultiRefProperty
): argument is T => {
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

const isNumber = (argument?: FilterValueType): argument is number => {
  return !isFilters(argument) && typeof argument === 'number';
};

const isNumberArray = (argument?: FilterValueType): argument is number[] => {
  return !isFilters(argument) && argument instanceof Array && typeof argument[0] === 'number';
};

const isBoolean = (argument?: FilterValueType): argument is boolean => {
  return !isFilters(argument) && typeof argument === 'boolean';
};

const isBooleanArray = (argument?: FilterValueType): argument is boolean[] => {
  return !isFilters(argument) && argument instanceof Array && typeof argument[0] === 'boolean';
};

// Cannot do argument.every((arg) => typeof arg === type) in the above because of type erasure

export default class Serialize {
  private static common = (args?: QueryArgs) => {
    return {
      limit: args?.limit,
      filters: args?.filters ? Serialize.filters(args.filters) : undefined,
      returnProperties: args?.returnProperties ? Serialize.properties(args.returnProperties) : undefined,
      returnMetadata: args?.returnMetadata ? Serialize.metadata(args.returnMetadata) : undefined,
    };
  };

  public static fetchObjects = (args?: FetchObjectsArgs): SearchFetchArgs => {
    return {
      ...Serialize.common(args),
      offset: args?.offset,
      after: args?.after,
      sort: args?.sort ? Serialize.sortBy(args.sort) : undefined,
    };
  };

  public static bm25 = (args: Bm25Args): SearchBm25Args => {
    return {
      ...Serialize.common(args),
      bm25: BM25.fromPartial({
        query: args.query,
        properties: args.queryProperties,
      }),
      autocut: args.autoLimit,
    };
  };

  public static hybrid = (args: HybridArgs): SearchHybridArgs => {
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
        properties: args.queryProperties,
        vector: args.vector,
        fusionType: fusionType(args.fusionType),
      }),
      autocut: args.autoLimit,
    };
  };

  public static nearAudio = (args: NearAudioArgs): SearchNearAudioArgs => {
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

  public static nearImage = (args: NearImageArgs): SearchNearImageArgs => {
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

  public static nearObject = (args: NearObjectArgs): SearchNearObjectArgs => {
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

  public static nearText = (args: NearTextArgs): SearchNearTextArgs => {
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

  public static nearVector = (args: NearVectorArgs): SearchNearVectorArgs => {
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

  public static nearVideo = (args: NearVideoArgs): SearchNearVideoArgs => {
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

  private static filters = <T extends FilterValueType>(filters: Filters<T>): FiltersGrpc => {
    const resolveFilters = (filters: Filters<T>): FiltersGrpc[] => {
      const out: FiltersGrpc[] = [];
      filters.filters?.forEach((val) => {
        if (isFilters(val)) {
          out.push(Serialize.filters(val));
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
          valueNumber: isNumber(value) ? value : undefined,
          valueNumberArray: isNumberArray(value) ? { values: value } : undefined,
          valueBoolean: isBoolean(value) ? value : undefined,
          valueBooleanArray: isBooleanArray(value) ? { values: value } : undefined,
        };
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

  private static properties = (properties?: Property[]): PropertiesRequest => {
    const nonRefProperties = properties?.filter((property) => typeof property === 'string') as
      | string[]
      | undefined;
    const refProperties = properties?.filter(isNotPrimitive)?.filter(isNotNested);
    const objectProperties = properties?.filter(isNotPrimitive)?.filter(isNotRef);

    const resolveObjectProperty = (property: NestedProperty): ObjectPropertiesRequest => {
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
            Object.entries(property.returnMetadata).forEach(([key, value]) => {
              metadata[key] = !!value;
            });
            return {
              referenceProperty: property.linkOn,
              properties: this.properties(property.returnProperties),
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

  private static metadata = (metadata: MetadataQuery): MetadataRequest => {
    const out: any = {};
    Object.entries(metadata).forEach(([key, value]) => {
      out[key] = !!value;
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
}
