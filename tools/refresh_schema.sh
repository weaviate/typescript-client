#!/bin/bash

set -euo pipefail

branchOrTag="${1:-main}"
npx openapi-typescript https://raw.githubusercontent.com/weaviate/weaviate/${branchOrTag}/openapi-specs/schema.json -o ./src/openapi/schema.ts
npx prettier --write --no-error-on-unmatched-pattern './src/openapi/schema.ts'
