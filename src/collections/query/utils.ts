import { MultiTargetVectorJoin, Vectors } from '../index.js';
import {
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
