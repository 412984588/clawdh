"""Shared pytest fixtures for backend integration tests.

Provides:
- FastAPI test client with isolated SQLite database
- Mock model provider (simulates OpenAI/Anthropic responses)
- Mock auth provider (simulates login/token validation)
- Test data factories for agents, tasks, runs, comments
"""

from __future__ import annotations

import os
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.overview import ControlPlaneStore


# ---------------------------------------------------------------------------
# Database Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    """Provide an isolated SQLite database path for each test."""
    return tmp_path / "test-control-plane.db"


@pytest.fixture
def db_connection(db_path: Path, monkeypatch: pytest.MonkeyPatch) -> Generator[sqlite3.Connection, None, None]:
    """Provide a raw SQLite connection with schema initialized."""
    monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(db_path))
    # Initialize schema before yielding connection
    store = ControlPlaneStore(str(db_path))
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    yield conn
    conn.close()
    store.close()


@pytest.fixture
def store(db_path: Path, monkeypatch: pytest.MonkeyPatch) -> Generator[ControlPlaneStore, None, None]:
    """Provide a ControlPlaneStore instance with isolated database."""
    monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(db_path))
    s = ControlPlaneStore(str(db_path))
    yield s
    s.close()


# ---------------------------------------------------------------------------
# FastAPI Test Client Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def client(db_path: Path, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    """Provide a FastAPI TestClient with isolated database."""
    monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(db_path))
    with TestClient(create_app()) as c:
        yield c


