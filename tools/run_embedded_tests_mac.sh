#!/bin/bash

### Some tests in src/embedded/journey.test.ts
### are unsupported on Mac. This script allows
### Mac users to run these tests. 

set -euo pipefail

echo """---
services:
  embedded:
    image: node:18.15.0-buster
    volumes:
      - ../:/root/embedded
    working_dir: '/root/embedded'
    command:
      - npm
      - test
      - --
      - src/embedded/journey.test.ts
...""" > ./tools/docker-compose-embedded.yml

docker compose -f ./tools/docker-compose-embedded.yml up
echo Success!
docker compose -f ./tools/docker-compose-embedded.yml down --remove-orphans
