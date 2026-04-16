#!/usr/bin/env bash
# Lint GitHub Actions workflow files to ensure all external actions are pinned to SHA hashes.
# Usage: bash tools/linter_actions_pinned.sh

set -euo pipefail

ERRORS=0

for workflow in .github/workflows/*.yaml .github/workflows/*.yml; do
    [ -f "$workflow" ] || continue

    while IFS= read -r line; do
        lineno=$(echo "$line" | cut -d: -f1)
        content=$(echo "$line" | cut -d: -f2-)

        # Extract the action reference (everything after "uses:")
        action_ref=$(echo "$content" | sed -n 's/.*uses:[[:space:]]*//p' | xargs)

        # Skip local actions (starting with ./)
        if [[ "$action_ref" == ./* ]]; then
            continue
        fi

        # Extract the version part (after @, before space or # comment)
        version=$(echo "$action_ref" | sed -n 's/.*@\([^ #]*\).*/\1/p')

        if [ -z "$version" ]; then
            echo "::error file=${workflow},line=${lineno}::Action missing version pin: ${action_ref}"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        # Check that the version is a 40-character hex SHA
        if ! echo "$version" | grep -qE '^[0-9a-f]{40}$'; then
            echo "::error file=${workflow},line=${lineno}::Action not pinned to SHA: ${action_ref} (version: ${version})"
            ERRORS=$((ERRORS + 1))
        fi
    done < <(grep -n 'uses:' "$workflow")
done

if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo "ERROR: Found ${ERRORS} action(s) not pinned to a SHA hash."
    echo "Replace tag references (e.g., @v5) with the full commit SHA (e.g., @93cb6ef...)"
    echo "Preserve the tag as a comment: uses: actions/checkout@<SHA> # v5"
    exit 1
fi

echo "All GitHub Actions are pinned to SHA hashes."
