import { MultiTargetVectorJoin } from '../index.js';
import { NearVectorInputType, TargetVectorInputType } from './types.js';

export class NearVectorInputGuards {
  public static is1DArray(input: NearVectorInputType): input is number[] {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }

  public static is2DArray(input: NearVectorInputType): input is number[][] {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]);
  }

  public static isObject(input: NearVectorInputType): input is Record<string, number[]> {
    return !Array.isArray(input);
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
    return (input as MultiTargetVectorJoin).combination !== undefined;
  }
}
