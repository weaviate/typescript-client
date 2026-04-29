// Test-only env-var resolution for the integration test suite.
// Hosts default to "localhost"; ports default to the previously-hardcoded
// values used by the docker-compose dev stacks.

export const TEST_HOST = process.env.WV_TEST_HOST || 'localhost';
export const TEST_REST_PORT = Number(process.env.WV_TEST_REST_PORT) || 8080;
export const TEST_GRPC_PORT = Number(process.env.WV_TEST_GRPC_PORT) || 50051;

export const TEST_AUTH_HOST = process.env.WV_TEST_AUTH_HOST || 'localhost';
export const TEST_AUTH_REST_PORT = Number(process.env.WV_TEST_AUTH_REST_PORT) || 8085;
export const TEST_AUTH_GRPC_PORT = Number(process.env.WV_TEST_AUTH_GRPC_PORT) || 50056;

export const TEST_OIDC_HOST = process.env.WV_TEST_OIDC_HOST || 'localhost';
export const TEST_OIDC_AZURE_PORT = Number(process.env.WV_TEST_OIDC_AZURE_PORT) || 8081;
export const TEST_OIDC_OKTA_CC_PORT = Number(process.env.WV_TEST_OIDC_OKTA_CC_PORT) || 8082;
export const TEST_OIDC_OKTA_USERS_PORT = Number(process.env.WV_TEST_OIDC_OKTA_USERS_PORT) || 8083;

export const TEST_RBAC_HOST = process.env.WV_TEST_RBAC_HOST || 'localhost';
export const TEST_RBAC_REST_PORT = Number(process.env.WV_TEST_RBAC_REST_PORT) || 8092;
export const TEST_RBAC_GRPC_PORT = Number(process.env.WV_TEST_RBAC_GRPC_PORT) || 50063;

export const TEST_VECTOR_HOST = process.env.WV_TEST_VECTOR_HOST || 'localhost';
export const TEST_VECTOR_REST_PORT = Number(process.env.WV_TEST_VECTOR_REST_PORT) || 8086;
export const TEST_VECTOR_GRPC_PORT = Number(process.env.WV_TEST_VECTOR_GRPC_PORT) || 50057;

export const TEST_CLUSTER_HOST = process.env.WV_TEST_CLUSTER_HOST || 'localhost';
export const TEST_CLUSTER_REST_PORT = Number(process.env.WV_TEST_CLUSTER_REST_PORT) || 8087;
export const TEST_CLUSTER_GRPC_PORT = Number(process.env.WV_TEST_CLUSTER_GRPC_PORT) || 50058;

export const TEST_BROKEN_HOST = process.env.WV_TEST_BROKEN_HOST || 'localhost';
export const TEST_BROKEN_REST_PORT = Number(process.env.WV_TEST_BROKEN_REST_PORT) || 8888;
export const TEST_BROKEN_GRPC_PORT = Number(process.env.WV_TEST_BROKEN_GRPC_PORT) || 55555;
