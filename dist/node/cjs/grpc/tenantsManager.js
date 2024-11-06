'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const tenants_js_1 = require('../proto/v1/tenants.js');
const base_js_1 = __importDefault(require('./base.js'));
const retry_js_1 = require('./retry.js');
class TenantsManager extends base_js_1.default {
  constructor() {
    super(...arguments);
    this.withGet = (args) =>
      this.call(
        tenants_js_1.TenantsGetRequest.fromPartial({ names: args.names ? { values: args.names } : undefined })
      );
  }
  static use(connection, collection, metadata, timeout) {
    return new TenantsManager(connection, collection, metadata, timeout);
  }
  call(message) {
    return this.sendWithTimeout((signal) =>
      this.connection.tenantsGet(
        Object.assign(Object.assign({}, message), { collection: this.collection }),
        Object.assign({ metadata: this.metadata, signal }, retry_js_1.retryOptions)
      )
    );
  }
}
exports.default = TenantsManager;
