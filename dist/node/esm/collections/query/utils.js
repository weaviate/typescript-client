export class NearVectorInputGuards {
  static is1DArray(input) {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }
  static isObject(input) {
    return !Array.isArray(input);
  }
}
export class ArrayInputGuards {
  static is1DArray(input) {
    return Array.isArray(input) && input.length > 0 && !Array.isArray(input[0]);
  }
  static is2DArray(input) {
    return Array.isArray(input) && input.length > 0 && Array.isArray(input[0]);
  }
}
export class TargetVectorInputGuards {
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
