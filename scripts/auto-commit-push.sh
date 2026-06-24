#!/usr/bin/env bash
# Auto commit + push the mpx-one-platform repo. Invoked by a Claude Code Stop hook
# at the end of each turn. Pushing the default branch triggers Railway auto-deploy
# (once the GitHub→Railway integration is connected per DEPLOY-RAILWAY.md).
#
# No-ops cleanly when there is nothing to commit, so it's safe to run every turn.
set -uo pipefail

# Resolve the repo root from this script's own location — no hardcoded paths,
# so the repo can be moved or cloned anywhere and the hook still works.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO" 2>/dev/null || exit 0

# Nothing changed → nothing to do.
[ -z "$(git status --porcelain)" ] && exit 0

git add -A
git commit -q -m "auto: checkpoint $(date '+%Y-%m-%d %H:%M:%S')" || exit 0
# Push to the current branch's upstream; ignore push errors (offline, etc.).
git push -q origin HEAD 2>/dev/null || true
exit 0
