import { MultiTargetVectorJoin } from '../index.js';
import { NearVectorInputType, TargetVectorInputType } from './types.js';
export declare class NearVectorInputGuards {
  static is1DArray(input: NearVectorInputType): input is number[];
  static isObject(input: NearVectorInputType): input is Record<string, number[] | number[][]>;
}
export declare class ArrayInputGuards {
  static is1DArray<U, T extends U[]>(input: U | T): input is T;
  static is2DArray<U, T extends U[]>(input: U | T): input is T;
}
export declare class TargetVectorInputGuards {
  static isSingle(input: TargetVectorInputType): input is string;
  static isMulti(input: TargetVectorInputType): input is string[];
  static isMultiJoin(input: TargetVectorInputType): input is MultiTargetVectorJoin;
}
