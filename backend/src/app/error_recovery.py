"""Error recovery and circuit breaker utilities."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel


class CheckpointType(str, Enum):
    """Type of recovery checkpoint."""

    AUTO = "auto"
    MANUAL = "manual"
    PRE_TOOL = "pre_tool"
    POST_TOOL = "post_tool"


class RecoveryStatus(str, Enum):
    """Status of a recovery attempt."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class SessionCheckpoint(BaseModel):
    """Checkpoint for session recovery."""

    checkpoint_id: str
    run_id: str
    checkpoint_type: CheckpointType
    state: dict[str, Any]
    tool_name: str | None = None
    tool_args: dict[str, Any] | None = None
    result: dict[str, Any] | None = None
    pre_checkpoint_id: str | None = None
    files_snapshot: dict[str, str] | None = None
    metadata: dict[str, Any] | None = None
    created_at: str


class CircuitState(str, Enum):
    """Circuit breaker state."""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failing, reject all requests
    HALF_OPEN = "half_open"  # Testing if recovered


class CircuitBreaker(BaseModel):
    """Circuit breaker state for a provider."""

    provider: str
    state: CircuitState
    failure_count: int
    success_count: int
    last_failure_at: str | None = None
    last_success_at: str | None = None
    opened_at: str | None = None

    # Configuration
    failure_threshold: int = 5
    success_threshold: int = 3
    timeout_seconds: int = 60


class RecoveryAttempt(BaseModel):
    """Record of a recovery attempt."""

    attempt_id: str
    run_id: str
    checkpoint_id: str | None = None
    status: str  # pending, success, failed
    error: str | None = None
    attempted_at: str
    completed_at: str | None = None


class DeadLetterEntry(BaseModel):
    """Entry in the dead letter queue."""

    entry_id: str
    run_id: str
    operation: str
    payload: dict[str, Any]
    error: str
    retry_count: int
    created_at: str
    last_retry_at: str | None = None


class Checkpoint(BaseModel):
    """A recovery checkpoint."""

    checkpoint_id: str
    run_id: str
    checkpoint_type: CheckpointType
    state: dict[str, Any]
    files_snapshot: dict[str, str] | None = None
    metadata: dict[str, Any] | None = None
    created_at: str


def _ensure_tables(conn: sqlite3.Connection) -> None:
    """Ensure recovery tables exist."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS recovery_checkpoints (
            checkpoint_id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            checkpoint_type TEXT NOT NULL,
            state TEXT,
            files_snapshot TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS recovery_attempts (
            attempt_id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            checkpoint_id TEXT,
            status TEXT NOT NULL,
            error TEXT,
            attempted_at TEXT NOT NULL,
            completed_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS circuit_breakers (
            provider TEXT PRIMARY KEY,
            state TEXT NOT NULL,
            failure_count INTEGER DEFAULT 0,
            success_count INTEGER DEFAULT 0,
            last_failure_at TEXT,
            last_success_at TEXT,
            opened_at TEXT,
            failure_threshold INTEGER DEFAULT 5,
            success_threshold INTEGER DEFAULT 3,
            timeout_seconds INTEGER DEFAULT 60
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS dead_letter_queue (
            entry_id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            payload TEXT,
            error TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            last_retry_at TEXT
        )
    """)
    conn.commit()


_ensure_error_recovery_tables = _ensure_tables


def create_checkpoint(
    conn: sqlite3.Connection,
    run_id: str,
    state: dict[str, Any],
    checkpoint_type: CheckpointType = CheckpointType.AUTO,
    files_snapshot: dict[str, str] | None = None,
    metadata: dict[str, Any] | None = None,
) -> Checkpoint:
    """Create a recovery checkpoint."""
    _ensure_tables(conn)

    checkpoint_id = f"cp-{uuid4().hex[:12]}"
    now = datetime.now(UTC).isoformat()

    checkpoint = Checkpoint(
        checkpoint_id=checkpoint_id,
        run_id=run_id,
        checkpoint_type=checkpoint_type,
        state=state,
        files_snapshot=files_snapshot,
        metadata=metadata,
        created_at=now,
    )

    import json

    conn.execute(
        """
        INSERT INTO recovery_checkpoints (
            checkpoint_id, run_id, checkpoint_type, state,
            files_snapshot, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            checkpoint.checkpoint_id,
            checkpoint.run_id,
            checkpoint.checkpoint_type.value,
            json.dumps(checkpoint.state),
            json.dumps(checkpoint.files_snapshot) if checkpoint.files_snapshot else None,
            json.dumps(checkpoint.metadata) if checkpoint.metadata else None,
            checkpoint.created_at,
        ),
    )
    conn.commit()

    return checkpoint


def get_latest_checkpoint(
    conn: sqlite3.Connection,
    run_id: str,
) -> Checkpoint | None:
    """Get the latest checkpoint for a run."""
    _ensure_tables(conn)

    import json

    cursor = conn.execute(
        """
        SELECT checkpoint_id, run_id, checkpoint_type, state,
               files_snapshot, metadata, created_at
        FROM recovery_checkpoints
        WHERE run_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (run_id,),
    )

    row = cursor.fetchone()
    if not row:
        return None

    return Checkpoint(
        checkpoint_id=row[0],
        run_id=row[1],
        checkpoint_type=CheckpointType(row[2]),
        state=json.loads(row[3]) if row[3] else {},
        files_snapshot=json.loads(row[4]) if row[4] else None,
        metadata=json.loads(row[5]) if row[5] else None,
        created_at=row[6],
    )


