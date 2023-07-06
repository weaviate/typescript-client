#!/usr/bin/env bash

set -eou pipefail

source ./ci/compose.sh

compose_down_all
rm -rf weaviate-data || true
