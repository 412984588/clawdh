#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash "$ROOT/scripts/pack-openclaw-plugin.sh" >/dev/null
ARCHIVE="$(ls -t "$ROOT"/dist/voice-hub-openclaw-plugin-v*.tar.gz | head -n1)"

shasum -a 256 "$ARCHIVE"
tar -tzf "$ARCHIVE" | sed -n '1,40p'

echo "openclaw provenance smoke: PASS"
