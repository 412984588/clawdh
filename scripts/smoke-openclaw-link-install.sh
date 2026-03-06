#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/.openclaw/plugins"
printf '{"plugins":{}}\n' > "$TMP_DIR/.openclaw/plugins/manifest.json"

OPENCLAW_DIR="$TMP_DIR/.openclaw" bash "$ROOT/scripts/install-openclaw-local.sh"

PLUGIN_ROOT="$TMP_DIR/.openclaw/plugins/voice-hub"
node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('$PLUGIN_ROOT/package.json','utf8')); if(!pkg['openclaw.extensions']) process.exit(1);"

echo "openclaw link-install smoke: PASS"
