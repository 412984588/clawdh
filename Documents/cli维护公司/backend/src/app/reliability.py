"""Run cleanup and heartbeat reliability service.

Implements:
- Stale run detection based on heartbeat timeout
- Auto-release of stale checkouts
- Run health status tracking
- Auth drift detection for providers
"""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime, timedelta
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums and Models
# ---------------------------------------------------------------------------


class RunHealthStatus(str, Enum):
    """Health status of a run based on heartbeat activity."""

    HEALTHY = "healthy"  # Recent heartbeat activity
    STALE = "stale"  # No heartbeat within timeout
    DEAD = "dead"  # Process confirmed dead
    UNKNOWN = "unknown"  # No heartbeat data available


class AuthStatus(str, Enum):
    """Authentication status for a provider."""

    VALID = "valid"
    EXPIRED = "expired"
    INVALID = "invalid"
    UNKNOWN = "unknown"


class StaleRunInfo(BaseModel):
    """Information about a stale run."""

    run_id: str
    agent: str
    status: str
    issue: str | None
    started_at: str
    last_heartbeat: str | None
    stale_duration_seconds: int
    health_status: RunHealthStatus


class CleanupResult(BaseModel):
    """Result of a cleanup operation."""

    cleaned_count: int
    stale_runs: list[StaleRunInfo]
    errors: list[str]
    timestamp: str


class CleanupRequest(BaseModel):
    """Request to run cleanup."""

    stale_timeout_seconds: int = Field(default=300, gt=0)
    dead_timeout_seconds: int = Field(default=600, gt=0)
    auto_release: bool = False


class RecordAuthRequest(BaseModel):
    """Request to record auth status."""

    provider: str = Field(min_length=1)
    status: AuthStatus
    expires_at: str | None = None
    error: str | None = None


class HeartbeatRequest(BaseModel):
    """Request to record a heartbeat."""

    run_id: str = Field(min_length=1)
    status: str = Field(min_length=1)
    files_touched: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class HeartbeatResponse(BaseModel):
    """Response from recording a heartbeat."""

    run_id: str
    recorded_at: str
    health_status: RunHealthStatus
    warnings: list[str]


class AuthCheckRequest(BaseModel):
    """Request to check auth status for providers."""

    providers: list[str] = Field(default_factory=list)


class ProviderAuthStatus(BaseModel):
    """Auth status for a single provider."""

    provider: str
    status: AuthStatus
    expires_at: str | None
    error: str | None
    checked_at: str


class AuthCheckResponse(BaseModel):
    """Response from auth check."""

    providers: list[ProviderAuthStatus]
    all_valid: bool
    checked_at: str


class RunHealthReport(BaseModel):
    """Comprehensive run health report."""

    total_runs: int
    healthy_count: int
    stale_count: int
    dead_count: int
    unknown_count: int
    stale_runs: list[StaleRunInfo]
    generated_at: str


# ---------------------------------------------------------------------------
# Database Schema
# ---------------------------------------------------------------------------

RELIABILITY_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS heartbeats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    status TEXT NOT NULL,
    files_touched TEXT NOT NULL DEFAULT '[]',
    metadata TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY(run_id) REFERENCES runs(id)
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_run
    ON heartbeats(run_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS auth_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    status TEXT NOT NULL,
    expires_at TEXT,
    error TEXT,
    checked_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_checks_provider
    ON auth_checks(provider, checked_at DESC);

CREATE TABLE IF NOT EXISTS run_cleanup_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    performed_at TEXT NOT NULL,
    FOREIGN KEY(run_id) REFERENCES runs(id)
);
"""


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------


def _current_timestamp() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_timestamp(ts: str) -> datetime:
    """Parse ISO timestamp to datetime."""
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    return datetime.fromisoformat(ts)


def _ensure_reliability_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(RELIABILITY_TABLES_SQL)


# ---------------------------------------------------------------------------
# Heartbeat Operations
# ---------------------------------------------------------------------------


def record_heartbeat(
    conn: sqlite3.Connection,
    request: HeartbeatRequest,
    stale_timeout_seconds: int = 180,
) -> HeartbeatResponse:
    """Record a heartbeat for a run.

    Args:
        conn: Database connection
        request: Heartbeat request data
        stale_timeout_seconds: Seconds before a run is considered stale

    Returns:
        HeartbeatResponse with health status
    """
    import json

    _ensure_reliability_tables(conn)

    # Verify run exists
    run = conn.execute("SELECT id, status FROM runs WHERE id = ?", (request.run_id,)).fetchone()
    if run is None:
        raise KeyError(f"Run not found: {request.run_id}")

    recorded_at = _current_timestamp()
    warnings: list[str] = []

    # Record heartbeat
    conn.execute(
        """
        INSERT INTO heartbeats (run_id, recorded_at, status, files_touched, metadata)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            request.run_id,
            recorded_at,
            request.status,
            json.dumps(request.files_touched),
            json.dumps(request.metadata),
        ),
    )

    # Update run's updated_at
    conn.execute(
        "UPDATE runs SET updated_at = ? WHERE id = ?",
        (recorded_at, request.run_id),
    )

    # Check health status
    health_status = _calculate_run_health(conn, request.run_id, stale_timeout_seconds)

    # Check for anomalies
    if request.status == "error":
        warnings.append("Run reported error status")

    # Check file count
    if len(request.files_touched) > 50:
        warnings.append(f"Large number of files touched: {len(request.files_touched)}")

    conn.commit()

    return HeartbeatResponse(
        run_id=request.run_id,
        recorded_at=recorded_at,
        health_status=health_status,
        warnings=warnings,
    )


