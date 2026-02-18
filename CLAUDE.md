# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Official Weaviate TypeScript/JavaScript client library. Provides a typed SDK for interacting with Weaviate vector database instances via both REST/GraphQL (HTTP/1.1) and gRPC (HTTP/2) protocols.

## Contribution Guidelines

- Develop all features in a user-centric way, prioritizing ease of use and intuitive API design. This includes:
    - not only thoughtful method naming, parameter structures, and return types,
    - but also ensuring that core implementations do not collide with user requirements.
    - E.g., any tradeoffs should be shouldered by the internal implementation rather than exposing complexity to the user.
- Follow existing code style and architecture patterns.
- Write unit tests for new logic and integration/journey tests for new features.
- Use descriptive commit messages and PR titles.
- Ensure all tests pass before merging.

## Common Commands

```bash
npm run build          # Lint + build CJS and ESM to dist/node/
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier format all source files
npm run format:check   # Prettier check (CI uses this)
npm test               # Run all tests (unit + integration + journey) via Vitest

# Run a single test file
npx vitest run path/to/file.test.ts

# Run only unit tests (no Weaviate instance needed)
npx vitest run --project unit

# Run only integration tests (requires running Weaviate)
npx vitest run --project integration

# Run only journey tests (requires running Weaviate)
npx vitest run --project journey
```

Integration and journey tests require a running Weaviate instance (default: `localhost:8080` for REST, `localhost:50051` for gRPC). CI uses `ci/run_dependencies.sh <version>` to start Weaviate via Docker Compose. The `WEAVIATE_VERSION` env var gates version-specific tests via `test/version.ts` helpers (`requireAtLeast`).

## Architecture

### Dual API Surface (v2 and v3)

- **v3 API** (`src/index.ts`): Current collection-oriented API. Entry points are `connectToLocal()`, `connectToWeaviateCloud()`, `connectToCustom()`. Returns a `WeaviateClient` with namespaces: `collections`, `backup`, `cluster`, `roles`, `users`, `groups`, `alias`.
- **v2 API** (`src/v2/index.ts`): Legacy builder-pattern API exported as `weaviateV2`. Uses `schema`, `data`, `graphql`, `batch`, `classifications`, `c11y` namespaces. Still maintained but deprecated for new use.

### Connection Layer (`src/connection/`)

Three-tier inheritance: `ConnectionREST` (`http.ts`) → `ConnectionGQL` (`gql.ts`) → `ConnectionGRPC` (`grpc.ts`). The top-level client always creates a `ConnectionGRPC` which inherits REST and GraphQL capabilities. Connection setup handles auth (API key, OIDC, client credentials), proxies, and timeouts.

### Collections Layer (`src/collections/`)

The v3 API's core. `collections/index.ts` manages CRUD for collections. `collections/collection/index.ts` creates per-collection objects with sub-namespaces:
- **query/**: Search operations (BM25, hybrid, nearVector, nearText, nearImage, etc.)
- **generate/**: RAG/generative search operations
- **aggregate/**: Aggregation queries
- **data/**: CRUD operations on objects within a collection
- **config/**: Collection configuration management
- **configure/**: Builder helpers for creating collection configs (vectorizers, generative, reranker, vector index)
- **tenants/**: Multi-tenancy management
- **filters/**, **sort/**, **references/**, **iterator/**, **vectors/**: Supporting utilities

### Serialization/Deserialization (`src/collections/serialize/`, `src/collections/deserialize/`)

Translate between the client's TypeScript types and Weaviate's gRPC protobuf messages. `Serialize` converts query parameters into protobuf request objects. `Deserialize` converts gRPC responses back into typed client objects.

### gRPC Layer (`src/grpc/`)

Thin wrappers around generated protobuf clients for search, batch, tenants, and aggregation operations. Uses `nice-grpc` with retry middleware.

### Generated Code

- `src/proto/`: Auto-generated protobuf TypeScript types (refreshed via `npm run refresh-protos`). Do not edit manually.
- `src/openapi/`: Auto-generated OpenAPI types (refreshed via `npm run refresh-schema`). Do not edit manually.

### Legacy Modules (`src/batch/`, `src/data/`, `src/graphql/`, `src/schema/`)

Used by both v2 API directly and v3 API internally (e.g., `ClassCreator`, `ClassDeleter`, `SchemaGetter` are used by `collections/index.ts`).

## Test Structure

Tests use Vitest with three project configurations defined in `vitest.config.ts`:
- **unit** (`src/**/unit.test.ts`): Pure logic tests, no Weaviate instance needed.
- **integration** (`test/**/integration.test.ts`, `test/**/mock.test.ts`): Require a running Weaviate instance.
- **journey** (`test/**/journey.test.ts`): End-to-end tests requiring a running Weaviate instance.

Test timeout is 100 seconds. Tests run sequentially (`--no-file-parallelism`).

## Key Conventions

- All internal imports use explicit `.js` extensions (ESM convention, resolved via Vitest alias).
- The build produces both CJS (`dist/node/cjs/`) and ESM (`dist/node/esm/`) outputs.
- TypeScript strict mode is enabled.
- Naming convention enforced by ESLint: `camelCase`, `UPPER_CASE`, or `PascalCase` for identifiers; properties are unrestricted.
- Collection names are auto-capitalized (first letter) before being sent to Weaviate.
- Heavy use of generics throughout the collections API for type-safe property access (`TProperties`, `TVectors`, `TName`).
