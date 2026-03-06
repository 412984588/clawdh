#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/.claude/plugins"
printf '{"plugins":{}}\n' > "$TMP_DIR/.claude/plugins/registry.json"

CLAUDE_DIR="$TMP_DIR/.claude" bash "$ROOT/scripts/install-claude-plugin-local.sh"

PLUGIN_ROOT="$TMP_DIR/.claude/plugins/voice-hub"
test -f "$PLUGIN_ROOT/.claude-plugin/plugin.json"
test -f "$PLUGIN_ROOT/.claude/settings.json"
test -f "$PLUGIN_ROOT/skills/doctor/SKILL.md"
test -f "$PLUGIN_ROOT/bin/doctor.js"

echo "claude plugin install smoke: PASS"
