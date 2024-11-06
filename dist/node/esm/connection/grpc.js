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
var _a;
import { isAbortError } from 'abort-controller-x';
import { ChannelCredentials, createChannel, createClientFactory, Metadata } from 'nice-grpc';
import { retryMiddleware } from 'nice-grpc-client-middleware-retry';
import { WeaviateGRPCUnavailableError, WeaviateUnsupportedFeatureError } from '../errors.js';
import Batcher from '../grpc/batcher.js';
import Searcher from '../grpc/searcher.js';
import TenantsManager from '../grpc/tenantsManager.js';
import { HealthCheckResponse_ServingStatus, HealthDefinition } from '../proto/google/health/v1/health.js';
import { WeaviateDefinition } from '../proto/v1/weaviate.js';
import { DbVersionSupport, initDbVersionProvider } from '../utils/dbVersion.js';
import ConnectionGQL from './gql.js';
const clientFactory = createClientFactory().use(retryMiddleware);
const MAX_GRPC_MESSAGE_LENGTH = 104858000; // 10mb, needs to be synchronized with GRPC server
// Must extend from ConnectionGQL so that it can be passed to all the builder methods,
// which are tightly coupled to ConnectionGQL
class ConnectionGRPC extends ConnectionGQL {
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
    this.grpc = grpcClient(params);
    this.grpcAddress = params.grpcAddress;
  }
  connect() {
    return __awaiter(this, void 0, void 0, function* () {
      const isHealthy = yield this.grpc.health();
      if (!isHealthy) {
        yield this.close();
        throw new WeaviateGRPCUnavailableError(this.grpcAddress);
      }
    });
  }
}
_a = ConnectionGRPC;
ConnectionGRPC.use = (params) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const connection = new ConnectionGRPC(params);
    const dbVersionProvider = initDbVersionProvider(connection);
    const dbVersionSupport = new DbVersionSupport(dbVersionProvider);
    if (params.skipInitChecks) {
      return { connection, dbVersionProvider, dbVersionSupport };
    }
    yield Promise.all([
      dbVersionSupport.supportsCompatibleGrpcService().then((check) => {
        if (!check.supports) {
          throw new WeaviateUnsupportedFeatureError(
            `Checking for gRPC compatibility failed with message: ${check.message}`
          );
        }
      }),
      connection.connect(),
    ]);
    return { connection, dbVersionProvider, dbVersionSupport };
  });
export default ConnectionGRPC;
export const grpcClient = (config) => {
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
  const channel = createChannel(
    config.grpcAddress,
    config.grpcSecure ? ChannelCredentials.createSsl() : ChannelCredentials.createInsecure(),
    channelOptions
  );
  const client = clientFactory.create(WeaviateDefinition, channel);
  const health = clientFactory.create(HealthDefinition, channel);
  return {
    close: () => channel.close(),
    batch: (collection, consistencyLevel, tenant, bearerToken) => {
      var _b;
      return Batcher.use(
        client,
        collection,
        new Metadata(
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
        .then((res) => res.status === HealthCheckResponse_ServingStatus.SERVING)
        .catch((err) => {
          if (isAbortError(err)) {
            throw new WeaviateGRPCUnavailableError(config.grpcAddress);
          }
          throw err;
        })
        .finally(() => clearTimeout(timeoutId));
    },
    search: (collection, consistencyLevel, tenant, bearerToken) => {
      var _b;
      return Searcher.use(
        client,
        collection,
        new Metadata(
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
      return TenantsManager.use(
        client,
        collection,
        new Metadata(
          bearerToken
            ? Object.assign(Object.assign({}, config.headers), { authorization: bearerToken })
            : config.headers
        ),
        ((_b = config.timeout) === null || _b === void 0 ? void 0 : _b.query) || 30
      );
    },
  };
};
