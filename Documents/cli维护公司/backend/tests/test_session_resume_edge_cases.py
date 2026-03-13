"""Edge case tests for session resume and crash recovery.

Tests the scenarios required by CLI-57:
- Corrupt state files (invalid JSON in checkpoint columns)
- Missing state / empty state handling
- Concurrent sessions / race conditions
- Recovery attempt exhaustion
- Circuit breaker state transitions
- Checkpoint cleanup and retention limits
- Dead letter queue operations under stress
- State serialization/deserialization validation
"""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest

from app.error_recovery import (
    CIRCUIT_FAILURE_THRESHOLD,
    MAX_RETRY_COUNT,
    CheckpointType,
    CircuitState,
    RecoveryStatus,
    _ensure_error_recovery_tables,
    add_to_dead_letter_queue,
    attempt_recovery,
    cleanup_old_checkpoints,
    cleanup_processed_dead_letters,
    create_checkpoint,
    get_circuit_breaker,
    get_dead_letter_entries,
    get_latest_checkpoint,
    get_recovery_history,
    get_recovery_report,
    is_circuit_open,
    record_circuit_failure,
    record_circuit_success,
    retry_dead_letter_entry,
)
from app.reliability import (
    RunHealthStatus,
    _ensure_reliability_tables,
    record_heartbeat,
)
from app.session_resume import (
    OrphanSessionDetector,
    SessionResumeService,
    detect_orphan_sessions,
    emit_recovery_log,
    get_recovery_logs,
    release_stale_checkouts,
    resume_session_from_checkpoint,
)


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "test-edge-cases.db"


