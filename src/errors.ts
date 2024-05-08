class WeaviateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Is thrown if the input to a function is invalid.
 */
export class WeaviateInvalidInputError extends WeaviateError {
  constructor(message: string) {
    super(`Invalid input provided: ${message}`);
  }
}

/**
 * Is thrown if a query (either gRPC or GraphQL) to Weaviate fails in any way.
 */
export class WeaviateQueryError extends WeaviateError {
  constructor(message: string, protocolType: 'GraphQL' | 'gRPC') {
    super(`Query call with protocol ${protocolType} failed with message: ${message}`);
  }
}

/**
 * Is thrown if a gRPC delete many request to Weaviate fails in any way.
 */
export class WeaviateDeleteManyError extends WeaviateError {
  constructor(message: string) {
    super(`Delete many failed with message: ${message}`);
  }
}

/**
 * Is thrown if a gRPC batch query to Weaviate fails in any way.
 */
export class WeaviateBatchError extends WeaviateError {
  constructor(message: string) {
    super(`Batch objects insert failed with message: ${message}`);
  }
}

/**
 * Is thrown if the gRPC health check against Weaviate fails.
 */
export class WeaviateGRPCUnavailableError extends WeaviateError {
  constructor(address: string) {
    const grpcMsg = `Please check that the server address and port: ${address} are correct.`;
    const msg = `Weaviate makes use of a high-speed gRPC API as well as a REST API.
      Unfortunately, the gRPC health check against Weaviate could not be completed.

      This error could be due to one of several reasons:
        - The gRPC traffic at the specified port is blocked by a firewall.
        - gRPC is not enabled or incorrectly configured on the server or the client.
            - ${grpcMsg}
        - your connection is unstable or has a high latency. In this case you can:
            - increase init-timeout in weaviate.connectToLocal({timeout: {init: X}})'
            - disable startup checks by connecting using 'skipInitChecks=true'
    `;
    super(msg);
  }
}

/**
 * Is thrown if data returned by Weaviate cannot be processed by the client.
 */
export class WeaviateDeserializationError extends WeaviateError {
  constructor(message: string) {
    super(`Converting data from Weaviate failed with message: ${message}`);
  }
}

/**
 * Is thrown if data to be sent to Weaviate cannot be processed by the client.
 */
export class WeaviateSerializationError extends WeaviateError {
  constructor(message: string) {
    super(`Converting data to Weaviate failed with message: ${message}`);
  }
}

/**
 * Is thrown if Weaviate returns an unexpected status code.
 */
export class WeaviateUnexpectedStatusCodeError extends WeaviateError {
  public code: number;
  constructor(code: number, message: string) {
    super(`The request to Weaviate failed with status code: ${code} and message: ${message}`);
    this.code = code;
  }
}

/**
 * Is thrown when a backup creation or restoration fails.
 */
export class WeaviateBackupFailed extends WeaviateError {
  constructor(message: string, kind: 'creation' | 'restoration') {
    super(`Backup ${kind} failed with message: ${message}`);
  }
}

export class WeaviateUnsupportedFeatureError extends WeaviateError {}