def get_last_heartbeat(
    conn: sqlite3.Connection,
    run_id: str,
) -> dict[str, Any] | None:
    """Get the last heartbeat for a run."""
    _ensure_reliability_tables(conn)

    row = conn.execute(
        """
        SELECT run_id, recorded_at, status, files_touched, metadata
        FROM heartbeats
        WHERE run_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
        """,
        (run_id,),
    ).fetchone()

    if row is None:
        return None

    import json

    return {
        "run_id": row["run_id"],
        "recorded_at": row["recorded_at"],
        "status": row["status"],
        "files_touched": json.loads(row["files_touched"]),
        "metadata": json.loads(row["metadata"]),
    }


def _calculate_run_health(
    conn: sqlite3.Connection,
    run_id: str,
    stale_timeout_seconds: int,
) -> RunHealthStatus:
    """Calculate health status for a run based on heartbeat history."""
    last_heartbeat = get_last_heartbeat(conn, run_id)

    if last_heartbeat is None:
        return RunHealthStatus.UNKNOWN

    last_time = _parse_timestamp(last_heartbeat["recorded_at"])
    now = datetime.now(UTC)
    elapsed = (now - last_time).total_seconds()

    if elapsed > stale_timeout_seconds * 2:
        return RunHealthStatus.DEAD
    elif elapsed > stale_timeout_seconds:
        return RunHealthStatus.STALE
    else:
        return RunHealthStatus.HEALTHY


# ---------------------------------------------------------------------------
# Stale Run Detection and Cleanup
# ---------------------------------------------------------------------------


def detect_stale_runs(
    conn: sqlite3.Connection,
    stale_timeout_seconds: int = 300,
    dead_timeout_seconds: int = 600,
) -> list[StaleRunInfo]:
    """Detect runs that are stale or dead based on heartbeat activity.

    Args:
        conn: Database connection
        stale_timeout_seconds: Seconds before a run is considered stale (default 5 min)
        dead_timeout_seconds: Seconds before a run is considered dead (default 10 min)

    Returns:
        List of stale/dead run information
    """
    _ensure_reliability_tables(conn)

    # Get all active runs
    active_runs = conn.execute(
        """
        SELECT id, agent, status, issue, started_at, updated_at
        FROM runs
        WHERE status NOT IN ('completed', 'failed', 'killed')
        """
    ).fetchall()

    now = datetime.now(UTC)
    stale_runs: list[StaleRunInfo] = []

    for run in active_runs:
        run_id = run["id"]

        # Get last heartbeat
        last_heartbeat = get_last_heartbeat(conn, run_id)

        if last_heartbeat is None:
            # No heartbeat - check run's updated_at
            last_activity = _parse_timestamp(run["updated_at"])
            elapsed = (now - last_activity).total_seconds()

            if elapsed > dead_timeout_seconds:
                health = RunHealthStatus.DEAD
            elif elapsed > stale_timeout_seconds:
                health = RunHealthStatus.STALE
            else:
                health = RunHealthStatus.UNKNOWN

            stale_runs.append(
                StaleRunInfo(
                    run_id=run_id,
                    agent=run["agent"],
                    status=run["status"],
                    issue=run["issue"],
                    started_at=run["started_at"],
                    last_heartbeat=None,
                    stale_duration_seconds=int(elapsed),
                    health_status=health,
                )
            )
        else:
            last_time = _parse_timestamp(last_heartbeat["recorded_at"])
            elapsed = (now - last_time).total_seconds()

            if elapsed > dead_timeout_seconds:
                health = RunHealthStatus.DEAD
            elif elapsed > stale_timeout_seconds:
                health = RunHealthStatus.STALE
            else:
                continue  # Healthy run, skip

            stale_runs.append(
                StaleRunInfo(
                    run_id=run_id,
                    agent=run["agent"],
                    status=run["status"],
                    issue=run["issue"],
                    started_at=run["started_at"],
                    last_heartbeat=last_heartbeat["recorded_at"],
                    stale_duration_seconds=int(elapsed),
                    health_status=health,
                )
            )

    return stale_runs


