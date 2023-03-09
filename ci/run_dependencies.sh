#!/bin/bash

. ./ci/compose.sh

echo "Stop existing session if running"
compose_down_all
rm -rf weaviate-data || true

echo "Run Docker compose"
compose_up_all

echo "Wait until weaviate is up"

for port in $(all_weaviate_ports); do
   # pulling all images usually takes < 3 min
  # starting weaviate usually takes < 2 min
  i="0"
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" localhost:"$port"/v1/.well-known/ready)

  while [ "$STATUS_CODE" -ne 200 ]; do
    i=$(($i+5))
    echo "Sleep $i"
    sleep 5
    if [ $i -gt 300 ]; then
      echo "Weaviate did not start in time"
      exit 1
    fi
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" localhost:"$port"/v1/.well-known/ready)
  done
  echo "Weaviate on port $port is up and running"
done
