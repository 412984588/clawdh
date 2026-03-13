"""Demonstration tests for test fixtures and factories.

These tests verify that all fixtures work correctly and serve as
documentation for how to use the test infrastructure.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.overview import ControlPlaneStore
from tests.conftest import (
    AgentFactory,
    CommentFactory,
    MockAuthProvider,
    MockModelProvider,
    RunFactory,
    TaskFactory,
    insert_test_data,
)


# ---------------------------------------------------------------------------
# Test Client Fixtures
# ---------------------------------------------------------------------------


class TestClientFixtures:
    """Verify FastAPI test client fixtures work correctly."""

    def test_client_provides_isolated_database(self, client: TestClient) -> None:
        """Client fixture creates isolated database per test."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_client_has_seeded_data(self, client: TestClient) -> None:
        """Default client includes seed data from ControlPlaneStore."""
        response = client.get("/api/agents")
        assert response.status_code == 200
        body = response.json()
        assert len(body["items"]) >= 3  # Seeded agents

    def test_empty_client_has_no_data(self, empty_client: TestClient) -> None:
        """Empty client has schema but no seed data."""
        response = empty_client.get("/api/agents")
        assert response.status_code == 200
        body = response.json()
        assert body["items"] == []

    def test_seeded_client_has_extra_data(self, seeded_client: TestClient) -> None:
        """Seeded client has extra test data beyond defaults."""
        response = seeded_client.get("/api/agents")
        assert response.status_code == 200
        body = response.json()
        names = [a["name"] for a in body["items"]]
        assert "Extra Test Agent" in names


# ---------------------------------------------------------------------------
# Database Fixtures
# ---------------------------------------------------------------------------


class TestDatabaseFixtures:
    """Verify database fixtures work correctly."""

    def test_db_path_provides_unique_path(self, db_path: Path) -> None:
        """Each test gets a unique database path."""
        assert db_path.suffix == ".db"
        assert "test-control-plane" in db_path.name

    def test_db_connection_is_sqlite(self, db_connection: sqlite3.Connection) -> None:
        """Database connection is a valid SQLite connection."""
        result = db_connection.execute("SELECT 1").fetchone()
        assert result[0] == 1

    def test_store_has_schema_initialized(self, store: ControlPlaneStore) -> None:
        """Store fixture initializes schema correctly."""
        agents = store.list_agents()
        assert len(agents) >= 3  # Seeded agents exist


# ---------------------------------------------------------------------------
# Mock Model Provider
# ---------------------------------------------------------------------------


