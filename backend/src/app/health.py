"""Enhanced health check module with dependency status reporting."""

from __future__ import annotations

import os
import sqlite3
import time
from enum import Enum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field


class DependencyStatus(str, Enum):
    """Status of a dependency check."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class DependencyCheck(BaseModel):
    """Result of a single dependency check."""

    name: str
    status: DependencyStatus
    latency_ms: float | None = None
    message: str | None = None
    details: dict[str, Any] | None = None


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""

    status: str = Field(description="Overall health status: ok, degraded, or unhealthy")
    timestamp: str = Field(description="ISO 8601 timestamp of the check")
    version: str | None = None
    dependencies: list[DependencyCheck] = Field(default_factory=list)

    @property
    def is_healthy(self) -> bool:
        """Return True if all dependencies are healthy."""
        return all(d.status == DependencyStatus.HEALTHY for d in self.dependencies)

    @property
    def has_critical_failure(self) -> bool:
        """Return True if any dependency is unhealthy."""
        return any(d.status == DependencyStatus.UNHEALTHY for d in self.dependencies)


class DeepHealthResponse(HealthResponse):
    """Extended health response with detailed diagnostics."""

    system_info: dict[str, Any] | None = None
    uptime_seconds: float | None = None


# Module start time for uptime calculation
_start_time = time.time()


def check_database(db_path: str | None = None) -> DependencyCheck:
    """Check database connectivity and basic operations."""
    start = time.perf_counter()

    if db_path is None:
        db_path = os.getenv(
            "CONTROL_PLANE_DB_PATH",
            str(Path(__file__).resolve().parents[2] / ".data" / "control-plane.sqlite3"),
        )

    try:
        conn = sqlite3.connect(db_path, timeout=5.0)
        cursor = conn.cursor()

        # Basic connectivity check
        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        # Check table count
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]

        # Check database size
        db_size = Path(db_path).stat().st_size if Path(db_path).exists() else 0

        conn.close()

        latency = (time.perf_counter() - start) * 1000

        return DependencyCheck(
            name="database",
            status=DependencyStatus.HEALTHY,
            latency_ms=round(latency, 2),
            message="SQLite database is accessible",
            details={
                "type": "sqlite",
                "path": db_path,
                "tables": table_count,
                "size_bytes": db_size,
            },
        )
    except sqlite3.OperationalError as e:
        latency = (time.perf_counter() - start) * 1000
        return DependencyCheck(
            name="database",
            status=DependencyStatus.UNHEALTHY,
            latency_ms=round(latency, 2),
            message=f"Database error: {e}",
            details={"type": "sqlite", "path": db_path, "error": str(e)},
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        return DependencyCheck(
            name="database",
            status=DependencyStatus.UNHEALTHY,
            latency_ms=round(latency, 2),
            message=f"Unexpected error: {e}",
            details={"type": "sqlite", "path": db_path, "error": str(e)},
        )


def check_filesystem(workspace_root: str | None = None) -> DependencyCheck:
    """Check filesystem access for workspace directory."""
    start = time.perf_counter()

    if workspace_root is None:
        workspace_root = os.getenv("WORKSPACE_ROOT", "/tmp/workspace")

    try:
        path = Path(workspace_root)

        # Create directory if it doesn't exist
        path.mkdir(parents=True, exist_ok=True)

        # Test write access
        test_file = path / ".health_check"
        test_file.write_text("health_check")
        content = test_file.read_text()
        test_file.unlink()

        latency = (time.perf_counter() - start) * 1000

        if content == "health_check":
            return DependencyCheck(
                name="filesystem",
                status=DependencyStatus.HEALTHY,
                latency_ms=round(latency, 2),
                message="Workspace filesystem is accessible",
                details={"path": str(path.absolute()), "writable": True},
            )
        else:
            return DependencyCheck(
                name="filesystem",
                status=DependencyStatus.DEGRADED,
                latency_ms=round(latency, 2),
                message="Write/read verification failed",
                details={"path": str(path.absolute()), "writable": True},
            )
    except PermissionError:
        latency = (time.perf_counter() - start) * 1000
        return DependencyCheck(
            name="filesystem",
            status=DependencyStatus.UNHEALTHY,
            latency_ms=round(latency, 2),
            message="Permission denied for workspace directory",
            details={"path": workspace_root, "writable": False},
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        return DependencyCheck(
            name="filesystem",
            status=DependencyStatus.UNHEALTHY,
            latency_ms=round(latency, 2),
            message=f"Filesystem error: {e}",
            details={"path": workspace_root, "error": str(e)},
        )


def check_model_providers() -> list[DependencyCheck]:
    """Check configured model provider endpoints."""
    checks: list[DependencyCheck] = []

    # Check for common provider configurations
    providers = [
        ("anthropic", "ANTHROPIC_API_KEY", "https://api.anthropic.com"),
        ("openai", "OPENAI_API_KEY", "https://api.openai.com"),
        ("google", "GOOGLE_API_KEY", "https://generativelanguage.googleapis.com"),
    ]

    for name, env_var, base_url in providers:
        start = time.perf_counter()
        api_key = os.getenv(env_var)

        if not api_key:
            checks.append(
                DependencyCheck(
                    name=f"provider:{name}",
                    status=DependencyStatus.UNKNOWN,
                    message=f"{env_var} not configured",
                    details={"base_url": base_url, "configured": False},
                )
            )
        else:
            # Just check if the key is set, don't make actual API calls
            latency = (time.perf_counter() - start) * 1000
            checks.append(
                DependencyCheck(
                    name=f"provider:{name}",
                    status=DependencyStatus.HEALTHY,
                    latency_ms=round(latency, 2),
                    message=f"{name} API key is configured",
                    details={"base_url": base_url, "configured": True},
                )
            )

    return checks


def check_environment() -> DependencyCheck:
    """Check required environment variables."""
    start = time.perf_counter()

    required_vars = ["PAPERCLIP_API_URL", "PAPERCLIP_COMPANY_ID"]
    optional_vars = ["PAPERCLIP_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"]

    missing_required = [v for v in required_vars if not os.getenv(v)]
    present_optional = [v for v in optional_vars if os.getenv(v)]

    latency = (time.perf_counter() - start) * 1000

    if missing_required:
        return DependencyCheck(
            name="environment",
            status=DependencyStatus.DEGRADED,
            latency_ms=round(latency, 2),
            message=f"Missing required variables: {', '.join(missing_required)}",
            details={
                "missing_required": missing_required,
                "present_optional": present_optional,
            },
        )

    return DependencyCheck(
        name="environment",
        status=DependencyStatus.HEALTHY,
        latency_ms=round(latency, 2),
        message="All required environment variables are set",
        details={
            "missing_required": [],
            "present_optional": present_optional,
        },
    )


def get_system_info() -> dict[str, Any]:
    """Get system information for deep health check."""
    import platform
    import sys

    return {
        "platform": platform.platform(),
        "python_version": sys.version,
        "hostname": platform.node(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
    }


def perform_health_check(deep: bool = False, db_path: str | None = None) -> HealthResponse | DeepHealthResponse:
    """Perform comprehensive health check.

    Args:
        deep: If True, include detailed diagnostics and latency measurements
        db_path: Optional database path override

    Returns:
        HealthResponse or DeepHealthResponse depending on deep flag
    """
    from datetime import datetime, timezone

    # Run all checks
    dependencies = [
        check_database(db_path),
        check_filesystem(),
        check_environment(),
    ]

    # Add provider checks (non-critical)
    dependencies.extend(check_model_providers())

    # Determine overall status
    has_unhealthy = any(d.status == DependencyStatus.UNHEALTHY for d in dependencies)
    has_degraded = any(d.status == DependencyStatus.DEGRADED for d in dependencies)

    if has_unhealthy:
        overall_status = "unhealthy"
    elif has_degraded:
        overall_status = "degraded"
    else:
        overall_status = "ok"

    timestamp = datetime.now(timezone.utc).isoformat()

    if deep:
        return DeepHealthResponse(
            status=overall_status,
            timestamp=timestamp,
            version=os.getenv("APP_VERSION", "0.1.0"),
            dependencies=dependencies,
            system_info=get_system_info(),
            uptime_seconds=round(time.time() - _start_time, 2),
        )
    else:
        return HealthResponse(
            status=overall_status,
            timestamp=timestamp,
            version=os.getenv("APP_VERSION", "0.1.0"),
            dependencies=dependencies,
        )
