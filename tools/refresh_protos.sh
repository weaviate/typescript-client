#!/bin/bash

branchOrTag="${1:-main}"
dir="tools"
srcDir="./packages/core/src"
mkdir -p ${dir}
curl -LkSs https://api.github.com/repos/weaviate/weaviate/tarball/${branchOrTag} -o ${dir}/weaviate.tar.gz
tar --strip-components=3 -C ${dir} -xvf ${dir}/weaviate.tar.gz $(tar -tf ${dir}/weaviate.tar.gz | grep '^weaviate-weaviate-[^/]\+/grpc/proto/v1')

./node_modules/.bin/grpc_tools_node_protoc -I ${dir} \
    --ts_proto_out=${srcDir}/proto \
    --ts_proto_opt=forceLong==bigint \
     --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    ${dir}/v1/*.proto

./node_modules/.bin/grpc_tools_node_protoc -I ${dir} \
    --ts_proto_out=${srcDir}/proto/google/health/v1 \
    --ts_proto_opt=forceLong==bigint \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    ${dir}/health.proto

rm ${dir}/weaviate.tar.gz

sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/v1/*.ts
sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/google/protobuf/struct.ts
sed -i ''  's/\"protobufjs\/minimal\"/\"protobufjs\/minimal.js\"/g' src/proto/google/health/v1/health.ts

sed -i ''  's/google\/protobuf\/struct"/google\/protobuf\/struct.js"/g' src/proto/v1/*.ts

# replace import paths
for filepath in ${dir}/v1/*; do # loops through known protos
    filename=${filepath##*/} # extract filename from path
    file=${filename%.*} # remove extension
    sed -i ''  "s/\".\/${file}\"/\".\/${file}.js\"/g" src/proto/v1/*.ts # replace import paths
    # e.g. import { Vectors } from "./base"; => import { Vectors } from "./base.js";
done

rm -rf ${dir}/v1

echo "done"