def attempt_recovery(
    conn: sqlite3.Connection,
    run_id: str,
    checkpoint_id: str | None = None,
) -> RecoveryAttempt:
    """Attempt to recover a run from checkpoint."""
    _ensure_tables(conn)

    attempt_id = f"ra-{uuid4().hex[:12]}"
    now = datetime.now(UTC).isoformat()

    # Get checkpoint if not specified
    if not checkpoint_id:
        checkpoint = get_latest_checkpoint(conn, run_id)
        if checkpoint:
            checkpoint_id = checkpoint.checkpoint_id

    attempt = RecoveryAttempt(
        attempt_id=attempt_id,
        run_id=run_id,
        checkpoint_id=checkpoint_id,
        status="success",
        attempted_at=now,
        completed_at=now,
    )

    conn.execute(
        """
        INSERT INTO recovery_attempts (
            attempt_id, run_id, checkpoint_id, status, attempted_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            attempt.attempt_id,
            attempt.run_id,
            attempt.checkpoint_id,
            attempt.status,
            attempt.attempted_at,
            attempt.completed_at,
        ),
    )
    conn.commit()

    return attempt


def get_recovery_history(
    conn: sqlite3.Connection,
    run_id: str,
    limit: int = 10,
) -> list[RecoveryAttempt]:
    """Get recovery attempt history for a run."""
    _ensure_tables(conn)

    cursor = conn.execute(
        """
        SELECT attempt_id, run_id, checkpoint_id, status, error, attempted_at, completed_at
        FROM recovery_attempts
        WHERE run_id = ?
        ORDER BY attempted_at DESC
        LIMIT ?
        """,
        (run_id, limit),
    )

    return [
        RecoveryAttempt(
            attempt_id=row[0],
            run_id=row[1],
            checkpoint_id=row[2],
            status=row[3],
            error=row[4],
            attempted_at=row[5],
            completed_at=row[6],
        )
        for row in cursor.fetchall()
    ]


def get_recovery_report(conn: sqlite3.Connection) -> dict[str, Any]:
    """Get comprehensive recovery status report."""
    _ensure_tables(conn)

    cursor = conn.execute("SELECT COUNT(*) FROM recovery_checkpoints")
    checkpoint_count = cursor.fetchone()[0]

    cursor = conn.execute("SELECT COUNT(*) FROM recovery_attempts WHERE status = 'success'")
    successful_recoveries = cursor.fetchone()[0]

    cursor = conn.execute("SELECT COUNT(*) FROM recovery_attempts WHERE status = 'failed'")
    failed_recoveries = cursor.fetchone()[0]

    cursor = conn.execute("SELECT COUNT(*) FROM dead_letter_queue")
    dlq_count = cursor.fetchone()[0]

    return {
        "checkpoint_count": checkpoint_count,
        "successful_recoveries": successful_recoveries,
        "failed_recoveries": failed_recoveries,
        "dead_letter_entries": dlq_count,
        "generated_at": datetime.now(UTC).isoformat(),
    }


def get_circuit_breaker(
    conn: sqlite3.Connection,
    provider: str,
) -> CircuitBreaker:
    """Get circuit breaker state for a provider."""
    _ensure_tables(conn)

    cursor = conn.execute(
        """
        SELECT provider, state, failure_count, success_count,
               last_failure_at, last_success_at, opened_at,
               failure_threshold, success_threshold, timeout_seconds
        FROM circuit_breakers
        WHERE provider = ?
        """,
        (provider,),
    )

    row = cursor.fetchone()
    if not row:
        return CircuitBreaker(
            provider=provider,
            state=CircuitState.CLOSED,
            failure_count=0,
            success_count=0,
        )

    return CircuitBreaker(
        provider=row[0],
        state=CircuitState(row[1]),
        failure_count=row[2],
        success_count=row[3],
        last_failure_at=row[4],
        last_success_at=row[5],
        opened_at=row[6],
        failure_threshold=row[7],
        success_threshold=row[8],
        timeout_seconds=row[9],
    )


def record_circuit_success(
    conn: sqlite3.Connection,
    provider: str,
) -> CircuitBreaker:
    """Record a successful operation for circuit breaker."""
    _ensure_tables(conn)

    breaker = get_circuit_breaker(conn, provider)
    now = datetime.now(UTC).isoformat()

    breaker.success_count += 1
    breaker.last_success_at = now

    # Check if we should close the circuit
    if breaker.state == CircuitState.HALF_OPEN:
        if breaker.success_count >= breaker.success_threshold:
            breaker.state = CircuitState.CLOSED
            breaker.failure_count = 0

    conn.execute(
        """
        INSERT OR REPLACE INTO circuit_breakers (
            provider, state, failure_count, success_count,
            last_failure_at, last_success_at, opened_at,
            failure_threshold, success_threshold, timeout_seconds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            breaker.provider,
            breaker.state.value,
            breaker.failure_count,
            breaker.success_count,
            breaker.last_failure_at,
            breaker.last_success_at,
            breaker.opened_at,
            breaker.failure_threshold,
            breaker.success_threshold,
            breaker.timeout_seconds,
        ),
    )
    conn.commit()

    return breaker


