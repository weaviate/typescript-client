import { MultiTargetVectorJoin } from '../index.js';
import { NearVectorInputType, TargetVectorInputType } from './types.js';

export class NearVectorInputGuards {
  public static is1DArray(input: NearVectorInputType): input is number[] {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }

  public static isObject(input: NearVectorInputType): input is Record<string, number[] | number[][]> {
    return !Array.isArray(input);
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
