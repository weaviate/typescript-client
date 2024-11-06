import { WeaviateStartUpError } from '../errors.js';
export function connectToWeaviateCloud(clusterURL, clientMaker, options) {
  // check if the URL is set
  if (!clusterURL) throw new Error('Missing `clusterURL` parameter');
  if (!clusterURL.startsWith('http')) {
    clusterURL = `https://${clusterURL}`;
  }
  const url = new URL(clusterURL);
  let grpcHost;
  if (url.hostname.endsWith('.weaviate.network')) {
    const [ident, ...rest] = url.hostname.split('.');
    grpcHost = `${ident}.grpc.${rest.join('.')}`;
  } else {
    grpcHost = `grpc-${url.hostname}`;
  }
  return clientMaker({
    connectionParams: {
      http: {
        secure: true,
        host: url.hostname,
        port: 443,
      },
      grpc: {
        secure: true,
        host: grpcHost,
        port: 443,
      },
    },
    auth: options === null || options === void 0 ? void 0 : options.authCredentials,
    headers: options === null || options === void 0 ? void 0 : options.headers,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}
export function connectToLocal(clientMaker, options) {
  return clientMaker({
    connectionParams: {
      http: {
        secure: false,
        host: (options === null || options === void 0 ? void 0 : options.host) || 'localhost',
        port: (options === null || options === void 0 ? void 0 : options.port) || 8080,
      },
      grpc: {
        secure: false,
        host: (options === null || options === void 0 ? void 0 : options.host) || 'localhost',
        port: (options === null || options === void 0 ? void 0 : options.grpcPort) || 50051,
      },
    },
    auth: options === null || options === void 0 ? void 0 : options.authCredentials,
    headers: options === null || options === void 0 ? void 0 : options.headers,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}
export function connectToCustom(clientMaker, options) {
  return clientMaker({
    connectionParams: {
      http: {
        secure: (options === null || options === void 0 ? void 0 : options.httpSecure) || false,
        host: (options === null || options === void 0 ? void 0 : options.httpHost) || 'localhost',
        path: (options === null || options === void 0 ? void 0 : options.httpPath) || '',
        port: (options === null || options === void 0 ? void 0 : options.httpPort) || 8080,
      },
      grpc: {
        secure: (options === null || options === void 0 ? void 0 : options.grpcSecure) || false,
        host: (options === null || options === void 0 ? void 0 : options.grpcHost) || 'localhost',
        port: (options === null || options === void 0 ? void 0 : options.grpcPort) || 50051,
      },
    },
    auth: options === null || options === void 0 ? void 0 : options.authCredentials,
    headers: options === null || options === void 0 ? void 0 : options.headers,
    proxies: options === null || options === void 0 ? void 0 : options.proxies,
  }).catch((e) => {
    throw new WeaviateStartUpError(`Weaviate failed to startup with message: ${e.message}`);
  });
}
