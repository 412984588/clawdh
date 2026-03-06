#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/.openclaw/plugins"
printf '{"plugins":{}}\n' > "$TMP_DIR/.openclaw/plugins/manifest.json"

OPENCLAW_DIR="$TMP_DIR/.openclaw" bash "$ROOT/scripts/install-openclaw-local.sh"

test -f "$TMP_DIR/.openclaw/plugins/voice-hub/openclaw.plugin.json"
test -f "$TMP_DIR/.openclaw/plugins/voice-hub/package.json"
test -f "$TMP_DIR/.openclaw/plugins/voice-hub/src/index.js"
test -f "$TMP_DIR/.openclaw/plugins/voice-hub/dist/index.js"

echo "openclaw install smoke: PASS"
