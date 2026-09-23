import { WeaviateInvalidInputError } from '../errors.js';
import {
  BoostOptions,
  DiversityConfig,
  FilterValue,
  MMR,
  MultiTargetVectorJoin,
  NumericDecay,
  PropertyValue,
  TimeDecay,
  Vectors,
} from '../index.js';
import {
  Bm25OperatorAnd,
  Bm25OperatorAndCross,
  Bm25OperatorOptions,
  Bm25OperatorOr,
  ListOfVectors,
  MultiVectorType,
  NearVectorInputType,
  PrimitiveVectorType,
  SingleVectorType,
  TargetVectorInputType,
} from './types.js';

export class NearVectorInputGuards {
  public static is1D(input: NearVectorInputType): input is SingleVectorType {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }

  public static is2D(input: NearVectorInputType): input is MultiVectorType {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]) && input[0].length > 0;
  }

  public static isObject(
    input: NearVectorInputType
  ): input is Record<
    string,
    PrimitiveVectorType | ListOfVectors<SingleVectorType> | ListOfVectors<MultiVectorType>
  > {
    return !Array.isArray(input);
  }

  public static isListOf1D(
    input: PrimitiveVectorType | ListOfVectors<SingleVectorType> | ListOfVectors<MultiVectorType>
  ): input is ListOfVectors<SingleVectorType> {
    const i = input as ListOfVectors<SingleVectorType>;
    return !Array.isArray(input) && i.kind === 'listOfVectors' && i.dimensionality == '1D';
  }

  public static isListOf2D(
    input: PrimitiveVectorType | ListOfVectors<SingleVectorType> | ListOfVectors<MultiVectorType>
  ): input is ListOfVectors<MultiVectorType> {
    const i = input as ListOfVectors<MultiVectorType>;
    return !Array.isArray(input) && i.kind === 'listOfVectors' && i.dimensionality == '2D';
  }
}

export class ArrayInputGuards {
  public static is1DArray<U, T extends U[]>(input: U | T): input is T {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }
  public static is2DArray<U, T extends U[]>(input: U | T): input is T {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]);
  }
}

export class TargetVectorInputGuards {
  public static isSingle(input: TargetVectorInputType<Vectors>): input is string {
    return typeof input === 'string';
  }

  public static isMulti(input: TargetVectorInputType<Vectors>): input is string[] {
    return Array.isArray(input);
  }

  public static isMultiJoin(input: TargetVectorInputType<Vectors>): input is MultiTargetVectorJoin<Vectors> {
    const i = input as MultiTargetVectorJoin<Vectors>;
    return i.combination !== undefined && i.targetVectors !== undefined;
  }
}

export class Boost {
  static filter(filter: FilterValue, args?: Pick<BoostOptions, 'weight' | 'depth'>): BoostOptions {
    return {
      ...args,
      conditions: [
        {
          weight: args?.weight,
          func: {
            ...filter,
            type: 'filter',
          },
        },
      ],
    };
  }
  static timeDecay(args: Omit<TimeDecay, 'type'> & Pick<BoostOptions, 'weight' | 'depth'>): BoostOptions {
    const { weight, depth, ...func } = args;
    return {
      conditions: [
        {
          weight,
          func: {
            ...func,
            type: 'timeDecay',
          },
        },
      ],
      weight,
      depth,
    };
  }
  static numericDecay(
    args: Omit<NumericDecay, 'type'> & Pick<BoostOptions, 'weight' | 'depth'>
  ): BoostOptions {
    const { weight, depth, ...func } = args;
    return {
      conditions: [
        {
          weight,
          func: {
            ...func,
            type: 'numericDecay',
          },
        },
      ],
      weight,
      depth,
    };
  }
  static numericProperty(
    args: Omit<PropertyValue, 'type'> & Pick<BoostOptions, 'weight' | 'depth'>
  ): BoostOptions {
    const { weight, depth, ...func } = args;
    return {
      conditions: [
        {
          weight,
          func: {
            ...func,
            type: 'propertyValue',
          },
        },
      ],
      weight,
      depth,
    };
  }
  static blend(boosts: BoostOptions[], options: Pick<BoostOptions, 'weight' | 'depth'>): BoostOptions {
    const out: BoostOptions = { ...options, conditions: [] };
    for (const boost of boosts) {
      if (boost.depth) {
        throw new WeaviateInvalidInputError('A boost passed to Boost.blend() cannot set its own depth.');
      }
      for (let cond of boost.conditions) {
        if (!cond.weight && boost.weight) {
          cond = {
            ...cond,
            weight: boost.weight,
          };
        }
        out.conditions.push({ ...cond });
      }
    }
    return out;
  }
}

export class Bm25Operator {
  static and(opts?: Omit<Bm25OperatorAnd, 'operator'>): Bm25OperatorOptions {
    return { ...opts, operator: 'And' };
  }

  static andCross(opts?: Omit<Bm25OperatorAndCross, 'operator'>): Bm25OperatorOptions {
    return { ...opts, operator: 'AndCross' };
  }

  static or(opts: Omit<Bm25OperatorOr, 'operator'>): Bm25OperatorOptions {
    return { ...opts, operator: 'Or' };
  }
}

export class Diversity {
  /** Use Maximal Marginal Relevance diversity selection. */
  static mmr(args?: Omit<MMR, 'type'>): DiversityConfig {
    return {
      ...args,
      type: 'mmr',
    };
  }

  static isMMR(args: DiversityConfig): args is MMR {
    return args.type === 'mmr';
  }
}
