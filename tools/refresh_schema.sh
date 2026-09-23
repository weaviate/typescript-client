#!/bin/bash

set -euo pipefail

branchOrTag="${1:-main}"
srcDir="./packages/core/src"
npx openapi-typescript https://raw.githubusercontent.com/weaviate/weaviate/${branchOrTag}/openapi-specs/schema.json -o ${srcDir}/openapi/schema.ts
npx prettier --write --no-error-on-unmatched-pattern '${srcDir}/openapi/schema.ts'