@pytest.fixture
def empty_client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    """Provide a FastAPI TestClient with empty database (no seed data)."""
    db_file = tmp_path / "empty.db"
    # Create schema but skip seeding
    conn = sqlite3.connect(str(db_file))
    conn.executescript(
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
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            owner TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            next_action TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            agent TEXT NOT NULL,
            status TEXT NOT NULL,
            trigger TEXT NOT NULL,
            issue TEXT NOT NULL,
            started_at TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT '',
            ended_at TEXT,
            outcome TEXT
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
        CREATE TABLE IF NOT EXISTS status_history (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            from_status TEXT,
            to_status TEXT NOT NULL,
            run_id TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY(task_id) REFERENCES tasks(id),
            FOREIGN KEY(run_id) REFERENCES runs(id)
        );
        CREATE TABLE IF NOT EXISTS run_logs (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            agent TEXT NOT NULL,
            issue TEXT NOT NULL,
            result TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            FOREIGN KEY(run_id) REFERENCES runs(id)
        );
        """
    )
    conn.close()
    monkeypatch.setenv("CONTROL_PLANE_DB_PATH", str(db_file))
    with TestClient(create_app(seed_data=False)) as c:
        yield c


# ---------------------------------------------------------------------------
# Mock Model Provider
# ---------------------------------------------------------------------------


class MockModelProvider:
    """Simulates OpenAI/Anthropic model responses for testing.

    Configurable for different test scenarios:
    - Default responses (success, failure, timeout)
    - Custom response sequences
    - Latency simulation
    - Token usage tracking
    """

    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []
        self.responses: list[dict[str, Any]] = []
        self._default_response: dict[str, Any] = {
            "id": "mock-completion-1",
            "object": "chat.completion",
            "model": "gpt-5",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "Mock response from model provider.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30,
            },
        }
        self._fail_next: bool = False
        self._timeout_next: bool = False
        self._latency_ms: float = 0

    def configure(
        self,
        *,
        response: dict[str, Any] | None = None,
        fail_next: bool = False,
        timeout_next: bool = False,
        latency_ms: float = 0,
    ) -> None:
        """Configure mock behavior for upcoming calls."""
        if response is not None:
            self._default_response = response
        self._fail_next = fail_next
        self._timeout_next = timeout_next
        self._latency_ms = latency_ms

    def enqueue_response(self, response: dict[str, Any]) -> None:
        """Queue a specific response for the next call."""
        self.responses.append(response)

    def chat_completion(
        self,
        messages: list[dict[str, str]],
        model: str = "gpt-5",
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Simulate a chat completion API call."""
        call_record = {
            "messages": messages,
            "model": model,
            "kwargs": kwargs,
            "timestamp": datetime.now(UTC).isoformat(),
        }
        self.calls.append(call_record)

        if self._timeout_next:
            self._timeout_next = False
            raise TimeoutError(f"Mock timeout for model {model}")

        if self._fail_next:
            self._fail_next = False
            raise RuntimeError(f"Mock API error for model {model}")

        if self.responses:
            return self.responses.pop(0)

        response = {**self._default_response, "model": model}
        # Only override id if it's the default mock id (preserve custom response ids)
        if not response["id"].startswith("custom-"):
            response["id"] = f"mock-completion-{uuid4().hex[:8]}"
        return response

    def reset(self) -> None:
        """Reset mock state for clean test isolation."""
        self.calls.clear()
        self.responses.clear()
        self._fail_next = False
        self._timeout_next = False
        self._latency_ms = 0


@pytest.fixture
def mock_model_provider() -> MockModelProvider:
    """Provide a configurable mock model provider."""
    return MockModelProvider()


# ---------------------------------------------------------------------------
# Mock Auth Provider
# ---------------------------------------------------------------------------


class MockAuthProvider:
    """Simulates authentication provider for testing.

    Configurable for different auth scenarios:
    - Valid/expired/invalid tokens
    - Login/logout flows
    - Token refresh
    - Permission checks
    """

    def __init__(self) -> None:
        self.auth_checks: list[dict[str, Any]] = []
        self._valid_tokens: dict[str, dict[str, Any]] = {}
        self._default_valid: bool = True
        self._token_expiry_seconds: int = 3600

    def configure(
        self,
        *,
        default_valid: bool = True,
        token_expiry_seconds: int = 3600,
    ) -> None:
        """Configure mock auth behavior."""
        self._default_valid = default_valid
        self._token_expiry_seconds = token_expiry_seconds

    def create_token(
        self,
        user_id: str = "test-user",
        scopes: list[str] | None = None,
        expires_in_seconds: int | None = None,
    ) -> str:
        """Create a mock authentication token."""
        token = f"mock-token-{uuid4().hex[:16]}"
        expiry = expires_in_seconds or self._token_expiry_seconds
        self._valid_tokens[token] = {
            "user_id": user_id,
            "scopes": scopes or ["read", "write"],
            "created_at": datetime.now(UTC).isoformat(),
            "expires_in": expiry,
            "valid": True,
        }
        return token

    def validate_token(self, token: str) -> dict[str, Any]:
        """Validate a mock authentication token."""
        record = {
            "token": token[:20] + "...",
            "timestamp": datetime.now(UTC).isoformat(),
        }

        token_data = self._valid_tokens.get(token)
        if token_data is not None:
            # Token exists - check if it's been revoked
            if token_data["valid"]:
                record["valid"] = True
                record["user_id"] = token_data["user_id"]
                record["scopes"] = token_data["scopes"]
            else:
                # Token exists but was revoked
                record["valid"] = False
                record["error"] = "Token has been revoked"
        else:
            # Token doesn't exist - use default validity
            record["valid"] = self._default_valid
            if not record["valid"]:
                record["error"] = "Invalid or expired token"

        self.auth_checks.append(record)
        return record

    def revoke_token(self, token: str) -> bool:
        """Revoke a mock authentication token."""
        if token in self._valid_tokens:
            self._valid_tokens[token]["valid"] = False
            return True
        return False

    def check_permission(
        self,
        token: str,
        required_scope: str,
    ) -> bool:
        """Check if token has required permission scope."""
        record = {
            "token": token[:20] + "...",
            "required_scope": required_scope,
            "timestamp": datetime.now(UTC).isoformat(),
        }

        token_data = self._valid_tokens.get(token)
        if token_data and token_data["valid"]:
            has_scope = required_scope in token_data["scopes"]
            record["has_scope"] = has_scope
        else:
            has_scope = self._default_valid
            record["has_scope"] = has_scope

        self.auth_checks.append(record)
        return has_scope

    def reset(self) -> None:
        """Reset mock state for clean test isolation."""
        self.auth_checks.clear()
        self._valid_tokens.clear()
        self._default_valid = True


@pytest.fixture
def mock_auth_provider() -> MockAuthProvider:
    """Provide a configurable mock auth provider."""
    return MockAuthProvider()


# ---------------------------------------------------------------------------
# Test Data Factories
# ---------------------------------------------------------------------------


class AgentFactory:
    """Factory for creating valid AgentRecord test data."""

    _counter = 0

    @classmethod
    def build(
        cls,
        *,
        name: str | None = None,
        adapter: str = "codex-local",
        model: str = "gpt-5",
        heartbeat_seconds: int = 300,
        sandbox_mode: str = "workspace-write",
        instructions_path: str | None = None,
        workspace_root: str = "/workspace/test",
    ) -> dict[str, Any]:
        """Build an agent data dictionary."""
        cls._counter += 1
        suffix = cls._counter
        agent_name = name or f"Test Agent {suffix}"
        slug = agent_name.lower().replace(" ", "-")
        return {
            "id": f"agent-{slug}",
            "name": agent_name,
            "adapter": adapter,
            "model": model,
            "heartbeatSeconds": heartbeat_seconds,
            "sandboxMode": sandbox_mode,
            "instructionsPath": instructions_path or f"agents/{slug}/AGENTS.md",
            "workspaceRoot": workspace_root,
        }

    @classmethod
    def build_create_request(cls, **kwargs: Any) -> dict[str, Any]:
        """Build an agent creation request payload (without id)."""
        data = cls.build(**kwargs)
        data.pop("id")
        return data

    @classmethod
    def reset(cls) -> None:
        """Reset counter for test isolation."""
        cls._counter = 0


class TaskFactory:
    """Factory for creating valid TaskOverview test data."""

    _counter = 0

    @classmethod
    def build(
        cls,
        *,
        task_id: str | None = None,
        title: str | None = None,
        owner: str = "Test Owner",
        status: str = "todo",
        priority: str = "medium",
        next_action: str = "Start implementation.",
        updated_at: str | None = None,
    ) -> dict[str, Any]:
        """Build a task data dictionary."""
        cls._counter += 1
        suffix = cls._counter
        return {
            "id": task_id or f"task-test-{suffix}",
            "title": title or f"Test Task {suffix}",
            "owner": owner,
            "status": status,
            "priority": priority,
            "nextAction": next_action,
            "updatedAt": updated_at or _current_timestamp(),
        }

    @classmethod
    def reset(cls) -> None:
        """Reset counter for test isolation."""
        cls._counter = 0


class RunFactory:
    """Factory for creating valid RunOverview test data."""

    _counter = 0

    @classmethod
    def build(
        cls,
        *,
        run_id: str | None = None,
        agent: str = "codex-local",
        status: str = "healthy",
        trigger: str = "issue_checked_out",
        issue: str = "CLI-1",
        started_at: str | None = None,
    ) -> dict[str, Any]:
        """Build a run data dictionary."""
        cls._counter += 1
        suffix = cls._counter
        return {
            "id": run_id or f"run-test-{suffix}",
            "agent": agent,
            "status": status,
            "trigger": trigger,
            "issue": issue,
            "startedAt": started_at or _current_timestamp(),
        }

    @classmethod
    def reset(cls) -> None:
        """Reset counter for test isolation."""
        cls._counter = 0


class CommentFactory:
    """Factory for creating valid comment test data."""

    _counter = 0

    @classmethod
    def build_task_comment(
        cls,
        *,
        task_id: str = "task-test-1",
        author: str = "Test Author",
        body: str = "Test comment body.",
    ) -> dict[str, Any]:
        """Build a task comment data dictionary."""
        cls._counter += 1
        suffix = cls._counter
        return {
            "id": f"{task_id}-comment-{suffix}",
            "author": author,
            "body": body,
        }

    @classmethod
    def build_run_comment(
        cls,
        *,
        run_id: str = "run-test-1",
        author: str = "Test Author",
        body: str = "Test comment body.",
    ) -> dict[str, Any]:
        """Build a run comment data dictionary."""
        cls._counter += 1
        suffix = cls._counter
        return {
            "id": f"{run_id}-comment-{suffix}",
            "author": author,
            "body": body,
        }

    @classmethod
    def reset(cls) -> None:
        """Reset counter for test isolation."""
        cls._counter = 0


@pytest.fixture(autouse=True)
def reset_factories() -> Generator[None, None, None]:
    """Auto-reset all factories between tests for isolation."""
    yield
    AgentFactory.reset()
    TaskFactory.reset()
    RunFactory.reset()
    CommentFactory.reset()


@pytest.fixture
def agent_factory() -> type[AgentFactory]:
    """Provide the AgentFactory class."""
    return AgentFactory


@pytest.fixture
def task_factory() -> type[TaskFactory]:
    """Provide the TaskFactory class."""
    return TaskFactory


@pytest.fixture
def run_factory() -> type[RunFactory]:
    """Provide the RunFactory class."""
    return RunFactory


@pytest.fixture
def comment_factory() -> type[CommentFactory]:
    """Provide the CommentFactory class."""
    return CommentFactory


# ---------------------------------------------------------------------------
# Helper Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def seeded_client(
    client: TestClient,
    agent_factory: type[AgentFactory],
    task_factory: type[TaskFactory],
    run_factory: type[RunFactory],
) -> TestClient:
    """Provide a client with additional test data seeded."""
    # Add extra test agents
    client.post("/api/agents", json=agent_factory.build_create_request(
        name="Extra Test Agent",
        adapter="test-adapter",
        model="test-model",
    ))
    return client


# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------


def _current_timestamp() -> str:
    """Generate ISO 8601 timestamp with Z suffix."""
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def insert_test_data(
    connection: sqlite3.Connection,
    *,
    agents: list[dict[str, Any]] | None = None,
    tasks: list[dict[str, Any]] | None = None,
    runs: list[dict[str, Any]] | None = None,
    status_history: list[dict[str, Any]] | None = None,
    run_logs: list[dict[str, Any]] | None = None,
) -> None:
    """Insert test data directly into database for fast setup.

    Useful for tests that need specific data without going through the API.
    """
    import json

    for agent in (agents or []):
        connection.execute(
            """
            INSERT INTO agents (
                id, name, adapter, model, heartbeat_seconds,
                sandbox_mode, instructions_path, workspace_root
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                agent["id"],
                agent["name"],
                agent["adapter"],
                agent["model"],
                agent.get("heartbeatSeconds", 300),
                agent.get("sandboxMode", "workspace-write"),
                agent.get("instructionsPath", f"agents/{agent['id']}/AGENTS.md"),
                agent.get("workspaceRoot", "/workspace/test"),
            ),
        )

    for task in (tasks or []):
        connection.execute(
            """
            INSERT INTO tasks (id, title, owner, status, priority, next_action, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task["id"],
                task["title"],
                task.get("owner", "Test Owner"),
                task.get("status", "todo"),
                task.get("priority", "medium"),
                task.get("nextAction", "Start implementation."),
                task.get("updatedAt", _current_timestamp()),
            ),
        )

    for run in (runs or []):
        connection.execute(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at, ended_at, outcome)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run["id"],
                run["agent"],
                run.get("status", "healthy"),
                run.get("trigger", "manual"),
                run.get("issue", "CLI-0"),
                run.get("startedAt", _current_timestamp()),
                run.get("updatedAt", _current_timestamp()),
                run.get("endedAt"),
                run.get("outcome"),
            ),
        )

    for entry in (status_history or []):
        connection.execute(
            """
            INSERT INTO status_history (id, task_id, from_status, to_status, run_id, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                entry["id"],
                entry["taskId"],
                entry.get("fromStatus"),
                entry["toStatus"],
                entry.get("runId"),
                entry.get("timestamp", _current_timestamp()),
            ),
        )

    for log_entry in (run_logs or []):
        connection.execute(
            """
            INSERT INTO run_logs (id, run_id, timestamp, action, agent, issue, result, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_entry["id"],
                log_entry["runId"],
                log_entry.get("timestamp", _current_timestamp()),
                log_entry["action"],
                log_entry.get("agent", "test-agent"),
                log_entry.get("issue", "CLI-0"),
                log_entry.get("result", "success"),
                json.dumps(log_entry.get("metadata", {})),
            ),
        )

    connection.commit()


