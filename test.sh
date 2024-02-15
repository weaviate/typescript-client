#!/usr/bin/env bash
source ~/.bash_profile

export OPENAI_APIKEY=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

# ci/run_dependencies.sh $2
npm run test -- $1
# ci/stop_dependencies.sh $2
