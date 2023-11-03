import {
  PropertiesRequest,
  ObjectPropertiesRequest,
  Filters as FiltersGrpc,
  Filters_Operator,
  SortBy as SortByGrpc,
  MetadataRequest,
} from '../proto/v1/search_get';

import { Filters, FilterValueType, PrimitiveFilterValueType, PrimitiveListFilterValueType } from './filters';
import {
  MultiRefProperty,
  NonPrimitiveProperty,
  NestedProperty,
  Property,
  RefProperty,
  SortBy,
  MetadataQuery,
} from './types';

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

// Cannot do argument.every((arg) => typeof arg === type) because of type erasure

export default class Serialize {
  static filters = <T extends FilterValueType>(filters: Filters<T>): FiltersGrpc => {
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

  static operator = (operator: string): Filters_Operator => {
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

  static properties = (properties?: Property[]): PropertiesRequest => {
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

  static metadata = (metadata: MetadataQuery): MetadataRequest => {
    const out: any = {};
    Object.entries(metadata).forEach(([key, value]) => {
      out[key] = !!value;
    });
    return out;
  };

  static sortBy = (sort: SortBy[]): SortByGrpc[] => {
    return sort.map((sort) => {
      return {
        ascending: !!sort.ascending,
        path: [sort.property],
      };
    });
  };
}
