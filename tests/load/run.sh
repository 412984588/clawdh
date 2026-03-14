#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/tests/load/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$RESULTS_DIR"

BASE_URL="${BASE_URL:-http://localhost:8911}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-test-secret}"
DURATION="${DURATION:-default}"

export BASE_URL BACKEND_URL WEBHOOK_SECRET

run_test() {
  local test_name="$1"
  local test_file="$2"
  local output_file="$RESULTS_DIR/${TIMESTAMP}_${test_name}.json"

  echo "Running: $test_name"

  if k6 run --out json="$output_file" "$test_file" 2>&1 | tee "$RESULTS_DIR/${TIMESTAMP}_${test_name}.log"; then
    echo "✓ $test_name completed"
  else
    echo "✗ $test_name failed"
    return 1
  fi
}

main() {
  echo "=== Voice Hub Load Test Suite ==="
  echo "Base URL: $BASE_URL"
  echo "Backend URL: $BACKEND_URL"
  echo "Timestamp: $TIMESTAMP"
  echo ""

  failed=0

  run_test "health" "$SCRIPT_DIR/scenarios/health.js" || failed=$((failed + 1))
  run_test "sessions" "$SCRIPT_DIR/scenarios/sessions.js" || failed=$((failed + 1))
  run_test "webhooks" "$SCRIPT_DIR/scenarios/webhooks.js" || failed=$((failed + 1))
  run_test "tts" "$SCRIPT_DIR/scenarios/tts.js" || failed=$((failed + 1))
  run_test "audio" "$SCRIPT_DIR/scenarios/audio.js" || failed=$((failed + 1))
  run_test "backend" "$SCRIPT_DIR/backend.js" || failed=$((failed + 1))

  if [ "$DURATION" = "full" ]; then
    run_test "smoke" "$SCRIPT_DIR/smoke.js" || failed=$((failed + 1))
    run_test "stress" "$SCRIPT_DIR/stress.js" || failed=$((failed + 1))
  fi

  echo ""
  echo "=== Summary ==="
  echo "Results saved to: $RESULTS_DIR"
  echo "Failed tests: $failed"

  if [ $failed -gt 0 ]; then
    exit 1
  fi
}

case "${1:-all}" in
  health)
    run_test "health" "$SCRIPT_DIR/scenarios/health.js"
    ;;
  sessions)
    run_test "sessions" "$SCRIPT_DIR/scenarios/sessions.js"
    ;;
  webhooks)
    run_test "webhooks" "$SCRIPT_DIR/scenarios/webhooks.js"
    ;;
  smoke)
    run_test "smoke" "$SCRIPT_DIR/smoke.js"
    ;;
  stress)
    run_test "stress" "$SCRIPT_DIR/stress.js"
    ;;
  backend)
    run_test "backend" "$SCRIPT_DIR/backend.js"
    ;;
  all)
    main
    ;;
  *)
    echo "Usage: $0 [health|sessions|webhooks|smoke|stress|backend|all]"
    exit 1
    ;;
esac
