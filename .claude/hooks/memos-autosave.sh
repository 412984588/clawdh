#!/bin/bash
# Auto-save AWS Code conversations to MemOS

MEMOS_API="http://localhost:8000/product/add"
USER_ID="openclaw-main"

# Get the last interaction from stdin
INTERACTION=$(cat)

# Save to MemOS (silent, don't block)
curl -s -X POST "$MEMOS_API" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"messages\":[{\"role\":\"user\",\"content\":\"AWS Code: $INTERACTION\"}]}" \
  > /dev/null 2>&1 &

exit 0
