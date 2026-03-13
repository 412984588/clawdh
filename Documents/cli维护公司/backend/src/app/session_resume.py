"""Session resume and crash recovery for long-running agent sessions.

Implements:
- Orphan session detection (task checked out but run stale/dead)
- Session resume from last checkpoint
- Pre/post-tool-call checkpoint hooks
- Recovery logs for audit trail
- Stale checkout auto-release after configurable timeout

This module integrates with error_recovery.py (checkpoints) and
reliability.py (heartbeats, stale detection) to provide a complete
session recovery system.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field

from app.error_recovery import (
    CheckpointType,
    RecoveryStatus,
    SessionCheckpoint,
    _ensure_error_recovery_tables,
    create_checkpoint,
    get_latest_checkpoint,
)
from app.reliability import (
    RunHealthStatus,
    _ensure_reliability_tables,
    _parse_timestamp,
    _current_timestamp,
    get_last_heartbeat,
)


# ---------------------------------------------------------------------------
# Enums and Models
# ---------------------------------------------------------------------------


class RecoveryAction(str, Enum):
    """Actions taken during recovery."""

    RESUMED = "resumed"
    ROLLED_BACK = "rolled_back"
    RELEASED = "released"
    SKIPPED = "skipped"


class OrphanSession(BaseModel):
    """An orphaned session detected by the orphan detector."""

    run_id: str
    agent: str
    health_status: RunHealthStatus
    stale_duration_seconds: int
    task_id: str | None = None
    task_title: str | None = None
    last_heartbeat: str | None = None
    last_checkpoint_id: str | None = None


class ResumeResult(BaseModel):
    """Result of a session resume operation."""

    success: bool
    run_id: str
    checkpoint_id: str | None = None
    recovered_state: dict[str, Any] = Field(default_factory=dict)
    action: RecoveryAction = RecoveryAction.RESUMED
    error: str | None = None
    resumed_at: str


class ReleaseResult(BaseModel):
    """Result of stale checkout release operation."""

    detected_count: int
    released_count: int
    released_checkouts: list[ReleasedCheckout]
    errors: list[str] = Field(default_factory=list)
    timestamp: str


class ReleasedCheckout(BaseModel):
    """Information about a released checkout."""

    run_id: str
    task_id: str
    task_title: str
    stale_duration_seconds: int
    previous_status: str


class RecoveryLogEntry(BaseModel):
    """Recovery log entry for audit trail."""

    id: str
    run_id: str
    timestamp: str
    action: str
    details: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Database Schema
# ---------------------------------------------------------------------------

SESSION_RESUME_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS recovery_logs (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY(run_id) REFERENCES runs(id)
);

CREATE INDEX IF NOT EXISTS idx_recovery_logs_run
    ON recovery_logs(run_id, timestamp DESC);
"""


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------


def _ensure_session_resume_tables(conn: sqlite3.Connection) -> None:
    """Ensure session resume tables exist."""
    _ensure_error_recovery_tables(conn)
    _ensure_reliability_tables(conn)
    conn.executescript(SESSION_RESUME_TABLES_SQL)


# ---------------------------------------------------------------------------
# Recovery Logging
# ---------------------------------------------------------------------------