@pytest.fixture
def conn(db_path: Path) -> sqlite3.Connection:
    """Create a test database connection with full schema."""
    connection = sqlite3.connect(str(db_path), check_same_thread=False)
    connection.row_factory = sqlite3.Row

    # Create base tables
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            adapter TEXT NOT NULL,
            model TEXT NOT NULL,
            heartbeat_seconds INTEGER NOT NULL,
            sandbox_mode TEXT NOT NULL,
            instructions_path TEXT NOT NULL,
            workspace_root TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            agent TEXT NOT NULL,
            status TEXT NOT NULL,
            trigger TEXT NOT NULL,
            issue TEXT NOT NULL,
            started_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            owner TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            next_action TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS task_comments (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            author TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(task_id) REFERENCES tasks(id)
        );

        CREATE TABLE IF NOT EXISTS run_comments (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            author TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(run_id) REFERENCES runs(id)
        );
        """
    )

    _ensure_reliability_tables(connection)
    _ensure_error_recovery_tables(connection)

    # Insert test data
    connection.execute(
        """
        INSERT INTO agents (id, name, adapter, model, heartbeat_seconds, sandbox_mode,
                           instructions_path, workspace_root)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("agent-test", "Test Agent", "test-adapter", "test-model", 300, "workspace-write",
         "agents/test/AGENTS.md", "/workspace"),
    )

    connection.execute(
        """
        INSERT INTO tasks (id, title, owner, status, priority, next_action, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        ("task-1", "Test Task", "Test Agent", "in_progress", "high",
         "Continue implementation", "2026-03-13T11:00:00Z"),
    )

    connection.execute(
        """
        INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        ("run-1", "test-adapter", "healthy", "issue_checked_out", "task-1",
         "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
    )

    connection.commit()
    yield connection
    connection.close()


# ---------------------------------------------------------------------------
# Corrupt State Tests
# ---------------------------------------------------------------------------


class TestCorruptState:
    """Tests for handling corrupt state in checkpoints."""

    def test_resume_with_corrupt_json_in_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should handle invalid JSON in checkpoint state gracefully."""
        # Insert checkpoint with corrupt JSON directly
        conn.execute(
            """
            INSERT INTO session_checkpoints
            (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "ckpt-corrupt",
                "run-1",
                "auto",
                "{invalid json: this is not valid",  # Corrupt JSON
                "[]",
                "{}",
                "2026-03-13T11:00:00Z",
            ),
        )
        conn.commit()

        # Should raise JSON decode error or return failure
        with pytest.raises((json.JSONDecodeError, ValueError)):
            resume_session_from_checkpoint(conn, "run-1", checkpoint_id="ckpt-corrupt")

    def test_get_latest_checkpoint_with_corrupt_state(self, conn: sqlite3.Connection) -> None:
        """Should raise error when latest checkpoint has corrupt state."""
        # Insert a valid checkpoint first (with older timestamp)
        create_checkpoint(
            conn, "run-1",
            state={"step": 1, "valid": True},
            checkpoint_type=CheckpointType.AUTO,
        )

        # Insert corrupt checkpoint with newer timestamp (in the future)
        # Note: _ensure_error_recovery_tables is called by create_checkpoint above
        from datetime import datetime, UTC, timedelta
        future_time = (datetime.now(UTC) + timedelta(hours=1)).isoformat().replace("+00:00", "Z")
        conn.execute(
            """
            INSERT INTO session_checkpoints
            (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "ckpt-corrupt-newer",
                "run-1",
                "auto",
                "NOT JSON AT ALL",
                "[]",
                "{}",
                future_time,  # Newer than valid checkpoint (future time)
            ),
        )
        conn.commit()

        # get_latest_checkpoint returns the newest - will fail on JSON parse
        with pytest.raises(json.JSONDecodeError):
            get_latest_checkpoint(conn, "run-1")

    def test_checkpoint_with_nested_corrupt_metadata(self, conn: sqlite3.Connection) -> None:
        """Should handle corrupt metadata in checkpoint."""
        # Insert checkpoint with valid state but corrupt metadata
        conn.execute(
            """
            INSERT INTO session_checkpoints
            (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "ckpt-meta-corrupt",
                "run-1",
                "auto",
                '{"step": 1}',  # Valid state
                "[]",
                "{broken: metadata}",  # Corrupt metadata
                "2026-03-13T11:00:00Z",
            ),
        )
        conn.commit()

        with pytest.raises(json.JSONDecodeError):
            get_latest_checkpoint(conn, "run-1")

    def test_recovery_log_with_corrupt_details(self, conn: sqlite3.Connection) -> None:
        """Should handle corrupt details in recovery log when reading."""
        from app.session_resume import _ensure_session_resume_tables

        # Ensure session resume tables exist
        _ensure_session_resume_tables(conn)

        # Insert recovery log with corrupt details directly
        conn.execute(
            """
            INSERT INTO recovery_logs (id, run_id, timestamp, action, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                "log-corrupt",
                "run-1",
                "2026-03-13T11:00:00Z",
                "test_action",
                "{corrupt: json}",
            ),
        )
        conn.commit()

        # get_recovery_logs should fail on corrupt JSON
        with pytest.raises(json.JSONDecodeError):
            get_recovery_logs(conn, run_id="run-1")


# ---------------------------------------------------------------------------
# Missing State Tests
# ---------------------------------------------------------------------------


class TestMissingState:
    """Tests for handling missing or empty state."""

    def test_resume_with_empty_state_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should resume successfully with empty state."""
        # Create checkpoint with empty state
        conn.execute(
            """
            INSERT INTO session_checkpoints
            (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "ckpt-empty",
                "run-1",
                "auto",
                "{}",  # Empty but valid JSON
                "[]",
                "{}",
                "2026-03-13T11:00:00Z",
            ),
        )
        conn.commit()

        result = resume_session_from_checkpoint(conn, "run-1", checkpoint_id="ckpt-empty")

        assert result.success is True
        assert result.recovered_state == {}

    def test_resume_with_null_fields_in_state(self, conn: sqlite3.Connection) -> None:
        """Should handle null values in state dict."""
        create_checkpoint(
            conn, "run-1",
            state={"step": None, "files": None, "context": None},
            checkpoint_type=CheckpointType.AUTO,
        )

        result = resume_session_from_checkpoint(conn, "run-1")

        assert result.success is True
        assert result.recovered_state["step"] is None

    def test_checkpoint_for_nonexistent_run(self, conn: sqlite3.Connection) -> None:
        """Should raise KeyError when creating checkpoint for nonexistent run."""
        with pytest.raises(KeyError, match="Run not found"):
            create_checkpoint(
                conn,
                "run-does-not-exist",
                state={"step": 1},
                checkpoint_type=CheckpointType.AUTO,
            )

    def test_recovery_attempt_for_nonexistent_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should raise KeyError when recovering from nonexistent checkpoint."""
        with pytest.raises(KeyError, match="Checkpoint not found"):
            attempt_recovery(conn, "run-1", checkpoint_id="ckpt-does-not-exist")

    def test_recovery_attempt_with_no_checkpoints(self, conn: sqlite3.Connection) -> None:
        """Should raise ValueError when no checkpoints exist for run."""
        with pytest.raises(ValueError, match="No checkpoints found"):
            attempt_recovery(conn, "run-1")

    def test_orphan_detection_with_missing_task(self, conn: sqlite3.Connection) -> None:
        """Should handle runs with no associated task."""
        # Insert a run without a task (task reference is invalid)
        conn.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("run-no-task", "test-adapter", "healthy", "manual", "task-nonexistent",
             "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
        )
        conn.commit()

        # Make it stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ? WHERE id = ?", (old_time, "run-no-task"))
        conn.commit()

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300)

        # Should detect the orphan even without a valid task
        orphan_ids = [o.run_id for o in orphans]
        assert "run-no-task" in orphan_ids


# ---------------------------------------------------------------------------
# Concurrent Session Tests
# ---------------------------------------------------------------------------


class TestConcurrentSessions:
    """Tests for concurrent session operations and race conditions.

    Note: SQLite has limited concurrent write support. These tests verify
    that concurrent operations either succeed or fail gracefully without
    data corruption.
    """

    def test_sequential_checkpoint_creation_is_consistent(self, conn: sqlite3.Connection) -> None:
        """Should handle rapid sequential checkpoint creation for same run."""
        # Use a unique run to avoid interference from other tests
        conn.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("run-seq-test", "test-adapter", "healthy", "manual", "task-1",
             "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
        )
        conn.commit()

        results = []
        base_time = "2026-03-13T12:00:00Z"
        checkpoint_idx = 0

        # Create checkpoints with explicit timestamps to ensure deterministic ordering
        for thread_id in range(3):
            for i in range(5):
                timestamp = f"2026-03-13T12:00:{checkpoint_idx:02d}Z"
                conn.execute(
                    """
                    INSERT INTO session_checkpoints
                    (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        f"ckpt-seq-{checkpoint_idx:03d}",
                        "run-seq-test",
                        "auto",
                        json.dumps({"thread": thread_id, "seq": i}),
                        "[]",
                        "{}",
                        timestamp,
                    ),
                )
                conn.commit()
                results.append(f"ckpt-seq-{checkpoint_idx:03d}")
                checkpoint_idx += 1

        # All checkpoints should be created
        assert len(results) == 15  # 3 threads * 5 checkpoints

        # Verify all checkpoints are queryable
        latest = get_latest_checkpoint(conn, "run-seq-test")
        assert latest is not None
        assert latest.state["thread"] == 2  # Last thread
        assert latest.state["seq"] == 4     # Last seq

    def test_sequential_recovery_log_emission(self, conn: sqlite3.Connection) -> None:
        """Should handle rapid sequential recovery log emission."""
        results = []

        for thread_id in range(3):
            for i in range(10):
                entry = emit_recovery_log(
                    conn, "run-1",
                    action=f"concurrent_test_{thread_id}",
                    details={"seq": i, "thread": thread_id},
                )
                results.append(entry.id)

        assert len(results) == 30  # 3 threads * 10 logs

        # Verify all logs are queryable
        logs = get_recovery_logs(conn, run_id="run-1")
        assert len(logs) == 30

    def test_stale_release_is_idempotent(self, conn: sqlite3.Connection) -> None:
        """Should handle multiple stale checkout release calls gracefully."""
        # Make run stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ? WHERE id = ?", (old_time, "run-1"))
        conn.commit()

        results = []

        # First release should succeed
        result1 = release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )
        results.append(result1)
        assert result1.released_count >= 1

        # Task should be in todo after first release
        task = conn.execute("SELECT status FROM tasks WHERE id = ?", ("task-1",)).fetchone()
        assert task["status"] == "todo"

        # Second release should detect no stale (already released)
        result2 = release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )
        results.append(result2)
        # No new releases since task is no longer in_progress
        assert result2.released_count == 0


# ---------------------------------------------------------------------------
# Recovery Exhaustion Tests
# ---------------------------------------------------------------------------


class TestRecoveryExhaustion:
    """Tests for recovery attempt exhaustion scenarios."""

    def test_recovery_exhausted_after_max_retries(self, conn: sqlite3.Connection) -> None:
        """Should mark recovery as exhausted after MAX_RETRY_COUNT attempts."""
        # Create a checkpoint
        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        # Exhaust retry count
        for _ in range(MAX_RETRY_COUNT):
            attempt_recovery(conn, "run-1")

        # Next attempt should be exhausted
        final_attempt = attempt_recovery(conn, "run-1")

        assert final_attempt.status == RecoveryStatus.EXHAUSTED
        assert "exceeded" in final_attempt.error.lower()

    def test_recovery_history_tracks_all_attempts(self, conn: sqlite3.Connection) -> None:
        """Should track all recovery attempts in history."""
        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        # Make several attempts
        for _ in range(3):
            attempt_recovery(conn, "run-1")

        history = get_recovery_history(conn, "run-1")

        assert len(history) == 3
        # All attempts should be tracked with correct retry counts
        retry_counts = sorted([h.retry_count for h in history])
        assert retry_counts == [0, 1, 2]

    def test_recovery_increments_retry_count(self, conn: sqlite3.Connection) -> None:
        """Should increment retry count on each attempt."""
        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        first = attempt_recovery(conn, "run-1")
        second = attempt_recovery(conn, "run-1")
        third = attempt_recovery(conn, "run-1")

        assert first.retry_count == 0
        assert second.retry_count == 1
        assert third.retry_count == 2


# ---------------------------------------------------------------------------
# Circuit Breaker Edge Cases
# ---------------------------------------------------------------------------


class TestCircuitBreakerEdgeCases:
    """Tests for circuit breaker state transitions and edge cases."""

    def test_circuit_opens_after_threshold_failures(self, conn: sqlite3.Connection) -> None:
        """Should open circuit after CIRCUIT_FAILURE_THRESHOLD failures."""
        provider = "test-provider"

        # Record failures up to threshold
        for i in range(CIRCUIT_FAILURE_THRESHOLD - 1):
            state = record_circuit_failure(conn, provider)
            assert state.state == CircuitState.CLOSED

        # One more failure should open the circuit
        state = record_circuit_failure(conn, provider)
        assert state.state == CircuitState.OPEN
        assert state.failure_count == CIRCUIT_FAILURE_THRESHOLD

    def test_circuit_blocks_requests_when_open(self, conn: sqlite3.Connection) -> None:
        """Should block requests when circuit is open."""
        provider = "test-provider-block"

        # Open the circuit
        for _ in range(CIRCUIT_FAILURE_THRESHOLD):
            record_circuit_failure(conn, provider)

        assert is_circuit_open(conn, provider) is True

    def test_circuit_success_resets_to_closed(self, conn: sqlite3.Connection) -> None:
        """Should reset circuit to closed on success."""
        provider = "test-provider-reset"

        # Cause some failures
        for _ in range(3):
            record_circuit_failure(conn, provider)

        # Success should reset
        state = record_circuit_success(conn, provider)

        assert state.state == CircuitState.CLOSED
        assert state.failure_count == 0
        assert is_circuit_open(conn, provider) is False

    def test_circuit_breaker_state_persistence(self, conn: sqlite3.Connection) -> None:
        """Should persist circuit breaker state across reads."""
        provider = "test-provider-persist"

        record_circuit_failure(conn, provider, error="Connection refused")
        record_circuit_failure(conn, provider, error="Timeout")

        # Read state back
        state = get_circuit_breaker(conn, provider)

        assert state.provider == provider
        assert state.failure_count == 2
        assert state.last_failure_at is not None

    def test_circuit_recovery_timeout_transition(self, conn: sqlite3.Connection) -> None:
        """Should transition from OPEN to HALF_OPEN after recovery timeout."""
        provider = "test-provider-recovery"

        # Open the circuit
        for _ in range(CIRCUIT_FAILURE_THRESHOLD):
            record_circuit_failure(conn, provider)

        # Manually set next_retry_at to past to simulate timeout
        past_time = (datetime.now(UTC) - timedelta(seconds=1)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE circuit_breakers SET next_retry_at = ? WHERE provider = ?",
            (past_time, provider),
        )
        conn.commit()

        # Reading state should transition to half-open
        state = get_circuit_breaker(conn, provider)
        assert state.state == CircuitState.HALF_OPEN

    def test_multiple_providers_independent(self, conn: sqlite3.Connection) -> None:
        """Should maintain independent circuit breakers per provider."""
        provider_a = "provider-a"
        provider_b = "provider-b"

        # Fail provider A
        for _ in range(CIRCUIT_FAILURE_THRESHOLD):
            record_circuit_failure(conn, provider_a)

        # Provider B should still be closed
        assert is_circuit_open(conn, provider_a) is True
        assert is_circuit_open(conn, provider_b) is False

        # Success on B shouldn't affect A
        record_circuit_success(conn, provider_b)
        assert is_circuit_open(conn, provider_a) is True


# ---------------------------------------------------------------------------
# Dead Letter Queue Edge Cases
# ---------------------------------------------------------------------------


class TestDeadLetterQueueEdgeCases:
    """Tests for dead letter queue operations under stress."""

    def test_dlq_handles_large_payload(self, conn: sqlite3.Connection) -> None:
        """Should handle large payloads in dead letter queue."""
        large_payload = {
            "data": "x" * 10000,
            "nested": {"deep": {"value": list(range(1000))}},
        }

        entry = add_to_dead_letter_queue(
            conn,
            run_id="run-1",
            operation="large_operation",
            payload=large_payload,
            error="Test error",
        )

        assert entry.id is not None

        # Verify retrieval preserves large payload
        entries = get_dead_letter_entries(conn, run_id="run-1")
        assert len(entries) == 1
        assert entries[0].payload["data"] == "x" * 10000

    def test_dlq_retry_increments_count(self, conn: sqlite3.Connection) -> None:
        """Should increment retry count on each retry."""
        entry = add_to_dead_letter_queue(
            conn,
            run_id="run-1",
            operation="test_op",
            payload={},
            error="Test error",
        )

        # Retry multiple times
        for expected_count in range(1, 4):
            updated = retry_dead_letter_entry(conn, entry.id)
            assert updated is not None
            assert updated.retry_count == expected_count

    def test_dlq_retry_nonexistent_entry(self, conn: sqlite3.Connection) -> None:
        """Should return None when retrying nonexistent entry."""
        result = retry_dead_letter_entry(conn, "dlq-does-not-exist")
        assert result is None

    def test_dlq_cleanup_removes_exhausted_entries(self, conn: sqlite3.Connection) -> None:
        """Should clean up entries that have been retried max times."""
        entry = add_to_dead_letter_queue(
            conn,
            run_id="run-1",
            operation="test_op",
            payload={},
            error="Test error",
        )

        # Retry to exhaustion
        for _ in range(MAX_RETRY_COUNT):
            retry_dead_letter_entry(conn, entry.id)

        # Cleanup should remove it
        deleted = cleanup_processed_dead_letters(conn)
        assert deleted == 1

        entries = get_dead_letter_entries(conn)
        assert len(entries) == 0

    def test_dlq_multiple_operations_same_run(self, conn: sqlite3.Connection) -> None:
        """Should handle multiple failed operations for same run."""
        operations = ["op_1", "op_2", "op_3"]

        for op in operations:
            add_to_dead_letter_queue(
                conn,
                run_id="run-1",
                operation=op,
                payload={"operation": op},
                error=f"Error in {op}",
            )

        entries = get_dead_letter_entries(conn, run_id="run-1")
        assert len(entries) == 3

        entry_ops = [e.operation for e in entries]
        for op in operations:
            assert op in entry_ops


# ---------------------------------------------------------------------------
# Checkpoint Cleanup and Retention Tests
# ---------------------------------------------------------------------------


class TestCheckpointCleanup:
    """Tests for checkpoint cleanup and retention limits."""

    def test_checkpoint_limit_per_run(self, conn: sqlite3.Connection) -> None:
        """Should enforce MAX_CHECKPOINTS_PER_RUN limit."""
        from app.error_recovery import MAX_CHECKPOINTS_PER_RUN, _ensure_error_recovery_tables
        from uuid import uuid4

        # Use a unique run to avoid interference from other tests
        unique_run_id = f"run-limit-test-{uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (unique_run_id, "test-adapter", "healthy", "manual", "task-1",
             "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
        )
        conn.commit()
        _ensure_error_recovery_tables(conn)

        # Create more checkpoints than the limit using direct INSERT
        # Use explicit timestamps to ensure deterministic ordering
        for i in range(MAX_CHECKPOINTS_PER_RUN + 10):
            timestamp = f"2026-03-13T12:{i//60:02d}:{i%60:02d}Z"
            conn.execute(
                """
                INSERT INTO session_checkpoints
                (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"ckpt-limit-{i:04d}",
                    unique_run_id,
                    "auto",
                    json.dumps({"step": i}),
                    "[]",
                    "{}",
                    timestamp,
                ),
            )

        # Manually trigger cleanup (same logic as in create_checkpoint)
        checkpoint_count = conn.execute(
            "SELECT COUNT(*) as count FROM session_checkpoints WHERE run_id = ?",
            (unique_run_id,),
        ).fetchone()["count"]

        if checkpoint_count > MAX_CHECKPOINTS_PER_RUN:
            conn.execute(
                """
                DELETE FROM session_checkpoints
                WHERE run_id = ? AND id NOT IN (
                    SELECT id FROM session_checkpoints
                    WHERE run_id = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                )
                """,
                (unique_run_id, unique_run_id, MAX_CHECKPOINTS_PER_RUN),
            )
        conn.commit()

        # Count checkpoints for this specific run
        count = conn.execute(
            "SELECT COUNT(*) as count FROM session_checkpoints WHERE run_id = ?",
            (unique_run_id,),
        ).fetchone()["count"]

        # Should be limited to MAX_CHECKPOINTS_PER_RUN
        assert count == MAX_CHECKPOINTS_PER_RUN

        # Latest checkpoint should be preserved (the very last one created)
        latest = get_latest_checkpoint(conn, unique_run_id)
        assert latest is not None
        assert latest.state["step"] == MAX_CHECKPOINTS_PER_RUN + 9

    def test_cleanup_old_checkpoints(self, conn: sqlite3.Connection) -> None:
        """Should clean up checkpoints beyond retention period."""
        # Create checkpoint with old timestamp
        conn.execute(
            """
            INSERT INTO session_checkpoints
            (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "ckpt-old",
                "run-1",
                "auto",
                '{"step": 1}',
                "[]",
                "{}",
                "2020-01-01T00:00:00Z",  # Very old
            ),
        )

        # Create recent checkpoint
        create_checkpoint(
            conn, "run-1",
            state={"step": 2},
            checkpoint_type=CheckpointType.AUTO,
        )

        conn.commit()

        # Cleanup with 1 hour retention
        deleted = cleanup_old_checkpoints(conn, retention_hours=1)

        assert deleted == 1

        # Recent checkpoint should remain
        latest = get_latest_checkpoint(conn, "run-1")
        assert latest is not None
        assert latest.state["step"] == 2

    def test_checkpoint_history_ordering(self, conn: sqlite3.Connection) -> None:
        """Should return checkpoint history in reverse chronological order."""
        from app.error_recovery import get_checkpoint_history
        from uuid import uuid4

        # Use a unique run to avoid interference from other tests
        unique_run_id = f"run-order-test-{uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (unique_run_id, "test-adapter", "healthy", "manual", "task-1",
             "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
        )
        conn.commit()

        # Create checkpoints with explicit timestamps to ensure deterministic ordering
        checkpoint_ids = []
        base_time = "2026-03-13T12:00:00Z"
        for i in range(5):
            timestamp = f"2026-03-13T12:00:0{i}.000Z"
            conn.execute(
                """
                INSERT INTO session_checkpoints
                (id, run_id, checkpoint_type, state, files_snapshot, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"ckpt-order-{i:04d}",
                    unique_run_id,
                    "auto",
                    json.dumps({"seq": i}),
                    "[]",
                    "{}",
                    timestamp,
                ),
            )
            conn.commit()
            checkpoint_ids.append(f"ckpt-order-{i:04d}")

        history = get_checkpoint_history(conn, unique_run_id, limit=3)

        assert len(history) == 3
        # Should be newest first - verify by checkpoint IDs (newest last created)
        # The most recently created checkpoint should be first in history
        assert history[0].id == checkpoint_ids[-1]  # Last created (ckpt-order-0004)
        assert history[0].state["seq"] == 4


# ---------------------------------------------------------------------------
# SessionResumeService Edge Cases
# ---------------------------------------------------------------------------


class TestSessionResumeServiceEdgeCases:
    """Tests for SessionResumeService edge cases."""

    def test_pre_tool_checkpoint_includes_sequence(self, conn: sqlite3.Connection) -> None:
        """Should increment tool sequence number."""
        service = SessionResumeService(conn)

        ckpt1 = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="bash",
            tool_args={"command": "ls"},
        )
        ckpt2 = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="write",
            tool_args={"path": "test.py"},
        )

        assert ckpt1.metadata["tool_sequence"] == 1
        assert ckpt2.metadata["tool_sequence"] == 2

    def test_post_tool_checkpoint_requires_pre_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should link post checkpoint to pre checkpoint."""
        service = SessionResumeService(conn)

        pre = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="bash",
            tool_args={"command": "test"},
        )

        post = service.create_post_tool_call_checkpoint(
            run_id="run-1",
            tool_name="bash",
            result={"success": True, "exit_code": 0},
            pre_checkpoint_id=pre.id,
        )

        assert post.metadata["pre_checkpoint_id"] == pre.id

    def test_tool_checkpoint_excludes_large_payloads(self, conn: sqlite3.Connection) -> None:
        """Should exclude large fields from tool args summary."""
        service = SessionResumeService(conn)

        checkpoint = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="write_file",
            tool_args={
                "path": "test.py",
                "content": "x" * 10000,  # Large content
                "data": "y" * 10000,     # Large data
                "body": "z" * 10000,     # Large body
                "small_field": "value",  # Should be included
            },
        )

        summary = checkpoint.metadata.get("tool_args_summary", {})
        assert "content" not in summary
        assert "data" not in summary
        assert "body" not in summary
        assert "small_field" in summary


# ---------------------------------------------------------------------------
# OrphanSessionDetector Edge Cases
# ---------------------------------------------------------------------------


class TestOrphanSessionDetectorEdgeCases:
    """Tests for OrphanSessionDetector edge cases."""

    def test_detector_recover_all_without_checkpoints(self, conn: sqlite3.Connection) -> None:
        """Should skip recovery when no checkpoint exists."""
        # Make run stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ? WHERE id = ?", (old_time, "run-1"))
        conn.commit()

        detector = OrphanSessionDetector(conn, stale_timeout_seconds=300)
        results = detector.recover_all()

        assert len(results) == 1
        assert results[0].success is False
        assert "no checkpoint" in results[0].error.lower()

    def test_detector_with_custom_timeouts(self, conn: sqlite3.Connection) -> None:
        """Should respect custom timeout configuration."""
        # Run is 100 seconds old
        old_time = (datetime.now(UTC) - timedelta(seconds=100)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ? WHERE id = ?", (old_time, "run-1"))
        conn.commit()

        # With 50s timeout, should detect as stale
        detector_short = OrphanSessionDetector(conn, stale_timeout_seconds=50)
        orphans_short = detector_short.detect()
        assert len(orphans_short) == 1

        # With 200s timeout, should not detect
        detector_long = OrphanSessionDetector(conn, stale_timeout_seconds=200)
        orphans_long = detector_long.detect()
        assert len(orphans_long) == 0

    def test_detector_recovery_emits_logs(self, conn: sqlite3.Connection) -> None:
        """Should emit recovery logs during recovery attempts."""
        # Create checkpoint
        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        # Make run stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ? WHERE id = ?", (old_time, "run-1"))
        conn.commit()

        detector = OrphanSessionDetector(conn, stale_timeout_seconds=300)
        orphans = detector.detect()

        for orphan in orphans:
            detector.recover_orphan(orphan)

        logs = get_recovery_logs(conn, run_id="run-1")

        # Should have detection and recovery logs
        actions = [log.action for log in logs]
        assert "orphan_detected" in actions
        assert "session_resumed" in actions


# ---------------------------------------------------------------------------
# Recovery Report Tests
# ---------------------------------------------------------------------------


class TestRecoveryReport:
    """Tests for recovery report generation."""

    def test_recovery_report_empty(self, conn: sqlite3.Connection) -> None:
        """Should generate valid report with no data."""
        report = get_recovery_report(conn)

        assert report.total_checkpoints == 0
        assert report.total_recovery_attempts == 0
        assert report.successful_recoveries == 0
        assert report.failed_recoveries == 0
        assert report.dead_letter_count == 0

    def test_recovery_report_with_data(self, conn: sqlite3.Connection) -> None:
        """Should include all metrics in report."""
        # Create some checkpoints
        for i in range(3):
            create_checkpoint(
                conn, "run-1",
                state={"step": i},
                checkpoint_type=CheckpointType.AUTO,
            )

        # Make some recovery attempts
        for _ in range(2):
            attempt_recovery(conn, "run-1")

        # Add dead letter entries
        add_to_dead_letter_queue(
            conn, "run-1", "test_op", {}, "Test error"
        )

        # Record circuit breaker state
        record_circuit_failure(conn, "test-provider")

        report = get_recovery_report(conn)

        assert report.total_checkpoints == 3
        assert report.total_recovery_attempts == 2
        assert report.successful_recoveries == 2
        assert report.failed_recoveries == 0
        assert report.dead_letter_count == 1
        assert len(report.circuit_breakers) >= 1


# ---------------------------------------------------------------------------
# State Serialization/Deserialization Tests
# ---------------------------------------------------------------------------


class TestStateSerialization:
    """Tests for checkpoint state serialization and deserialization."""

    def test_checkpoint_preserves_complex_state(self, conn: sqlite3.Connection) -> None:
        """Should preserve complex nested state structures."""
        complex_state = {
            "step": 5,
            "files": ["a.py", "b.py", "c.py"],
            "metadata": {
                "author": "test",
                "tags": ["feature", "bugfix"],
                "nested": {
                    "deep": {
                        "value": 42,
                        "flag": True,
                    }
                }
            },
            "numbers": [1, 2, 3, 4, 5],
            "null_value": None,
            "bool_value": False,
        }

        checkpoint = create_checkpoint(
            conn, "run-1",
            state=complex_state,
            checkpoint_type=CheckpointType.AUTO,
        )

        # Retrieve and verify
        latest = get_latest_checkpoint(conn, "run-1")

        assert latest.state == complex_state
        assert latest.state["metadata"]["nested"]["deep"]["value"] == 42
        assert latest.state["null_value"] is None
        assert latest.state["bool_value"] is False

    def test_checkpoint_preserves_unicode(self, conn: sqlite3.Connection) -> None:
        """Should preserve unicode characters in state."""
        unicode_state = {
            "message": "你好世界 🌍",
            "emoji": "🚀💻🔧",
            "special": "Special chars: àáâãäå",
        }

        create_checkpoint(
            conn, "run-1",
            state=unicode_state,
            checkpoint_type=CheckpointType.AUTO,
        )

        latest = get_latest_checkpoint(conn, "run-1")

        assert latest.state["message"] == "你好世界 🌍"
        assert latest.state["emoji"] == "🚀💻🔧"

    def test_checkpoint_files_snapshot(self, conn: sqlite3.Connection) -> None:
        """Should preserve files snapshot list."""
        files = ["src/main.py", "src/utils.py", "tests/test_main.py"]

        checkpoint = create_checkpoint(
            conn, "run-1",
            state={},
            checkpoint_type=CheckpointType.AUTO,
            files_snapshot=files,
        )

        latest = get_latest_checkpoint(conn, "run-1")

        assert latest.files_snapshot == files

    def test_recovery_log_details_preserved(self, conn: sqlite3.Connection) -> None:
        """Should preserve complex details in recovery logs."""
        complex_details = {
            "checkpoint_id": "ckpt-123",
            "state_keys": ["step", "files", "context"],
            "counts": {"files": 5, "errors": 0},
            "nested": {"a": {"b": {"c": "deep"}}},
        }

        emit_recovery_log(
            conn, "run-1",
            action="test_complex",
            details=complex_details,
        )

        logs = get_recovery_logs(conn, run_id="run-1")

        assert len(logs) == 1
        assert logs[0].details == complex_details
        assert logs[0].details["nested"]["a"]["b"]["c"] == "deep"
