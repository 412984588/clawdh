"""FastAPI 中间件与 CORS 模式 — 自定义中间件、CORS、限流、请求 ID、日志"""

import time
import uuid
from collections import defaultdict
from typing import Callable

from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# ===== 1. 请求 ID 中间件 =====


class RequestIdMiddleware(BaseHTTPMiddleware):
    """为每个请求注入唯一 ID，方便日志追踪"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response


# ===== 2. 访问日志中间件 =====


class AccessLogMiddleware(BaseHTTPMiddleware):
    """记录每个请求的方法、路径、状态码和耗时"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        request_id = getattr(request.state, "request_id", "-")
        print(
            f"[{request_id}] {request.method} {request.url.path} "
            f"-> {response.status_code} ({elapsed_ms:.1f}ms)"
        )
        return response


# ===== 3. 限流中间件（固定窗口）=====

_rate_counters: dict[str, list[float]] = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """按 IP 限流：默认 60 请求/分钟"""

    def __init__(self, app, requests_per_minute: int = 60) -> None:
        super().__init__(app)
        self.limit = requests_per_minute
        self.window = 60.0

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window

        # 清除过期记录
        _rate_counters[ip] = [t for t in _rate_counters[ip] if t > window_start]

        if len(_rate_counters[ip]) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={"Retry-After": "60"},
            )

        _rate_counters[ip].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(self.limit - len(_rate_counters[ip]))
        return response


# ===== 4. 安全 Headers 中间件 =====


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """注入安全相关的响应头"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        if not response.headers.get("Content-Security-Policy"):
            response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response


# ===== 5. CORS 配置 =====

CORS_CONFIG = {
    "allow_origins": ["https://example.com", "https://app.example.com"],
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "allow_headers": ["Authorization", "Content-Type", "X-Request-Id"],
    "expose_headers": ["X-Request-Id", "X-RateLimit-Remaining"],
    "max_age": 600,
}

# 开发环境：允许所有来源
DEV_CORS_CONFIG = {
    "allow_origins": ["*"],
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}


# ===== 6. 路由 =====

router = APIRouter(prefix="/middleware-demo", tags=["middleware"])


@router.get("/echo-headers")
async def echo_headers(request: Request) -> dict:
    return {
        "request_id": getattr(request.state, "request_id", None),
        "headers": dict(request.headers),
    }


@router.get("/slow")
async def slow_endpoint() -> dict:
    import asyncio
    await asyncio.sleep(0.2)
    return {"message": "Slow response"}


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


def create_app(dev_mode: bool = True) -> FastAPI:
    app = FastAPI(title="Middleware & CORS Demo", version="1.0.0")

    # 注册中间件（顺序：外层先执行）
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(AccessLogMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60)
    app.add_middleware(
        CORSMiddleware,
        **(DEV_CORS_CONFIG if dev_mode else CORS_CONFIG),
    )

    app.include_router(router)
    return app


app = create_app()
