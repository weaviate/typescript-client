'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const search_get_js_1 = require('../proto/v1/search_get.js');
const errors_js_1 = require('../errors.js');
const base_js_1 = __importDefault(require('./base.js'));
const retry_js_1 = require('./retry.js');
class Searcher extends base_js_1.default {
  constructor() {
    super(...arguments);
    this.withFetch = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withBm25 = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withHybrid = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearAudio = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearDepth = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearImage = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearIMU = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearObject = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearText = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearThermal = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearVector = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.withNearVideo = (args) => this.call(search_get_js_1.SearchRequest.fromPartial(args));
    this.call = (message) =>
      this.sendWithTimeout((signal) =>
        this.connection
          .search(
            Object.assign(Object.assign({}, message), {
              collection: this.collection,
              consistencyLevel: this.consistencyLevel,
              tenant: this.tenant,
              uses123Api: true,
              uses125Api: true,
            }),
            Object.assign({ metadata: this.metadata, signal }, retry_js_1.retryOptions)
          )
          .catch((err) => {
            throw new errors_js_1.WeaviateQueryError(err.message, 'gRPC');
          })
      );
  }
  static use(connection, collection, metadata, timeout, consistencyLevel, tenant) {
    return new Searcher(connection, collection, metadata, timeout, consistencyLevel, tenant);
  }
}
exports.default = Searcher;
