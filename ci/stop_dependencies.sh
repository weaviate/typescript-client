#!/bin/bash

. ./ci/compose.sh

compose_down_all
rm -rf weaviate-data || true