def record_circuit_failure(
    conn: sqlite3.Connection,
    provider: str,
    error: str | None = None,
) -> CircuitBreaker:
    """Record a failed operation for circuit breaker."""
    _ensure_tables(conn)

    breaker = get_circuit_breaker(conn, provider)
    now = datetime.now(UTC).isoformat()

    breaker.failure_count += 1
    breaker.last_failure_at = now

    # Check if we should open the circuit
    if breaker.state == CircuitState.CLOSED:
        if breaker.failure_count >= breaker.failure_threshold:
            breaker.state = CircuitState.OPEN
            breaker.opened_at = now
    elif breaker.state == CircuitState.HALF_OPEN:
        breaker.state = CircuitState.OPEN
        breaker.opened_at = now

    conn.execute(
        """
        INSERT OR REPLACE INTO circuit_breakers (
            provider, state, failure_count, success_count,
            last_failure_at, last_success_at, opened_at,
            failure_threshold, success_threshold, timeout_seconds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            breaker.provider,
            breaker.state.value,
            breaker.failure_count,
            breaker.success_count,
            breaker.last_failure_at,
            breaker.last_success_at,
            breaker.opened_at,
            breaker.failure_threshold,
            breaker.success_threshold,
            breaker.timeout_seconds,
        ),
    )
    conn.commit()

    return breaker


def add_to_dead_letter_queue(
    conn: sqlite3.Connection,
    run_id: str,
    operation: str,
    payload: dict[str, Any],
    error: str,
    retry_count: int = 0,
) -> DeadLetterEntry:
    """Add an entry to the dead letter queue."""
    _ensure_tables(conn)

    import json

    entry_id = f"dlq-{uuid4().hex[:12]}"
    now = datetime.now(UTC).isoformat()

    entry = DeadLetterEntry(
        entry_id=entry_id,
        run_id=run_id,
        operation=operation,
        payload=payload,
        error=error,
        retry_count=retry_count,
        created_at=now,
    )

    conn.execute(
        """
        INSERT INTO dead_letter_queue (
            entry_id, run_id, operation, payload, error, retry_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            entry.entry_id,
            entry.run_id,
            entry.operation,
            json.dumps(entry.payload),
            entry.error,
            entry.retry_count,
            entry.created_at,
        ),
    )
    conn.commit()

    return entry


def get_dead_letter_entries(
    conn: sqlite3.Connection,
    run_id: str | None = None,
    limit: int = 50,
) -> list[DeadLetterEntry]:
    """Get entries from the dead letter queue."""
    _ensure_tables(conn)

    import json

    if run_id:
        cursor = conn.execute(
            """
            SELECT entry_id, run_id, operation, payload, error, retry_count, created_at, last_retry_at
            FROM dead_letter_queue
            WHERE run_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (run_id, limit),
        )
    else:
        cursor = conn.execute(
            """
            SELECT entry_id, run_id, operation, payload, error, retry_count, created_at, last_retry_at
            FROM dead_letter_queue
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )

    return [
        DeadLetterEntry(
            entry_id=row[0],
            run_id=row[1],
            operation=row[2],
            payload=json.loads(row[3]) if row[3] else {},
            error=row[4],
            retry_count=row[5],
            created_at=row[6],
            last_retry_at=row[7],
        )
        for row in cursor.fetchall()
    ]


def retry_dead_letter_entry(
    conn: sqlite3.Connection,
    entry_id: str,
) -> DeadLetterEntry | None:
    """Retry a dead letter queue entry."""
    _ensure_tables(conn)

    import json

    cursor = conn.execute(
        """
        SELECT entry_id, run_id, operation, payload, error, retry_count, created_at, last_retry_at
        FROM dead_letter_queue
        WHERE entry_id = ?
        """,
        (entry_id,),
    )

    row = cursor.fetchone()
    if not row:
        return None

    now = datetime.now(UTC).isoformat()
    new_retry_count = row[5] + 1

    conn.execute(
        """
        UPDATE dead_letter_queue
        SET retry_count = ?, last_retry_at = ?
        WHERE entry_id = ?
        """,
        (new_retry_count, now, entry_id),
    )
    conn.commit()

    return DeadLetterEntry(
        entry_id=row[0],
        run_id=row[1],
        operation=row[2],
        payload=json.loads(row[3]) if row[3] else {},
        error=row[4],
        retry_count=new_retry_count,
        created_at=row[6],
        last_retry_at=now,
    )
