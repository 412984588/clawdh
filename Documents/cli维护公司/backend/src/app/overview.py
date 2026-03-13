from __future__ import annotations

import re
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


MetricTone = Literal["active", "blocked", "attention"]
TaskStatus = Literal["todo", "in_progress", "blocked", "done", "in_review"]
Priority = Literal["high", "medium", "low"]
RunStatus = Literal["healthy", "attention", "blocked"]


class SummaryMetric(BaseModel):
    id: str
    label: str
    value: int
    tone: MetricTone


class AgentRecord(BaseModel):
    id: str
    name: str
    adapter: str
    model: str
    heartbeatSeconds: int
    sandboxMode: str
    instructionsPath: str
    workspaceRoot: str


class AgentCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    adapter: str = Field(min_length=1)
    model: str = Field(min_length=1)
    heartbeatSeconds: int = Field(gt=0)
    sandboxMode: str = Field(min_length=1)
    instructionsPath: str = Field(min_length=1)
    workspaceRoot: str = Field(min_length=1)


class TaskOverview(BaseModel):
    id: str
    title: str
    owner: str
    status: TaskStatus
    priority: Priority
    nextAction: str
    updatedAt: str


class TaskCheckoutRequest(BaseModel):
    owner: str = Field(min_length=1)


class TaskUpdateRequest(BaseModel):
    status: TaskStatus | None = None
    nextAction: str | None = Field(default=None, min_length=1)
    owner: str | None = Field(default=None, min_length=1)

    @model_validator(mode="after")
    def validate_changes(self) -> "TaskUpdateRequest":
        if self.status is None and self.nextAction is None and self.owner is None:
            raise ValueError("At least one task field must be updated.")
        return self


class TaskCommentRecord(BaseModel):
    id: str
    author: str
    body: str
    createdAt: str


class TaskCommentCreateRequest(BaseModel):
    author: str = Field(min_length=1)
    body: str = Field(min_length=1)


class RunOverview(BaseModel):
    id: str
    agent: str
    status: RunStatus
    trigger: str
    issue: str
    startedAt: str


class RunUpdateRequest(BaseModel):
    status: RunStatus | None = None

    @model_validator(mode="after")
    def validate_changes(self) -> "RunUpdateRequest":
        if self.status is None:
            raise ValueError("At least one run field must be updated.")
        return self


class RunCommentRecord(BaseModel):
    id: str
    author: str
    body: str
    createdAt: str


class RunCommentCreateRequest(BaseModel):
    author: str = Field(min_length=1)
    body: str = Field(min_length=1)


class RunLogEntry(BaseModel):
    id: str
    runId: str
    timestamp: str
    action: str
    agent: str
    issue: str
    result: str
    metadata: dict = Field(default_factory=dict)


class RunLogResponse(BaseModel):
    runId: str
    entries: list[RunLogEntry]


class StatusHistoryEntry(BaseModel):
    id: str
    taskId: str
    fromStatus: str | None
    toStatus: str
    runId: str | None
    timestamp: str


class RunWithDuration(BaseModel):
    id: str
    agent: str
    status: RunStatus
    trigger: str
    issue: str
    startedAt: str
    endedAt: str | None = None
    durationSeconds: int | None = None
    outcome: str | None = None


class OperationsOverview(BaseModel):
    generatedAt: str
    summary: list[SummaryMetric]
    agents: list[AgentRecord]
    tasks: list[TaskOverview]
    runs: list[RunWithDuration]
    workspaceHealth: list[dict] = Field(default_factory=list)


