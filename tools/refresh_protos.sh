#!/bin/bash

echo "this script assumes that you have checked out weaviate next to the client"
cd "${0%/*}/.."


./node_modules/.bin/grpc_tools_node_protoc -I ../weaviate/grpc/proto \
    --ts_proto_out=./src/proto \
    --ts_proto_opt=forceLong==bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    ../weaviate/grpc/proto/v1/*.proto

./node_modules/.bin/grpc_tools_node_protoc -I ./tools \
    --ts_proto_out=./src/proto/google/health/v1 \
    --ts_proto_opt=forceLong==bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    ./tools/health.proto


sed -i ''  's/import _m0 from/import * as _m0 from/g' src/proto/v1/*.ts
sed -i ''  's/import _m0 from/import * as _m0 from/g' src/proto/google/protobuf/struct.ts

echo "done"