def cleanup_stale_runs(
    conn: sqlite3.Connection,
    stale_timeout_seconds: int = 300,
    dead_timeout_seconds: int = 600,
    auto_release: bool = False,
) -> CleanupResult:
    """Detect and optionally clean up stale runs.

    Args:
        conn: Database connection
        stale_timeout_seconds: Seconds before a run is considered stale
        dead_timeout_seconds: Seconds before a run is considered dead
        auto_release: If True, automatically release stale checkouts

    Returns:
        CleanupResult with details of what was found/cleaned
    """
    _ensure_reliability_tables(conn)

    stale_runs = detect_stale_runs(conn, stale_timeout_seconds, dead_timeout_seconds)
    errors: list[str] = []
    cleaned_count = 0
    timestamp = _current_timestamp()

    if auto_release:
        for stale_run in stale_runs:
            if stale_run.health_status == RunHealthStatus.DEAD:
                try:
                    # Update run status to failed
                    conn.execute(
                        "UPDATE runs SET status = ?, updated_at = ? WHERE id = ?",
                        ("failed", timestamp, stale_run.run_id),
                    )

                    # Log cleanup action
                    conn.execute(
                        """
                        INSERT INTO run_cleanup_log (run_id, action, reason, performed_at)
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            stale_run.run_id,
                            "auto_fail",
                            f"Run dead for {stale_run.stale_duration_seconds}s, no heartbeat",
                            timestamp,
                        ),
                    )

                    # Add audit comment
                    comment_id = f"{stale_run.run_id}-cleanup-{timestamp}"
                    conn.execute(
                        """
                        INSERT INTO run_comments (id, run_id, author, body, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            comment_id,
                            stale_run.run_id,
                            "System",
                            f"Run auto-failed: no heartbeat for {stale_run.stale_duration_seconds}s",
                            timestamp,
                        ),
                    )

                    cleaned_count += 1
                except Exception as e:
                    errors.append(f"Failed to clean run {stale_run.run_id}: {e}")

        conn.commit()

    return CleanupResult(
        cleaned_count=cleaned_count,
        stale_runs=stale_runs,
        errors=errors,
        timestamp=timestamp,
    )


def get_run_health_report(
    conn: sqlite3.Connection,
    stale_timeout_seconds: int = 300,
) -> RunHealthReport:
    """Generate a comprehensive run health report.

    Args:
        conn: Database connection
        stale_timeout_seconds: Seconds before a run is considered stale

    Returns:
        RunHealthReport with statistics and details
    """
    _ensure_reliability_tables(conn)

    # Get all runs
    all_runs = conn.execute("SELECT id FROM runs").fetchall()
    total_runs = len(all_runs)

    # Get stale runs
    stale_runs = detect_stale_runs(conn, stale_timeout_seconds)

    # Count by health status
    healthy_count = 0
    stale_count = 0
    dead_count = 0
    unknown_count = 0

    for run in stale_runs:
        if run.health_status == RunHealthStatus.HEALTHY:
            healthy_count += 1
        elif run.health_status == RunHealthStatus.STALE:
            stale_count += 1
        elif run.health_status == RunHealthStatus.DEAD:
            dead_count += 1
        else:
            unknown_count += 1

    # Healthy runs are those not in stale_runs
    healthy_count = total_runs - len(stale_runs)

    return RunHealthReport(
        total_runs=total_runs,
        healthy_count=healthy_count,
        stale_count=stale_count,
        dead_count=dead_count,
        unknown_count=unknown_count,
        stale_runs=stale_runs,
        generated_at=_current_timestamp(),
    )


# ---------------------------------------------------------------------------
# Auth Drift Detection
# ---------------------------------------------------------------------------


