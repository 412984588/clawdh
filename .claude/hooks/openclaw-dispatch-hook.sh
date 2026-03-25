#!/usr/bin/env bash
set -euo pipefail

# Claude hook -> OpenClaw zero-poll bridge
# Writes latest.json/history.jsonl and sends gateway wake event.

OUT_DIR="${HOME}/.openclaw-gateway/workspace/ops/claude-dispatch"
mkdir -p "$OUT_DIR"

LATEST="$OUT_DIR/latest.json"
HISTORY="$OUT_DIR/history.jsonl"

# Non-blocking stdin read: avoid hanging when no payload is piped into hook
PAYLOAD="$(python3 - <<'PY'
import sys, select
payload = ''
try:
    r, _, _ = select.select([sys.stdin], [], [], 0.05)
    if r:
        payload = sys.stdin.read()
except Exception:
    payload = ''
print(payload, end='')
PY
)"
NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

python3 - "$PAYLOAD" "$NOW_ISO" "$LATEST" "$HISTORY" <<'PY'
import json, os, sys
payload_raw, now_iso, latest, history = sys.argv[1:]
obj = {}
if payload_raw.strip():
    try:
        obj = json.loads(payload_raw)
    except Exception:
        obj = {"raw": payload_raw[:20000]}

# Best-effort event extraction (different Claude versions may differ)
def get_nested(d, *path):
    cur = d
    for p in path:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return None
    return cur

event = (
    get_nested(obj, "event", "type")
    or obj.get("event")
    or os.environ.get("CLAUDE_HOOK_EVENT")
    or os.environ.get("HOOK_EVENT_NAME")
    or "unknown"
)

session_id = (
    get_nested(obj, "session", "id")
    or obj.get("session_id")
    or os.environ.get("CLAUDE_SESSION_ID")
    or "unknown"
)

cwd = (
    obj.get("cwd")
    or os.environ.get("CLAUDE_PROJECT_DIR")
    or os.getcwd()
)

output = (
    obj.get("output")
    or get_nested(obj, "result", "output")
    or get_nested(obj, "message")
    or ""
)

status = obj.get("status") or ("done" if event in ("Stop", "SessionEnd") else "event")

record = {
    "timestamp": now_iso,
    "event": event,
    "session_id": session_id,
    "cwd": cwd,
    "status": status,
    "output": str(output)[-20000:],
    "raw": obj if obj else None,
}

with open(latest, "w", encoding="utf-8") as f:
    json.dump(record, f, ensure_ascii=False, indent=2)
with open(history, "a", encoding="utf-8") as f:
    f.write(json.dumps(record, ensure_ascii=False) + "\n")

print(json.dumps({"ok": True, "event": event, "session_id": session_id}, ensure_ascii=False))
PY

if command -v openclaw >/dev/null 2>&1; then
  MSG="Claude hook event captured. Read: ops/claude-dispatch/latest.json"
  openclaw gateway wake --text "$MSG" --mode now >/dev/null 2>&1 || true
fi

echo "[openclaw-dispatch-hook] ok"
