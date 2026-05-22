#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script inside the dignity.js git repository."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

if git show-ref --verify --quiet refs/heads/docs; then
  echo "Branch docs already exists."
else
  git branch docs
  echo "Created branch docs from ${CURRENT_BRANCH}."
fi

echo
echo "Next steps:"
echo "1. Commit library + docs changes on ${CURRENT_BRANCH}"
echo "2. git push origin docs"
echo "3. Remove docs from main:"
echo "   git checkout main"
echo "   git rm -r docs"
echo "   git commit -m \"Move documentation site to docs branch\""
echo "4. Configure GitHub Pages to publish from branch docs / folder /docs"
echo
echo "To work on docs only:"
echo "   git checkout docs"
