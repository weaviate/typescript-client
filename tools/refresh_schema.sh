#!/bin/bash

set -euo pipefail

var="${1:-master}"
npx openapi-typescript https://raw.githubusercontent.com/weaviate/weaviate/${var}/openapi-specs/schema.json -o ./src/openapi/schema.ts
npx prettier --write --no-error-on-unmatched-pattern './src/openapi/schema.ts'
