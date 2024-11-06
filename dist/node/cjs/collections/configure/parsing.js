'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.parseWithDefault = exports.QuantizerGuards = void 0;
class QuantizerGuards {
  static isPQCreate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'pq';
  }
  static isPQUpdate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'pq';
  }
  static isBQCreate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'bq';
  }
  static isBQUpdate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'bq';
  }
  static isSQCreate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'sq';
  }
  static isSQUpdate(config) {
    return (config === null || config === void 0 ? void 0 : config.type) === 'sq';
  }
}
exports.QuantizerGuards = QuantizerGuards;
function parseWithDefault(value, defaultValue) {
  return value !== undefined ? value : defaultValue;
}
exports.parseWithDefault = parseWithDefault;
