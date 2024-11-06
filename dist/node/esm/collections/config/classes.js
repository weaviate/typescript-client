var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WeaviateInvalidInputError } from '../../errors.js';
import { QuantizerGuards } from '../configure/parsing.js';
export class MergeWithExisting {
  static schema(current, supportsNamedVectors, update) {
    var _a;
    if (update === undefined) return current;
    if (update.description !== undefined) current.description = update.description;
    if (update.invertedIndex !== undefined)
      current.invertedIndexConfig = MergeWithExisting.invertedIndex(
        current.invertedIndexConfig,
        update.invertedIndex
      );
    if (update.replication !== undefined)
      current.replicationConfig = MergeWithExisting.replication(
        current.replicationConfig,
        update.replication
      );
    if (update.vectorizers !== undefined) {
      if (Array.isArray(update.vectorizers)) {
        current.vectorConfig = MergeWithExisting.vectors(current.vectorConfig, update.vectorizers);
      } else if (supportsNamedVectors && current.vectorConfig !== undefined) {
        const updateVectorizers = Object.assign(Object.assign({}, update.vectorizers), { name: 'default' });
        current.vectorConfig = MergeWithExisting.vectors(current.vectorConfig, [updateVectorizers]);
      } else {
        current.vectorIndexConfig =
          ((_a = update.vectorizers) === null || _a === void 0 ? void 0 : _a.vectorIndex.name) === 'hnsw'
            ? MergeWithExisting.hnsw(current.vectorIndexConfig, update.vectorizers.vectorIndex.config)
            : MergeWithExisting.flat(current.vectorIndexConfig, update.vectorizers.vectorIndex.config);
      }
    }
    return current;
  }
  static invertedIndex(current, update) {
    if (current === undefined) throw Error('Inverted index config is missing from the class schema.');
    if (update === undefined) return current;
    const { bm25, stopwords } = update,
      rest = __rest(update, ['bm25', 'stopwords']);
    const merged = Object.assign(Object.assign({}, current), rest);
    if (bm25 !== undefined) merged.bm25 = Object.assign(Object.assign({}, current.bm25), bm25);
    if (stopwords !== undefined)
      merged.stopwords = Object.assign(Object.assign({}, current.stopwords), stopwords);
    return merged;
  }
  static replication(current, update) {
    if (current === undefined) throw Error('Replication config is missing from the class schema.');
    if (update === undefined) return current;
    return Object.assign(Object.assign({}, current), update);
  }
  static vectors(current, update) {
    if (current === undefined) throw Error('Vector index config is missing from the class schema.');
    if (update === undefined) return current;
    update.forEach((v) => {
      const existing = current[v.name];
      if (existing !== undefined) {
        current[v.name].vectorIndexConfig =
          v.vectorIndex.name === 'hnsw'
            ? MergeWithExisting.hnsw(existing.vectorIndexConfig, v.vectorIndex.config)
            : MergeWithExisting.flat(existing.vectorIndexConfig, v.vectorIndex.config);
      }
    });
    return current;
  }
  static flat(current, update) {
    if (update === undefined) return current;
    if (
      (QuantizerGuards.isPQUpdate(update.quantizer) &&
        (current === null || current === void 0 ? void 0 : current.bq).enabled) ||
      (QuantizerGuards.isBQUpdate(update.quantizer) &&
        (current === null || current === void 0 ? void 0 : current.pq).enabled)
    )
      throw Error(`Cannot update the quantizer type of an enabled vector index.`);
    const { quantizer } = update,
      rest = __rest(update, ['quantizer']);
    const merged = Object.assign(Object.assign({}, current), rest);
    if (QuantizerGuards.isBQUpdate(quantizer)) {
      const { type } = quantizer,
        quant = __rest(quantizer, ['type']);
      merged.bq = Object.assign(Object.assign(Object.assign({}, current.bq), quant), { enabled: true });
    }
    return merged;
  }
  static hnsw(current, update) {
    if (update === undefined) return current;
    if (
      (QuantizerGuards.isBQUpdate(update.quantizer) &&
        (((current === null || current === void 0 ? void 0 : current.pq) || {}).enabled ||
          ((current === null || current === void 0 ? void 0 : current.sq) || {}).enabled)) ||
      (QuantizerGuards.isPQUpdate(update.quantizer) &&
        (((current === null || current === void 0 ? void 0 : current.bq) || {}).enabled ||
          ((current === null || current === void 0 ? void 0 : current.sq) || {}).enabled)) ||
      (QuantizerGuards.isSQUpdate(update.quantizer) &&
        (((current === null || current === void 0 ? void 0 : current.pq) || {}).enabled ||
          ((current === null || current === void 0 ? void 0 : current.bq) || {}).enabled))
    )
      throw new WeaviateInvalidInputError(`Cannot update the quantizer type of an enabled vector index.`);
    const { quantizer } = update,
      rest = __rest(update, ['quantizer']);
    const merged = Object.assign(Object.assign({}, current), rest);
    if (QuantizerGuards.isBQUpdate(quantizer)) {
      const { type } = quantizer,
        quant = __rest(quantizer, ['type']);
      merged.bq = Object.assign(Object.assign(Object.assign({}, current.bq), quant), { enabled: true });
    }
    if (QuantizerGuards.isPQUpdate(quantizer)) {
      const { type } = quantizer,
        quant = __rest(quantizer, ['type']);
      merged.pq = Object.assign(Object.assign(Object.assign({}, current.pq), quant), { enabled: true });
    }
    if (QuantizerGuards.isSQUpdate(quantizer)) {
      const { type } = quantizer,
        quant = __rest(quantizer, ['type']);
      merged.sq = Object.assign(Object.assign(Object.assign({}, current.sq), quant), { enabled: true });
    }
    return merged;
  }
}
