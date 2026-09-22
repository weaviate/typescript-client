#!/bin/bash

set -euo pipefail
export LC_ALL=C
cd "$(dirname "$0")/.."

branchOrTag="${1:-main}"
protoc="./node_modules/.bin/grpc_tools_node_protoc"
plugin="./node_modules/.bin/protoc-gen-ts_proto"

if [[ ! -x "$plugin" ]]; then
    echo "Missing ts-proto: run pnpm install at the repository root." >&2
    exit 1
fi
if ! "$protoc" --version >/dev/null 2>&1; then
    echo "Missing protoc binary: run pnpm install, then pnpm rebuild grpc-tools." >&2
    exit 1
fi

tmpDir=$(mktemp -d)
trap 'rm -rf "$tmpDir"' EXIT
curl -fLSs "https://api.github.com/repos/weaviate/weaviate/tarball/${branchOrTag}" -o "$tmpDir/weaviate.tar.gz"
protoDir=$(tar -tf "$tmpDir/weaviate.tar.gz" | grep -E '^[^/]+/grpc/proto/v1/$')
tar --strip-components=3 -C "$tmpDir" -xf "$tmpDir/weaviate.tar.gz" "$protoDir"

mkdir -p "$tmpDir/generated/google/health/v1"
options=(
    "--plugin=protoc-gen-ts_proto=$plugin"
    --ts_proto_opt=forceLong=number
    --ts_proto_opt=esModuleInterop=true
    --ts_proto_opt=importSuffix=.js
    --ts_proto_opt=env=both,outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false
)
"$protoc" -I "$tmpDir" "${options[@]}" \
    --ts_proto_out="$tmpDir/generated" "$tmpDir"/v1/*.proto
"$protoc" -I tools "${options[@]}" \
    --ts_proto_out="$tmpDir/generated/google/health/v1" tools/health.proto

# Preserve the existing sources if either generator fails.
cp -R "$tmpDir/generated/." packages/core/src/proto/

echo "done"
