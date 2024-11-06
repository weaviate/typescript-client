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
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { backup } from './collections/backup/client.js';
import cluster from './collections/cluster/index.js';
import { configGuards } from './collections/config/index.js';
import { configure, reconfigure } from './collections/configure/index.js';
import collections from './collections/index.js';
import {
  ApiKey,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  isApiKey,
  mapApiKey,
} from './connection/auth.js';
import { connectToCustom, connectToLocal, connectToWeaviateCloud } from './connection/helpers.js';
import { ConnectionGRPC } from './connection/index.js';
import { LiveChecker, OpenidConfigurationGetter, ReadyChecker } from './misc/index.js';
import MetaGetter from './misc/metaGetter.js';
import weaviateV2 from './v2/index.js';
const cleanHost = (host, protocol) => {
  if (host.includes('http')) {
    console.warn(`The ${protocol}.host parameter should not include the protocol. Please remove the http:// or https:// from the ${protocol}.host parameter.\
      To specify a secure connection, set the secure parameter to true. The protocol will be inferred from the secure parameter instead.`);
    return host.replace('http://', '').replace('https://', '');
  }
  return host;
};
const app = {
  /**
   * Connect to a custom Weaviate deployment, e.g. your own self-hosted Kubernetes cluster.
   *
   * @param {ConnectToCustomOptions} options Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your custom Weaviate deployment.
   */
  connectToCustom: function (options) {
    return connectToCustom(this.client, options);
  },
  /**
   * Connect to a locally-deployed Weaviate instance, e.g. as a Docker compose stack.
   *
   * @param {ConnectToLocalOptions} [options] Options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your local Weaviate instance.
   */
  connectToLocal: function (options) {
    return connectToLocal(this.client, options);
  },
  /**
   * Connect to your own Weaviate Cloud (WCD) instance.
   *
   * @deprecated Use `connectToWeaviateCloud` instead.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCDOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
   */
  connectToWCD: function (clusterURL, options) {
    console.warn(
      'The `connectToWCD` method is deprecated. Please use `connectToWeaviateCloud` instead. This method will be removed in a future release.'
    );
    return connectToWeaviateCloud(clusterURL, this.client, options);
  },
  /**
   * Connect to your own Weaviate Cloud Service (WCS) instance.
   *
   * @deprecated Use `connectToWeaviateCloud` instead.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWCSOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCS instance.
   */
  connectToWCS: function (clusterURL, options) {
    console.warn(
      'The `connectToWCS` method is deprecated. Please use `connectToWeaviateCloud` instead. This method will be removed in a future release.'
    );
    return connectToWeaviateCloud(clusterURL, this.client, options);
  },
  /**
   * Connect to your own Weaviate Cloud (WCD) instance.
   *
   * @param {string} clusterURL The URL of your WCD instance. E.g., `https://example.weaviate.network`.
   * @param {ConnectToWeaviateCloudOptions} [options] Additional options for the connection.
   * @returns {Promise<WeaviateClient>} A Promise that resolves to a client connected to your WCD instance.
   */
  connectToWeaviateCloud: function (clusterURL, options) {
    return connectToWeaviateCloud(clusterURL, this.client, options);
  },
  client: function (params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      let { host: httpHost } = params.connectionParams.http;
      let { host: grpcHost } = params.connectionParams.grpc;
      const { port: httpPort, secure: httpSecure, path: httpPath } = params.connectionParams.http;
      const { port: grpcPort, secure: grpcSecure } = params.connectionParams.grpc;
      httpHost = cleanHost(httpHost, 'rest');
      grpcHost = cleanHost(grpcHost, 'grpc');
      // check if headers are set
      if (!params.headers) params.headers = {};
      const scheme = httpSecure ? 'https' : 'http';
      const agent = httpSecure ? new HttpsAgent({ keepAlive: true }) : new HttpAgent({ keepAlive: true });
      const { connection, dbVersionProvider, dbVersionSupport } = yield ConnectionGRPC.use({
        host: `${scheme}://${httpHost}:${httpPort}${httpPath || ''}`,
        scheme: scheme,
        headers: params.headers,
        grpcAddress: `${grpcHost}:${grpcPort}`,
        grpcSecure: grpcSecure,
        grpcProxyUrl: (_a = params.proxies) === null || _a === void 0 ? void 0 : _a.grpc,
        apiKey: isApiKey(params.auth) ? mapApiKey(params.auth) : undefined,
        authClientSecret: isApiKey(params.auth) ? undefined : params.auth,
        agent,
        timeout: params.timeout,
        skipInitChecks: params.skipInitChecks,
      });
      const ifc = {
        backup: backup(connection),
        cluster: cluster(connection),
        collections: collections(connection, dbVersionSupport),
        close: () => Promise.resolve(connection.close()),
        getMeta: () => new MetaGetter(connection).do(),
        getOpenIDConfig: () => new OpenidConfigurationGetter(connection.http).do(),
        getWeaviateVersion: () => dbVersionSupport.getVersion(),
        isLive: () => new LiveChecker(connection, dbVersionProvider).do(),
        isReady: () => new ReadyChecker(connection, dbVersionProvider).do(),
      };
      if (connection.oidcAuth) ifc.oidcAuth = connection.oidcAuth;
      return ifc;
    });
  },
  ApiKey,
  AuthUserPasswordCredentials,
  AuthAccessTokenCredentials,
  AuthClientCredentials,
  configure,
  configGuards,
  reconfigure,
};
export default app;
export * from './collections/index.js';
export * from './connection/index.js';
export * from './utils/base64.js';
export * from './utils/uuid.js';
export { ApiKey, AuthAccessTokenCredentials, AuthClientCredentials, AuthUserPasswordCredentials, weaviateV2 };
