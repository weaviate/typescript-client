#!/bin/bash

echo "this script assumes that you have checked out weaviate next to the client"
cd "${0%/*}/.."


protoc -I ../weaviate/grpc/proto \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=./src/proto \
    --ts_proto_opt=forceLong==bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=useExactTypes=false \
    ../weaviate/grpc/proto/v1/*.proto


# sed -i ''  's/from v1/from weaviate.proto.v1/g' v1/*.py
# sed -i ''  's/from v1/from weaviate.proto.v1/g' v1/*.pyi

echo "done"
