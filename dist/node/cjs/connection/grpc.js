'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.grpcClient = void 0;
const abort_controller_x_1 = require('abort-controller-x');
const gql_js_1 = __importDefault(require('./gql.js'));
const nice_grpc_1 = require('nice-grpc');
const nice_grpc_client_middleware_retry_1 = require('nice-grpc-client-middleware-retry');
const health_js_1 = require('../proto/google/health/v1/health.js');
const weaviate_js_1 = require('../proto/v1/weaviate.js');
const batcher_js_1 = __importDefault(require('../grpc/batcher.js'));
const searcher_js_1 = __importDefault(require('../grpc/searcher.js'));
const tenantsManager_js_1 = __importDefault(require('../grpc/tenantsManager.js'));
const dbVersion_js_1 = require('../utils/dbVersion.js');
const errors_js_1 = require('../errors.js');
const clientFactory = (0, nice_grpc_1.createClientFactory)().use(
  nice_grpc_client_middleware_retry_1.retryMiddleware
);
const MAX_GRPC_MESSAGE_LENGTH = 104858000; // 10mb, needs to be synchronized with GRPC server
// Must extend from ConnectionGQL so that it can be passed to all the builder methods,
// which are tightly coupled to ConnectionGQL
class ConnectionGRPC extends gql_js_1.default {
  constructor(params) {
    super(params);
    this.search = (collection, consistencyLevel, tenant) => {
      if (this.authEnabled) {
        return this.login().then((token) =>
          this.grpc.search(collection, consistencyLevel, tenant, `Bearer ${token}`)
        );
      }
      return new Promise((resolve) => resolve(this.grpc.search(collection, consistencyLevel, tenant)));
    };
    this.batch = (collection, consistencyLevel, tenant) => {
      if (this.authEnabled) {
        return this.login().then((token) =>
          this.grpc.batch(collection, consistencyLevel, tenant, `Bearer ${token}`)
        );
      }
      return new Promise((resolve) => resolve(this.grpc.batch(collection, consistencyLevel, tenant)));
    };
    this.tenants = (collection) => {
      if (this.authEnabled) {
        return this.login().then((token) => this.grpc.tenants(collection, `Bearer ${token}`));
      }
      return new Promise((resolve) => resolve(this.grpc.tenants(collection)));
    };
    this.close = () => {
      this.grpc.close();
      this.http.close();
    };
    this.grpc = (0, exports.grpcClient)(params);
    this.grpcAddress = params.grpcAddress;
  }
  connect() {
    return __awaiter(this, void 0, void 0, function* () {
      const isHealthy = yield this.grpc.health();
      if (!isHealthy) {
        yield this.close();
        throw new errors_js_1.WeaviateGRPCUnavailableError(this.grpcAddress);
      }
    });
  }
}
_a = ConnectionGRPC;
ConnectionGRPC.use = (params) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const connection = new ConnectionGRPC(params);
    const dbVersionProvider = (0, dbVersion_js_1.initDbVersionProvider)(connection);
    const dbVersionSupport = new dbVersion_js_1.DbVersionSupport(dbVersionProvider);
    if (params.skipInitChecks) {
      return { connection, dbVersionProvider, dbVersionSupport };
    }
    yield Promise.all([
      dbVersionSupport.supportsCompatibleGrpcService().then((check) => {
        if (!check.supports) {
          throw new errors_js_1.WeaviateUnsupportedFeatureError(
            `Checking for gRPC compatibility failed with message: ${check.message}`
          );
        }
      }),
      connection.connect(),
    ]);
    return { connection, dbVersionProvider, dbVersionSupport };
  });
exports.default = ConnectionGRPC;
const grpcClient = (config) => {
  const channelOptions = {
    'grpc.max_send_message_length': MAX_GRPC_MESSAGE_LENGTH,
    'grpc.max_receive_message_length': MAX_GRPC_MESSAGE_LENGTH,
  };
  if (config.grpcProxyUrl) {
    // grpc.http_proxy is not used by grpc.js under-the-hood
    // only uses the env var and whether http_proxy is enabled
    process.env.grpc_proxy = config.grpcProxyUrl;
    channelOptions['grpc.enabled_http_proxy'] = true;
  }
  const channel = (0, nice_grpc_1.createChannel)(
    config.grpcAddress,
    config.grpcSecure
      ? nice_grpc_1.ChannelCredentials.createSsl()
      : nice_grpc_1.ChannelCredentials.createInsecure(),
    channelOptions
  );
  const client = clientFactory.create(weaviate_js_1.WeaviateDefinition, channel);
  const health = clientFactory.create(health_js_1.HealthDefinition, channel);
  return {
    close: () => channel.close(),
    batch: (collection, consistencyLevel, tenant, bearerToken) => {
      var _b;
      return batcher_js_1.default.use(
        client,
        collection,
        new nice_grpc_1.Metadata(
          bearerToken
            ? Object.assign(Object.assign({}, config.headers), { authorization: bearerToken })
            : config.headers
        ),
        ((_b = config.timeout) === null || _b === void 0 ? void 0 : _b.insert) || 90,
        consistencyLevel,
        tenant
      );
    },
    health: () => {
      var _b;
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        (((_b = config.timeout) === null || _b === void 0 ? void 0 : _b.init) || 2) * 1000
      );
      return health
        .check({ service: '/grpc.health.v1.Health/Check' }, { signal: controller.signal })
        .then((res) => res.status === health_js_1.HealthCheckResponse_ServingStatus.SERVING)
        .catch((err) => {
          if ((0, abort_controller_x_1.isAbortError)(err)) {
            throw new errors_js_1.WeaviateGRPCUnavailableError(config.grpcAddress);
          }
          throw err;
        })
        .finally(() => clearTimeout(timeoutId));
    },
    search: (collection, consistencyLevel, tenant, bearerToken) => {
      var _b;
      return searcher_js_1.default.use(
        client,
        collection,
        new nice_grpc_1.Metadata(
          bearerToken
            ? Object.assign(Object.assign({}, config.headers), { authorization: bearerToken })
            : config.headers
        ),
        ((_b = config.timeout) === null || _b === void 0 ? void 0 : _b.query) || 30,
        consistencyLevel,
        tenant
      );
    },
    tenants: (collection, bearerToken) => {
      var _b;
      return tenantsManager_js_1.default.use(
        client,
        collection,
        new nice_grpc_1.Metadata(
          bearerToken
            ? Object.assign(Object.assign({}, config.headers), { authorization: bearerToken })
            : config.headers
        ),
        ((_b = config.timeout) === null || _b === void 0 ? void 0 : _b.query) || 30
      );
    },
  };
};
exports.grpcClient = grpcClient;
