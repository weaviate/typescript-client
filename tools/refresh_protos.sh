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


# sed -i ''  's/import * as _m0 from/import _m0 from/g' src/proto/v1/*.ts
# sed -i ''  's/import * as _m0 from/import _m0 from/g' src/proto/google/protobuf/struct.ts

sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/google/protobuf/struct.ts
sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/google/health/v1/health.ts

sed -i ''  's/google\/protobuf\/struct"/google\/protobuf\/struct.js"/g' src/proto/v1/*.ts

sed -i ''  's/\".\/base\"/\".\/base.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/batch\"/\".\/batch.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/batch_delete\"/\".\/batch_delete.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/generative\"/\".\/generative.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/properties\"/\".\/properties.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/search_get\"/\".\/search_get.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\".\/tenants\"/\".\/tenants.js\"/g' src/proto/v1/*.ts

echo "done"
