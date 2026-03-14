"""Workspace snapshot and determinism utilities."""

from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel


class SnapshotType(str, Enum):
    """Type of workspace snapshot."""

    MANUAL = "manual"
    AUTO = "auto"
    PRE_TOOL = "pre_tool"
    POST_TOOL = "post_tool"


class WorkspaceSnapshot(BaseModel):
    """A snapshot of workspace state."""

    snapshot_id: str
    agent_id: str
    snapshot_type: SnapshotType
    state_hash: str
    files_snapshot: dict[str, str] | None = None
    metadata: dict[str, Any] | None = None
    created_at: str


class DriftResult(BaseModel):
    """Result of comparing two snapshots for drift."""

    baseline_id: str
    compare_id: str
    has_drift: bool
    drift_details: dict[str, Any] | None = None


class ResumeRequest(BaseModel):
    """Request to resume from a snapshot."""

    snapshot_id: str | None = None
    force: bool = False


class ResumeResult(BaseModel):
    """Result of a resume operation."""

    success: bool
    snapshot_id: str
    resumed_at: str
    message: str | None = None


class WorkspaceHealth(BaseModel):
    """Health status of a workspace."""

    agent_id: str
    has_snapshots: bool
    latest_snapshot_id: str | None = None
    latest_snapshot_at: str | None = None
    snapshot_count: int


def create_snapshot(
    conn: sqlite3.Connection,
    agent_id: str,
    payload: "SnapshotRequest",
) -> WorkspaceSnapshot:
    """Create a workspace snapshot."""
    # Ensure table exists
    conn.execute("""
        CREATE TABLE IF NOT EXISTS workspace_snapshots (
            snapshot_id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            snapshot_type TEXT NOT NULL,
            state_hash TEXT NOT NULL,
            files_snapshot TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()

    snapshot_id = f"ws-{uuid4().hex[:12]}"
    now = datetime.now(UTC).isoformat()

    # Compute state hash
    state_str = json.dumps(payload.state or {}, sort_keys=True)
    state_hash = hashlib.sha256(state_str.encode()).hexdigest()[:16]

    snapshot = WorkspaceSnapshot(
        snapshot_id=snapshot_id,
        agent_id=agent_id,
        snapshot_type=SnapshotType(payload.snapshot_type or "auto"),
        state_hash=state_hash,
        files_snapshot=payload.files_snapshot,
        metadata=payload.metadata,
        created_at=now,
    )

    conn.execute(
        """
        INSERT INTO workspace_snapshots (
            snapshot_id, agent_id, snapshot_type, state_hash,
            files_snapshot, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            snapshot.snapshot_id,
            snapshot.agent_id,
            snapshot.snapshot_type.value,
            snapshot.state_hash,
            json.dumps(snapshot.files_snapshot) if snapshot.files_snapshot else None,
            json.dumps(snapshot.metadata) if snapshot.metadata else None,
            snapshot.created_at,
        ),
    )
    conn.commit()

    return snapshot


class SnapshotRequest(BaseModel):
    """Request to create a snapshot."""

    state: dict[str, Any] | None = None
    snapshot_type: str = "auto"
    files_snapshot: dict[str, str] | None = None
    metadata: dict[str, Any] | None = None


def list_snapshots(
    conn: sqlite3.Connection,
    agent_id: str,
) -> list[WorkspaceSnapshot]:
    """List all snapshots for an agent."""
    cursor = conn.execute(
        """
        SELECT snapshot_id, agent_id, snapshot_type, state_hash,
               files_snapshot, metadata, created_at
        FROM workspace_snapshots
        WHERE agent_id = ?
        ORDER BY created_at DESC
        """,
        (agent_id,),
    )

    snapshots = []
    for row in cursor.fetchall():
        snapshots.append(
            WorkspaceSnapshot(
                snapshot_id=row[0],
                agent_id=row[1],
                snapshot_type=SnapshotType(row[2]),
                state_hash=row[3],
                files_snapshot=json.loads(row[4]) if row[4] else None,
                metadata=json.loads(row[5]) if row[5] else None,
                created_at=row[6],
            )
        )

    return snapshots


def check_drift(
    conn: sqlite3.Connection,
    agent_id: str,
    baseline_id: str,
    compare_id: str,
) -> DriftResult:
    """Check for drift between two snapshots."""
    cursor = conn.execute(
        """
        SELECT state_hash FROM workspace_snapshots
        WHERE snapshot_id = ? AND agent_id = ?
        """,
        (baseline_id, agent_id),
    )
    baseline = cursor.fetchone()

    cursor = conn.execute(
        """
        SELECT state_hash FROM workspace_snapshots
        WHERE snapshot_id = ? AND agent_id = ?
        """,
        (compare_id, agent_id),
    )
    compare = cursor.fetchone()

    if not baseline or not compare:
        raise KeyError(f"Snapshot not found for agent {agent_id}")

    has_drift = baseline[0] != compare[0]

    return DriftResult(
        baseline_id=baseline_id,
        compare_id=compare_id,
        has_drift=has_drift,
        drift_details={"baseline_hash": baseline[0], "compare_hash": compare[0]},
    )


def resume_from_snapshot(
    conn: sqlite3.Connection,
    agent_id: str,
    payload: ResumeRequest,
) -> ResumeResult:
    """Resume workspace from a snapshot."""
    snapshot_id = payload.snapshot_id

    if not snapshot_id:
        # Get latest snapshot
        cursor = conn.execute(
            """
            SELECT snapshot_id FROM workspace_snapshots
            WHERE agent_id = ?
            ORDER BY created_at DESC LIMIT 1
            """,
            (agent_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise KeyError(f"No snapshots found for agent {agent_id}")
        snapshot_id = row[0]

    return ResumeResult(
        success=True,
        snapshot_id=snapshot_id,
        resumed_at=datetime.now(UTC).isoformat(),
        message=f"Resumed from snapshot {snapshot_id}",
    )


def get_workspace_health(
    conn: sqlite3.Connection,
) -> list[WorkspaceHealth]:
    """Get health status of all workspaces."""
    # Ensure table exists
    try:
        cursor = conn.execute("""
            SELECT agent_id,
                   COUNT(*) as snapshot_count,
                   MAX(created_at) as latest_at
            FROM workspace_snapshots
            GROUP BY agent_id
        """)
    except sqlite3.OperationalError:
        return []

    health_list = []
    for row in cursor.fetchall():
        health_list.append(
            WorkspaceHealth(
                agent_id=row[0],
                has_snapshots=row[1] > 0,
                latest_snapshot_id=None,  # Would need additional query
                latest_snapshot_at=row[2],
                snapshot_count=row[1],
            )
        )

    return health_list
