#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

test -f "$ROOT/packages/claude-marketplace/bin/doctor.js"
test -f "$ROOT/packages/claude-marketplace/bin/provider-matrix.js"
test -f "$ROOT/packages/claude-marketplace/bin/run-dev.js"

node "$ROOT/apps/bridge-daemon/dist/cli.js" provider list >/dev/null

echo "claude plugin dev smoke: PASS"
