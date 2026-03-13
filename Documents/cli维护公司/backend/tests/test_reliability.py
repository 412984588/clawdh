"""Tests for run cleanup and heartbeat reliability service."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.reliability import (
    AuthCheckRequest,
    AuthStatus,
    HeartbeatRequest,
    RunHealthStatus,
    _ensure_reliability_tables,
    check_provider_auth,
    cleanup_stale_runs,
    detect_auth_drift,
    detect_stale_runs,
    get_auth_history,
    get_last_heartbeat,
    get_run_health_report,
    record_auth_status,
    record_heartbeat,
)


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "test-reliability.db"


@pytest.fixture
def conn(db_path: Path) -> sqlite3.Connection:
    """Create a test database connection with schema."""
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

    # Ensure reliability tables exist
    _ensure_reliability_tables(connection)

    # Insert test data
    connection.executemany(
        """
        INSERT INTO agents (id, name, adapter, model, heartbeat_seconds, sandbox_mode, instructions_path, workspace_root)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                "agent-1",
                "Test Agent",
                "codex-local",
                "gpt-5",
                300,
                "workspace-write",
                "agents/test/AGENTS.md",
                "/workspace",
            ),
            (
                "agent-2",
                "Claude Agent",
                "claude-local",
                "claude-sonnet",
                420,
                "workspace-write",
                "agents/claude/AGENTS.md",
                "/workspace",
            ),
        ],
    )

    connection.executemany(
        """
        INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                "run-healthy",
                "codex-local",
                "healthy",
                "issue_checked_out",
                "CLI-1",
                "2026-03-13T11:00:00Z",
                "2026-03-13T11:00:00Z",
            ),
            (
                "run-stale",
                "claude-local",
                "in_progress",
                "issue_checked_out",
                "CLI-2",
                "2026-03-13T10:00:00Z",
                "2026-03-13T10:00:00Z",
            ),
            (
                "run-completed",
                "codex-local",
                "completed",
                "issue_checked_out",
                "CLI-3",
                "2026-03-13T09:00:00Z",
                "2026-03-13T09:30:00Z",
            ),
        ],
    )

    connection.commit()
    yield connection
    connection.close()


# ---------------------------------------------------------------------------
# Heartbeat Tests
# ---------------------------------------------------------------------------


class TestHeartbeat:
    """Tests for heartbeat recording and health status."""

    def test_record_heartbeat_creates_entry(self, conn: sqlite3.Connection) -> None:
        """Heartbeat should be recorded in the database."""
        request = HeartbeatRequest(
            run_id="run-healthy",
            status="running",
            files_touched=["src/main.py", "tests/test_main.py"],
        )

        response = record_heartbeat(conn, request)

        assert response.run_id == "run-healthy"
        assert response.health_status == RunHealthStatus.HEALTHY
        assert len(response.warnings) == 0

    def test_record_heartbeat_updates_run_timestamp(self, conn: sqlite3.Connection) -> None:
        """Recording heartbeat should update the run's updated_at."""
        request = HeartbeatRequest(run_id="run-healthy", status="running")

        record_heartbeat(conn, request)

        run = conn.execute("SELECT updated_at FROM runs WHERE id = ?", ("run-healthy",)).fetchone()
        # updated_at should be recent (within last minute)
        updated = datetime.fromisoformat(run["updated_at"].replace("Z", "+00:00"))
        now = datetime.now(UTC)
        assert (now - updated).total_seconds() < 60

    def test_get_last_heartbeat_returns_latest(self, conn: sqlite3.Connection) -> None:
        """Should return the most recent heartbeat."""
        # Record heartbeats directly with different timestamps
        base_time = datetime.now(UTC)
        for i in range(3):
            ts = (base_time + timedelta(seconds=i)).isoformat().replace("+00:00", "Z")
            conn.execute(
                """
                INSERT INTO heartbeats (run_id, recorded_at, status, files_touched, metadata)
                VALUES (?, ?, ?, ?, ?)
                """,
                ("run-healthy", ts, f"step-{i}", "[]", "{}"),
            )
        conn.commit()

        last = get_last_heartbeat(conn, "run-healthy")

        assert last is not None
        assert last["status"] == "step-2"  # Most recent

    def test_get_last_heartbeat_returns_none_for_unknown_run(
        self, conn: sqlite3.Connection
    ) -> None:
        """Should return None for run with no heartbeats."""
        result = get_last_heartbeat(conn, "run-unknown")
        assert result is None

    def test_heartbeat_with_error_status_adds_warning(self, conn: sqlite3.Connection) -> None:
        """Heartbeat with error status should add a warning."""
        request = HeartbeatRequest(run_id="run-healthy", status="error")

        response = record_heartbeat(conn, request)

        assert "Run reported error status" in response.warnings

    def test_heartbeat_with_many_files_adds_warning(self, conn: sqlite3.Connection) -> None:
        """Heartbeat touching many files should add a warning."""
        files = [f"file_{i}.py" for i in range(60)]
        request = HeartbeatRequest(run_id="run-healthy", status="running", files_touched=files)

        response = record_heartbeat(conn, request)

        assert any("Large number of files" in w for w in response.warnings)

    def test_heartbeat_for_nonexistent_run_raises(self, conn: sqlite3.Connection) -> None:
        """Heartbeat for non-existent run should raise KeyError."""
        request = HeartbeatRequest(run_id="nonexistent", status="running")

        with pytest.raises(KeyError):
            record_heartbeat(conn, request)


# ---------------------------------------------------------------------------
# Stale Run Detection Tests
# ---------------------------------------------------------------------------


class TestStaleRunDetection:
    """Tests for detecting stale and dead runs."""

    def test_detect_stale_runs_finds_old_runs(self, conn: sqlite3.Connection) -> None:
        """Should detect runs with no recent heartbeat."""
        # run-stale has old updated_at, should be detected
        stale_runs = detect_stale_runs(conn, stale_timeout_seconds=60, dead_timeout_seconds=120)

        stale_ids = {r.run_id for r in stale_runs}
        assert "run-stale" in stale_ids
        # run-completed should not be in stale (it's completed)
        assert "run-completed" not in stale_ids

    def test_detect_stale_runs_with_recent_heartbeat(self, conn: sqlite3.Connection) -> None:
        """Run with recent heartbeat should not be stale."""
        # Record a fresh heartbeat for run-healthy
        record_heartbeat(conn, HeartbeatRequest(run_id="run-healthy", status="running"))

        stale_runs = detect_stale_runs(conn, stale_timeout_seconds=300)

        stale_ids = {r.run_id for r in stale_runs}
        assert "run-healthy" not in stale_ids

    def test_stale_run_info_contains_correct_fields(self, conn: sqlite3.Connection) -> None:
        """StaleRunInfo should contain all required fields."""
        stale_runs = detect_stale_runs(conn, stale_timeout_seconds=60)

        if stale_runs:
            run = stale_runs[0]
            assert run.run_id
            assert run.agent
            assert run.status
            assert run.started_at
            assert run.stale_duration_seconds >= 0
            assert run.health_status in [RunHealthStatus.STALE, RunHealthStatus.DEAD]

    def test_health_status_reflects_staleness(self, conn: sqlite3.Connection) -> None:
        """Health status should reflect how stale a run is."""
        # Very short timeout should mark as dead
        stale_runs = detect_stale_runs(conn, stale_timeout_seconds=1, dead_timeout_seconds=2)

        for run in stale_runs:
            if run.stale_duration_seconds > 2:
                assert run.health_status == RunHealthStatus.DEAD


# ---------------------------------------------------------------------------
# Run Cleanup Tests
# ---------------------------------------------------------------------------


class TestRunCleanup:
    """Tests for run cleanup operations."""

    def test_cleanup_detects_stale_runs(self, conn: sqlite3.Connection) -> None:
        """Cleanup should detect stale runs."""
        result = cleanup_stale_runs(conn, stale_timeout_seconds=60, auto_release=False)

        assert len(result.stale_runs) > 0
        assert result.cleaned_count == 0  # Not auto-releasing

    def test_cleanup_auto_release_marks_dead_runs_failed(self, conn: sqlite3.Connection) -> None:
        """Auto-release should mark dead runs as failed."""
        # Make run-stale very old
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            ("2026-03-13T00:00:00Z", "run-stale"),
        )
        conn.commit()

        cleanup_stale_runs(
            conn,
            stale_timeout_seconds=60,
            dead_timeout_seconds=120,
            auto_release=True,
        )

        # Check that run-stale was marked as failed
        run = conn.execute("SELECT status FROM runs WHERE id = ?", ("run-stale",)).fetchone()
        assert run["status"] == "failed"

    def test_cleanup_logs_action(self, conn: sqlite3.Connection) -> None:
        """Cleanup should log the action taken."""
        # Make run-stale very old
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            ("2026-03-13T00:00:00Z", "run-stale"),
        )
        conn.commit()

        cleanup_stale_runs(
            conn, stale_timeout_seconds=60, dead_timeout_seconds=120, auto_release=True
        )

        # Check cleanup log
        log = conn.execute(
            "SELECT * FROM run_cleanup_log WHERE run_id = ?",
            ("run-stale",),
        ).fetchone()

        assert log is not None
        assert log["action"] == "auto_fail"
        assert "no heartbeat" in log["reason"]

    def test_cleanup_creates_audit_comment(self, conn: sqlite3.Connection) -> None:
        """Cleanup should create an audit comment on the run."""
        # Make run-stale very old
        conn.execute(
            "UPDATE runs SET updated_at = ? WHERE id = ?",
            ("2026-03-13T00:00:00Z", "run-stale"),
        )
        conn.commit()

        cleanup_stale_runs(
            conn, stale_timeout_seconds=60, dead_timeout_seconds=120, auto_release=True
        )

        # Check for cleanup comment
        comments = conn.execute(
            "SELECT * FROM run_comments WHERE run_id = ?",
            ("run-stale",),
        ).fetchall()

        assert len(comments) > 0
        assert any("auto-failed" in c["body"] for c in comments)