def check_provider_auth(
    conn: sqlite3.Connection,
    request: AuthCheckRequest,
) -> AuthCheckResponse:
    """Check authentication status for providers.

    Note: This records the check request. Actual auth verification
    would be done by the provider adapters. This function provides
    the framework for tracking auth status over time.

    Args:
        conn: Database connection
        request: Auth check request with provider list

    Returns:
        AuthCheckResponse with status for each provider
    """
    _ensure_reliability_tables(conn)

    checked_at = _current_timestamp()
    provider_statuses: list[ProviderAuthStatus] = []

    for provider in request.providers:
        # Get last auth check for this provider
        last_check = conn.execute(
            """
            SELECT status, expires_at, error, checked_at
            FROM auth_checks
            WHERE provider = ?
            ORDER BY checked_at DESC
            LIMIT 1
            """,
            (provider,),
        ).fetchone()

        if last_check is None:
            # No previous check - status unknown
            status = AuthStatus.UNKNOWN
            expires_at = None
            error = None
        else:
            status = AuthStatus(last_check["status"])
            expires_at = last_check["expires_at"]
            error = last_check["error"]

        provider_statuses.append(
            ProviderAuthStatus(
                provider=provider,
                status=status,
                expires_at=expires_at,
                error=error,
                checked_at=checked_at,
            )
        )

    all_valid = all(ps.status == AuthStatus.VALID for ps in provider_statuses)

    return AuthCheckResponse(
        providers=provider_statuses,
        all_valid=all_valid,
        checked_at=checked_at,
    )


def record_auth_status(
    conn: sqlite3.Connection,
    provider: str,
    status: AuthStatus,
    expires_at: str | None = None,
    error: str | None = None,
) -> None:
    """Record authentication status for a provider.

    Args:
        conn: Database connection
        provider: Provider name (e.g., "codex", "claude", "gemini")
        status: Auth status
        expires_at: Optional expiration timestamp
        error: Optional error message if status is not valid
    """
    _ensure_reliability_tables(conn)

    checked_at = _current_timestamp()

    conn.execute(
        """
        INSERT INTO auth_checks (provider, status, expires_at, error, checked_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (provider, status.value, expires_at, error, checked_at),
    )

    conn.commit()


def get_auth_history(
    conn: sqlite3.Connection,
    provider: str,
    limit: int = 10,
) -> list[dict[str, Any]]:
    """Get auth check history for a provider.

    Args:
        conn: Database connection
        provider: Provider name
        limit: Maximum number of records to return

    Returns:
        List of auth check records
    """
    _ensure_reliability_tables(conn)

    rows = conn.execute(
        """
        SELECT provider, status, expires_at, error, checked_at
        FROM auth_checks
        WHERE provider = ?
        ORDER BY checked_at DESC
        LIMIT ?
        """,
        (provider, limit),
    ).fetchall()

    return [
        {
            "provider": row["provider"],
            "status": row["status"],
            "expires_at": row["expires_at"],
            "error": row["error"],
            "checked_at": row["checked_at"],
        }
        for row in rows
    ]


def detect_auth_drift(
    conn: sqlite3.Connection,
    drift_threshold_hours: int = 24,
) -> list[dict[str, Any]]:
    """Detect providers with stale or expired auth.

    Args:
        conn: Database connection
        drift_threshold_hours: Hours since last check to consider drifted

    Returns:
        List of providers with auth drift
    """
    _ensure_reliability_tables(conn)

    now = datetime.now(UTC)
    threshold = now - timedelta(hours=drift_threshold_hours)
    threshold_str = threshold.isoformat().replace("+00:00", "Z")

    # Find providers with no recent check or expired auth
    drifted = conn.execute(
        """
        SELECT DISTINCT adapter
        FROM agents
        WHERE adapter LIKE '%-local'
        """
    ).fetchall()

    drifted_providers: list[dict[str, Any]] = []

    for row in drifted:
        adapter = row["adapter"]
        # Extract provider name from adapter (e.g., "codex-local" -> "codex")
        provider = adapter.replace("-local", "")

        # Check last auth status
        last_check = conn.execute(
            """
            SELECT status, expires_at, checked_at
            FROM auth_checks
            WHERE provider = ?
            ORDER BY checked_at DESC
            LIMIT 1
            """,
            (provider,),
        ).fetchone()

        if last_check is None:
            drifted_providers.append(
                {
                    "provider": provider,
                    "reason": "no_auth_check",
                    "last_check": None,
                }
            )
        elif last_check["checked_at"] < threshold_str:
            drifted_providers.append(
                {
                    "provider": provider,
                    "reason": "stale_auth_check",
                    "last_check": last_check["checked_at"],
                }
            )
        elif last_check["status"] != AuthStatus.VALID.value:
            drifted_providers.append(
                {
                    "provider": provider,
                    "reason": f"auth_status_{last_check['status']}",
                    "last_check": last_check["checked_at"],
                }
            )

    return drifted_providers
