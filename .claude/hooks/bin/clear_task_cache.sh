#!/bin/bash
# Clear oh-my-claudecode task cache
# Removes stale todos.json files that cause phantom task count prompts
#
# Usage: ~/.claude/hooks/bin/clear_task_cache.sh [--dry-run]
#
# Source: oh-my-claudecode pre-tool-enforcer reads from:
#   - ~/.claude/todos/*.json (global)
#   - <project>/.omc/todos.json (local)
#   - <project>/.claude/todos.json (local)

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "[DRY RUN] Would delete the following files:"
fi

GLOBAL_TODOS_DIR="$HOME/.claude/todos"
deleted_count=0

# Clear global todos
if [[ -d "$GLOBAL_TODOS_DIR" ]]; then
    file_count=$(find "$GLOBAL_TODOS_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$file_count" -gt 0 ]]; then
        if $DRY_RUN; then
            echo "  $GLOBAL_TODOS_DIR/*.json ($file_count files)"
        else
            rm -f "$GLOBAL_TODOS_DIR"/*.json 2>/dev/null || true
            echo "Cleared $file_count files from $GLOBAL_TODOS_DIR"
        fi
        deleted_count=$((deleted_count + file_count))
    fi
fi

# Clear local project todos (current directory)
for local_path in ".omc/todos.json" ".claude/todos.json"; do
    if [[ -f "$local_path" ]]; then
        if $DRY_RUN; then
            echo "  $(pwd)/$local_path"
        else
            rm -f "$local_path"
            echo "Cleared $local_path"
        fi
        deleted_count=$((deleted_count + 1))
    fi
done

if [[ $deleted_count -eq 0 ]]; then
    echo "No task cache files found."
else
    if $DRY_RUN; then
        echo "[DRY RUN] Total: $deleted_count files would be deleted"
    else
        echo "Done. Cleared $deleted_count task cache files."
        echo "Phantom task count prompt should be gone in new sessions."
    fi
fi