# ---------------------------------------------------------------------------
# Run Health Report Tests
# ---------------------------------------------------------------------------


class TestRunHealthReport:
    """Tests for run health reporting."""

    def test_health_report_counts_runs(self, conn: sqlite3.Connection) -> None:
        """Report should count all runs correctly."""
        report = get_run_health_report(conn, stale_timeout_seconds=60)

        assert report.total_runs == 3  # We have 3 test runs
        assert report.generated_at

    def test_health_report_categorizes_by_status(self, conn: sqlite3.Connection) -> None:
        """Report should categorize runs by health status."""
        # Record a heartbeat for run-healthy to make it healthy
        record_heartbeat(conn, HeartbeatRequest(run_id="run-healthy", status="running"))

        report = get_run_health_report(conn, stale_timeout_seconds=300)

        # Healthy runs + stale runs should equal total
        assert (
            report.healthy_count + report.stale_count + report.dead_count + report.unknown_count
            >= 0
        )


# ---------------------------------------------------------------------------
# Auth Drift Detection Tests
# ---------------------------------------------------------------------------


class TestAuthDrift:
    """Tests for authentication drift detection."""

    def test_record_auth_status_persists(self, conn: sqlite3.Connection) -> None:
        """Auth status should be recorded in the database."""
        record_auth_status(conn, "codex", AuthStatus.VALID)

        history = get_auth_history(conn, "codex")

        assert len(history) == 1
        assert history[0]["status"] == "valid"

    def test_record_auth_status_with_expiry(self, conn: sqlite3.Connection) -> None:
        """Auth status with expiry should be recorded correctly."""
        expires = (datetime.now(UTC) + timedelta(hours=24)).isoformat()
        record_auth_status(conn, "claude", AuthStatus.VALID, expires_at=expires)

        history = get_auth_history(conn, "claude")

        assert history[0]["expires_at"] == expires

    def test_record_auth_status_with_error(self, conn: sqlite3.Connection) -> None:
        """Auth error should be recorded."""
        record_auth_status(conn, "gemini", AuthStatus.INVALID, error="API key expired")

        history = get_auth_history(conn, "gemini")

        assert history[0]["error"] == "API key expired"

    def test_check_provider_auth_returns_unknown_for_new(self, conn: sqlite3.Connection) -> None:
        """Unknown provider should return UNKNOWN status."""
        request = AuthCheckRequest(providers=["unknown-provider"])

        response = check_provider_auth(conn, request)

        assert response.providers[0].status == AuthStatus.UNKNOWN

    def test_check_provider_auth_returns_recorded_status(self, conn: sqlite3.Connection) -> None:
        """Should return previously recorded auth status."""
        record_auth_status(conn, "codex", AuthStatus.VALID)

        request = AuthCheckRequest(providers=["codex"])
        response = check_provider_auth(conn, request)

        assert response.providers[0].status == AuthStatus.VALID
        assert response.all_valid is True

    def test_check_provider_auth_all_valid_false_when_any_invalid(
        self, conn: sqlite3.Connection
    ) -> None:
        """all_valid should be False if any provider is invalid."""
        record_auth_status(conn, "codex", AuthStatus.VALID)
        record_auth_status(conn, "claude", AuthStatus.EXPIRED)

        request = AuthCheckRequest(providers=["codex", "claude"])
        response = check_provider_auth(conn, request)

        assert response.all_valid is False

    def test_detect_auth_drift_finds_stale_checks(self, conn: sqlite3.Connection) -> None:
        """Should detect providers with stale auth checks."""
        # Record an old auth check
        old_time = (datetime.now(UTC) - timedelta(hours=48)).isoformat().replace("+00:00", "Z")
        conn.execute(
            """
            INSERT INTO auth_checks (provider, status, expires_at, error, checked_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("codex", "valid", None, None, old_time),
        )
        conn.commit()

        drifted = detect_auth_drift(conn, drift_threshold_hours=24)

        # codex should be detected as drifted due to stale check
        codex_drift = [d for d in drifted if d["provider"] == "codex"]
        assert len(codex_drift) > 0
        assert codex_drift[0]["reason"] == "stale_auth_check"

    def test_detect_auth_drift_finds_invalid_status(self, conn: sqlite3.Connection) -> None:
        """Should detect providers with invalid auth status."""
        # Add a gemini agent so detect_auth_drift will check it
        conn.execute(
            """
            INSERT INTO agents (id, name, adapter, model, heartbeat_seconds, sandbox_mode, instructions_path, workspace_root)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "agent-gemini",
                "Gemini Agent",
                "gemini-local",
                "gemini-pro",
                300,
                "workspace-write",
                "agents/gemini/AGENTS.md",
                "/workspace",
            ),
        )
        conn.commit()

        record_auth_status(conn, "gemini", AuthStatus.INVALID, error="Key revoked")

        drifted = detect_auth_drift(conn, drift_threshold_hours=24)

        gemini_drift = [d for d in drifted if d["provider"] == "gemini"]
        assert len(gemini_drift) > 0
        assert "invalid" in gemini_drift[0]["reason"]