class ControlPlaneStore:
    def __init__(self, database_path: str | Path, seed_data: bool = True) -> None:
        database_location = str(database_path)
        if database_location != ":memory:":
            Path(database_location).expanduser().resolve().parent.mkdir(parents=True, exist_ok=True)

        self._connection = sqlite3.connect(database_location, check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        self._initialize_schema()
        if seed_data:
            self._seed_defaults()

    def close(self) -> None:
        self._connection.close()

    def list_tasks(self) -> list[TaskOverview]:
        return self._list_tasks()

    def list_agents(self) -> list[AgentRecord]:
        rows = self._connection.execute(
            """
            SELECT
                id,
                name,
                adapter,
                model,
                heartbeat_seconds,
                sandbox_mode,
                instructions_path,
                workspace_root
            FROM agents
            ORDER BY rowid
            """
        ).fetchall()

        return [
            AgentRecord(
                id=row["id"],
                name=row["name"],
                adapter=row["adapter"],
                model=row["model"],
                heartbeatSeconds=row["heartbeat_seconds"],
                sandboxMode=row["sandbox_mode"],
                instructionsPath=row["instructions_path"],
                workspaceRoot=row["workspace_root"],
            )
            for row in rows
        ]

    def create_agent(self, payload: AgentCreateRequest) -> AgentRecord:
        agent_id = self._build_agent_id(payload.name)

        self._connection.execute(
            """
            INSERT INTO agents (
                id,
                name,
                adapter,
                model,
                heartbeat_seconds,
                sandbox_mode,
                instructions_path,
                workspace_root
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                agent_id,
                payload.name,
                payload.adapter,
                payload.model,
                payload.heartbeatSeconds,
                payload.sandboxMode,
                payload.instructionsPath,
                payload.workspaceRoot,
            ),
        )
        self._connection.commit()

        return AgentRecord(
            id=agent_id,
            name=payload.name,
            adapter=payload.adapter,
            model=payload.model,
            heartbeatSeconds=payload.heartbeatSeconds,
            sandboxMode=payload.sandboxMode,
            instructionsPath=payload.instructionsPath,
            workspaceRoot=payload.workspaceRoot,
        )

    def checkout_task(self, task_id: str, payload: TaskCheckoutRequest) -> TaskOverview:
        task = self._get_task(task_id)
        updated_at = self._current_timestamp()

        self._connection.execute(
            """
            UPDATE tasks
            SET owner = ?, status = ?, updated_at = ?
            WHERE id = ?
            """,
            (payload.owner, "in_progress", updated_at, task_id),
        )

        # Record status transition in history
        self._insert_status_history(
            task_id=task_id,
            from_status=task["status"],
            to_status="in_progress",
            run_id=None,
            timestamp=updated_at,
        )

        self._insert_task_comment(
            task_id=task_id,
            author="System",
            body=f"Checked out by {payload.owner}.",
            created_at=updated_at,
        )
        self._connection.commit()

        return self._task_from_row(self._get_task(task_id))

    def update_task(self, task_id: str, payload: TaskUpdateRequest) -> TaskOverview:
        task = self._get_task(task_id)
        next_action = payload.nextAction or task["next_action"]
        status = payload.status or task["status"]
        owner = payload.owner or task["owner"]
        updated_at = self._current_timestamp()

        self._connection.execute(
            """
            UPDATE tasks
            SET owner = ?, status = ?, next_action = ?, updated_at = ?
            WHERE id = ?
            """,
            (owner, status, next_action, updated_at, task_id),
        )

        audit_lines: list[str] = []
        if payload.status is not None and payload.status != task["status"]:
            audit_lines.append(f"Status changed to {payload.status}.")
            # Record status transition in history
            self._insert_status_history(
                task_id=task_id,
                from_status=task["status"],
                to_status=payload.status,
                run_id=None,
                timestamp=updated_at,
            )
        if payload.nextAction is not None and payload.nextAction != task["next_action"]:
            audit_lines.append(f"Next action updated to: {payload.nextAction}")
        if payload.owner is not None and payload.owner != task["owner"]:
            audit_lines.append(f"Owner reassigned to {payload.owner}.")

        if audit_lines:
            self._insert_task_comment(
                task_id=task_id,
                author="System",
                body="\n".join(audit_lines),
                created_at=updated_at,
            )

        self._connection.commit()

        return self._task_from_row(self._get_task(task_id))

    def list_task_comments(self, task_id: str) -> list[TaskCommentRecord]:
        self._get_task(task_id)
        rows = self._connection.execute(
            """
            SELECT id, author, body, created_at
            FROM task_comments
            WHERE task_id = ?
            ORDER BY created_at, rowid
            """,
            (task_id,),
        ).fetchall()

        return [
            TaskCommentRecord(
                id=row["id"],
                author=row["author"],
                body=row["body"],
                createdAt=row["created_at"],
            )
            for row in rows
        ]

    def create_task_comment(
        self,
        task_id: str,
        payload: TaskCommentCreateRequest,
    ) -> TaskCommentRecord:
        self._get_task(task_id)
        created_at = self._current_timestamp()
        comment = self._insert_task_comment(
            task_id=task_id,
            author=payload.author,
            body=payload.body,
            created_at=created_at,
        )
        self._connection.execute(
            """
            UPDATE tasks
            SET updated_at = ?
            WHERE id = ?
            """,
            (created_at, task_id),
        )
        self._connection.commit()
        return comment

    def update_run(self, run_id: str, payload: RunUpdateRequest) -> RunOverview:
        run = self._get_run(run_id)
        status = payload.status or run["status"]
        updated_at = self._current_timestamp()

        self._connection.execute(
            """
            UPDATE runs
            SET status = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, updated_at, run_id),
        )

        if payload.status is not None and payload.status != run["status"]:
            self._insert_run_comment(
                run_id=run_id,
                author="System",
                body=f"Run status changed to {payload.status}.",
                created_at=updated_at,
            )

        self._connection.commit()

        return self._run_from_row(self._get_run(run_id))

    def list_run_comments(self, run_id: str) -> list[RunCommentRecord]:
        self._get_run(run_id)
        rows = self._connection.execute(
            """
            SELECT id, author, body, created_at
            FROM run_comments
            WHERE run_id = ?
            ORDER BY created_at, rowid
            """,
            (run_id,),
        ).fetchall()

        return [
            RunCommentRecord(
                id=row["id"],
                author=row["author"],
                body=row["body"],
                createdAt=row["created_at"],
            )
            for row in rows
        ]

    def create_run_comment(
        self,
        run_id: str,
        payload: RunCommentCreateRequest,
    ) -> RunCommentRecord:
        self._get_run(run_id)
        created_at = self._current_timestamp()
        comment = self._insert_run_comment(
            run_id=run_id,
            author=payload.author,
            body=payload.body,
            created_at=created_at,
        )
        self._connection.execute(
            """
            UPDATE runs
            SET updated_at = ?
            WHERE id = ?
            """,
            (created_at, run_id),
        )
        self._connection.commit()
        return comment

    def get_operations_overview(self) -> OperationsOverview:
        tasks = self._list_tasks()
        runs = self._list_runs()

        review_queue = sum(1 for task in tasks if task.status in {"todo", "in_review"})
        blocked_work = sum(1 for task in tasks if task.status == "blocked")

        # Import workspace health lazily to avoid circular imports
        try:
            from app.workspaces import get_workspace_health

            workspace_health = get_workspace_health(self._connection)
            workspace_health_dicts = [h.model_dump() for h in workspace_health]
        except Exception:
            workspace_health_dicts = []

        return OperationsOverview(
            generatedAt=self._current_timestamp(),
            summary=[
                SummaryMetric(
                    id="active_runs",
                    label="Active Runs",
                    value=len(runs),
                    tone="active",
                ),
                SummaryMetric(
                    id="blocked_work",
                    label="Blocked Work",
                    value=blocked_work,
                    tone="blocked",
                ),
                SummaryMetric(
                    id="review_queue",
                    label="Review Queue",
                    value=review_queue,
                    tone="attention",
                ),
            ],
            agents=self.list_agents(),
            tasks=tasks,
            runs=runs,
            workspaceHealth=workspace_health_dicts,
        )

    def _initialize_schema(self) -> None:
        self._connection.executescript(
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
                updated_at TEXT NOT NULL,
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
        self._ensure_runs_updated_at_column()
        self._ensure_runs_audit_columns()

    def _seed_defaults(self) -> None:
        if self._table_has_rows("agents"):
            return

        self._connection.executemany(
            """
            INSERT INTO agents (
                id,
                name,
                adapter,
                model,
                heartbeat_seconds,
                sandbox_mode,
                instructions_path,
                workspace_root
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    "agent-founding-engineer",
                    "Founding Engineer",
                    "codex-local",
                    "gpt-5",
                    300,
                    "danger-full-access",
                    "agents/founding-engineer/AGENTS.md",
                    "/workspace/company-bootstrap",
                ),
                (
                    "agent-frontend-specialist",
                    "Frontend Specialist",
                    "claude-local",
                    "claude-sonnet-4.5",
                    420,
                    "workspace-write",
                    "agents/frontend-specialist/AGENTS.md",
                    "/workspace/company-bootstrap",
                ),
                (
                    "agent-platform-agent",
                    "Platform Agent",
                    "gemini-local",
                    "gemini-2.5-pro",
                    600,
                    "workspace-write",
                    "agents/platform-agent/AGENTS.md",
                    "/workspace/company-bootstrap",
                ),
            ],
        )
        self._connection.executemany(
            """
            INSERT INTO tasks (id, title, owner, status, priority, next_action, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    "task-heartbeat-recovery",
                    "Harden Codex heartbeat recovery",
                    "Founding Engineer",
                    "in_progress",
                    "high",
                    "Persist run checkpoints before long tool calls.",
                    "2026-03-13T11:20:00Z",
                ),
                (
                    "task-gemini-routing",
                    "Normalize Gemini workspace routing",
                    "Platform Agent",
                    "blocked",
                    "high",
                    "Resolve adapter auth injection for local heartbeats.",
                    "2026-03-13T11:08:00Z",
                ),
                (
                    "task-review-surface",
                    "Ship issue review surface",
                    "Frontend Specialist",
                    "todo",
                    "medium",
                    "Implement status badges, comments panel, and reviewer handoff.",
                    "2026-03-13T10:54:00Z",
                ),
                (
                    "task-reviewer-handoff",
                    "Route blocked tasks into reviewer handoff",
                    "Frontend Specialist",
                    "in_review",
                    "medium",
                    "Confirm the audit trail wording before enabling review handoff.",
                    "2026-03-13T10:42:00Z",
                ),
            ],
        )
        self._connection.executemany(
            """
            INSERT INTO runs (id, agent, status, trigger, issue, started_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    "run-codex-241",
                    "codex-local",
                    "healthy",
                    "issue_checked_out",
                    "CLI-4",
                    "2026-03-13T11:42:00Z",
                    "2026-03-13T11:42:00Z",
                ),
                (
                    "run-claude-118",
                    "claude-local",
                    "attention",
                    "issue_comment_mentioned",
                    "CLI-5",
                    "2026-03-13T11:31:00Z",
                    "2026-03-13T11:31:00Z",
                ),
                (
                    "run-gemini-052",
                    "gemini-local",
                    "blocked",
                    "approval_resolved",
                    "CLI-8",
                    "2026-03-13T11:05:00Z",
                    "2026-03-13T11:05:00Z",
                ),
            ],
        )
        self._connection.executemany(
            """
            INSERT INTO run_comments (id, run_id, author, body, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                (
                    "run-codex-241-comment-1",
                    "run-codex-241",
                    "System",
                    "Run opened from CLI-4 checkout.",
                    "2026-03-13T11:42:00Z",
                ),
                (
                    "run-claude-118-comment-1",
                    "run-claude-118",
                    "System",
                    "Reviewer mention pulled this run into the attention queue.",
                    "2026-03-13T11:31:00Z",
                ),
                (
                    "run-gemini-052-comment-1",
                    "run-gemini-052",
                    "System",
                    "Approval resolution blocked the run until auth recovery finishes.",
                    "2026-03-13T11:05:00Z",
                ),
            ],
        )
        self._connection.commit()

    def _list_tasks(self) -> list[TaskOverview]:
        rows = self._connection.execute(
            """
            SELECT id, title, owner, status, priority, next_action, updated_at
            FROM tasks
            ORDER BY updated_at DESC
            """
        ).fetchall()

        return [self._task_from_row(row) for row in rows]

    def _list_runs(self) -> list[RunWithDuration]:
        rows = self._connection.execute(
            """
            SELECT id, agent, status, trigger, issue, started_at, updated_at, ended_at, outcome
            FROM runs
            ORDER BY updated_at DESC, started_at DESC
            """
        ).fetchall()

        return [self._run_with_duration_from_row(row) for row in rows]

    def _build_agent_id(self, name: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        candidate = f"agent-{slug}"

        if (
            self._connection.execute(
                "SELECT 1 FROM agents WHERE id = ?",
                (candidate,),
            ).fetchone()
            is None
        ):
            return candidate

        return f"{candidate}-{uuid4().hex[:8]}"

    def _table_has_rows(self, table_name: str) -> bool:
        row = self._connection.execute(f"SELECT COUNT(*) AS count FROM {table_name}").fetchone()
        return bool(row["count"])

    def _build_task_comment_id(self, task_id: str) -> str:
        count = self._connection.execute(
            "SELECT COUNT(*) AS count FROM task_comments WHERE task_id = ?",
            (task_id,),
        ).fetchone()
        return f"{task_id}-comment-{count['count'] + 1}"

    def _build_run_comment_id(self, run_id: str) -> str:
        count = self._connection.execute(
            "SELECT COUNT(*) AS count FROM run_comments WHERE run_id = ?",
            (run_id,),
        ).fetchone()
        return f"{run_id}-comment-{count['count'] + 1}"

    def _get_task(self, task_id: str) -> sqlite3.Row:
        row = self._connection.execute(
            """
            SELECT id, title, owner, status, priority, next_action, updated_at
            FROM tasks
            WHERE id = ?
            """,
            (task_id,),
        ).fetchone()
        if row is None:
            raise KeyError(task_id)
        return row

    def _get_run(self, run_id: str) -> sqlite3.Row:
        row = self._connection.execute(
            """
            SELECT id, agent, status, trigger, issue, started_at, updated_at, ended_at, outcome
            FROM runs
            WHERE id = ?
            """,
            (run_id,),
        ).fetchone()
        if row is None:
            raise KeyError(run_id)
        return row

    def _insert_task_comment(
        self,
        *,
        task_id: str,
        author: str,
        body: str,
        created_at: str,
    ) -> TaskCommentRecord:
        comment = TaskCommentRecord(
            id=self._build_task_comment_id(task_id),
            author=author,
            body=body,
            createdAt=created_at,
        )
        self._connection.execute(
            """
            INSERT INTO task_comments (id, task_id, author, body, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (comment.id, task_id, comment.author, comment.body, comment.createdAt),
        )
        return comment

    def _insert_run_comment(
        self,
        *,
        run_id: str,
        author: str,
        body: str,
        created_at: str,
    ) -> RunCommentRecord:
        comment = RunCommentRecord(
            id=self._build_run_comment_id(run_id),
            author=author,
            body=body,
            createdAt=created_at,
        )
        self._connection.execute(
            """
            INSERT INTO run_comments (id, run_id, author, body, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (comment.id, run_id, comment.author, comment.body, comment.createdAt),
        )
        return comment

    @staticmethod
    def _task_from_row(row: sqlite3.Row) -> TaskOverview:
        return TaskOverview(
            id=row["id"],
            title=row["title"],
            owner=row["owner"],
            status=row["status"],
            priority=row["priority"],
            nextAction=row["next_action"],
            updatedAt=row["updated_at"],
        )

    @staticmethod
    def _run_from_row(row: sqlite3.Row) -> RunOverview:
        return RunOverview(
            id=row["id"],
            agent=row["agent"],
            status=row["status"],
            trigger=row["trigger"],
            issue=row["issue"],
            startedAt=row["started_at"],
        )

    def _ensure_runs_updated_at_column(self) -> None:
        columns = {
            row["name"] for row in self._connection.execute("PRAGMA table_info(runs)").fetchall()
        }
        if "updated_at" in columns:
            return

        self._connection.execute("ALTER TABLE runs ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''")
        self._connection.execute(
            """
            UPDATE runs
            SET updated_at = started_at
            WHERE updated_at = ''
            """
        )
        self._connection.commit()

    def _ensure_runs_audit_columns(self) -> None:
        """Add ended_at and outcome columns for audit trail if missing."""
        columns = {
            row["name"] for row in self._connection.execute("PRAGMA table_info(runs)").fetchall()
        }
        if "ended_at" not in columns:
            self._connection.execute("ALTER TABLE runs ADD COLUMN ended_at TEXT")
        if "outcome" not in columns:
            self._connection.execute("ALTER TABLE runs ADD COLUMN outcome TEXT")
        self._connection.commit()

    def _insert_status_history(
        self,
        *,
        task_id: str,
        from_status: str | None,
        to_status: str,
        run_id: str | None,
        timestamp: str,
    ) -> None:
        """Record a status transition in the history table."""
        entry_id = f"status-{task_id}-{uuid4().hex[:8]}"
        self._connection.execute(
            """
            INSERT INTO status_history (id, task_id, from_status, to_status, run_id, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (entry_id, task_id, from_status, to_status, run_id, timestamp),
        )

    def _insert_run_log(
        self,
        *,
        run_id: str,
        action: str,
        agent: str,
        issue: str,
        result: str,
        metadata: dict | None = None,
        timestamp: str | None = None,
    ) -> RunLogEntry:
        """Insert a structured log entry for a run."""
        import json

        ts = timestamp or self._current_timestamp()
        entry_id = f"log-{run_id}-{uuid4().hex[:8]}"
        meta_json = json.dumps(metadata or {})

        self._connection.execute(
            """
            INSERT INTO run_logs (id, run_id, timestamp, action, agent, issue, result, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (entry_id, run_id, ts, action, agent, issue, result, meta_json),
        )

        return RunLogEntry(
            id=entry_id,
            runId=run_id,
            timestamp=ts,
            action=action,
            agent=agent,
            issue=issue,
            result=result,
            metadata=metadata or {},
        )

    def get_run_log(self, run_id: str) -> RunLogResponse:
        """Get structured log entries for a run."""
        import json

        self._get_run(run_id)  # Raises KeyError if not found
        rows = self._connection.execute(
            """
            SELECT id, run_id, timestamp, action, agent, issue, result, metadata
            FROM run_logs
            WHERE run_id = ?
            ORDER BY timestamp, rowid
            """,
            (run_id,),
        ).fetchall()

        entries = [
            RunLogEntry(
                id=row["id"],
                runId=row["run_id"],
                timestamp=row["timestamp"],
                action=row["action"],
                agent=row["agent"],
                issue=row["issue"],
                result=row["result"],
                metadata=json.loads(row["metadata"]) if row["metadata"] else {},
            )
            for row in rows
        ]

        return RunLogResponse(runId=run_id, entries=entries)

    def get_status_history(self, task_id: str) -> list[StatusHistoryEntry]:
        """Get status transition history for a task."""
        self._get_task(task_id)  # Raises KeyError if not found
        rows = self._connection.execute(
            """
            SELECT id, task_id, from_status, to_status, run_id, timestamp
            FROM status_history
            WHERE task_id = ?
            ORDER BY timestamp, rowid
            """,
            (task_id,),
        ).fetchall()

        return [
            StatusHistoryEntry(
                id=row["id"],
                taskId=row["task_id"],
                fromStatus=row["from_status"],
                toStatus=row["to_status"],
                runId=row["run_id"],
                timestamp=row["timestamp"],
            )
            for row in rows
        ]

    def _calculate_run_duration(self, row: sqlite3.Row) -> int | None:
        """Calculate run duration in seconds."""
        started = row["started_at"]
        ended = row["ended_at"]
        if not started or not ended:
            return None
        try:
            start_dt = datetime.fromisoformat(started.replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(ended.replace("Z", "+00:00"))
            return int((end_dt - start_dt).total_seconds())
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _run_with_duration_from_row(row: sqlite3.Row) -> RunWithDuration:
        """Create RunWithDuration from a database row."""
        started = row["started_at"]
        ended = row["ended_at"]
        duration = None
        if started and ended:
            try:
                start_dt = datetime.fromisoformat(started.replace("Z", "+00:00"))
                end_dt = datetime.fromisoformat(ended.replace("Z", "+00:00"))
                duration = int((end_dt - start_dt).total_seconds())
            except (ValueError, TypeError):
                pass

        return RunWithDuration(
            id=row["id"],
            agent=row["agent"],
            status=row["status"],
            trigger=row["trigger"],
            issue=row["issue"],
            startedAt=row["started_at"],
            endedAt=ended,
            durationSeconds=duration,
            outcome=row["outcome"],
        )

    @staticmethod
    def _current_timestamp() -> str:
        return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
