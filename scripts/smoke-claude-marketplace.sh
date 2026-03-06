#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node <<'EOF'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'packages/claude-marketplace/package.json'), 'utf8'));
const plugin = JSON.parse(fs.readFileSync(path.join(root, 'packages/claude-marketplace/.claude-plugin/plugin.json'), 'utf8'));
if (pkg.version !== plugin.version) {
  throw new Error(`version mismatch: package=${pkg.version} plugin=${plugin.version}`);
}
EOF

echo "claude marketplace smoke: PASS"
