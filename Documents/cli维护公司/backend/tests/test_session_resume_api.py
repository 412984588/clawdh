"""Integration tests for session resume API endpoints.

Uses the conftest client fixture for proper database isolation.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


class TestOrphanDetectionAPI:
    """Tests for GET /api/reliability/orphans endpoint."""

    def test_detect_orphans_empty(self, client: TestClient) -> None:
        """Should return empty list when no orphans."""
        response = client.get("/api/reliability/orphans")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_detect_orphans_with_custom_timeouts(self, client: TestClient) -> None:
        """Should accept custom timeout parameters."""
        response = client.get(
            "/api/reliability/orphans",
            params={"stale_timeout_seconds": 600, "dead_timeout_seconds": 1200},
        )

        assert response.status_code == 200

    def test_detect_orphans_invalid_timeout(self, client: TestClient) -> None:
        """Should reject invalid timeout values."""
        response = client.get(
            "/api/reliability/orphans",
            params={"stale_timeout_seconds": -1},
        )

        assert response.status_code == 422


class TestSessionResumeAPI:
    """Tests for POST /api/reliability/resume/{run_id} endpoint."""

    def test_resume_no_checkpoint(self, client: TestClient, data_inserter) -> None:
        """Should return failure when no checkpoint exists."""
        # Insert a run without checkpoints
        data_inserter(
            runs=[{
                "id": "run-no-ckpt",
                "agent": "codex-local",
                "status": "failed",
                "trigger": "issue_checked_out",
                "issue": "CLI-1",
            }],
        )

        response = client.post(
            "/api/reliability/resume/run-no-ckpt",
            json={},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "checkpoint" in data["error"].lower()

    def test_resume_with_checkpoint(self, client: TestClient, data_inserter) -> None:
        """Should resume session from checkpoint."""
        # Insert a run
        data_inserter(
            runs=[{
                "id": "run-with-ckpt",
                "agent": "codex-local",
                "status": "failed",
                "trigger": "issue_checked_out",
                "issue": "CLI-2",
            }],
        )

        # Create a checkpoint
        client.post(
            "/api/reliability/checkpoint/run-with-ckpt",
            json={
                "state": {"step": 5, "context": "testing"},
                "checkpoint_type": "auto",
            },
        )

        # Now resume
        response = client.post(
            "/api/reliability/resume/run-with-ckpt",
            json={},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["checkpoint_id"] is not None
        assert data["recovered_state"]["step"] == 5

    def test_resume_specific_checkpoint(self, client: TestClient, data_inserter) -> None:
        """Should resume from specific checkpoint."""
        # Insert a run
        data_inserter(
            runs=[{
                "id": "run-multi-ckpt",
                "agent": "codex-local",
                "status": "failed",
                "trigger": "issue_checked_out",
                "issue": "CLI-3",
            }],
        )

        # Create two checkpoints
        r1 = client.post(
            "/api/reliability/checkpoint/run-multi-ckpt",
            json={"state": {"step": 1}, "checkpoint_type": "auto"},
        )
        ckpt1_id = r1.json()["id"]

        client.post(
            "/api/reliability/checkpoint/run-multi-ckpt",
            json={"state": {"step": 2}, "checkpoint_type": "auto"},
        )

        # Resume from first checkpoint
        response = client.post(
            "/api/reliability/resume/run-multi-ckpt",
            json={"checkpoint_id": ckpt1_id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["checkpoint_id"] == ckpt1_id

    def test_resume_nonexistent_run(self, client: TestClient) -> None:
        """Should return failure for nonexistent run."""
        response = client.post(
            "/api/reliability/resume/nonexistent-run",
            json={},
        )

        assert response.status_code == 200  # Returns failure result, not 404
        data = response.json()
        assert data["success"] is False


class TestReleaseStaleAPI:
    """Tests for POST /api/reliability/release-stale endpoint."""

    def test_release_stale_dry_run(self, client: TestClient) -> None:
        """Should perform dry run by default."""
        response = client.post(
            "/api/reliability/release-stale",
            json={},
        )

        assert response.status_code == 200
        data = response.json()
        assert "detected_count" in data
        assert "released_count" in data
        # Default is dry run (auto_release=False)
        assert data["released_count"] == 0

    def test_release_stale_auto_release(self, client: TestClient) -> None:
        """Should release checkouts when auto_release=True."""
        response = client.post(
            "/api/reliability/release-stale",
            json={
                "auto_release": True,
                "stale_timeout_seconds": 1,  # Very short for testing
            },
        )

        assert response.status_code == 200


class TestRecoveryLogsAPI:
    """Tests for GET /api/reliability/recovery-logs endpoint."""

    def test_get_recovery_logs(self, client: TestClient) -> None:
        """Should return recovery logs."""
        response = client.get("/api/reliability/recovery-logs")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_recovery_logs_filtered(self, client: TestClient, data_inserter) -> None:
        """Should filter logs by run_id."""
        # Insert a run
        data_inserter(
            runs=[{
                "id": "run-log-test",
                "agent": "codex-local",
                "status": "healthy",
                "trigger": "manual",
                "issue": "CLI-4",
            }],
        )

        # Create a log entry via checkpoint
        client.post(
            "/api/reliability/checkpoint/run-log-test",
            json={"state": {}, "checkpoint_type": "auto"},
        )

        response = client.get(
            "/api/reliability/recovery-logs",
            params={"run_id": "run-log-test"},
        )

        assert response.status_code == 200
        data = response.json()
        assert all(log["run_id"] == "run-log-test" for log in data)

    def test_get_recovery_logs_with_limit(self, client: TestClient) -> None:
        """Should respect limit parameter."""
        response = client.get(
            "/api/reliability/recovery-logs",
            params={"limit": 10},
        )

        assert response.status_code == 200
        assert len(response.json()) <= 10


class TestToolCallCheckpointAPI:
    """Tests for pre/post tool-call checkpoint endpoints."""

    def test_create_pre_tool_checkpoint(self, client: TestClient, data_inserter) -> None:
        """Should create pre-tool-call checkpoint."""
        # Insert a run
        data_inserter(
            runs=[{
                "id": "run-tool-pre",
                "agent": "codex-local",
                "status": "healthy",
                "trigger": "manual",
                "issue": "CLI-5",
            }],
        )

        response = client.post(
            "/api/reliability/checkpoint/tool-call/pre/run-tool-pre",
            json={
                "tool_name": "write_file",
                "tool_args": {"path": "test.py", "content": "print('hello')"},
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["checkpoint_type"] == "pre_operation"
        assert data["metadata"]["tool_name"] == "write_file"

    def test_create_post_tool_checkpoint(self, client: TestClient, data_inserter) -> None:
        """Should create post-tool-call checkpoint linked to pre checkpoint."""
        # Insert a run
        data_inserter(
            runs=[{
                "id": "run-tool-post",
                "agent": "codex-local",
                "status": "healthy",
                "trigger": "manual",
                "issue": "CLI-6",
            }],
        )

        # Create pre checkpoint first
        pre_response = client.post(
            "/api/reliability/checkpoint/tool-call/pre/run-tool-post",
            json={"tool_name": "bash", "tool_args": {"command": "ls"}},
        )
        pre_id = pre_response.json()["id"]

        # Create post checkpoint
        response = client.post(
            "/api/reliability/checkpoint/tool-call/post/run-tool-post",
            json={
                "tool_name": "bash",
                "result": {"success": True, "exit_code": 0},
                "pre_checkpoint_id": pre_id,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["checkpoint_type"] == "post_operation"
        assert data["metadata"]["pre_checkpoint_id"] == pre_id
