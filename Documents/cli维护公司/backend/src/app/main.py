import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, Response, status

from app.health import perform_health_check
from app.logging_middleware import RequestLoggingMiddleware
from app.pagination import PaginatedResponse
from app.rate_limiter import RateLimitMiddleware
from app.overview import (
    AgentCreateRequest,
    AgentRecord,
    ControlPlaneStore,
    OperationsOverview,
    RunCommentCreateRequest,
    RunCommentRecord,
    RunLogResponse,
    RunOverview,
    RunUpdateRequest,
    StatusHistoryEntry,
    TaskCheckoutRequest,
    TaskCommentCreateRequest,
    TaskCommentRecord,
    TaskOverview,
    TaskUpdateRequest,
)
from app.reliability import (
    AuthCheckRequest,
    CleanupRequest,
    HeartbeatRequest,
    ProviderHealthStatus,
    RecordAuthRequest,
    check_provider_auth,
    check_provider_connectivity,
    cleanup_stale_runs,
    detect_auth_drift,
    detect_provider_drift,
    detect_stale_runs,
    get_auth_history,
    get_provider_health_report,
    get_run_health_report,
    record_auth_status,
    record_heartbeat,
    record_provider_health,
)
from app.error_recovery import (
    CheckpointType,
    add_to_dead_letter_queue,
    attempt_recovery,
    create_checkpoint,
    get_circuit_breaker,
    get_dead_letter_entries,
    get_latest_checkpoint,
    get_recovery_history,
    get_recovery_report,
    record_circuit_failure,
    record_circuit_success,
    retry_dead_letter_entry,
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
from app.session_resume import (
    OrphanSessionDetector,
    SessionResumeService,
    detect_orphan_sessions,
    get_recovery_logs,
    release_stale_checkouts,
    resume_session_from_checkpoint,
)


def create_app(seed_data: bool = True) -> FastAPI:
    app = FastAPI(title="OpenClaw Company Bootstrap API")

    # Add rate limiting middleware (must be added first to wrap all requests)
    app.add_middleware(RateLimitMiddleware)  # type: ignore[arg-type]

    # Add request/response logging middleware
    app.add_middleware(RequestLoggingMiddleware)  # type: ignore[arg-type]

    database_path = os.getenv(
        "CONTROL_PLANE_DB_PATH",
        str(Path(__file__).resolve().parents[2] / ".data" / "control-plane.sqlite3"),
    )
    store = ControlPlaneStore(database_path, seed_data=seed_data)
    app.state.store = store

    @app.get("/health")
    async def health(response: Response):
        """Health check endpoint with dependency status."""
        result = perform_health_check(deep=False)

        # Set HTTP status based on health
        if result.has_critical_failure:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        elif not result.is_healthy:
            response.status_code = status.HTTP_200_OK  # Degraded but operational

        return result

    @app.get("/health/deep")
    async def health_deep(response: Response):
        """Deep health check with latency measurements and system info."""
        result = perform_health_check(deep=True)

        if result.has_critical_failure:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

        return result

    @app.get("/api/overview")
    async def overview(request: Request) -> OperationsOverview:
        return request.app.state.store.get_operations_overview()

    @app.get("/api/agents")
    async def list_agents(
        request: Request,
        limit: int = Query(default=20, ge=1, le=1000),
        offset: int = Query(default=0, ge=0),
    ) -> PaginatedResponse[AgentRecord]:
        all_agents = request.app.state.store.list_agents()
        total = len(all_agents)
        items = all_agents[offset : offset + limit]
        return PaginatedResponse.create(items, total, limit, offset)

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

    @app.get("/api/runs/{run_id}/log")
    async def get_run_log(
        run_id: str,
        request: Request,
    ) -> RunLogResponse:
        """Get structured log entries for a run's audit trail."""
        try:
            return request.app.state.store.get_run_log(run_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Run not found.") from error

    @app.get("/api/tasks/{task_id}/status-history")
    async def get_task_status_history(
        task_id: str,
        request: Request,
    ) -> list[StatusHistoryEntry]:
        """Get status transition history for a task."""
        try:
            return request.app.state.store.get_status_history(task_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Task not found.") from error

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

    # ---- Provider Health Check Endpoints ----

    @app.get("/api/reliability/provider-health")
    async def provider_health_report(request: Request):
        """Get comprehensive provider health report."""
        return get_provider_health_report(request.app.state.store._connection)

    @app.post("/api/reliability/provider-health/check")
    async def check_provider_health(
        request: Request,
        providers: list[str] | None = None,
        mock_mode: bool = False,
        timeout_ms: int = Query(default=5000, gt=0),
    ):
        """Run health check for providers."""
        body = (
            await request.json()
            if request.headers.get("content-type") == "application/json"
            else {}
        )
        providers_list = body.get("providers", providers or [])
        use_mock = body.get("mock_mode", mock_mode)

        return check_provider_connectivity(
            request.app.state.store._connection,
            providers=providers_list,
            mock_mode=use_mock,
            timeout_ms=timeout_ms,
        )

    @app.get("/api/reliability/provider-drift")
    async def provider_drift(
        request: Request,
        drift_threshold_hours: int = Query(default=24, gt=0),
    ):
        """Detect providers with health drift."""
        return detect_provider_drift(
            request.app.state.store._connection,
            drift_threshold_hours,
        )

    @app.post("/api/reliability/provider-health/record")
    async def record_provider_health_endpoint(
        request: Request,
    ):
        """Record a provider health check result."""
        body = await request.json()
        provider = body.get("provider")
        status = body.get("status", "unknown")
        latency_ms = body.get("latency_ms")
        model = body.get("model")
        error = body.get("error")
        error_code = body.get("error_code")
        warning = body.get("warning")

        if not provider:
            raise HTTPException(status_code=400, detail="provider is required")

        record_provider_health(
            request.app.state.store._connection,
            provider=provider,
            status=ProviderHealthStatus(status),
            latency_ms=latency_ms,
            model=model,
            error=error,
            error_code=error_code,
            warning=warning,
        )

        return {"status": "recorded", "provider": provider}

    # ---- Error Recovery Endpoints ----

    @app.get("/api/reliability/recovery-report")
    async def recovery_report(request: Request):
        """Get comprehensive recovery status report."""
        return get_recovery_report(request.app.state.store._connection)

    @app.post("/api/reliability/checkpoint/{run_id}")
    async def create_session_checkpoint(
        run_id: str,
        request: Request,
    ):
        """Create a checkpoint for session recovery."""
        body = await request.json()
        state = body.get("state", {})
        checkpoint_type = body.get("checkpoint_type", "auto")
        files_snapshot = body.get("files_snapshot")
        metadata = body.get("metadata")

        try:
            checkpoint = create_checkpoint(
                request.app.state.store._connection,
                run_id,
                state=state,
                checkpoint_type=CheckpointType(checkpoint_type),
                files_snapshot=files_snapshot,
                metadata=metadata,
            )
            return checkpoint.model_dump()
        except KeyError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/reliability/checkpoint/{run_id}/latest")
    async def get_latest_session_checkpoint(
        run_id: str,
        request: Request,
    ):
        """Get the latest checkpoint for a run."""
        checkpoint = get_latest_checkpoint(
            request.app.state.store._connection,
            run_id,
        )
        if checkpoint is None:
            raise HTTPException(status_code=404, detail="No checkpoints found")
        return checkpoint.model_dump()

    @app.post("/api/reliability/recover/{run_id}")
    async def recover_session(
        run_id: str,
        request: Request,
    ):
        """Attempt to recover a session from checkpoint."""
        body = await request.json() if request.headers.get("content-length") else {}
        checkpoint_id = body.get("checkpoint_id")

        try:
            attempt = attempt_recovery(
                request.app.state.store._connection,
                run_id,
                checkpoint_id=checkpoint_id,
            )
            return attempt.model_dump()
        except (KeyError, ValueError) as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @app.get("/api/reliability/recovery/{run_id}/history")
    async def recovery_history(
        run_id: str,
        request: Request,
        limit: int = Query(default=10, gt=0),
    ):
        """Get recovery attempt history for a run."""
        return [
            a.model_dump()
            for a in get_recovery_history(
                request.app.state.store._connection,
                run_id,
                limit,
            )
        ]

    @app.get("/api/reliability/circuit-breaker/{provider}")
    async def get_circuit_breaker_state(
        provider: str,
        request: Request,
    ):
        """Get circuit breaker state for a provider."""
        return get_circuit_breaker(
            request.app.state.store._connection,
            provider,
        ).model_dump()

    @app.post("/api/reliability/circuit-breaker/{provider}/success")
    async def record_provider_success(
        provider: str,
        request: Request,
    ):
        """Record a successful provider operation."""
        return record_circuit_success(
            request.app.state.store._connection,
            provider,
        ).model_dump()

    @app.post("/api/reliability/circuit-breaker/{provider}/failure")
    async def record_provider_failure(
        provider: str,
        request: Request,
    ):
        """Record a failed provider operation."""
        body = await request.json() if request.headers.get("content-length") else {}
        error = body.get("error")
        return record_circuit_failure(
            request.app.state.store._connection,
            provider,
            error=error,
        ).model_dump()

    @app.get("/api/reliability/dead-letter")
    async def list_dead_letter_entries(
        request: Request,
        run_id: str | None = None,
        limit: int = Query(default=50, gt=0),
    ):
        """Get entries from the dead letter queue."""
        return [
            e.model_dump()
            for e in get_dead_letter_entries(
                request.app.state.store._connection,
                run_id=run_id,
                limit=limit,
            )
        ]

    @app.post("/api/reliability/dead-letter/{run_id}")
    async def add_dead_letter_entry(
        run_id: str,
        request: Request,
    ):
        """Add an entry to the dead letter queue."""
        body = await request.json()
        operation = body.get("operation", "unknown")
        payload = body.get("payload", {})
        error = body.get("error", "Unknown error")
        retry_count = body.get("retry_count", 0)

        entry = add_to_dead_letter_queue(
            request.app.state.store._connection,
            run_id,
            operation,
            payload,
            error,
            retry_count,
        )
        return entry.model_dump()

    @app.post("/api/reliability/dead-letter/{entry_id}/retry")
    async def retry_entry(
        entry_id: str,
        request: Request,
    ):
        """Retry a dead letter queue entry."""
        entry = retry_dead_letter_entry(
            request.app.state.store._connection,
            entry_id,
        )
        if entry is None:
            raise HTTPException(status_code=404, detail="Entry not found")
        return entry.model_dump()

    # ---- Session Resume and Crash Recovery Endpoints ----

    @app.get("/api/reliability/orphans")
    async def detect_orphans(
        request: Request,
        stale_timeout_seconds: int = Query(default=300, gt=0),
        dead_timeout_seconds: int = Query(default=600, gt=0),
    ):
        """Detect orphaned sessions (task checked out but run stale/dead)."""
        return [
            o.model_dump()
            for o in detect_orphan_sessions(
                request.app.state.store._connection,
                stale_timeout_seconds=stale_timeout_seconds,
                dead_timeout_seconds=dead_timeout_seconds,
            )
        ]

    @app.post("/api/reliability/resume/{run_id}")
    async def resume_session(
        run_id: str,
        request: Request,
    ):
        """Resume a session from its latest checkpoint."""
        body = await request.json() if request.headers.get("content-length") else {}
        checkpoint_id = body.get("checkpoint_id")

        result = resume_session_from_checkpoint(
            request.app.state.store._connection,
            run_id,
            checkpoint_id=checkpoint_id,
        )
        return result.model_dump()

    @app.post("/api/reliability/release-stale")
    async def release_stale(
        request: Request,
    ):
        """Release stale checkouts for orphaned sessions."""
        body = await request.json() if request.headers.get("content-length") else {}
        stale_timeout = body.get("stale_timeout_seconds", 300)
        dead_timeout = body.get("dead_timeout_seconds", 600)
        auto_release = body.get("auto_release", False)

        result = release_stale_checkouts(
            request.app.state.store._connection,
            stale_timeout_seconds=stale_timeout,
            dead_timeout_seconds=dead_timeout,
            auto_release=auto_release,
        )
        return result.model_dump()

    @app.get("/api/reliability/recovery-logs")
    async def list_recovery_logs(
        request: Request,
        run_id: str | None = None,
        limit: int = Query(default=50, gt=0, le=500),
    ):
        """Get recovery log entries for audit trail."""
        return [
            log.model_dump()
            for log in get_recovery_logs(
                request.app.state.store._connection,
                run_id=run_id,
                limit=limit,
            )
        ]

    @app.post("/api/reliability/checkpoint/tool-call/pre/{run_id}")
    async def create_pre_tool_checkpoint(
        run_id: str,
        request: Request,
    ):
        """Create a pre-tool-call checkpoint for session recovery."""
        body = await request.json()
        tool_name = body.get("tool_name", "unknown")
        tool_args = body.get("tool_args", {})
        current_state = body.get("current_state")

        service = SessionResumeService(request.app.state.store._connection)
        checkpoint = service.create_pre_tool_call_checkpoint(
            run_id=run_id,
            tool_name=tool_name,
            tool_args=tool_args,
            current_state=current_state,
        )
        return checkpoint.model_dump()

    @app.post("/api/reliability/checkpoint/tool-call/post/{run_id}")
    async def create_post_tool_checkpoint(
        run_id: str,
        request: Request,
    ):
        """Create a post-tool-call checkpoint for session recovery."""
        body = await request.json()
        tool_name = body.get("tool_name", "unknown")
        result = body.get("result", {})
        pre_checkpoint_id = body.get("pre_checkpoint_id", "")

        service = SessionResumeService(request.app.state.store._connection)
        checkpoint = service.create_post_tool_call_checkpoint(
            run_id=run_id,
            tool_name=tool_name,
            result=result,
            pre_checkpoint_id=pre_checkpoint_id,
        )
        return checkpoint.model_dump()

    return app


app = create_app()
