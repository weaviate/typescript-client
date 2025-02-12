import { MultiTargetVectorJoin } from '../index.js';
import { ListOfVectors, NearVectorInputType, PrimitiveVectorType, TargetVectorInputType } from './types.js';

export class NearVectorInputGuards {
  public static is1D(input: NearVectorInputType): input is number[] {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }

  public static is2D(input: NearVectorInputType): input is number[][] {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]) && input[0].length > 0;
  }

  public static isObject(
    input: NearVectorInputType
  ): input is Record<string, PrimitiveVectorType | ListOfVectors<number[]> | ListOfVectors<number[][]>> {
    return !Array.isArray(input);
  }

  public static isListOf1D(
    input: PrimitiveVectorType | ListOfVectors<number[]> | ListOfVectors<number[][]>
  ): input is ListOfVectors<number[]> {
    const i = input as ListOfVectors<number[]>;
    return !Array.isArray(input) && i.kind === 'listOfVectors' && i.dimensionality == '1D';
  }

  public static isListOf2D(
    input: PrimitiveVectorType | ListOfVectors<number[]> | ListOfVectors<number[][]>
  ): input is ListOfVectors<number[][]> {
    const i = input as ListOfVectors<number[][]>;
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
  public static isSingle(input: TargetVectorInputType): input is string {
    return typeof input === 'string';
  }

  public static isMulti(input: TargetVectorInputType): input is string[] {
    return Array.isArray(input);
  }

  public static isMultiJoin(input: TargetVectorInputType): input is MultiTargetVectorJoin {
    const i = input as MultiTargetVectorJoin;
    return i.combination !== undefined && i.targetVectors !== undefined;
  }
}