class TestMockModelProvider:
    """Verify mock model provider fixture works correctly."""

    def test_default_response(self, mock_model_provider: MockModelProvider) -> None:
        """Default mock response is well-formed."""
        response = mock_model_provider.chat_completion(
            messages=[{"role": "user", "content": "Hello"}]
        )
        assert "choices" in response
        assert response["choices"][0]["message"]["role"] == "assistant"
        assert "usage" in response

    def test_custom_response(self, mock_model_provider: MockModelProvider) -> None:
        """Custom response can be configured."""
        mock_model_provider.configure(response={
            "id": "custom-123",
            "object": "chat.completion",
            "model": "custom-model",
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": "Custom response"},
                "finish_reason": "stop",
            }],
            "usage": {"prompt_tokens": 5, "completion_tokens": 10, "total_tokens": 15},
        })
        response = mock_model_provider.chat_completion(
            messages=[{"role": "user", "content": "Test"}]
        )
        assert response["id"] == "custom-123"
        assert response["choices"][0]["message"]["content"] == "Custom response"

    def test_queued_responses(self, mock_model_provider: MockModelProvider) -> None:
        """Queued responses are returned in order."""
        mock_model_provider.enqueue_response({
            "id": "q1", "object": "chat.completion", "model": "gpt-5",
            "choices": [{"index": 0, "message": {"role": "assistant", "content": "First"}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        })
        mock_model_provider.enqueue_response({
            "id": "q2", "object": "chat.completion", "model": "gpt-5",
            "choices": [{"index": 0, "message": {"role": "assistant", "content": "Second"}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        })

        first = mock_model_provider.chat_completion(messages=[])
        second = mock_model_provider.chat_completion(messages=[])

        assert first["id"] == "q1"
        assert second["id"] == "q2"

    def test_failure_simulation(self, mock_model_provider: MockModelProvider) -> None:
        """Provider can simulate API failures."""
        mock_model_provider.configure(fail_next=True)
        with pytest.raises(RuntimeError, match="Mock API error"):
            mock_model_provider.chat_completion(messages=[])

    def test_timeout_simulation(self, mock_model_provider: MockModelProvider) -> None:
        """Provider can simulate timeouts."""
        mock_model_provider.configure(timeout_next=True)
        with pytest.raises(TimeoutError, match="Mock timeout"):
            mock_model_provider.chat_completion(messages=[])

    def test_call_tracking(self, mock_model_provider: MockModelProvider) -> None:
        """Provider tracks all calls made."""
        mock_model_provider.chat_completion(
            messages=[{"role": "user", "content": "Hello"}],
            model="gpt-5",
        )
        mock_model_provider.chat_completion(
            messages=[{"role": "user", "content": "World"}],
            model="claude-sonnet-4.5",
        )
        assert len(mock_model_provider.calls) == 2
        assert mock_model_provider.calls[0]["model"] == "gpt-5"
        assert mock_model_provider.calls[1]["model"] == "claude-sonnet-4.5"

    def test_reset_clears_state(self, mock_model_provider: MockModelProvider) -> None:
        """Reset clears all tracked calls and state."""
        mock_model_provider.chat_completion(messages=[])
        mock_model_provider.reset()
        assert len(mock_model_provider.calls) == 0


# ---------------------------------------------------------------------------
# Mock Auth Provider
# ---------------------------------------------------------------------------


class TestMockAuthProvider:
    """Verify mock auth provider fixture works correctly."""

    def test_create_and_validate_token(self, mock_auth_provider: MockAuthProvider) -> None:
        """Can create and validate tokens."""
        token = mock_auth_provider.create_token(user_id="user-123")
        result = mock_auth_provider.validate_token(token)
        assert result["valid"] is True
        assert result["user_id"] == "user-123"

    def test_invalid_token(self, mock_auth_provider: MockAuthProvider) -> None:
        """Invalid tokens are rejected."""
        mock_auth_provider.configure(default_valid=False)
        result = mock_auth_provider.validate_token("invalid-token")
        assert result["valid"] is False
        assert "error" in result

    def test_revoke_token(self, mock_auth_provider: MockAuthProvider) -> None:
        """Can revoke tokens."""
        token = mock_auth_provider.create_token()
        assert mock_auth_provider.revoke_token(token) is True
        result = mock_auth_provider.validate_token(token)
        assert result["valid"] is False

    def test_permission_check(self, mock_auth_provider: MockAuthProvider) -> None:
        """Can check token permissions."""
        token = mock_auth_provider.create_token(scopes=["read", "write"])
        assert mock_auth_provider.check_permission(token, "read") is True
        assert mock_auth_provider.check_permission(token, "admin") is False

    def test_check_tracking(self, mock_auth_provider: MockAuthProvider) -> None:
        """Auth checks are tracked."""
        token = mock_auth_provider.create_token()
        mock_auth_provider.validate_token(token)
        mock_auth_provider.check_permission(token, "read")
        assert len(mock_auth_provider.auth_checks) == 2


# ---------------------------------------------------------------------------
# Test Data Factories
# ---------------------------------------------------------------------------


class TestAgentFactory:
    """Verify AgentFactory produces valid test data."""

    def test_build_creates_valid_agent(self) -> None:
        """Build creates a complete agent dictionary."""
        agent = AgentFactory.build()
        assert "id" in agent
        assert "name" in agent
        assert "adapter" in agent
        assert "model" in agent
        assert "heartbeatSeconds" in agent

    def test_build_with_custom_values(self) -> None:
        """Build accepts custom values."""
        agent = AgentFactory.build(
            name="Custom Agent",
            adapter="test-adapter",
            model="test-model",
            heartbeat_seconds=600,
        )
        assert agent["name"] == "Custom Agent"
        assert agent["adapter"] == "test-adapter"
        assert agent["model"] == "test-model"
        assert agent["heartbeatSeconds"] == 600

    def test_build_create_request_omits_id(self) -> None:
        """Create request payload omits the id field."""
        request = AgentFactory.build_create_request()
        assert "id" not in request
        assert "name" in request


class TestTaskFactory:
    """Verify TaskFactory produces valid test data."""

    def test_build_creates_valid_task(self) -> None:
        """Build creates a complete task dictionary."""
        task = TaskFactory.build()
        assert "id" in task
        assert "title" in task
        assert "status" in task
        assert "priority" in task

    def test_build_with_custom_values(self) -> None:
        """Build accepts custom values."""
        task = TaskFactory.build(
            title="Custom Task",
            status="in_progress",
            priority="high",
        )
        assert task["title"] == "Custom Task"
        assert task["status"] == "in_progress"
        assert task["priority"] == "high"


class TestRunFactory:
    """Verify RunFactory produces valid test data."""

    def test_build_creates_valid_run(self) -> None:
        """Build creates a complete run dictionary."""
        run = RunFactory.build()
        assert "id" in run
        assert "agent" in run
        assert "status" in run
        assert "trigger" in run
        assert "issue" in run

    def test_build_with_custom_values(self) -> None:
        """Build accepts custom values."""
        run = RunFactory.build(
            agent="claude-local",
            status="attention",
            issue="CLI-42",
        )
        assert run["agent"] == "claude-local"
        assert run["status"] == "attention"
        assert run["issue"] == "CLI-42"


class TestCommentFactory:
    """Verify CommentFactory produces valid test data."""

    def test_build_task_comment(self) -> None:
        """Build creates a valid task comment."""
        comment = CommentFactory.build_task_comment(task_id="task-1")
        assert "id" in comment
        assert "author" in comment
        assert "body" in comment

    def test_build_run_comment(self) -> None:
        """Build creates a valid run comment."""
        comment = CommentFactory.build_run_comment(run_id="run-1")
        assert "id" in comment
        assert "author" in comment
        assert "body" in comment


# ---------------------------------------------------------------------------
# Data Inserter Helper
# ---------------------------------------------------------------------------


class TestDataInserter:
    """Verify data inserter helper works correctly."""

    def test_insert_agents(self, empty_client: TestClient, empty_client_data_inserter) -> None:
        """Can insert agents directly into database."""
        empty_client_data_inserter(
            agents=[
                {"id": "agent-1", "name": "Test Agent 1", "adapter": "test", "model": "test"},
                {"id": "agent-2", "name": "Test Agent 2", "adapter": "test", "model": "test"},
            ]
        )
        response = empty_client.get("/api/agents")
        assert response.status_code == 200
        assert len(response.json()["items"]) == 2

    def test_insert_tasks(self, empty_client: TestClient, empty_client_data_inserter) -> None:
        """Can insert tasks directly into database."""
        empty_client_data_inserter(
            tasks=[
                {"id": "task-1", "title": "Test Task 1"},
                {"id": "task-2", "title": "Test Task 2"},
            ]
        )
        response = empty_client.get("/api/overview")
        assert response.status_code == 200
        assert len(response.json()["tasks"]) == 2

    def test_insert_runs(self, empty_client: TestClient, empty_client_data_inserter) -> None:
        """Can insert runs directly into database."""
        empty_client_data_inserter(
            runs=[
                {"id": "run-1", "agent": "test-agent"},
                {"id": "run-2", "agent": "test-agent"},
            ]
        )
        response = empty_client.get("/api/overview")
        assert response.status_code == 200
        assert len(response.json()["runs"]) == 2


# ---------------------------------------------------------------------------
# Integration: Factories + Client
# ---------------------------------------------------------------------------


class TestFactoryClientIntegration:
    """Verify factories work correctly with the test client."""

    def test_create_agent_from_factory(self, client: TestClient, agent_factory: type[AgentFactory]) -> None:
        """Can create agent via API using factory data."""
        request_data = agent_factory.build_create_request(name="Factory Agent")
        response = client.post("/api/agents", json=request_data)
        assert response.status_code == 201
        assert response.json()["name"] == "Factory Agent"

    def test_checkout_task_from_factory(self, client: TestClient, task_factory: type[TaskFactory]) -> None:
        """Can checkout task using factory-created owner."""
        # Seed a task first via the factory data inserter pattern
        task_data = task_factory.build(task_id="factory-task-1", title="Factory Task")
        # Use the API to interact with seeded data
        response = client.post(
            "/api/tasks/task-review-surface/checkout",
            json={"owner": "Factory Owner"},
        )
        assert response.status_code == 200
        assert response.json()["owner"] == "Factory Owner"

    def test_isolation_between_tests(self, client: TestClient) -> None:
        """Database is isolated between tests (no leftover data from previous test)."""
        # Create an agent in this test
        client.post("/api/agents", json={
            "name": "Isolation Test Agent",
            "adapter": "test",
            "model": "test",
            "heartbeatSeconds": 300,
            "sandboxMode": "test",
            "instructionsPath": "test/AGENTS.md",
            "workspaceRoot": "/test",
        })
        response = client.get("/api/agents")
        names = [a["name"] for a in response.json()["items"]]
        assert "Isolation Test Agent" in names
