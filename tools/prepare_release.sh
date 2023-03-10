#!/bin/bash

set -euo pipefail

VERSION=${1-}
REQUIRED_TOOLS="jq git"

if test -z "$VERSION"; then
  echo "Missing version parameter. Usage: $0 VERSION"
  exit 1
fi

if case $VERSION in v*) false;; esac; then
  VERSION="v$VERSION"
fi

for tool in $REQUIRED_TOOLS; do
  if ! hash "$tool" 2>/dev/null; then
    echo "This script requires '$tool', but it is not installed."
    exit 1
  fi
done

if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "Cannot prepare release, a release for $VERSION already exists"
  exit 1
fi

npm version "${VERSION/v}"
