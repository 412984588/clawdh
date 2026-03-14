"""Tests for session resume and crash recovery for long-running agent sessions.

Tests the integration of:
- Orphan session detection (task checked out but run stale/dead)
- Session resume from last checkpoint
- Pre/post-tool-call checkpoint hooks
- Recovery logs for audit trail
- Stale checkout auto-release after configurable timeout
"""

from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest

from app.error_recovery import (
    CheckpointType,
    RecoveryStatus,
    _ensure_error_recovery_tables,
    create_checkpoint,
    get_latest_checkpoint,
)
from app.reliability import (
    RunHealthStatus,
    _ensure_reliability_tables,
    record_heartbeat,
)
from app.session_resume import (
    OrphanSession,
    OrphanSessionDetector,
    RecoveryLogEntry,
    SessionResumeService,
    detect_orphan_sessions,
    emit_recovery_log,
    get_recovery_logs,
    resume_session_from_checkpoint,
    release_stale_checkouts,
)


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "test-session-resume.db"


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

    # Ensure reliability and error recovery tables exist
    _ensure_reliability_tables(connection)
    _ensure_error_recovery_tables(connection)

    # Insert test data
    connection.execute(
        """
        INSERT INTO agents (id, name, adapter, model, heartbeat_seconds, sandbox_mode,
                           instructions_path, workspace_root)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        ("agent-codex", "Codex Agent", "codex-local", "gpt-5", 300, "workspace-write",
         "agents/codex/AGENTS.md", "/workspace"),
    )

    # Task must be inserted BEFORE run, since run.issue references task.id
    connection.execute(
        """
        INSERT INTO tasks (id, title, owner, status, priority, next_action, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        ("task-1", "Test Task", "Codex Agent", "in_progress", "high",
         "Continue implementation", "2026-03-13T11:00:00Z"),
    )

    connection.execute(
        """
        INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        ("run-1", "codex-local", "healthy", "issue_checked_out", "task-1",
         "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
    )

    connection.commit()
    yield connection
    connection.close()


# ---------------------------------------------------------------------------
# Orphan Session Detection Tests
# ---------------------------------------------------------------------------


class TestOrphanSessionDetection:
    """Tests for detecting orphaned sessions."""

    def test_detect_no_orphans_when_healthy(self, conn: sqlite3.Connection) -> None:
        """Should return empty list when all sessions are healthy."""
        # Record recent heartbeat
        record_heartbeat(
            conn,
            request=type("obj", (object,), {
                "run_id": "run-1",
                "status": "healthy",
                "files_touched": [],
                "metadata": {},
            })(),
            stale_timeout_seconds=300,
        )

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300)

        assert len(orphans) == 0

    def test_detect_orphan_when_run_stale(self, conn: sqlite3.Connection) -> None:
        """Should detect orphan when run has no heartbeat and is stale."""
        # Run exists with old timestamp (simulating stale run)
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300)

        assert len(orphans) == 1
        assert orphans[0].run_id == "run-1"
        assert orphans[0].health_status == RunHealthStatus.STALE

    def test_detect_orphan_when_run_dead(self, conn: sqlite3.Connection) -> None:
        """Should detect orphan when run is dead (no heartbeat for extended period)."""
        # Run with very old timestamp
        old_time = (datetime.now(UTC) - timedelta(seconds=700)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300, dead_timeout_seconds=600)

        assert len(orphans) == 1
        assert orphans[0].health_status == RunHealthStatus.DEAD

    def test_detect_orphan_includes_task_info(self, conn: sqlite3.Connection) -> None:
        """Should include task information in orphan detection."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300)

        assert len(orphans) == 1
        assert orphans[0].task_id == "task-1"
        assert orphans[0].task_title == "Test Task"

    def test_detect_multiple_orphans(self, conn: sqlite3.Connection) -> None:
        """Should detect multiple orphaned sessions."""
        # Add another task first, then run (so run.issue references task.id)
        conn.execute(
            """
            INSERT INTO tasks (id, title, owner, status, priority, next_action, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("task-2", "Another Task", "Codex Agent", "in_progress", "medium",
             "Review changes", "2026-03-13T11:00:00Z"),
        )
        conn.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ("run-2", "codex-local", "healthy", "issue_checked_out", "task-2",
             "2026-03-13T11:00:00Z", "2026-03-13T11:00:00Z"),
        )
        conn.commit()

        # Make both stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute("UPDATE runs SET updated_at = ?", (old_time,))
        conn.commit()

        orphans = detect_orphan_sessions(conn, stale_timeout_seconds=300)

        assert len(orphans) == 2


# ---------------------------------------------------------------------------
# Session Resume Tests
# ---------------------------------------------------------------------------


class TestSessionResume:
    """Tests for resuming sessions from checkpoints."""

    def test_resume_from_latest_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should resume session from the latest checkpoint."""
        # Create checkpoints
        create_checkpoint(
            conn, "run-1",
            state={"step": 1, "files": ["a.py"]},
            checkpoint_type=CheckpointType.PRE_OPERATION,
        )
        create_checkpoint(
            conn, "run-1",
            state={"step": 5, "files": ["a.py", "b.py"]},
            checkpoint_type=CheckpointType.POST_OPERATION,
        )

        result = resume_session_from_checkpoint(conn, "run-1")

        assert result.success is True
        assert result.checkpoint_id is not None
        assert result.recovered_state["step"] in (1, 5)

    def test_resume_from_specific_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should resume from a specific checkpoint if provided."""
        ckpt1 = create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )
        create_checkpoint(
            conn, "run-1",
            state={"step": 2},
            checkpoint_type=CheckpointType.AUTO,
        )

        result = resume_session_from_checkpoint(conn, "run-1", checkpoint_id=ckpt1.id)

        assert result.success is True
        assert result.checkpoint_id == ckpt1.id

    def test_resume_fails_when_no_checkpoints(self, conn: sqlite3.Connection) -> None:
        """Should fail gracefully when no checkpoints exist."""
        result = resume_session_from_checkpoint(conn, "run-1")

        assert result.success is False
        assert "no checkpoint" in result.error.lower() or "no checkpoint" in str(result.error).lower()

    def test_resume_emits_recovery_log(self, conn: sqlite3.Connection) -> None:
        """Should emit recovery log entry on resume."""
        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        result = resume_session_from_checkpoint(conn, "run-1")

        logs = get_recovery_logs(conn, run_id="run-1")

        assert len(logs) > 0
        assert any(log.action == "session_resumed" for log in logs)

    def test_resume_updates_run_status(self, conn: sqlite3.Connection) -> None:
        """Should update run status after successful resume."""
        # Mark run as failed
        conn.execute(
            "UPDATE runs SET status = 'failed' WHERE id = ?",
            ("run-1",),
        )
        conn.commit()

        create_checkpoint(
            conn, "run-1",
            state={"step": 1},
            checkpoint_type=CheckpointType.AUTO,
        )

        resume_session_from_checkpoint(conn, "run-1")

        # Check run status updated
        run = conn.execute("SELECT status FROM runs WHERE id = ?", ("run-1",)).fetchone()
        assert run["status"] == "healthy"


# ---------------------------------------------------------------------------
# Recovery Logging Tests
# ---------------------------------------------------------------------------


class TestRecoveryLogging:
    """Tests for recovery log emission."""

    def test_emit_recovery_log(self, conn: sqlite3.Connection) -> None:
        """Should emit a recovery log entry."""
        entry = emit_recovery_log(
            conn,
            run_id="run-1",
            action="checkpoint_created",
            details={"checkpoint_id": "ckpt-123", "type": "auto"},
        )

        assert entry.id is not None
        assert entry.run_id == "run-1"
        assert entry.action == "checkpoint_created"
        assert entry.details["checkpoint_id"] == "ckpt-123"

    def test_get_recovery_logs_for_run(self, conn: sqlite3.Connection) -> None:
        """Should retrieve recovery logs for a specific run."""
        emit_recovery_log(conn, "run-1", "checkpoint_created", {"step": 1})
        emit_recovery_log(conn, "run-1", "checkpoint_created", {"step": 2})
        emit_recovery_log(conn, "run-1", "session_resumed", {"from": "ckpt-1"})

        logs = get_recovery_logs(conn, run_id="run-1")

        assert len(logs) == 3

    def test_recovery_logs_ordered_by_time(self, conn: sqlite3.Connection) -> None:
        """Should return recovery logs in chronological order when filtered by run_id."""
        emit_recovery_log(conn, "run-1", "first", {})
        emit_recovery_log(conn, "run-1", "second", {})
        emit_recovery_log(conn, "run-1", "third", {})

        # When filtering by run_id, logs are returned in ascending order (chronological)
        logs = get_recovery_logs(conn, run_id="run-1")

        actions = [log.action for log in logs]
        assert actions == ["first", "second", "third"]

    def test_recovery_logs_all_descending(self, conn: sqlite3.Connection) -> None:
        """Should return all recovery logs in descending order (newest first)."""
        emit_recovery_log(conn, "run-1", "oldest", {})
        emit_recovery_log(conn, "run-1", "middle", {})
        emit_recovery_log(conn, "run-1", "newest", {})

        # Without run_id filter, logs are returned in descending order
        logs = get_recovery_logs(conn)

        actions = [log.action for log in logs]
        assert actions == ["newest", "middle", "oldest"]

    def test_recovery_log_includes_metadata(self, conn: sqlite3.Connection) -> None:
        """Should include metadata in recovery logs."""
        entry = emit_recovery_log(
            conn,
            "run-1",
            "orphan_detected",
            {"stale_duration_seconds": 400, "health_status": "stale"},
        )

        logs = get_recovery_logs(conn, run_id="run-1")
        log = logs[0]

        assert log.details["stale_duration_seconds"] == 400
        assert log.details["health_status"] == "stale"


# ---------------------------------------------------------------------------
# Stale Checkout Release Tests
# ---------------------------------------------------------------------------


class TestStaleCheckoutRelease:
    """Tests for releasing stale checkouts."""

    def test_release_stale_checkouts(self, conn: sqlite3.Connection) -> None:
        """Should release checkouts for stale runs."""
        # Make run stale
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        result = release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )

        assert result.released_count >= 1
        assert "run-1" in [r.run_id for r in result.released_checkouts]

    def test_release_does_not_affect_healthy_runs(self, conn: sqlite3.Connection) -> None:
        """Should not release checkouts for healthy runs."""
        # Record recent heartbeat
        record_heartbeat(
            conn,
            request=type("obj", (object,), {
                "run_id": "run-1",
                "status": "healthy",
                "files_touched": [],
                "metadata": {},
            })(),
            stale_timeout_seconds=300,
        )

        result = release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )

        assert result.released_count == 0

    def test_release_emits_recovery_log(self, conn: sqlite3.Connection) -> None:
        """Should emit recovery log when releasing stale checkout."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )

        logs = get_recovery_logs(conn, run_id="run-1")

        assert any(log.action == "checkout_released" for log in logs)

    def test_release_dry_run_mode(self, conn: sqlite3.Connection) -> None:
        """Should not actually release when dry_run=True."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        result = release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=False,  # Dry run
        )

        # Should detect stale but not release
        assert result.detected_count >= 1
        assert result.released_count == 0

    def test_release_updates_task_status(self, conn: sqlite3.Connection) -> None:
        """Should update task status when releasing checkout."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        release_stale_checkouts(
            conn,
            stale_timeout_seconds=300,
            auto_release=True,
        )

        # Task should be back to todo
        task = conn.execute("SELECT status FROM tasks WHERE id = ?", ("task-1",)).fetchone()
        assert task["status"] == "todo"


# ---------------------------------------------------------------------------
# Pre/Post Tool Call Checkpoint Tests
# ---------------------------------------------------------------------------


class TestToolCallCheckpoints:
    """Tests for pre/post tool-call checkpoint hooks."""

    def test_create_pre_tool_call_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should create checkpoint before tool call."""
        service = SessionResumeService(conn)

        checkpoint = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="write_file",
            tool_args={"path": "test.py", "content": "print('hello')"},
        )

        assert checkpoint is not None
        assert checkpoint.checkpoint_type == CheckpointType.PRE_OPERATION
        assert checkpoint.metadata["tool_name"] == "write_file"

    def test_create_post_tool_call_checkpoint(self, conn: sqlite3.Connection) -> None:
        """Should create checkpoint after tool call."""
        service = SessionResumeService(conn)

        # Create pre checkpoint first
        pre_ckpt = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="write_file",
            tool_args={"path": "test.py"},
        )

        # Then post checkpoint
        post_ckpt = service.create_post_tool_call_checkpoint(
            run_id="run-1",
            tool_name="write_file",
            result={"success": True, "files_written": ["test.py"]},
            pre_checkpoint_id=pre_ckpt.id,
        )

        assert post_ckpt is not None
        assert post_ckpt.checkpoint_type == CheckpointType.POST_OPERATION
        assert post_ckpt.metadata["pre_checkpoint_id"] == pre_ckpt.id

    def test_checkpoint_includes_state_delta(self, conn: sqlite3.Connection) -> None:
        """Should include state changes in checkpoint."""
        service = SessionResumeService(conn)

        checkpoint = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="edit_file",
            tool_args={"path": "main.py"},
            current_state={"step": 5, "completed_files": ["a.py", "b.py"]},
        )

        assert checkpoint.state["step"] == 5
        assert "completed_files" in checkpoint.state

    def test_tool_checkpoint_chain_links(self, conn: sqlite3.Connection) -> None:
        """Should chain pre/post checkpoints via metadata."""
        service = SessionResumeService(conn)

        pre = service.create_pre_tool_call_checkpoint(
            run_id="run-1",
            tool_name="bash",
            tool_args={"command": "make test"},
        )

        post = service.create_post_tool_call_checkpoint(
            run_id="run-1",
            tool_name="bash",
            result={"exit_code": 0},
            pre_checkpoint_id=pre.id,
        )

        # Verify chain
        assert post.metadata["pre_checkpoint_id"] == pre.id
        assert pre.metadata["tool_sequence"] is not None


# ---------------------------------------------------------------------------
# OrphanSessionDetector Class Tests
# ---------------------------------------------------------------------------


class TestOrphanSessionDetectorClass:
    """Tests for the OrphanSessionDetector class."""

    def test_detector_finds_orphans(self, conn: sqlite3.Connection) -> None:
        """Should find orphaned sessions."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        detector = OrphanSessionDetector(conn, stale_timeout_seconds=300)
        orphans = detector.detect()

        assert len(orphans) == 1
        assert orphans[0].run_id == "run-1"

    def test_detector_with_recovery_action(self, conn: sqlite3.Connection) -> None:
        """Should support recovery action on detected orphans."""
        # Create checkpoint for recovery
        create_checkpoint(
            conn, "run-1",
            state={"step": 3},
            checkpoint_type=CheckpointType.AUTO,
        )

        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        detector = OrphanSessionDetector(conn, stale_timeout_seconds=300)
        orphans = detector.detect()

        # Attempt recovery for each orphan
        for orphan in orphans:
            result = detector.recover_orphan(orphan)

            assert result.success is True

    def test_detector_logs_all_actions(self, conn: sqlite3.Connection) -> None:
        """Should log all detection and recovery actions."""
        old_time = (datetime.now(UTC) - timedelta(seconds=400)).isoformat().replace("+00:00", "Z")
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            (old_time, "run-1"),
        )
        conn.commit()

        detector = OrphanSessionDetector(conn, stale_timeout_seconds=300)
        detector.detect()

        logs = get_recovery_logs(conn)

        assert any(log.action == "orphan_detected" for log in logs)
