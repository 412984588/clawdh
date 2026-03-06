#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

bash "$ROOT/scripts/pack-openclaw-plugin.sh" >/dev/null
ARCHIVE="$(ls -t "$ROOT"/dist/voice-hub-openclaw-plugin-v*.tar.gz | head -n1)"

tar -xzf "$ARCHIVE" -C "$TMP_DIR"
EXTRACTED="$(find "$TMP_DIR" -maxdepth 1 -type d -name 'voice-hub-openclaw-plugin-v*' | head -n1)"

test -f "$EXTRACTED/openclaw.plugin.json"
test -f "$EXTRACTED/package.json"
test -f "$EXTRACTED/src/index.js"
test -f "$EXTRACTED/dist/index.js"

echo "openclaw archive-install smoke: PASS"
