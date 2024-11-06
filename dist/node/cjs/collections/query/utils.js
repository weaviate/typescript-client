'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TargetVectorInputGuards = exports.ArrayInputGuards = exports.NearVectorInputGuards = void 0;
class NearVectorInputGuards {
  static is1DArray(input) {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }
  static isObject(input) {
    return !Array.isArray(input);
  }
}
exports.NearVectorInputGuards = NearVectorInputGuards;
class ArrayInputGuards {
  static is1DArray(input) {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }
  static is2DArray(input) {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]);
  }
}
exports.ArrayInputGuards = ArrayInputGuards;
class TargetVectorInputGuards {
  static isSingle(input) {
    return typeof input === 'string';
  }
  static isMulti(input) {
    return Array.isArray(input);
  }
  static isMultiJoin(input) {
    const i = input;
    return i.combination !== undefined && i.targetVectors !== undefined;
  }
}
exports.TargetVectorInputGuards = TargetVectorInputGuards;