def emit_recovery_log(
    conn: sqlite3.Connection,
    run_id: str,
    action: str,
    details: dict[str, Any] | None = None,
) -> RecoveryLogEntry:
    """Emit a recovery log entry for audit trail.

    Args:
        conn: Database connection
        run_id: Run ID
        action: Action being logged
        details: Additional details about the action

    Returns:
        Created recovery log entry
    """
    _ensure_session_resume_tables(conn)

    entry = RecoveryLogEntry(
        id=f"recovery-log-{uuid4().hex[:12]}",
        run_id=run_id,
        timestamp=_current_timestamp(),
        action=action,
        details=details or {},
    )

    conn.execute(
        """
        INSERT INTO recovery_logs (id, run_id, timestamp, action, details)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            entry.id,
            entry.run_id,
            entry.timestamp,
            entry.action,
            json.dumps(entry.details),
        ),
    )
    conn.commit()

    return entry


def get_recovery_logs(
    conn: sqlite3.Connection,
    run_id: str | None = None,
    limit: int = 50,
) -> list[RecoveryLogEntry]:
    """Get recovery log entries.

    Args:
        conn: Database connection
        run_id: Filter by run ID (optional)
        limit: Maximum entries to return

    Returns:
        List of recovery log entries (chronological order when filtered by run_id,
        newest-first when listing all)
    """
    _ensure_session_resume_tables(conn)

    if run_id:
        rows = conn.execute(
            """
            SELECT id, run_id, timestamp, action, details
            FROM recovery_logs
            WHERE run_id = ?
            ORDER BY rowid ASC
            LIMIT ?
            """,
            (run_id, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT id, run_id, timestamp, action, details
            FROM recovery_logs
            ORDER BY rowid DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [
        RecoveryLogEntry(
            id=row["id"],
            run_id=row["run_id"],
            timestamp=row["timestamp"],
            action=row["action"],
            details=json.loads(row["details"]),
        )
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Orphan Session Detection
# ---------------------------------------------------------------------------


def detect_orphan_sessions(
    conn: sqlite3.Connection,
    stale_timeout_seconds: int = 300,
    dead_timeout_seconds: int = 600,
) -> list[OrphanSession]:
    """Detect orphaned sessions (task checked out but run stale/dead).

    An orphan session is one where:
    - A task is in 'in_progress' status (checked out)
    - The associated run has no recent heartbeat (stale or dead)

    Args:
        conn: Database connection
        stale_timeout_seconds: Seconds before run is considered stale
        dead_timeout_seconds: Seconds before run is considered dead

    Returns:
        List of orphaned sessions
    """
    _ensure_session_resume_tables(conn)

    now = datetime.now(UTC)
    orphans: list[OrphanSession] = []

    # Find tasks that are checked out (in_progress)
    # and join with runs to check heartbeat status
    rows = conn.execute(
        """
        SELECT
            r.id as run_id,
            r.agent,
            r.status as run_status,
            r.updated_at,
            t.id as task_id,
            t.title as task_title,
            t.status as task_status
        FROM runs r
        LEFT JOIN tasks t ON r.issue = t.id
        WHERE r.status NOT IN ('completed', 'failed', 'killed')
          AND (t.status = 'in_progress' OR t.status IS NULL)
        """
    ).fetchall()

    for row in rows:
        run_id = row["run_id"]

        # Check heartbeat status
        last_heartbeat = get_last_heartbeat(conn, run_id)

        if last_heartbeat is None:
            # No heartbeat - check run's updated_at
            last_activity = _parse_timestamp(row["updated_at"])
            elapsed = (now - last_activity).total_seconds()

            if elapsed > dead_timeout_seconds:
                health = RunHealthStatus.DEAD
            elif elapsed > stale_timeout_seconds:
                health = RunHealthStatus.STALE
            else:
                continue  # Not stale yet
        else:
            last_time = _parse_timestamp(last_heartbeat["recorded_at"])
            elapsed = (now - last_time).total_seconds()

            if elapsed > dead_timeout_seconds:
                health = RunHealthStatus.DEAD
            elif elapsed > stale_timeout_seconds:
                health = RunHealthStatus.STALE
            else:
                continue  # Healthy

        # Get last checkpoint for potential recovery
        latest_ckpt = get_latest_checkpoint(conn, run_id)

        orphans.append(
            OrphanSession(
                run_id=run_id,
                agent=row["agent"],
                health_status=health,
                stale_duration_seconds=int(elapsed),
                task_id=row["task_id"],
                task_title=row["task_title"],
                last_heartbeat=last_heartbeat["recorded_at"] if last_heartbeat else None,
                last_checkpoint_id=latest_ckpt.id if latest_ckpt else None,
            )
        )

        # Emit detection log
        emit_recovery_log(
            conn,
            run_id=run_id,
            action="orphan_detected",
            details={
                "health_status": health.value,
                "stale_duration_seconds": int(elapsed),
                "task_id": row["task_id"],
                "has_checkpoint": latest_ckpt is not None,
            },
        )

    return orphans


# ---------------------------------------------------------------------------
# Session Resume
# ---------------------------------------------------------------------------


def resume_session_from_checkpoint(
    conn: sqlite3.Connection,
    run_id: str,
    checkpoint_id: str | None = None,
) -> ResumeResult:
    """Resume a session from a checkpoint.

    Args:
        conn: Database connection
        run_id: Run ID to resume
        checkpoint_id: Specific checkpoint to resume from (latest if None)

    Returns:
        ResumeResult with recovery details
    """
    _ensure_session_resume_tables(conn)

    now = _current_timestamp()

    # Get checkpoint to resume from
    if checkpoint_id:
        # Verify checkpoint exists
        row = conn.execute(
            "SELECT id FROM session_checkpoints WHERE id = ? AND run_id = ?",
            (checkpoint_id, run_id),
        ).fetchone()
        if row is None:
            emit_recovery_log(
                conn,
                run_id=run_id,
                action="resume_failed",
                details={"error": f"Checkpoint not found: {checkpoint_id}"},
            )
            return ResumeResult(
                success=False,
                run_id=run_id,
                error=f"Checkpoint not found: {checkpoint_id}",
                resumed_at=now,
            )
    else:
        checkpoint = get_latest_checkpoint(conn, run_id)
        if checkpoint is None:
            emit_recovery_log(
                conn,
                run_id=run_id,
                action="resume_failed",
                details={"error": "No checkpoint available"},
            )
            return ResumeResult(
                success=False,
                run_id=run_id,
                error="No checkpoint available for this run",
                resumed_at=now,
            )
        checkpoint_id = checkpoint.id

    # Get checkpoint data
    checkpoint_row = conn.execute(
        """
        SELECT id, state, checkpoint_type, metadata
        FROM session_checkpoints
        WHERE id = ?
        """,
        (checkpoint_id,),
    ).fetchone()

    if checkpoint_row is None:
        return ResumeResult(
            success=False,
            run_id=run_id,
            error=f"Checkpoint not found: {checkpoint_id}",
            resumed_at=now,
        )

    recovered_state = json.loads(checkpoint_row["state"])

    # Update run status to healthy
    conn.execute(
        "UPDATE runs SET status = ?, updated_at = ? WHERE id = ?",
        ("healthy", now, run_id),
    )

    # Emit recovery log
    emit_recovery_log(
        conn,
        run_id=run_id,
        action="session_resumed",
        details={
            "checkpoint_id": checkpoint_id,
            "checkpoint_type": checkpoint_row["checkpoint_type"],
            "recovered_state": recovered_state,
        },
    )

    conn.commit()

    return ResumeResult(
        success=True,
        run_id=run_id,
        checkpoint_id=checkpoint_id,
        recovered_state=recovered_state,
        action=RecoveryAction.RESUMED,
        resumed_at=now,
    )


# ---------------------------------------------------------------------------
# Stale Checkout Release
# ---------------------------------------------------------------------------


def release_stale_checkouts(
    conn: sqlite3.Connection,
    stale_timeout_seconds: int = 300,
    dead_timeout_seconds: int = 600,
    auto_release: bool = False,
) -> ReleaseResult:
    """Release stale checkouts for orphaned sessions.

    When a run becomes stale/dead, this function can release the associated
    task checkout, returning it to 'todo' status so other agents can pick it up.

    Args:
        conn: Database connection
        stale_timeout_seconds: Seconds before run is considered stale
        dead_timeout_seconds: Seconds before run is considered dead
        auto_release: If True, actually release checkouts (dry run if False)

    Returns:
        ReleaseResult with details of released checkouts
    """
    _ensure_session_resume_tables(conn)

    now = _current_timestamp()
    orphans = detect_orphan_sessions(
        conn,
        stale_timeout_seconds=stale_timeout_seconds,
        dead_timeout_seconds=dead_timeout_seconds,
    )

    released: list[ReleasedCheckout] = []
    errors: list[str] = []

    for orphan in orphans:
        if not auto_release:
            # Dry run - just count
            continue

        if orphan.task_id is None:
            continue

        try:
            # Get current task status
            task_row = conn.execute(
                "SELECT status, title FROM tasks WHERE id = ?",
                (orphan.task_id,),
            ).fetchone()

            if task_row is None:
                continue

            previous_status = task_row["status"]

            # Update task back to todo
            conn.execute(
                "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
                ("todo", now, orphan.task_id),
            )

            # Update run status to failed
            conn.execute(
                "UPDATE runs SET status = ?, updated_at = ? WHERE id = ?",
                ("failed", now, orphan.run_id),
            )

            # Add task comment about release
            comment_id = f"{orphan.task_id}-release-{uuid4().hex[:8]}"
            conn.execute(
                """
                INSERT INTO task_comments (id, task_id, author, body, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    comment_id,
                    orphan.task_id,
                    "System",
                    f"Checkout released: run {orphan.run_id} was {orphan.health_status.value} "
                    f"for {orphan.stale_duration_seconds}s. Task returned to todo queue.",
                    now,
                ),
            )

            released.append(
                ReleasedCheckout(
                    run_id=orphan.run_id,
                    task_id=orphan.task_id,
                    task_title=orphan.task_title or "Unknown",
                    stale_duration_seconds=orphan.stale_duration_seconds,
                    previous_status=previous_status,
                )
            )

            # Emit recovery log
            emit_recovery_log(
                conn,
                run_id=orphan.run_id,
                action="checkout_released",
                details={
                    "task_id": orphan.task_id,
                    "previous_status": previous_status,
                    "new_status": "todo",
                    "stale_duration_seconds": orphan.stale_duration_seconds,
                },
            )

        except Exception as e:
            errors.append(f"Failed to release checkout for run {orphan.run_id}: {e}")

    conn.commit()

    return ReleaseResult(
        detected_count=len(orphans),
        released_count=len(released),
        released_checkouts=released,
        errors=errors,
        timestamp=now,
    )


