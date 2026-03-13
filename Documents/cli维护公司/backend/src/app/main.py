import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, status

from app.overview import (
    AgentCreateRequest,
    AgentRecord,
    ControlPlaneStore,
    OperationsOverview,
    RunCommentCreateRequest,
    RunCommentRecord,
    TaskCheckoutRequest,
    TaskCommentCreateRequest,
    TaskCommentRecord,
    TaskOverview,
    TaskUpdateRequest,
    RunOverview,
    RunUpdateRequest,
)
from app.reliability import (
    AuthCheckRequest,
    CleanupRequest,
    HeartbeatRequest,
    RecordAuthRequest,
    check_provider_auth,
    cleanup_stale_runs,
    detect_auth_drift,
    detect_stale_runs,
    get_auth_history,
    get_run_health_report,
    record_auth_status,
    record_heartbeat,
)
from app.workspaces import (
    DriftResult,
    ResumeRequest,
    ResumeResult,
    SnapshotRequest,
    WorkspaceHealth,
    WorkspaceSnapshot,
    check_drift,
    create_snapshot,
    get_workspace_health,
    list_snapshots,
    resume_from_snapshot,
)


def create_app() -> FastAPI:
    app = FastAPI(title="OpenClaw Company Bootstrap API")
    database_path = os.getenv(
        "CONTROL_PLANE_DB_PATH",
        str(Path(__file__).resolve().parents[2] / ".data" / "control-plane.sqlite3"),
    )
    store = ControlPlaneStore(database_path)
    app.state.store = store

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/overview")
    async def overview(request: Request) -> OperationsOverview:
        return request.app.state.store.get_operations_overview()

    @app.get("/api/agents")
    async def list_agents(request: Request) -> list[AgentRecord]:
        return request.app.state.store.list_agents()

    @app.post("/api/agents", status_code=status.HTTP_201_CREATED)
    async def register_agent(
        payload: AgentCreateRequest,
        request: Request,
    ) -> AgentRecord:
        return request.app.state.store.create_agent(payload)

    @app.post("/api/tasks/{task_id}/checkout")
    async def checkout_task(
        task_id: str,
        payload: TaskCheckoutRequest,
        request: Request,
    ) -> TaskOverview:
        try:
            return request.app.state.store.checkout_task(task_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Task not found.") from error

    @app.patch("/api/tasks/{task_id}")
    async def update_task(
        task_id: str,
        payload: TaskUpdateRequest,
        request: Request,
    ) -> TaskOverview:
        try:
            return request.app.state.store.update_task(task_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Task not found.") from error

    @app.get("/api/tasks/{task_id}/comments")
    async def list_task_comments(
        task_id: str,
        request: Request,
    ) -> list[TaskCommentRecord]:
        try:
            return request.app.state.store.list_task_comments(task_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Task not found.") from error

    @app.post("/api/tasks/{task_id}/comments", status_code=status.HTTP_201_CREATED)
    async def create_task_comment(
        task_id: str,
        payload: TaskCommentCreateRequest,
        request: Request,
    ) -> TaskCommentRecord:
        try:
            return request.app.state.store.create_task_comment(task_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Task not found.") from error

    @app.patch("/api/runs/{run_id}")
    async def update_run(
        run_id: str,
        payload: RunUpdateRequest,
        request: Request,
    ) -> RunOverview:
        try:
            return request.app.state.store.update_run(run_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Run not found.") from error

    @app.get("/api/runs/{run_id}/comments")
    async def list_run_comments(
        run_id: str,
        request: Request,
    ) -> list[RunCommentRecord]:
        try:
            return request.app.state.store.list_run_comments(run_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Run not found.") from error

    @app.post("/api/runs/{run_id}/comments", status_code=status.HTTP_201_CREATED)
    async def create_run_comment(
        run_id: str,
        payload: RunCommentCreateRequest,
        request: Request,
    ) -> RunCommentRecord:
        try:
            return request.app.state.store.create_run_comment(run_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Run not found.") from error

    # ---- Workspace snapshot and determinism endpoints ----

    @app.post(
        "/api/workspaces/{agent_id}/snapshot",
        status_code=status.HTTP_201_CREATED,
    )
    async def create_workspace_snapshot(
        agent_id: str,
        payload: SnapshotRequest,
        request: Request,
    ) -> WorkspaceSnapshot:
        try:
            return create_snapshot(request.app.state.store._connection, agent_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/workspaces/{agent_id}/snapshots")
    async def list_workspace_snapshots(
        agent_id: str,
        request: Request,
    ) -> list[WorkspaceSnapshot]:
        try:
            return list_snapshots(request.app.state.store._connection, agent_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/workspaces/{agent_id}/drift")
    async def check_workspace_drift(
        agent_id: str,
        baselineId: str,
        compareId: str,
        request: Request,
    ) -> DriftResult:
        try:
            return check_drift(
                request.app.state.store._connection,
                agent_id,
                baselineId,
                compareId,
            )
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.post("/api/workspaces/{agent_id}/resume")
    async def resume_workspace(
        agent_id: str,
        payload: ResumeRequest,
        request: Request,
    ) -> ResumeResult:
        try:
            return resume_from_snapshot(request.app.state.store._connection, agent_id, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/workspaces/health")
    async def workspace_health(
        request: Request,
    ) -> list[WorkspaceHealth]:
        return get_workspace_health(request.app.state.store._connection)

    # ---- Reliability endpoints ----

    @app.post("/api/reliability/heartbeat")
    async def reliability_heartbeat(
        payload: HeartbeatRequest,
        request: Request,
    ):
        """Record a heartbeat for a run."""
        try:
            return record_heartbeat(request.app.state.store._connection, payload)
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/reliability/stale-runs")
    async def get_stale_runs(
        request: Request,
        stale_timeout_seconds: int = Query(default=300, gt=0),
        dead_timeout_seconds: int = Query(default=600, gt=0),
    ):
        """Detect stale runs based on heartbeat activity."""
        return detect_stale_runs(
            request.app.state.store._connection,
            stale_timeout_seconds,
            dead_timeout_seconds,
        )

    @app.post("/api/reliability/cleanup")
    async def run_cleanup(
        payload: CleanupRequest,
        request: Request,
    ):
        """Detect and optionally clean up stale runs."""
        return cleanup_stale_runs(
            request.app.state.store._connection,
            payload.stale_timeout_seconds,
            payload.dead_timeout_seconds,
            payload.auto_release,
        )

    @app.get("/api/reliability/health-report")
    async def reliability_health_report(
        request: Request,
        stale_timeout_seconds: int = Query(default=300, gt=0),
    ):
        """Generate a comprehensive run health report."""
        return get_run_health_report(
            request.app.state.store._connection,
            stale_timeout_seconds,
        )

    @app.post("/api/reliability/auth-check")
    async def auth_check(
        payload: AuthCheckRequest,
        request: Request,
    ):
        """Check authentication status for providers."""
        return check_provider_auth(request.app.state.store._connection, payload)

    @app.post("/api/reliability/auth-status")
    async def record_auth(
        payload: RecordAuthRequest,
        request: Request,
    ):
        """Record authentication status for a provider."""
        record_auth_status(
            request.app.state.store._connection,
            payload.provider,
            payload.status,
            payload.expires_at,
            payload.error,
        )
        return {"status": "recorded", "provider": payload.provider}

    @app.get("/api/reliability/auth-history/{provider}")
    async def auth_history(
        provider: str,
        request: Request,
        limit: int = Query(default=10, gt=0),
    ):
        """Get auth check history for a provider."""
        return get_auth_history(
            request.app.state.store._connection,
            provider,
            limit,
        )

    @app.get("/api/reliability/auth-drift")
    async def auth_drift(
        request: Request,
        drift_threshold_hours: int = Query(default=24, gt=0),
    ):
        """Detect providers with stale or expired auth."""
        return detect_auth_drift(
            request.app.state.store._connection,
            drift_threshold_hours,
        )

    return app


app = create_app()
