#!/bin/bash

echo "this script assumes that you have checked out weaviate next to the client"
cd "${0%/*}/.."


./node_modules/.bin/grpc_tools_node_protoc -I ../weaviate/grpc/proto \
    --ts_proto_out=./src/proto \
    --ts_proto_opt=forceLong==bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    ../weaviate/grpc/proto/v1/*.proto


# sed -i ''  's/from v1/from weaviate.proto.v1/g' v1/*.py
# sed -i ''  's/from v1/from weaviate.proto.v1/g' v1/*.pyi

echo "done"