# ---------------------------------------------------------------------------
# SessionResumeService Class
# ---------------------------------------------------------------------------


class SessionResumeService:
    """Service for managing session checkpoints and resume operations.

    Provides high-level methods for creating tool-call checkpoints
    and managing the checkpoint lifecycle.
    """

    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn
        _ensure_session_resume_tables(conn)

    def create_pre_tool_call_checkpoint(
        self,
        run_id: str,
        tool_name: str,
        tool_args: dict[str, Any],
        current_state: dict[str, Any] | None = None,
    ) -> SessionCheckpoint:
        """Create a checkpoint before executing a tool call.

        Args:
            run_id: Run ID
            tool_name: Name of the tool being called
            tool_args: Arguments to the tool call
            current_state: Current session state

        Returns:
            Created checkpoint
        """
        state = current_state or {}
        state["pending_tool_call"] = {
            "tool_name": tool_name,
            "tool_args": tool_args,
        }

        # Generate tool sequence number
        existing_checkpoints = self._conn.execute(
            "SELECT COUNT(*) as count FROM session_checkpoints WHERE run_id = ?",
            (run_id,),
        ).fetchone()["count"]

        checkpoint = create_checkpoint(
            self._conn,
            run_id,
            state=state,
            checkpoint_type=CheckpointType.PRE_OPERATION,
            metadata={
                "tool_name": tool_name,
                "tool_sequence": existing_checkpoints + 1,
                "tool_args_summary": {
                    k: v for k, v in tool_args.items()
                    if k not in ("content", "data", "body")  # Exclude large payloads
                },
            },
        )

        emit_recovery_log(
            self._conn,
            run_id=run_id,
            action="pre_tool_checkpoint",
            details={
                "checkpoint_id": checkpoint.id,
                "tool_name": tool_name,
            },
        )

        return checkpoint

    def create_post_tool_call_checkpoint(
        self,
        run_id: str,
        tool_name: str,
        result: dict[str, Any],
        pre_checkpoint_id: str,
    ) -> SessionCheckpoint:
        """Create a checkpoint after a tool call completes.

        Args:
            run_id: Run ID
            tool_name: Name of the tool that was called
            result: Result of the tool call
            pre_checkpoint_id: ID of the pre-tool-call checkpoint

        Returns:
            Created checkpoint
        """
        checkpoint = create_checkpoint(
            self._conn,
            run_id,
            state={
                "tool_result": result,
                "tool_name": tool_name,
            },
            checkpoint_type=CheckpointType.POST_OPERATION,
            metadata={
                "tool_name": tool_name,
                "pre_checkpoint_id": pre_checkpoint_id,
            },
            files_snapshot=result.get("files_written", []),
        )

        emit_recovery_log(
            self._conn,
            run_id=run_id,
            action="post_tool_checkpoint",
            details={
                "checkpoint_id": checkpoint.id,
                "pre_checkpoint_id": pre_checkpoint_id,
                "tool_name": tool_name,
                "success": result.get("success", True),
            },
        )

        return checkpoint