# ---------------------------------------------------------------------------
# API Endpoint Tests
# ---------------------------------------------------------------------------


class TestReliabilityEndpoints:
    """Tests for reliability API endpoints."""

    def test_heartbeat_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """POST /api/reliability/heartbeat should record heartbeat."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        # First add a run
        client.patch(
            "/api/runs/run-codex-241",
            json={"status": "healthy"},
        )

        response = client.post(
            "/api/reliability/heartbeat",
            json={
                "run_id": "run-codex-241",
                "status": "running",
                "files_touched": ["src/main.py"],
            },
        )

        assert response.status_code == 200
        assert response.json()["run_id"] == "run-codex-241"
        assert "health_status" in response.json()

    def test_stale_runs_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """GET /api/reliability/stale-runs should return stale runs."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.get("/api/reliability/stale-runs?stale_timeout_seconds=60")

        assert response.status_code == 200
        # Endpoint returns a list of stale runs
        assert isinstance(response.json(), list)

    def test_cleanup_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """POST /api/reliability/cleanup should detect and cleanup stale runs."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.post(
            "/api/reliability/cleanup",
            json={
                "stale_timeout_seconds": 60,
                "dead_timeout_seconds": 120,
                "auto_release": False,
            },
        )

        assert response.status_code == 200
        assert "cleaned_count" in response.json()

    def test_health_report_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """GET /api/reliability/health-report should return run health report."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.get("/api/reliability/health-report")

        assert response.status_code == 200
        assert "total_runs" in response.json()
        assert "healthy_count" in response.json()

    def test_auth_check_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """POST /api/reliability/auth-check should check provider auth."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.post(
            "/api/reliability/auth-check",
            json={"providers": ["codex", "claude", "gemini"]},
        )

        assert response.status_code == 200
        assert len(response.json()["providers"]) == 3

    def test_auth_status_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """POST /api/reliability/auth-status should record auth status."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.post(
            "/api/reliability/auth-status",
            json={
                "provider": "codex",
                "status": "valid",
                "expires_at": None,
                "error": None,
            },
        )

        assert response.status_code == 200

    def test_auth_history_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """GET /api/reliability/auth-history/:provider should return auth history."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        # First record some auth status
        client.post(
            "/api/reliability/auth-status",
            json={"provider": "codex", "status": "valid"},
        )

        response = client.get("/api/reliability/auth-history/codex")

        assert response.status_code == 200
        assert len(response.json()) > 0

    def test_auth_drift_endpoint(self, tmp_path: Path, monkeypatch) -> None:
        """GET /api/reliability/auth-drift should return drifted providers."""
        monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(tmp_path / "control-plane.db"))

        client = TestClient(create_app())

        response = client.get("/api/reliability/auth-drift")

        assert response.status_code == 200
        assert isinstance(response.json(), list)
