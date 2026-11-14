#!/bin/sh
# Publish the dev-branch Pattern Maker as a hidden preview at /dev/pattern-maker.html on main (noindex, disallowed in robots.txt).
set -e
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
python3 build/preview_pm.py "$TMP/pattern-maker.html"
git stash -q -u 2>/dev/null || true
git checkout -q main && git pull -q --ff-only
mkdir -p dev && cp "$TMP/pattern-maker.html" dev/pattern-maker.html
git add dev/pattern-maker.html
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -qm "Dev preview of Pattern Maker (hidden, noindex)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013UMNDVcpPkDtf1MRjM3bUT" || true
git push -q
git checkout -q dev
git stash pop -q 2>/dev/null || true
echo "published dev/pattern-maker.html"