@pytest.fixture
def data_inserter(db_connection: sqlite3.Connection):
    """Provide a helper to insert test data directly into the database."""
    def _insert(**kwargs: Any) -> None:
        insert_test_data(db_connection, **kwargs)
    return _insert


@pytest.fixture
def client_data_inserter(client: TestClient) -> Callable[..., None]:
    """Provide a helper to insert test data into the client's database.

    Use this fixture when you need to insert data that will be visible
    to the TestClient (for API assertions).
    """
    # Capture the database path at fixture setup time, not at call time
    import os
    db_path = os.getenv("CONTROL_PLANE_DB_PATH")

    def _insert(**kwargs: Any) -> None:
        if db_path:
            conn = sqlite3.connect(str(db_path))
            try:
                insert_test_data(conn, **kwargs)
            finally:
                conn.close()
    return _insert


@pytest.fixture
def empty_client_data_inserter(empty_client: TestClient) -> Callable[..., None]:
    """Provide a helper to insert test data into the empty_client's database.

    Use this fixture with empty_client when you need to insert data that
    will be visible to the TestClient API assertions.
    """
    # Capture the database path at fixture setup time
    import os
    db_path = os.getenv("CONTROL_PLANE_DB_PATH")

    def _insert(**kwargs: Any) -> None:
        if db_path:
            conn = sqlite3.connect(str(db_path))
            try:
                insert_test_data(conn, **kwargs)
            finally:
                conn.close()
    return _insert