# ---------------------------------------------------------------------------
# OrphanSessionDetector Class
# ---------------------------------------------------------------------------


class OrphanSessionDetector:
    """Detector for orphaned sessions with recovery capabilities.

    Provides a higher-level interface for detecting and recovering
    orphaned sessions.
    """

    def __init__(
        self,
        conn: sqlite3.Connection,
        stale_timeout_seconds: int = 300,
        dead_timeout_seconds: int = 600,
    ) -> None:
        self._conn = conn
        self._stale_timeout = stale_timeout_seconds
        self._dead_timeout = dead_timeout_seconds
        _ensure_session_resume_tables(conn)

    def detect(self) -> list[OrphanSession]:
        """Detect orphaned sessions.

        Returns:
            List of orphaned sessions
        """
        return detect_orphan_sessions(
            self._conn,
            stale_timeout_seconds=self._stale_timeout,
            dead_timeout_seconds=self._dead_timeout,
        )

    def recover_orphan(self, orphan: OrphanSession) -> ResumeResult:
        """Attempt to recover an orphaned session.

        Args:
            orphan: The orphaned session to recover

        Returns:
            ResumeResult with recovery details
        """
        return resume_session_from_checkpoint(
            self._conn,
            orphan.run_id,
            checkpoint_id=orphan.last_checkpoint_id,
        )

    def recover_all(self) -> list[ResumeResult]:
        """Detect and recover all orphaned sessions.

        Returns:
            List of resume results for each orphan
        """
        orphans = self.detect()
        results: list[ResumeResult] = []

        for orphan in orphans:
            if orphan.last_checkpoint_id:
                result = self.recover_orphan(orphan)
                results.append(result)
            else:
                # No checkpoint available - log and skip
                emit_recovery_log(
                    self._conn,
                    run_id=orphan.run_id,
                    action="recovery_skipped",
                    details={
                        "reason": "no_checkpoint_available",
                        "health_status": orphan.health_status.value,
                    },
                )
                results.append(
                    ResumeResult(
                        success=False,
                        run_id=orphan.run_id,
                        action=RecoveryAction.SKIPPED,
                        error="No checkpoint available",
                        resumed_at=_current_timestamp(),
                    )
                )

        return results
